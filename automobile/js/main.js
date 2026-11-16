(function () {
  "use strict";

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      menu.hidden = open;
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        menu.hidden = true;
      }
    });
  }

  // Header shadow on scroll
  var header = document.querySelector(".header");
  var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 10); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Custom dropdowns: the options always open directly below the field
  document.querySelectorAll(".field select").forEach(function (select, n) {
    var field = select.closest(".field");
    var labelText = field.querySelector("span");
    // Swap the <label> for a <div> so clicks inside the list don't re-toggle it
    if (field.tagName === "LABEL") {
      var div = document.createElement("div");
      div.className = field.className;
      while (field.firstChild) div.appendChild(field.firstChild);
      field.parentNode.replaceChild(div, field);
      field = div;
    }
    var id = "dd" + n;
    labelText.id = id + "-label";
    field.classList.add("dd");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dd__btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-labelledby", id + "-label " + id + "-value");
    btn.innerHTML = '<span class="dd__value" id="' + id + '-value"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var list = document.createElement("ul");
    list.className = "dd__list";
    list.id = id + "-list";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-labelledby", id + "-label");
    list.tabIndex = -1;
    btn.setAttribute("aria-controls", list.id);

    var opts = [];
    Array.prototype.forEach.call(select.options, function (o, i) {
      if (!o.value) return; // placeholder stays as the button text only
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.id = id + "-o" + i;
      li.dataset.value = o.value;
      li.innerHTML = '<span>' + o.text + '</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      list.appendChild(li);
      opts.push(li);
    });

    select.classList.add("dd__native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    var wrap = document.createElement("div");
    wrap.className = "dd__wrap";
    wrap.appendChild(btn);
    wrap.appendChild(list);
    wrap.appendChild(select);
    field.appendChild(wrap);

    var placeholder = select.options[0] && !select.options[0].value ? select.options[0].text : "";
    var active = -1;

    function sync() {
      var val = select.value;
      field.querySelector(".dd__value").textContent = val ? select.options[select.selectedIndex].text : placeholder;
      btn.classList.toggle("is-placeholder", !val);
      opts.forEach(function (li) { li.setAttribute("aria-selected", li.dataset.value === val ? "true" : "false"); });
    }
    function setActive(i) {
      active = Math.max(0, Math.min(opts.length - 1, i));
      opts.forEach(function (li, j) { li.classList.toggle("is-active", j === active); });
      list.setAttribute("aria-activedescendant", opts[active].id);
    }
    function open() {
      field.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      var cur = opts.findIndex(function (li) { return li.dataset.value === select.value; });
      setActive(cur < 0 ? 0 : cur);
      list.focus({ preventScroll: true });
    }
    function close(focusBtn) {
      field.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      if (focusBtn) btn.focus({ preventScroll: true });
    }
    function choose(i) {
      select.value = opts[i].dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      field.classList.remove("is-invalid");
      btn.removeAttribute("aria-invalid");
      sync();
      close(true);
    }

    btn.addEventListener("click", function () { field.classList.contains("is-open") ? close(true) : open(); });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); open(); }
    });
    opts.forEach(function (li, i) {
      li.addEventListener("click", function () { choose(i); });
      li.addEventListener("mousemove", function () { setActive(i); });
    });
    list.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Home") { e.preventDefault(); setActive(0); }
      else if (e.key === "End") { e.preventDefault(); setActive(opts.length - 1); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(active); }
      else if (e.key === "Escape") { e.preventDefault(); close(true); }
      else if (e.key === "Tab") { close(false); }
    });
    document.addEventListener("click", function (e) {
      if (!field.contains(e.target)) close(false);
    });
    var err = document.createElement("small");
    err.className = "dd__error";
    err.id = id + "-error";
    err.textContent = "Please choose " + (placeholder ? placeholder.replace(/^Choose /i, "") : "an option") + ".";
    field.appendChild(err);
    btn.setAttribute("aria-describedby", err.id);
    select.addEventListener("invalid", function (e) {
      e.preventDefault(); // show our own message under the field instead
      field.classList.add("is-invalid");
      btn.setAttribute("aria-invalid", "true");
      setTimeout(function () { btn.focus(); });
    });
    select.form && select.form.addEventListener("reset", function () { setTimeout(sync); });
    // Always start with no country chosen. Browsers can otherwise restore the
    // last choice on refresh or when coming back to the page.
    function clearChoice() { select.selectedIndex = 0; field.classList.remove("is-invalid"); sync(); }
    clearChoice();
    window.addEventListener("pageshow", clearChoice);
  });

  // Forms: build an email with the details filled in
  document.querySelectorAll("form[data-email]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = form.querySelector(":invalid:not(fieldset)");
      if (firstBad && firstBad.classList.contains("dd__native")) {
        var dd = firstBad.closest(".dd");
        dd.classList.add("is-invalid");
        dd.querySelector(".dd__btn").focus();
        return;
      }
      if (!form.reportValidity()) return;
      var lines = [];
      new FormData(form).forEach(function (value, key) {
        if (String(value).trim()) lines.push(key + ": " + value);
      });
      var name = form.querySelector('[name="Name"]');
      var subject = form.dataset.subject + (name && name.value ? " from " + name.value : "");
      var body = "Hello Barima team,\n\n" + lines.join("\n") + "\n\nThank you.";
      window.location.href = "mailto:" + form.dataset.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  });

  // Open / closed status (Sunday–Friday, 8am–5pm Toronto time)
  var status = document.getElementById("open-status");
  if (status) {
    try {
      var parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Toronto", weekday: "short", hour: "numeric", hour12: false
      }).formatToParts(new Date());
      var day = "", hour = 0;
      parts.forEach(function (p) {
        if (p.type === "weekday") day = p.value;
        if (p.type === "hour") hour = parseInt(p.value, 10) % 24;
      });
      var open = day.indexOf("Sat") !== 0 && hour >= 8 && hour < 17;
      status.textContent = open ? "Open now" : "Closed now";
      status.classList.toggle("is-open", open);
    } catch (err) { /* leave blank */ }
  }

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
