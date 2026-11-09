/*
  CASA TITO — Experiencia cinematográfica
  1. Introducción: logotipo original sobre fondo azul, una vez por sesión. Se puede omitir
     (botón, clic, tecla, rueda o gesto). Con movimiento reducido o sin JavaScript no aparece.
  2. Entrada escalonada de la portada y de la casita cuando el telón se retira.
  3. Estado activo del menú según la sección visible.
  Todo es mejora progresiva: el CSS base ya muestra el estado final y tiene seguros por tiempo.
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var hero = document.querySelector(".hero");
  var heroStarted = false;

  function reducedMotion() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }

  function startHero() {
    if (heroStarted || !hero) return;
    heroStarted = true;
    hero.classList.add("is-in");
  }

  /* ---------- 1. Introducción ---------- */
  var intro = document.getElementById("intro");
  var introActive = intro && root.classList.contains("intro-on") && !reducedMotion();

  if (!introActive) {
    if (intro) intro.remove();
    root.classList.remove("intro-on");
    /* Dos fotogramas para que la portada arranque desde su estado inicial */
    requestAnimationFrame(function () { requestAnimationFrame(startHero); });
  } else {
    try { sessionStorage.setItem("ct-intro", "1"); } catch (e) { /* sin almacenamiento: se verá de nuevo */ }

    var leaving = false;
    var timers = [];
    var skipEvents = ["keydown", "wheel", "touchmove"];

    var leave = function (fast) {
      if (leaving) return;
      leaving = true;
      timers.forEach(clearTimeout);
      skipEvents.forEach(function (type) { window.removeEventListener(type, skip); });
      intro.classList.add(fast ? "is-skipped" : "is-leaving");
      /* La portada empieza a aparecer mientras sube el telón */
      setTimeout(startHero, fast ? 40 : 140);
      setTimeout(function () {
        root.classList.remove("intro-on");
        if (intro.parentNode) intro.parentNode.removeChild(intro);
      }, fast ? 460 : 880);
    };
    var skip = function () { leave(true); };

    var play = function () {
      if (leaving || intro.classList.contains("is-playing")) return;
      intro.classList.add("is-playing");
      timers.push(setTimeout(function () { leave(false); }, 1420));
    };

    intro.addEventListener("click", skip);
    skipEvents.forEach(function (type) { window.addEventListener(type, skip, { passive: true }); });

    /* Espera a que el logotipo esté decodificado (máximo 700 ms) para no revelar una placa vacía */
    var img = intro.querySelector("img");
    var ready = img && img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    Promise.race([ready, new Promise(function (resolve) { setTimeout(resolve, 700); })])
      .then(function () { requestAnimationFrame(play); });

    /* Seguro: pase lo que pase, la intro no dura más de 3 s */
    timers.push(setTimeout(function () { leave(true); }, 3000));
  }

  /* Seguro general para la portada */
  setTimeout(startHero, 3400);

  /* ---------- 3. Menú: sección activa ---------- */
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
      /* Al llegar al final de la página, se marca Contacto */
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
