/* ==========================================================
   Barima Homes listings
   To add, change or remove a listing, edit the LISTINGS array
   below (or use the Google Sheet, see further down). Fields:
     type        "house" | "apartment" | "land"
     title       short name shown on the card
     location    area and town, e.g. "East Legon, Accra"
     price       e.g. "GH₵ 1,200,000" or "Price on request"
     amount      optional number in cedis, e.g. 1200000. Used by the
                 budget search; listings without it always show.
     specs       short facts, e.g. ["4 bedrooms", "4 bathrooms"]
     description optional paragraph shown in the detail view
     image       main photo: a file in assets/images/, a full https://
                 link, or a Google Drive share link
     photos      optional extra photos, e.g. ["kitchen.jpg", "bedroom.jpg"]
     videos      optional videos, any mix of:
                   - a YouTube link (normal, Shorts or youtu.be)
                   - a Vimeo link
                   - a Google Drive share link to a video
                   - a video file in assets/videos/, e.g. "tour.mp4"
                   - a full https:// link to an .mp4 file
     ref         your own reference code (sent in the WhatsApp message)
     status      "available" or "sold". Sold listings move to the bottom,
                 look faded and get an "Ask about similar" button.
   If a listing has no photo, its first video is used on the card.
   ----------------------------------------------------------
   GOOGLE SHEET (easiest way to manage listings)
   Paste the sheet's "Publish to web" CSV link below. When it is
   set, the page loads listings from the sheet and the LISTINGS
   array further down is only used if the sheet can't be reached.
   See HOW-TO-ADD-LISTINGS.md for the steps and columns.
   ========================================================== */
var SHEET_CSV_URL = "";

var LISTINGS = [
  // Example: copy this line, remove the // at the start and fill it in.
  // { type: "house", title: "4-bedroom house", location: "East Legon, Accra", price: "Price on request", specs: ["4 bedrooms", "Gated"], description: "", image: "my-house.jpg", photos: ["kitchen.jpg"], videos: ["https://youtu.be/XXXXXXXXXXX", "tour.mp4"], ref: "BH-H01", status: "available" },
  {
    type: "house",
    title: "The Belvoir Housing Complex",
    location: "Kutunse, Greater Accra",
    price: "Price on request",
    specs: ["Fitted kitchen", "Built-in wardrobes", "Feature fireplace wall", "Marble-finish floors"],
    description: "Newly finished homes with a modern, bright interior: LED cove ceilings, a fitted gloss kitchen with built-in oven, microwave and gas hob, built-in wardrobes, marble-finish floors and walls, and stylish bathrooms. Watch the video tour, then ask us for the documents and a viewing.",
    image: "belvoir-living-room.webp",
    videos: ["belvoir-tour.mp4"],
    photos: ["belvoir-kitchen.webp", "belvoir-bedroom-feature-wall.webp", "belvoir-master-bedroom.webp", "belvoir-wardrobes.webp", "belvoir-bathroom.webp", "belvoir-staircase.webp", "belvoir-exterior.webp"],
    ref: "BH-H01",
    status: "available"
  }
];

