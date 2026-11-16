/* ==========================================================
   Barima Homes listings
   To add, change or remove a listing, edit the LISTINGS array
   below. Fields:
     type     "house" | "apartment" | "land"
     title    short name shown on the card
     location area and town, e.g. "East Legon, Accra"
     price    e.g. "GH₵ 1,200,000" or "Price on request"
     amount   optional number in cedis, e.g. 1200000. Used by the
              budget search; listings without it always show.
     specs    short facts, e.g. ["4 bedrooms", "4 bathrooms"]
     image    main photo file in assets/images/
     photos   optional extra photos, e.g. ["apt-int-1.jpg", "apt-int-2.jpg"];
              the card then gets arrows to flick through them
     ref      your own reference code (sent in the WhatsApp message)
     status   "available" or "sold". Sold listings move to the bottom,
              look faded and get an "Ask about similar" button.
   The entries below are placeholders: swap in your real listings
   before going live.
   ----------------------------------------------------------
   GOOGLE SHEET (easiest way to manage listings)
   Paste the sheet's "Publish to web" CSV link below. When it is
   set, the page loads listings from the sheet and the LISTINGS
   array further down is only used if the sheet can't be reached.
   See HOW-TO-ADD-LISTINGS.md for the steps and columns.
   ========================================================== */
var SHEET_CSV_URL = "";

var LISTINGS = [
  { type: "house", title: "Modern gated house", location: "Accra", price: "Price on request", specs: ["Bedrooms: TBC", "Gated compound"], image: "modern-1.jpg", ref: "BH-H01", status: "available" },
  { type: "house", title: "Contemporary townhouse", location: "Accra", price: "Price on request", specs: ["Bedrooms: TBC", "Roof terrace"], image: "modern-2.jpg", ref: "BH-H02", status: "available" },
  { type: "house", title: "Villa with pool", location: "Greater Accra", price: "Price on request", specs: ["Bedrooms: TBC", "Swimming pool"], image: "house-1.jpg", ref: "BH-H03", status: "available" },
  { type: "house", title: "Two-storey house", location: "Greater Accra", price: "Price on request", specs: ["Bedrooms: TBC", "Balconies"], image: "house-3.jpg", ref: "BH-H04", status: "sold" },
  { type: "house", title: "Family bungalow", location: "Ghana", price: "Price on request", specs: ["Bedrooms: TBC", "Veranda"], image: "house-4.jpg", photos: ["interior-new-2.jpg"], ref: "BH-H05", status: "available" },
  { type: "apartment", title: "Apartment in a modern block", location: "East Legon, Accra", price: "Price on request", specs: ["1–3 bedrooms: TBC", "Lift access: TBC"], image: "apartment.jpg", photos: ["interior-new-1.jpg", "interior-new-2.jpg", "apt-int-1.jpg", "apt-int-3.jpg"], ref: "BH-A01", status: "available" },
  { type: "apartment", title: "Modern apartment building", location: "Accra", price: "Price on request", specs: ["Bedrooms: TBC", "Walled compound"], image: "modern-3.jpg", photos: ["interior-new-1.jpg", "interior-new-2.jpg", "apt-int-1.jpg", "apt-int-3.jpg"], ref: "BH-A02", status: "available" },
  { type: "apartment", title: "New-build apartments", location: "Accra", price: "Price on request", specs: ["Bedrooms: TBC", "Balconies"], image: "hero-modern.jpg", photos: ["interior-new-1.jpg", "interior-new-2.jpg", "apt-int-1.jpg", "apt-int-3.jpg"], ref: "BH-A03", status: "available" },
  { type: "apartment", title: "2-bedroom apartment", location: "East Legon, Accra", price: "Price on request", specs: ["2 bedrooms: TBC", "Open-plan kitchen"], image: "apt-ext-1.jpg", photos: ["interior-new-1.jpg", "interior-new-2.jpg", "apt-int-1.jpg", "apt-int-3.jpg"], ref: "BH-A04", status: "available" },
  { type: "apartment", title: "Apartment with city views", location: "Accra", price: "Price on request", specs: ["Bedrooms: TBC", "Balcony"], image: "apt-ext-2.jpg", photos: ["interior-new-1.jpg", "interior-new-2.jpg", "apt-int-1.jpg", "apt-int-3.jpg"], ref: "BH-A05", status: "sold" },
  { type: "land", title: "Residential plot", location: "Ghana", price: "Price on request", specs: ["Plot size: TBC", "Documents available"], image: "plot-c.jpg", ref: "BH-L01", status: "available" },
  { type: "land", title: "Building plot", location: "Ghana", price: "Price on request", specs: ["Plot size: TBC", "Documents available"], image: "plot-b.jpg", ref: "BH-L02", status: "available" },
  { type: "land", title: "Investment land", location: "Ghana", price: "Price on request", specs: ["Acreage: TBC", "Documents available"], image: "plot-a.jpg", ref: "BH-L03", status: "sold" }
];

