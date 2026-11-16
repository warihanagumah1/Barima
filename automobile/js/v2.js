(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll progress + hero parallax
  var bar = document.querySelector(".progress span");
  var heroImg = document.querySelector(".hero__photo img");
  var ticking = false;
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty("--p", h > 0 ? (window.scrollY / h).toFixed(4) : 0);
    if (heroImg && !reduce && window.scrollY < 900) heroImg.style.transform = "scale(1.06) translateY(" + (window.scrollY * 0.06).toFixed(1) + "px)";
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Service switch: highlight the umbrella in view
  var sw = document.querySelector(".switch");
  if (sw) {
    var thumb = sw.querySelector(".switch__thumb");
    var items = sw.querySelectorAll(".switch__item");
    var setActive = function (key) {
      sw.dataset.active = key || "";
      var active = null;
      items.forEach(function (it) {
        var on = it.dataset.umbrella === key;
        it.classList.toggle("is-active", on);
        if (on) active = it;
      });
      if (active) {
        thumb.style.width = active.offsetWidth + "px";
        thumb.style.transform = "translateX(" + active.offsetLeft + "px)";
        thumb.style.opacity = "1";
      } else {
        thumb.style.opacity = "0";
      }
    };
    var sections = document.querySelectorAll("[data-umbrella]:not(.switch__item)");
    var current = "";
    var check = function () {
      var mid = window.innerHeight * 0.4, key = "";
      sections.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) key = sec.dataset.umbrella;
      });
      if (key !== current) { current = key; setActive(key); }
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", function () { current = "_"; check(); });
    check();
  }

  // Spotlight on umbrella cards
  document.querySelectorAll(".umbrella").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
})();

// Hero slider
(function () {
  "use strict";
  var slider = document.querySelector("[data-slider]");
  if (!slider) return;
  var hero = slider.closest(".hero");
  var slides = slider.querySelectorAll(".slide");
  var tabs = slider.querySelectorAll(".slider__tab");
  var DURATION = 7000;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var index = 0, timer = null, paused = false;
  slider.style.setProperty("--slide-ms", DURATION + "ms");
  if (reduce) slider.classList.add("is-static");

  function go(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) {
      var on = k === index;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
      s.querySelectorAll("a, button").forEach(function (el) { el.tabIndex = on ? 0 : -1; });
    });
    tabs.forEach(function (t, k) {
      var on = k === index;
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", on ? "true" : "false");
      if (on) { void t.offsetWidth; t.classList.add("is-active"); } // restart progress bar
    });
    if (hero) hero.dataset.theme = slides[index].dataset.theme;
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (reduce || paused) return;
    timer = setTimeout(function () { go(index + 1); }, DURATION);
  }
  function pause(p) {
    paused = p;
    slider.classList.toggle("is-paused", p);
    if (p) clearTimeout(timer); else schedule();
  }

  tabs.forEach(function (t) { t.addEventListener("click", function () { go(+t.dataset.go); }); });
  slider.querySelectorAll(".slider__arrow").forEach(function (b) {
    b.addEventListener("click", function () { go(index + (+b.dataset.dir)); });
  });
  slider.addEventListener("mouseenter", function () { pause(true); });
  slider.addEventListener("mouseleave", function () { pause(false); });
  slider.addEventListener("focusin", function () { pause(true); });
  slider.addEventListener("focusout", function () { pause(false); });
  slider.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden) clearTimeout(timer); else schedule(); });

  // Swipe
  var startX = null, startY = null;
  var vp = slider.querySelector(".slider__viewport");
  vp.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") { startX = e.clientX; startY = e.clientY; } });
  vp.addEventListener("pointerup", function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
  vp.addEventListener("pointercancel", function () { startX = null; });

  go(0);
})();