(function () {
  "use strict";
  var grid = document.getElementById("listing-grid");
  if (!grid) return;
  var count = document.getElementById("listing-count");
  var filters = document.querySelectorAll(".filter");
  var filterBar = document.querySelector(".filters");
  var form = document.getElementById("listing-search");
  var clearBtn = document.getElementById("listing-clear");
  var LABEL = { house: "House", apartment: "Apartment", land: "Land" };
  var PHONE = "233548580304";
  var state = { type: "all", area: "", budget: 0 };
  var DATA = LISTINGS;

  var ICON_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
  var ICON_CAM = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>';
  var ICON_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1-1.2 2 .8c-.2 1.4-1.3 2-2.5 1.8A7 7 0 0 1 8.4 9.8c-.1-1.2.4-2.3 1.8-2.5l.8 2z"/></svg>';
  var ICON_PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>';

  // ---------- Photos & videos ----------
  function driveId(v) {
    var d = String(v).match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
    return d ? d[1] : "";
  }
  // Photos: a file name in assets/images/, a full https:// link,
  // or a Google Drive share link (the file must be shared as "Anyone with the link")
  function imgSrc(v) {
    v = String(v || "").trim();
    var id = driveId(v);
    if (id) return "https://drive.google.com/thumbnail?id=" + id + "&sz=w1600";
    if (/^https?:\/\//i.test(v) || /^(assets|\.{0,2}\/)/.test(v)) return v;
    return "assets/images/" + v;
  }
  function photo(v) { return { kind: "image", src: imgSrc(v), thumb: imgSrc(v) }; }
  function video(v) {
    v = String(v || "").trim();
    if (!v) return null;
    var m = v.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/);
    if (m) return { kind: "embed", vertical: /\/shorts\//.test(v), src: "https://www.youtube-nocookie.com/embed/" + m[1] + "?autoplay=1&rel=0&playsinline=1&modestbranding=1", thumb: "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" };
    m = v.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { kind: "embed", src: "https://player.vimeo.com/video/" + m[1] + "?autoplay=1&title=0&byline=0", thumb: "" };
    var id = driveId(v);
    if (id) return { kind: "embed", src: "https://drive.google.com/file/d/" + id + "/preview", thumb: "https://drive.google.com/thumbnail?id=" + id + "&sz=w1200" };
    var src = /^https?:\/\//i.test(v) || /^(assets|\.{0,2}\/)/.test(v) ? v : "assets/videos/" + v;
    // Optional cover picture: a .webp with the same name next to the video
    // (e.g. tour.mp4 + tour.webp). The video itself only downloads when played.
    return { kind: "file", src: src, thumb: src.replace(/\.(mp4|m4v|mov|webm)(\?.*)?$/i, ".webp") };
  }
  function mediaOf(l) {
    if (l._media) return l._media;
    var pics = (l.photos || []).map(photo);
    var vids = (l.videos || []).map(video).filter(Boolean);
    var list = l.image ? [photo(l.image)].concat(vids, pics) : vids.concat(pics);
    // A video without its own thumbnail borrows the main photo as its poster
    var poster = l.image ? imgSrc(l.image) : (pics[0] && pics[0].src) || "";
    vids.forEach(function (v) { v.poster = v.thumb || poster; v.fallback = poster; v.isVideo = true; });
    l._media = list;
    return list;
  }
  function hasVideo(l) { return mediaOf(l).some(function (m) { return m.isVideo; }); }

  // What a slide looks like on a card or thumbnail (videos never autoplay here)
  function preview(m, alt, lazy) {
    var ld = lazy ? ' loading="lazy"' : "";
    if (!m.isVideo) return '<img src="' + esc(m.src) + '" alt="' + esc(alt) + '"' + ld + ">";
    // Videos show a still (their cover picture, YouTube/Drive thumbnail or the main photo),
    // never the video itself, so nothing heavy downloads until someone presses play
    var fb = m.fallback && m.fallback !== m.poster ? m.fallback : "";
    var still = m.poster
      ? '<img src="' + esc(m.poster) + '" alt="' + esc(alt) + '"' + ld + ' data-fb="' + esc(fb) + '" onerror="if(this.dataset.fb){this.src=this.dataset.fb;this.dataset.fb=\'\'}else{this.style.visibility=\'hidden\'}">'
      : '<span class="media-blank"></span>';
    return still + '<span class="media-play" aria-hidden="true">' + ICON_PLAY + "</span>";
  }

  // ---------- Google Sheet ----------
  // Minimal CSV parser (handles quotes, commas and line breaks inside quotes)
  function parseCSV(text) {
    var rows = [], row = [], cell = "", q = false;
    text = String(text).replace(/^﻿/, "");
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
      var vids = split(o.videos || o.video);
      var main = o.image || pics.shift() || "";
      if (!main && !vids.length) return null;
      var specs = [];
      if (o.bedrooms) specs.push(/bed/i.test(o.bedrooms) ? o.bedrooms : o.bedrooms + (o.bedrooms === "1" ? " bedroom" : " bedrooms"));
      if (o.size) specs.push(o.size);
      specs = specs.concat(split(o.features));
      var amount = toNumber(o.amount || o.price);
      var item = {
        type: type, title: o.title, location: o.location || o.area || "Ghana",
        price: o.price || "Price on request", specs: specs, description: o.description || "",
        image: main, photos: pics, videos: vids,
        ref: o.ref || "", status: (o.status || "available").toLowerCase()
      };
      if (amount) item.amount = amount;
      return item;
    }).filter(Boolean);
  }

  // ---------- Helpers ----------
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
  function byRef(ref) { return DATA.filter(function (x) { return x.ref === ref; })[0]; }
  function enquiry(l) {
    return isSold(l)
      ? "Hello Barima Homes, I saw this sold listing and I'm looking for something similar:\n" + l.title + " (" + LABEL[l.type] + ")\n" + l.location + (l.ref ? "\nRef: " + l.ref : "")
      : "Hello Barima Homes, I'm interested in this listing:\n" + l.title + " (" + LABEL[l.type] + ")\n" + l.location + (l.ref ? "\nRef: " + l.ref : "");
  }

  // ---------- Cards ----------
  function card(l) {
    var sold = isSold(l);
    var media = mediaOf(l);
    var vids = media.filter(function (m) { return m.isVideo; }).length;
    var specs = (l.specs || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    return '<article class="listing' + (sold ? " is-sold" : "") + '" data-type="' + esc(l.type) + '" data-ref="' + esc(l.ref || "") + '">' +
      '<div class="listing__media">' +
        '<button class="listing__open" type="button" aria-label="View photos' + (vids ? " and video" : "") + ": " + esc(l.title) + '">' + preview(media[0], l.title + ", " + l.location, true) + "</button>" +
        (media.length > 1 ?
          '<button class="listing__nav listing__nav--prev" type="button" aria-label="Previous">‹</button>' +
          '<button class="listing__nav listing__nav--next" type="button" aria-label="Next">›</button>' +
          '<span class="listing__count">1/' + media.length + "</span>" : "") +
        '<span class="tag listing__tag listing__tag--' + esc(l.type) + '">' + LABEL[l.type] + "</span>" +
        '<span class="listing__flag listing__flag--' + (sold ? "sold" : "available") + '">' + (sold ? "Sold" : "Available") + "</span>" +
        (vids ? '<button class="listing__video" type="button" data-video="1">' + ICON_PLAY + (vids > 1 ? vids + " videos" : "Watch video") + "</button>" : "") +
      "</div>" +
      '<div class="listing__body">' +
        '<h3><button class="listing__title" type="button">' + esc(l.title) + "</button></h3>" +
        '<p class="listing__loc">' + ICON_PIN + esc(l.location) + "</p>" +
        (specs ? '<ul class="listing__specs">' + specs + "</ul>" : "") +
        '<div class="listing__foot">' +
          '<span class="listing__price">' + (sold ? "Sold" : esc(l.price)) + "</span>" +
          '<a class="btn ' + (sold ? "btn--outline" : "btn--red") + ' btn--sm" href="' + wa(enquiry(l)) + '" target="_blank" rel="noopener">' + (sold ? "Ask about similar" : "Enquire") + "</a>" +
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

  // No listing matches the search
  function noMatch() {
    var text = "Hello Barima Homes, I'm looking for a " + summary() + ". Please let me know what you have.";
    return '<div class="listings__empty">' +
      "<h3>No listings match your search yet</h3>" +
      "<p>Send us your request and we'll look for a litigation-free " + esc(summary()) + " for you.</p>" +
      '<div class="listings__empty-actions">' +
        '<a class="btn btn--whatsapp" href="' + wa(text) + '" target="_blank" rel="noopener">Send request on WhatsApp</a>' +
        '<a class="btn btn--dark" href="tel:+233548580304">Call 054 858 0304</a>' +
      "</div></div>";
  }

  // There are no listings at all
  function comingSoon() {
    return '<div class="listings__soon">' +
      '<div class="listings__soon-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg></div>' +
      '<span class="eyebrow">New listings coming soon</span>' +
      "<h2>Our next litigation-free properties <em>are on the way</em></h2>" +
      "<p>We're preparing new land, houses and apartments in Ghana, each one checked and documented. Tell us what you're looking for and you'll hear about it first.</p>" +
      '<div class="listings__soon-actions">' +
        '<a class="btn btn--gold btn--lg" href="tel:+233548580304">' + ICON_PHONE + "Call 054 858 0304</a>" +
        '<a class="btn btn--whatsapp btn--lg" href="' + wa("Hello Barima Homes, please tell me when you have new listings. I'm looking for: ") + '" target="_blank" rel="noopener">' + ICON_WA + "Tell us what you need</a>" +
      "</div>" +
      '<p class="listings__soon-kindly">Kindly call</p>' +
    "</div>";
  }

  function render() {
    var none = !DATA.length;
    if (form) form.hidden = none;
    if (filterBar) filterBar.hidden = none;
    var list = DATA.filter(matches)
      .map(function (l, i) { return { l: l, i: i }; })
      .sort(function (a, b) { return (isSold(a.l) - isSold(b.l)) || (a.i - b.i); })
      .map(function (x) { return x.l; });
    var avail = list.filter(function (l) { return !isSold(l); }).length;
    grid.innerHTML = none ? comingSoon() : list.length ? list.map(card).join("") : noMatch();
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
    try { history.replaceState(null, "", "listings.html" + (q.toString() ? "?" + q : "") + location.hash); } catch (e) {}
  }

  // Card clicks: arrows flick through photos/videos; everything else opens the detail view
  grid.addEventListener("click", function (e) {
    var art = e.target.closest(".listing");
    if (!art) return;
    var l = byRef(art.getAttribute("data-ref"));
    if (!l) return;
    var media = mediaOf(l);
    var i = parseInt(art.getAttribute("data-i") || "0", 10);
    var nav = e.target.closest(".listing__nav");
    if (nav) {
      i = (i + (nav.classList.contains("listing__nav--next") ? 1 : media.length - 1)) % media.length;
      art.setAttribute("data-i", i);
      art.querySelector(".listing__open").innerHTML = preview(media[i], l.title + ", " + l.location, false);
      art.querySelector(".listing__count").textContent = (i + 1) + "/" + media.length;
      return;
    }
    if (e.target.closest(".listing__video")) {
      for (var k = 0; k < media.length; k++) if (media[k].isVideo) { i = k; break; }
      return openDetail(l, i, true);
    }
    if (e.target.closest(".listing__open, .listing__title")) openDetail(l, i, !!media[i].isVideo);
  });

  // ---------- Detail view ----------
  var dlg = document.createElement("div");
  dlg.className = "ldetail";
  dlg.hidden = true;
  dlg.setAttribute("role", "dialog");
  dlg.setAttribute("aria-modal", "true");
  dlg.setAttribute("aria-labelledby", "ldetail-title");
  document.body.appendChild(dlg);
  var cur = null, curI = 0, lastFocus = null;

  function stage(m, l, play) {
    var alt = l.title + ", " + l.location;
    if (!m.isVideo) return '<img src="' + esc(m.src) + '" alt="' + esc(alt) + '">';
    if (!play) return '<button class="ldetail__poster" type="button" aria-label="Play video">' + preview(m, alt, false) + "</button>";
    if (m.kind === "file") return '<video src="' + esc(m.src) + '" controls autoplay playsinline preload="none"' + (m.poster ? ' poster="' + esc(m.poster) + '"' : "") + "></video>";
    return '<iframe src="' + esc(m.src) + '" title="Video: ' + esc(alt) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  }

  function show(i, play) {
    var media = mediaOf(cur);
    curI = (i + media.length) % media.length;
    var m = media[curI];
    var box = dlg.querySelector(".ldetail__stage-in");
    box.className = "ldetail__stage-in" + (m.isVideo ? " is-video" : "") + (m.vertical ? " is-vertical" : "");
    box.innerHTML = stage(m, cur, play);
    var c = dlg.querySelector(".ldetail__count");
    if (c) c.textContent = (curI + 1) + " / " + media.length;
    dlg.querySelectorAll(".ldetail__thumb").forEach(function (t, k) {
      t.classList.toggle("is-on", k === curI);
      if (k === curI) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current");
    });
    var on = dlg.querySelector(".ldetail__thumb.is-on");
    if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function openDetail(l, i, play) {
    cur = l;
    lastFocus = document.activeElement;
    var sold = isSold(l);
    var media = mediaOf(l);
    var specs = (l.specs || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    var thumbs = media.length > 1 ? '<div class="ldetail__thumbs">' + media.map(function (m, k) {
      return '<button class="ldetail__thumb' + (m.isVideo ? " is-video" : "") + '" type="button" data-i="' + k + '" aria-label="' + (m.isVideo ? "Video " : "Photo ") + (k + 1) + '">' + preview(m, "", true) + "</button>";
    }).join("") + "</div>" : "";
    var tour = "Hello Barima Homes, I'd like to book a viewing or video tour:\n" + l.title + "\n" + l.location + (l.ref ? "\nRef: " + l.ref : "");
    dlg.innerHTML =
      '<div class="ldetail__backdrop" data-close></div>' +
      '<div class="ldetail__panel">' +
        '<button class="ldetail__close" type="button" data-close aria-label="Close">×</button>' +
        '<div class="ldetail__gallery">' +
          '<div class="ldetail__stage"><div class="ldetail__stage-in"></div>' +
            (media.length > 1 ?
              '<button class="ldetail__nav ldetail__nav--prev" type="button" aria-label="Previous">‹</button>' +
              '<button class="ldetail__nav ldetail__nav--next" type="button" aria-label="Next">›</button>' +
              '<span class="ldetail__count"></span>' : "") +
          "</div>" + thumbs +
        "</div>" +
        '<div class="ldetail__info">' +
          '<div class="ldetail__tags"><span class="tag listing__tag--' + esc(l.type) + '">' + LABEL[l.type] + '</span><span class="listing__flag listing__flag--' + (sold ? "sold" : "available") + '">' + (sold ? "Sold" : "Available") + "</span></div>" +
          '<h2 id="ldetail-title">' + esc(l.title) + "</h2>" +
          '<p class="listing__loc">' + ICON_PIN + esc(l.location) + "</p>" +
          '<p class="ldetail__price">' + (sold ? "Sold" : esc(l.price)) + "</p>" +
          (specs ? '<ul class="listing__specs">' + specs + "</ul>" : "") +
          (l.description ? '<div class="ldetail__desc">' + String(l.description).split(/\n{2,}|\n/).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" : "") +
          '<p class="ldetail__note">Litigation-free. Ask us for the documents and a viewing.</p>' +
          '<div class="ldetail__actions">' +
            '<a class="btn ' + (sold ? "btn--outline" : "btn--red") + '" href="' + wa(enquiry(l)) + '" target="_blank" rel="noopener">' + ICON_WA + (sold ? "Ask about similar" : "Enquire on WhatsApp") + "</a>" +
            '<a class="btn btn--dark" href="tel:+233548580304">' + ICON_PHONE + "Call 054 858 0304</a>" +
            (sold ? "" : '<a class="ldetail__tour" href="' + wa(tour) + '" target="_blank" rel="noopener">' + ICON_CAM + "Book a viewing or video tour</a>") +
          "</div>" +
          (l.ref ? '<p class="ldetail__ref">Ref: ' + esc(l.ref) + "</p>" : "") +
        "</div>" +
      "</div>";
    dlg.hidden = false;
    document.documentElement.classList.add("has-ldetail");
    show(i || 0, play);
    dlg.querySelector(".ldetail__close").focus();
    if (l.ref && location.hash !== "#" + l.ref) { try { history.replaceState(null, "", location.pathname + location.search + "#" + encodeURIComponent(l.ref)); } catch (e) {} }
  }

  function closeDetail() {
    if (dlg.hidden) return;
    dlg.hidden = true;
    dlg.innerHTML = ""; // stops any playing video
    document.documentElement.classList.remove("has-ldetail");
    cur = null;
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  dlg.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) return closeDetail();
    var nav = e.target.closest(".ldetail__nav");
    if (nav) return show(curI + (nav.classList.contains("ldetail__nav--next") ? 1 : -1), false);
    var t = e.target.closest(".ldetail__thumb");
    if (t) { var k = parseInt(t.getAttribute("data-i"), 10); return show(k, !!mediaOf(cur)[k].isVideo); }
    if (e.target.closest(".ldetail__poster")) show(curI, true);
  });
  document.addEventListener("keydown", function (e) {
    if (dlg.hidden) return;
    if (e.key === "Escape") closeDetail();
    else if (e.key === "ArrowRight" && mediaOf(cur).length > 1) show(curI + 1, false);
    else if (e.key === "ArrowLeft" && mediaOf(cur).length > 1) show(curI - 1, false);
    else if (e.key === "Tab") {
      var f = dlg.querySelectorAll("button, a[href], iframe, video[controls]");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Swipe on the big photo/video on phones
  var sx = null;
  dlg.addEventListener("touchstart", function (e) { if (e.target.closest(".ldetail__stage") && !e.target.closest("iframe, video")) sx = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", function (e) {
    if (sx === null || !cur) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50 && mediaOf(cur).length > 1) show(curI + (dx < 0 ? 1 : -1), false);
  });

  // ---------- Filters & search ----------
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
    // listings.html#BH-H01 opens that listing straight away (handy for sharing)
    var h = decodeURIComponent(location.hash.slice(1));
    var l = h && byRef(h);
    if (l) openDetail(l, 0, false);
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