(function () {
  "use strict";
  var grid = document.getElementById("listing-grid");
  if (!grid) return;
  var count = document.getElementById("listing-count");
  var filters = document.querySelectorAll(".filter");
  var form = document.getElementById("listing-search");
  var clearBtn = document.getElementById("listing-clear");
  var LABEL = { house: "House", apartment: "Apartment", land: "Land" };
  var PLURAL = { house: "houses", apartment: "apartments", land: "land" };
  var PHONE = "233548580304";
  var state = { type: "all", area: "", budget: 0 };
  var DATA = LISTINGS;

  // Photos: a file name in assets/images/, a full https:// link,
  // or a Google Drive share link (the file must be shared as "Anyone with the link")
  function imgSrc(v) {
    v = String(v || "").trim();
    var d = v.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
    if (d) return "https://drive.google.com/thumbnail?id=" + d[1] + "&sz=w1600";
    if (/^https?:\/\//i.test(v)) return v;
    return "assets/images/" + v;
  }

  // Minimal CSV parser (handles quotes, commas and line breaks inside quotes)
  function parseCSV(text) {
    var rows = [], row = [], cell = "", q = false;
    text = String(text).replace(/^\uFEFF/, "");
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  function split(v) { return String(v || "").split(/\s*[|;\n]\s*/).map(function (s) { return s.trim(); }).filter(Boolean); }

  function fromSheet(text) {
    var rows = parseCSV(text);
    if (rows.length < 2) return [];
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    return rows.slice(1).map(function (r) {
      var o = {};
      head.forEach(function (h, i) { o[h] = (r[i] || "").trim(); });
      var type = (o.type || "").toLowerCase();
      if (type === "houses") type = "house";
      if (type === "apartments" || type === "flat") type = "apartment";
      if (type === "plot" || type === "plots") type = "land";
      if (!o.title || !LABEL[type]) return null;
      var pics = split(o.photos);
      var main = o.image || pics.shift();
      if (!main) return null;
      var specs = [];
      if (o.bedrooms) specs.push(/bed/i.test(o.bedrooms) ? o.bedrooms : o.bedrooms + (o.bedrooms === "1" ? " bedroom" : " bedrooms"));
      if (o.size) specs.push(o.size);
      specs = specs.concat(split(o.features));
      var amount = toNumber(o.amount || o.price);
      var item = {
        type: type, title: o.title, location: o.location || o.area || "Ghana",
        price: o.price || "Price on request", specs: specs, image: main, photos: pics,
        ref: o.ref || "", status: (o.status || "available").toLowerCase()
      };
      if (amount) item.amount = amount;
      return item;
    }).filter(Boolean);
  }

  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function toNumber(v) {
    var s = String(v || "").toLowerCase().replace(/[, ]/g, "").replace(/gh₵|ghs|ghc|cedis?|₵/g, "");
    var m = s.match(/^(\d+(?:\.\d+)?)(k|m)?$/);
    if (!m) return 0;
    var n = parseFloat(m[1]);
    if (m[2] === "k") n *= 1e3;
    if (m[2] === "m") n *= 1e6;
    return Math.round(n);
  }
  function money(n) { return "GH₵ " + n.toLocaleString("en-GH"); }
  function wa(text) { return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text); }

  function isSold(l) { return String(l.status || "").toLowerCase() === "sold"; }

  function card(l) {
    var sold = isSold(l);
    var msg = sold
      ? "Hello Barima Homes, I saw this sold listing and I'm looking for something similar:\n" + l.title + " (" + LABEL[l.type] + ")\n" + l.location + (l.ref ? "\nRef: " + l.ref : "")
      : "Hello Barima Homes, I'm interested in this listing:\n" + l.title + " (" + LABEL[l.type] + ")\n" + l.location + (l.ref ? "\nRef: " + l.ref : "");
    var specs = (l.specs || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    return '<article class="listing' + (sold ? " is-sold" : "") + '" data-type="' + esc(l.type) + '" data-ref="' + esc(l.ref || "") + '">' +
      '<div class="listing__media">' +
        '<img src="' + esc(imgSrc(l.image)) + '" alt="' + esc(l.title + ", " + l.location) + '" loading="lazy">' +
        (l.photos && l.photos.length ?
          '<button class="listing__nav listing__nav--prev" type="button" aria-label="Previous photo">‹</button>' +
          '<button class="listing__nav listing__nav--next" type="button" aria-label="Next photo">›</button>' +
          '<span class="listing__count">1/' + (l.photos.length + 1) + "</span>" : "") +
        '<span class="tag listing__tag listing__tag--' + esc(l.type) + '">' + LABEL[l.type] + "</span>" +
        '<span class="listing__flag listing__flag--' + (sold ? "sold" : "available") + '">' + (sold ? "Sold" : "Available") + "</span>" +
      "</div>" +
      '<div class="listing__body">' +
        "<h3>" + esc(l.title) + "</h3>" +
        '<p class="listing__loc"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>' + esc(l.location) + "</p>" +
        (specs ? '<ul class="listing__specs">' + specs + "</ul>" : "") +
        '<div class="listing__foot">' +
          '<span class="listing__price">' + (sold ? "Sold" : esc(l.price)) + "</span>" +
          '<a class="btn ' + (sold ? "btn--outline" : "btn--red") + ' btn--sm" href="' + wa(msg) + '" target="_blank" rel="noopener">' + (sold ? "Ask about similar" : "Enquire") + "</a>" +
        "</div>" +
      "</div>" +
    "</article>";
  }

  function matches(l) {
    if (state.type !== "all" && l.type !== state.type) return false;
    if (state.area) {
      var hay = (l.location + " " + l.title + " " + (l.area || "")).toLowerCase();
      var words = state.area.toLowerCase().split(/[\s,]+/).filter(Boolean);
      if (!words.some(function (w) { return hay.indexOf(w) !== -1; })) return false;
    }
    if (state.budget && typeof l.amount === "number" && l.amount > state.budget) return false;
    return true;
  }

  function summary() {
    var bits = [];
    bits.push(state.type === "all" ? "property" : LABEL[state.type].toLowerCase());
    if (state.area) bits.push("in " + state.area);
    if (state.budget) bits.push("up to " + money(state.budget));
    return bits.join(" ");
  }

  function emptyState() {
    var text = "Hello Barima Homes, I'm looking for a " + summary() + ". Please let me know what you have.";
    return '<div class="listings__empty">' +
      "<h3>No listings match your search yet</h3>" +
      "<p>Send us your request and we'll look for a litigation-free " + esc(summary()) + " for you.</p>" +
      '<div class="listings__empty-actions">' +
        '<a class="btn btn--whatsapp" href="' + wa(text) + '" target="_blank" rel="noopener">Send request on WhatsApp</a>' +
        '<a class="btn btn--dark" href="tel:+233548580304">Call 054 858 0304</a>' +
      "</div></div>";
  }

  function render() {
    var list = DATA.filter(matches)
      .map(function (l, i) { return { l: l, i: i }; })
      .sort(function (a, b) { return (isSold(a.l) - isSold(b.l)) || (a.i - b.i); })
      .map(function (x) { return x.l; });
    var avail = list.filter(function (l) { return !isSold(l); }).length;
    grid.innerHTML = list.length ? list.map(card).join("") : emptyState();
    if (count) count.textContent = list.length + (list.length === 1 ? " property" : " properties") + (list.length ? " · " + avail + " available" : "");
    filters.forEach(function (b) {
      var on = b.getAttribute("data-filter") === state.type;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });
    if (clearBtn) clearBtn.hidden = !(state.area || state.budget);
    var more = document.querySelector(".listings__more");
    if (more) more.hidden = !list.length;
    var q = new URLSearchParams();
    if (state.type !== "all") q.set("type", state.type);
    if (state.area) q.set("area", state.area);
    if (state.budget) q.set("budget", String(state.budget));
    try { history.replaceState(null, "", "listings.html" + (q.toString() ? "?" + q : "")); } catch (e) {}
  }

  // Photo arrows on cards that have extra photos
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".listing__nav");
    if (!btn) return;
    var art = btn.closest(".listing");
    var l = DATA.filter(function (x) { return x.ref === art.getAttribute("data-ref"); })[0];
    if (!l) return;
    var all = [l.image].concat(l.photos || []);
    var i = (parseInt(art.getAttribute("data-i") || "0", 10) + (btn.classList.contains("listing__nav--next") ? 1 : all.length - 1)) % all.length;
    art.setAttribute("data-i", i);
    art.querySelector(".listing__media img").src = imgSrc(all[i]);
    art.querySelector(".listing__count").textContent = (i + 1) + "/" + all.length;
  });

  filters.forEach(function (b) {
    b.addEventListener("click", function () { state.type = b.getAttribute("data-filter"); render(); });
  });
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      state.area = form.area.value.trim();
      state.budget = toNumber(form.budget.value);
      render();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      state.area = ""; state.budget = 0;
      if (form) { form.area.value = ""; form.budget.value = ""; }
      render();
    });
  }

  // Read the search from the URL (the homepage finder sends type, area, budget)
  var params = new URLSearchParams(location.search);
  var t = (params.get("type") || "all").toLowerCase();
  state.type = LABEL[t] ? t : "all";
  state.area = (params.get("area") || "").trim();
  state.budget = toNumber(params.get("budget"));
  if (form) {
    form.area.value = state.area;
    form.budget.value = state.budget ? state.budget.toLocaleString("en-GH") : "";
  }

  function useData(list) {
    DATA = list;
    DATA.forEach(function (l, i) { if (!l.ref) l.ref = "BH-" + (i + 1); });
    render();
  }

  if (SHEET_CSV_URL) {
    grid.innerHTML = '<p class="listings__loading">Loading listings…</p>';
    if (count) count.textContent = "";
    var done = false;
    var fallback = setTimeout(function () { if (!done) { done = true; useData(LISTINGS); } }, 8000);
    fetch(SHEET_CSV_URL, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (text) {
        var list = fromSheet(text);
        if (done) return;
        done = true; clearTimeout(fallback);
        useData(list.length ? list : LISTINGS);
      })
      .catch(function () { if (!done) { done = true; clearTimeout(fallback); useData(LISTINGS); } });
  } else {
    useData(LISTINGS);
  }
})();
