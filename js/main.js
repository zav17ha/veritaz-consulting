/* Veritaz Consulting Services — interactions & animations */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Preloader */
  var pre = $(".preloader");
  var hidePre = function () { if (pre) pre.classList.add("done"); var t = $(".page-transition"); if (t) t.classList.remove("active"); };
  window.addEventListener("load", function () { setTimeout(hidePre, reduce ? 0 : 450); });
  setTimeout(hidePre, 3000);
  window.addEventListener("pageshow", function (e) { if (e.persisted) hidePre(); });

  /* Header: solid on scroll, hide on scroll down */
  var header = $(".header"), toTop = $(".fab--top"), lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("scrolled", y > 40);
      header.classList.toggle("hide", y > lastY && y > 400 && !$(".nav.open"));
    }
    if (toTop) toTop.classList.toggle("show", y > 700);
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* Mobile menu */
  var burger = $(".burger"), nav = $(".nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  /* Smooth page transitions between internal pages */
  var pt = $(".page-transition");
  $$("a[href]").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:|\/\/)/.test(href) || a.target === "_blank") return;
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || reduce || !pt) return;
      e.preventDefault();
      pt.classList.add("active");
      setTimeout(function () { window.location.href = href; }, 520);
    });
  });

  /* Scroll reveal */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else { revealEls.forEach(function (el) { el.classList.add("in"); }); }

  /* Counters */
  $$("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10), done = false;
    var run = function () {
      if (done) return; done = true;
      if (reduce) { el.textContent = target; return; }
      var start = null, dur = 1800;
      (function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: 0.6 }).observe(el);
    } else run();
  });

  /* 3D tilt on cards (desktop pointers only) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".card[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + x * 4 + "deg) rotateX(" + -y * 4 + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* Hero particle network */
  var canvas = $("#hero-canvas");
  if (canvas && !reduce) {
    var ctx = canvas.getContext("2d"), w, h, pts = [], mouse = { x: -999, y: -999 }, raf;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(90, Math.floor((w * h) / 16000));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 });
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        var dxm = p.x - mouse.x, dym = p.y - mouse.y, dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 130) { p.x += dxm / dm * 1.2; p.y += dym / dm * 1.2; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = "rgba(232,203,131,.85)"; ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 14400) { ctx.strokeStyle = "rgba(201,162,75," + (0.22 * (1 - d / 14400)) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    size(); draw();
    window.addEventListener("resize", function () { cancelAnimationFrame(raf); size(); draw(); });
    canvas.parentElement.addEventListener("mousemove", function (e) { var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.parentElement.addEventListener("mouseleave", function () { mouse.x = mouse.y = -999; });
    document.addEventListener("visibilitychange", function () { if (document.hidden) cancelAnimationFrame(raf); else draw(); });
  }

  /* Hero parallax */
  var vis = $(".hero__visual");
  if (vis && !reduce && window.matchMedia("(hover: hover)").matches) {
    $(".hero").addEventListener("mousemove", function (e) {
      var x = (e.clientX / window.innerWidth - .5) * 26, y = (e.clientY / window.innerHeight - .5) * 26;
      vis.style.transform = "translate(" + x + "px," + y + "px)";
    });
  }

  /* Services filter (categories only; deep links open the right category) */
  var chips = $$(".chip");
  function applyFilter(f, animate) {
    chips.forEach(function (c) { c.classList.toggle("active", c.getAttribute("data-filter") === f); });
    $$(".card[data-cat]").forEach(function (card) {
      var show = card.getAttribute("data-cat").split(" ").indexOf(f) > -1;
      card.classList.toggle("hidden", !show);
      if (show && animate) { card.classList.remove("in"); void card.offsetWidth; card.classList.add("in"); }
    });
  }
  if (chips.length) {
    var firstFilter = $(".chip.active") ? $(".chip.active").getAttribute("data-filter") : chips[0].getAttribute("data-filter");
    var target = null;
    try { target = location.hash ? $(location.hash) : null; } catch (err) { target = null; }
    if (target && target.getAttribute && target.getAttribute("data-cat")) {
      var cats = target.getAttribute("data-cat").split(" ");
      firstFilter = cats.filter(function (c) { return chips.some(function (ch) { return ch.getAttribute("data-filter") === c; }); })[0] || firstFilter;
    }
    applyFilter(firstFilter, false);
    chips.forEach(function (chip) { chip.addEventListener("click", function () { applyFilter(chip.getAttribute("data-filter"), true); }); });
    if (target && !target.classList.contains("hidden")) {
      setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "center" }); target.style.borderColor = "#c9a24b"; }, 900);
    }
  }

  /* 3D map: scroll-driven tilt + pointer parallax */
  var m3 = $("#map3d");
  if (m3 && !reduce) {
    var board = $(".map3d__board", m3), mcard = $(".map3d__card", m3), mx = 0, my = 0;
    function tiltMap() {
      var r = m3.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.9)));
      var rx = 24 - p * 14 - my * 4, rz = (1 - p) * -3 + mx * 3;
      board.style.transform = "rotateX(" + rx + "deg) rotateZ(" + rz + "deg)";
      mcard.style.transform = "translate3d(" + (mx * -10) + "px," + (my * -8) + "px,60px)";
    }
    window.addEventListener("scroll", tiltMap, { passive: true });
    window.addEventListener("resize", tiltMap);
    m3.addEventListener("mousemove", function (e) { var r = m3.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; tiltMap(); });
    m3.addEventListener("mouseleave", function () { mx = my = 0; tiltMap(); });
    tiltMap();
  }

  try { sessionStorage.setItem("vz", "1"); } catch (err) {}

  /* Footer year */
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
