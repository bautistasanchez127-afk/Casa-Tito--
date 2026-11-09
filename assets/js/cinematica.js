/*
  CASA TITO — Experiencia cinematográfica (v2 «Tablero»)
  1. Presentación: tablero en penumbra, foco de luz, logotipo original y sello de 73 años;
     la escena se abre con forma de casa hacia la portada. Una vez por sesión, se puede omitir
     (botón, tecla, clic, rueda o gesto) y repetir desde el pie. Nunca con movimiento reducido.
  2. Entrada escalonada de la portada cuando se abre la escena.
  3. Luz de la portada que sigue al puntero (sólo mouse).
  4. La casita de la historia se construye al entrar en pantalla.
  5. Estado activo del menú según la sección visible.
  Todo es mejora progresiva: el CSS base ya muestra el estado final y tiene seguros por tiempo.
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var hero = document.querySelector(".hero");
  var intro = document.getElementById("intro");

  function reducedMotion() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }

  /* ---------- 2. Portada ---------- */
  function startHero() {
    if (!hero || hero.classList.contains("is-in")) return;
    hero.classList.add("is-in");
  }
  function restartHero() {
    if (!hero) return;
    hero.classList.remove("is-in");
    void hero.offsetWidth; /* vuelve al estado inicial antes de entrar de nuevo */
  }

  /* ---------- 1. Presentación ---------- */
  var OPEN_AT = 1450;    /* ms desde que arranca hasta que se abre la casa */
  var OPEN_MS = 780;     /* duración de la apertura */
  var running = null;

  function runIntro(isReplay) {
    if (!intro || running) return;
    var timers = [];
    var done = false;
    var skipEvents = ["keydown", "wheel", "touchstart"];

    intro.classList.remove("is-playing", "is-opening", "is-skipped");
    if (isReplay) intro.classList.add("is-replay");
    intro.hidden = false;

    function cleanup() {
      done = true;
      timers.forEach(clearTimeout);
      skipEvents.forEach(function (type) { window.removeEventListener(type, skip, true); });
      intro.removeEventListener("pointerdown", skip);
      intro.classList.remove("is-playing", "is-opening", "is-skipped", "is-replay");
      intro.hidden = true;
      root.classList.remove("intro-on");
      running = null;
    }
    function open() {
      if (done) return;
      intro.classList.add("is-opening");
      timers.push(setTimeout(startHero, 90));
      timers.push(setTimeout(cleanup, OPEN_MS + 40));
    }
    function skip(event) {
      if (done) return;
      if (event && event.type === "keydown" && (event.key === "Shift" || event.key === "Control" || event.key === "Alt" || event.key === "Meta")) return;
      timers.forEach(clearTimeout);
      intro.classList.add("is-skipped");
      startHero();
      timers.push(setTimeout(cleanup, 340));
    }
    function play() {
      if (done) return;
      intro.classList.add("is-playing");
      timers.push(setTimeout(open, OPEN_AT));
    }

    running = { skip: skip };
    skipEvents.forEach(function (type) { window.addEventListener(type, skip, { passive: true, capture: true }); });
    intro.addEventListener("pointerdown", skip);

    /* Espera a que el logotipo esté listo (máximo 600 ms) para no revelar una placa vacía */
    var img = intro.querySelector(".intro__plate img");
    var ready = img && img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    Promise.race([ready, new Promise(function (r) { setTimeout(r, 600); })])
      .then(function () { requestAnimationFrame(function () { requestAnimationFrame(play); }); });

    /* Tope duro: pase lo que pase, la presentación termina en 3,4 s */
    timers.push(setTimeout(function () { if (!done) skip(); }, 3400));
  }

  var introActive = intro && root.classList.contains("intro-on") && !reducedMotion();
  if (introActive) {
    try { sessionStorage.setItem("ct-intro", "1"); } catch (e) { /* sin almacenamiento: puede repetirse */ }
    runIntro(false);
  } else {
    root.classList.remove("intro-on");
    if (intro) intro.hidden = true;
    requestAnimationFrame(function () { requestAnimationFrame(startHero); });
  }
  /* Seguro general de la portada */
  setTimeout(startHero, 3800);

  var replay = document.getElementById("replay-intro");
  if (replay) {
    if (reducedMotion()) replay.hidden = true;
    replay.addEventListener("click", function () {
      if (reducedMotion() || running) return;
      window.scrollTo({ top: 0, behavior: "instant" });
      restartHero();
      runIntro(true);
    });
  }

  /* ---------- 3. Luz de la portada ---------- */
  if (hero && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion()) {
    var lightFrame = 0;
    hero.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse" || lightFrame) return;
      lightFrame = requestAnimationFrame(function () {
        lightFrame = 0;
        var rect = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + "%");
        hero.style.setProperty("--my", ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + "%");
      });
    });
  }

  /* ---------- 4. La casita de la historia ---------- */
  var casita = document.querySelector(".casita");
  if (casita && "IntersectionObserver" in window && !reducedMotion()) {
    casita.classList.add("is-armed");
    var casitaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        casita.classList.add("is-in");
        casitaObserver.disconnect();
      });
    }, { threshold: 0.35 });
    casitaObserver.observe(casita);
  }

  /* ---------- 5. Menú: sección activa ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.desktop-nav a[href^="#"]'));
  var targets = [
    ["catalogo", "#catalogo"],
    ["categorias", "#categorias"],
    ["productos", "#catalogo"],
    ["casa-tito", "#casa-tito"],
    ["contacto", "#contacto"]
  ].map(function (pair) { return { el: document.getElementById(pair[0]), href: pair[1] }; })
   .filter(function (item) { return item.el; });

  if (links.length && targets.length) {
    var ticking = false;
    var current = null;
    var update = function () {
      ticking = false;
      var line = window.innerHeight * 0.35;
      var next = null;
      targets.forEach(function (item) { if (item.el.getBoundingClientRect().top <= line) next = item.href; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) next = "#contacto";
      if (next === current) return;
      current = next;
      links.forEach(function (link) {
        var active = link.getAttribute("href") === current;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
      });
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }
})();
