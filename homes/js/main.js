(function () {
  "use strict";

  var header = document.querySelector(".header");
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
      if (header) header.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
  }

  // Solid header once the page scrolls past the hero top
  if (header && document.body.classList.contains("home")) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Scroll reveal
  var items = document.querySelectorAll(".section__head, .duo__card, .gallery__item, .split__media, .split__copy, .step, .faq__list details, .trust__item, .enquire__form");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  }

  // Enquiry form: opens WhatsApp with the details filled in
  var form = document.getElementById("enquiry-form");
  if (form) {
    var err = document.getElementById("enquiry-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var get = function (n) { var el = form.elements[n]; return el ? String(el.value || "").trim() : ""; };
      var missing = ["name", "phone"].filter(function (n) {
        var bad = !get(n);
        form.elements[n].classList.toggle("is-invalid", bad);
        return bad;
      });
      if (err) err.hidden = !missing.length;
      if (missing.length) { form.elements[missing[0]].focus(); return; }
      var lines = ["Hello Barima Homes, I'd like to make an enquiry.", "", "Name: " + get("name"), "Phone: " + get("phone"), "Interested in: " + get("type")];
      if (get("area")) lines.push("Area: " + get("area"));
      if (get("budget")) lines.push("Budget: GH\u20B5 " + get("budget").replace(/^\s*(gh\s*)?\u20B5?\s*/i, ""));
      if (get("message")) lines.push("", get("message"));
      window.open("https://wa.me/233548580304?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
    form.addEventListener("input", function (e) {
      if (e.target.classList.contains("is-invalid") && e.target.value.trim()) e.target.classList.remove("is-invalid");
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
