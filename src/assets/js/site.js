/* Navbar (menu mobile) e filtro de projetos.
   Cada bloco verifica se os elementos existem — a mesma página não precisa ter tudo. */
(function () {
  "use strict";

  /* ---------- Menu mobile ---------- */
  var header = document.querySelector("[data-nav]");
  var toggle = header && header.querySelector(".nav-toggle");
  var nav = header && header.querySelector(".site-nav");

  if (header && toggle && nav) {
    var mq = window.matchMedia("(max-width: 760px)");

    var setOpen = function (open, returnFocus) {
      header.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", toggle.getAttribute(open ? "data-label-close" : "data-label-open") || "");
      if (!open && returnFocus) toggle.focus();
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Fecha ao escolher uma página (inclusive âncoras da mesma página)
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    // Esc fecha e devolve o foco ao botão
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("nav-open")) setOpen(false, true);
    });

    // Clique/toque fora fecha
    document.addEventListener("click", function (e) {
      if (header.classList.contains("nav-open") && !header.contains(e.target)) setOpen(false);
    });

    // Ao voltar para a largura de desktop, garante o estado "fechado"
    var onChange = function () {
      if (!mq.matches) setOpen(false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);

    // Voltar/avançar do navegador (bfcache) não deve reabrir o menu
    window.addEventListener("pageshow", function () {
      setOpen(false);
    });
  }

  /* ---------- Filtro de projetos por tecnologia ---------- */
  var filters = document.querySelector("[data-filters]");
  var grid = document.querySelector("[data-grid]");

  if (filters && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".project-card"));
    var buttons = Array.prototype.slice.call(filters.querySelectorAll("[data-filter]"));
    var status = document.querySelector("[data-filter-status]");
    filters.hidden = false; // sem JS os filtros ficam ocultos e todos os cards aparecem

    var apply = function (key) {
      var shown = 0;
      cards.forEach(function (card) {
        var techs = (card.getAttribute("data-tech") || "").split("|");
        var match = key === "all" || techs.indexOf(key) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === key));
      });
      if (status) {
        var tpl = shown === 1 ? status.getAttribute("data-template-one") : status.getAttribute("data-template");
        status.textContent = (tpl || "").replace("{n}", String(shown));
      }
    };

    filters.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (btn) apply(btn.getAttribute("data-filter"));
    });
  }
})();
