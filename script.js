/* =====================================================================
   Video Editor Portfolio — script.js
   No libraries needed. Each feature is independent; delete any you don't want.
   ===================================================================== */

(function () {
  "use strict";

  /* ---------- Video link helpers ---------- */
  // Accepts any YouTube link: watch?v=, youtu.be/, /shorts/, /live/, /embed/,
  // or even a full <iframe> embed code copied from YouTube's "Share → Embed".
  function cleanLink(url) {
    url = (url || "").trim();
    var src = url.match(/src=["']([^"']+)["']/);
    return src ? src[1] : url;
  }
  function youTubeId(url) {
    var m = cleanLink(url).match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : "";
  }
  function toEmbedUrl(url) {
    url = cleanLink(url);
    if (!url) return "";
    var id = youTubeId(url);
    if (id) return "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
    var vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return "https://player.vimeo.com/video/" + vm[1] + "?autoplay=1";
    return url; // already an embed url
  }
  // Frame shape: data-ratio="9:16" (vertical), "16:9" (landscape), "1:1", "4:5"…
  // With no data-ratio, YouTube Shorts links are vertical and everything else is landscape.
  function videoRatio(el, url) {
    var attr = (el.getAttribute("data-ratio") || "").trim();
    var m = attr.match(/^(\d+(?:\.\d+)?)\s*[:\/x]\s*(\d+(?:\.\d+)?)$/i);
    if (m) return [parseFloat(m[1]), parseFloat(m[2])];
    if (/\/shorts\//.test(cleanLink(url))) return [9, 16];
    return [16, 9];
  }
  function applyRatio(el, r) {
    el.style.aspectRatio = r[0] + " / " + r[1];
    el.style.setProperty("--ratio", String(r[0] / r[1]));
    el.classList.toggle("is-portrait", r[0] < r[1]);
  }

  // Use YouTube's own thumbnail; falls back to the smaller one if no HD version exists.
  function loadYouTubeThumb(id, onReady) {
    var hd = new Image();
    hd.onload = function () {
      if (hd.naturalWidth > 120) onReady(hd.src);
      else onReady("https://i.ytimg.com/vi/" + id + "/hqdefault.jpg");
    };
    hd.onerror = function () { onReady("https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"); };
    hd.src = "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";
  }

  function makeIframe(src, title) {
    var f = document.createElement("iframe");
    f.src = src;
    f.title = title || "Video";
    f.allow = "autoplay; fullscreen; picture-in-picture";
    f.allowFullscreen = true;
    return f;
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      links.classList.toggle("is-open", !open);
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        links.classList.remove("is-open");
      }
    });
  }

  /* ---------- Showreel video frame ----------
     1. Shows your video's thumbnail inside the frame (your own poster image wins if you add one).
     2. Pressing play (or anywhere on the frame) swaps in the YouTube player and starts the video. */
  var reel = document.querySelector(".reel");
  if (reel) {
    var embed = cleanLink(reel.getAttribute("data-embed"));
    var poster = reel.getAttribute("data-poster");
    var ytId = youTubeId(embed);

    var reelRatio = videoRatio(reel, embed);
    applyRatio(reel, reelRatio);
    var reelTicks = reel.parentElement.querySelector(".ticks");
    if (reelTicks) reelTicks.classList.toggle("is-portrait", reelRatio[0] < reelRatio[1]);

    var setPoster = function (src) {
      reel.style.backgroundImage = "url('" + src + "')";
      reel.classList.add("has-poster");
    };

    if (embed) {
      reel.classList.add("has-video");
      var note = reel.querySelector(".reel-note");
      if (note) note.remove();
      if (ytId) loadYouTubeThumb(ytId, setPoster); // shown right away…
    }
    if (poster) {                                 // …replaced by your own poster if it exists
      var probe = new Image();
      probe.onload = function () { setPoster(poster); };
      probe.src = poster;
    }

    var playBtn = reel.querySelector(".play-btn");
    var play = function () {
      if (reel.classList.contains("is-playing")) return;
      if (!embed) {
        var n = reel.querySelector(".reel-note");
        if (n) n.textContent = "No showreel yet — paste your YouTube link into data-embed in index.html";
        return;
      }
      reel.classList.add("is-playing");
      reel.appendChild(makeIframe(toEmbedUrl(embed), "Showreel"));
    };
    if (playBtn) playBtn.addEventListener("click", play);
    reel.addEventListener("click", function (e) {
      if (embed && e.target === reel) play();   // clicking the thumbnail itself also plays
    });
  }

  /* ---------- Running timecode in the reel corner (just for looks) ---------- */
  var tc = document.querySelector("[data-timecode]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (tc && !reduceMotion) {
    var start = performance.now();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    (function tick(now) {
      var t = (now - start) / 1000;
      var h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = Math.floor(t) % 60, f = Math.floor((t % 1) * 25);
      tc.textContent = pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
      requestAnimationFrame(tick);
    })(start);
  }

  /* ---------- Missing images → show a placeholder label instead of a broken icon ---------- */
  // A project card with a YouTube link but no thumbnail file uses YouTube's thumbnail instead.
  document.querySelectorAll(".thumb img, .portrait img").forEach(function (img) {
    var card = img.closest(".project");
    var cardYt = card ? youTubeId(card.getAttribute("data-video")) : "";
    var usedYt = false;
    var mark = function () {
      if (cardYt && !usedYt) {
        usedYt = true;
        loadYouTubeThumb(cardYt, function (src) { img.src = src; });
        return;
      }
      img.parentElement.classList.add("no-img");
    };
    if (!img.getAttribute("src")) return mark();
    img.addEventListener("error", mark);
    if (img.complete && img.naturalWidth === 0) mark();
  });

  /* ---------- Project filters (built from each card's data-category) ---------- */
  var filterBar = document.querySelector(".filters");
  var projects = Array.prototype.slice.call(document.querySelectorAll(".project"));
  if (filterBar && projects.length) {
    var cats = ["All"];
    projects.forEach(function (p) {
      var c = p.getAttribute("data-category");
      if (c && cats.indexOf(c) === -1) cats.push(c);
    });
    cats.forEach(function (c, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter";
      b.textContent = c;
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        filterBar.querySelectorAll(".filter").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        projects.forEach(function (p) {
          p.hidden = !(c === "All" || p.getAttribute("data-category") === c);
        });
      });
      filterBar.appendChild(b);
    });
  }

  /* ---------- Project video lightbox ---------- */
  var box = document.querySelector(".lightbox");
  var frame = box && box.querySelector(".lightbox-frame");
  if (box && frame && typeof box.showModal === "function") {
    projects.forEach(function (p) {
      var url = p.getAttribute("data-video");
      var btn = p.querySelector(".thumb");
      if (!btn) return;
      if (!url) { btn.style.cursor = "default"; return; }
      btn.addEventListener("click", function () {
        var title = (p.querySelector("h3") || {}).textContent || "Project video";
        var r = videoRatio(p, url);
        frame.style.aspectRatio = r[0] + " / " + r[1];
        box.style.setProperty("--ratio", String(r[0] / r[1]));
        box.classList.toggle("is-portrait", r[0] < r[1]);
        frame.innerHTML = "";
        frame.appendChild(makeIframe(toEmbedUrl(url), title));
        box.showModal();
      });
    });
    var close = function () { box.close(); };
    box.querySelector(".lightbox-close").addEventListener("click", close);
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    box.addEventListener("close", function () { frame.innerHTML = ""; }); // stops playback
  }

  /* ---------- Contact form → Netlify Forms without leaving the page ---------- */
  var form = document.querySelector(".contact-form");
  if (form) {
    var success = document.querySelector(".form-success");
    var error = form.querySelector(".form-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Sending…";
      if (error) error.hidden = true;

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          form.hidden = true;
          if (success) success.hidden = false;
        })
        .catch(function () {
          if (error) error.hidden = false;
          btn.disabled = false;
          btn.textContent = "Send message";
        });
    });
  }

  /* ---------- Process steps light up as you scroll ---------- */
  var steps = document.querySelectorAll(".process li");
  if (steps.length && "IntersectionObserver" in window) {
    var stepObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) en.target.classList.add("is-active"); });
    }, { rootMargin: "0px 0px -30% 0px" });
    steps.forEach(function (s) { stepObs.observe(s); });
  }

  /* ---------- Gentle fade-in on scroll ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll(".section-head, .project, .service, .process li, .about > *, .contact > *");
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); revObs.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    targets.forEach(function (t) { t.classList.add("reveal"); revObs.observe(t); });
  }

  /* ---------- Footer year ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
