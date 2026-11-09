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

  /* ---------- 6. Escena de la portada (del lienzo «Casa Tito Premium Cinematográfico») ----------
     El scroll nativo de la página mueve la escena: nunca se frena ni se secuestra.
     measure() mide; update() sólo escribe transform/opacity en cada cuadro. */
  var track = document.querySelector(".ct-track");
  var scene = document.querySelector(".ct-scene");
  var header = document.querySelector(".site-header");
  var sceneM = null, sceneFrame = 0, lastW = 0, lastVh = 0;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var hoverNone = window.matchMedia ? window.matchMedia("(hover: none)").matches : false;

  function sceneReset() {
    root.classList.remove("scene-pin");
    ["--H", "--edge0", "--edge1"].forEach(function (k) { root.style.removeProperty(k); });
    if (track) track.style.height = "";
    [".band", ".ct-strip", ".ct-shelf", ".ct-giant", ".ct-seal"].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) { el.style.transform = ""; el.style.opacity = ""; el.style.visibility = ""; }
    });
    sceneM = null;
  }

  function sceneMeasure(force) {
    if (!track || !scene || !header) return;
    var vh = window.innerHeight;
    var W = document.documentElement.clientWidth;
    /* En el celular, la barra del navegador cambia el alto al desplazarse: no remedir por eso */
    if (!force && sceneM && hoverNone && W === lastW && Math.abs(vh - lastVh) < 160) return;
    lastW = W; lastVh = vh;
    var hdr = header.offsetHeight;
    root.style.setProperty("--hdr", hdr + "px");
    var wantPin = !reducedMotion() && vh >= 460 && vh <= 1300 && W >= 300;
    if (!wantPin) { sceneReset(); return; }
    var H = vh - hdr;
    var compact = W < 768;
    var edge0 = Math.round(H * (compact ? .85 : .79));
    var edge1 = Math.round(H * (compact ? .37 : .45));
    root.classList.add("scene-pin");
    root.style.setProperty("--H", H + "px");
    root.style.setProperty("--edge0", edge0 + "px");
    root.style.setProperty("--edge1", edge1 + "px");
    var strip = scene.querySelector(".ct-strip");
    var shelf = scene.querySelector(".ct-shelf");
    var giant = scene.querySelector(".ct-giant");
    strip.style.transform = "";
    var stripW = strip.scrollWidth;
    var endX = Math.min(0, W - stripW - (compact ? 16 : 28));
    var qDist = H * .72;
    var sStart = qDist * .42;
    var sDist = Math.max(H * .5, (W - endX) * .86);
    var total = Math.max(qDist, sStart + sDist) + H * .06;
    track.style.height = (H + total) + "px";
    sceneM = {
      H: H, W: W, hdr: hdr, edge0: edge0, edge1: edge1, endX: endX, qDist: qDist, sStart: sStart, sDist: sDist, total: total, compact: compact,
      shelfScale: compact ? .94 : .64,
      shelfX0: compact ? 16 : Math.round(W * .47),
      shelfW: shelf.scrollWidth,
      giantW: giant.scrollWidth,
      cards: Array.prototype.slice.call(scene.querySelectorAll(".feature-card")),
      lead: scene.querySelector(".ct-lead"),
      band: scene.querySelector(".band"), strip: strip, shelf: shelf, giant: giant,
      seal: scene.querySelector(".ct-seal"),
      counter: scene.querySelector(".ct-counter"),
      counterN: scene.querySelector(".ct-counter-n"),
      prog: scene.querySelector(".ct-progress i")
    };
    sceneUpdate();
  }

  function sceneUpdate() {
    sceneFrame = 0;
    var m = sceneM; if (!m) return;
    var y = clamp(m.hdr - track.getBoundingClientRect().top, 0, m.total);
    var q = clamp(y / m.qDist, 0, 1), eq = ease(q);
    var edge = lerp(m.edge0, m.edge1, eq);
    m.band.style.transform = "translate3d(0," + (edge - m.edge1).toFixed(1) + "px,0)";
    m.band.scrollLeft = 0; m.strip.scrollLeft = 0; /* el foco del navegador no debe correr la tira */
    var s = clamp((y - m.sStart) / m.sDist, 0, 1);
    var sx = lerp(m.W, m.endX, s);
    m.strip.style.transform = "translate3d(" + sx.toFixed(1) + "px,0,0)";
    var travel = Math.max(0, m.shelfW * m.shelfScale - m.W * .7);
    var shelfX = lerp(m.shelfX0, 16 - travel, y / m.total);
    m.shelf.style.transform = "translate3d(" + shelfX.toFixed(1) + "px," + (edge - m.edge0).toFixed(1) + "px,0) scale(" + lerp(1, m.shelfScale, eq).toFixed(4) + ")";
    m.giant.style.transform = "translate3d(" + lerp(m.W, -m.giantW, s).toFixed(1) + "px,0,0)";
    m.seal.style.opacity = (1 - clamp(q / .5, 0, 1)).toFixed(3);
    m.seal.style.transform = "translate3d(0," + (-q * 34).toFixed(1) + "px,0)";
    m.seal.style.visibility = q > .6 ? "hidden" : "visible";
    m.counter.style.opacity = q > .94 ? "1" : "0";
    m.prog.style.transform = "scaleX(" + (y / m.total).toFixed(4) + ")";
    var current = 1;
    var reveal = function (el, left) { el.style.setProperty("--reveal", (clamp((.98 - left / m.W) / .3, -.4, 1.6) * 100).toFixed(1) + "%"); };
    reveal(m.lead, sx + m.lead.offsetLeft);
    m.cards.forEach(function (card, i) {
      var left = sx + card.offsetLeft;
      reveal(card, left);
      if (left < m.W * .55) current = i + 1;
    });
    m.counterN.textContent = String(current).padStart(2, "0");
  }

  /* Con teclado: al enfocar una tarjeta de la tira, la página baja hasta mostrarla */
  function sceneFocus(target) {
    var m = sceneM; if (!m || !target) return;
    var card = target.closest(".feature-card, .ct-lead"); if (!card) return;
    var targetX = Math.max(m.endX, Math.min(m.W, (m.compact ? 12 : m.W * .18) - card.offsetLeft));
    var s = (m.W - targetX) / (m.W - m.endX);
    var want = m.sStart + s * m.sDist;
    var now = clamp(m.hdr - track.getBoundingClientRect().top, 0, m.total);
    window.scrollBy({ top: want - now, behavior: "instant" });
  }

  if (track && scene) {
    window.addEventListener("scroll", function () { if (!sceneFrame) sceneFrame = requestAnimationFrame(sceneUpdate); }, { passive: true });
    window.addEventListener("resize", function () { sceneMeasure(false); }, { passive: true });
    scene.addEventListener("focusin", function (event) { if (sceneM) sceneFocus(event.target); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { sceneMeasure(true); });
    window.addEventListener("load", function () { sceneMeasure(true); });
    sceneMeasure(true);
    var noticeClose = document.getElementById("notice-close");
    if (noticeClose) noticeClose.addEventListener("click", function () { setTimeout(function () { sceneMeasure(true); }, 0); });
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
