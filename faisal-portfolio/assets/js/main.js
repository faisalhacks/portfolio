/* ============================================================
   MFP · RESEARCH — shared behavior (v2, multi-page)
   Rules: transform/opacity only · IO reveals fire once + unobserve
   · no raw scroll handlers except one rAF-wrapped progress bar
   · WebGL desktop-only, paused off-screen/hidden.
   ============================================================ */
(function () {
  "use strict";
  var docEl = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) docEl.classList.add("no-motion");

  /* ================= PRELOADER (first session visit only) =================
     A tiny inline <head> script already decided: html.preload → show it,
     otherwise html.ready. Total budget here is <= 1.5s. */
  var HARD_CAP = 1500;
  function finishPreload() {
    var pre = document.getElementById("preloader");
    if (pre) {
      pre.classList.add("is-done");
      setTimeout(function () { pre.remove(); }, 380);
    }
    docEl.classList.remove("preload");
    docEl.classList.add("ready");
  }
  if (docEl.classList.contains("preload")) {
    var logs = [
      "initializing runtime…",
      "loading weights… <b>4.7B params</b>",
      "calibrating confidence…",
      "quantizing to <b>1-bit</b>…",
      "<b>ready.</b>"
    ];
    var logEl = document.getElementById("preLog");
    var numEl = document.getElementById("preNum");
    var barEl = document.getElementById("preBar");
    var t0 = performance.now();
    var DUR = 1000;
    var li = -1;
    (function tickPre(now) {
      var t = Math.min((now - t0) / DUR, 1);
      var e = 1 - Math.pow(1 - t, 3); /* easeOutCubic */
      var v = Math.round(e * 100);
      if (numEl) numEl.textContent = (v < 10 ? "00" : v < 100 ? "0" : "") + v;
      if (barEl) barEl.style.transform = "scaleX(" + e + ")";
      var idx = Math.min(Math.floor(t * logs.length), logs.length - 1);
      if (idx !== li && logEl) { li = idx; logEl.innerHTML = logs[idx]; }
      if (t < 1) requestAnimationFrame(tickPre);
      else setTimeout(finishPreload, 120);
    })(t0);
    setTimeout(finishPreload, HARD_CAP); /* hard cap — never exceed 1.5s */
  } else if (!docEl.classList.contains("ready")) {
    docEl.classList.add("ready");
  }

  /* ================= PAGE TRANSITIONS (~200ms fade) ================= */
  function isInternal(a) {
    if (a.target === "_blank" || a.hasAttribute("download")) return false;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^(mailto|tel|http)/i.test(href) && a.host !== location.host) return false;
    return true;
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || !isInternal(a)) return;
    var url = a.href;
    if (url.split("#")[0] === location.href.split("#")[0] && url.indexOf("#") !== -1) return; /* same-page hash */
    e.preventDefault();
    if (reduced) { location.href = url; return; }
    docEl.classList.add("page-exit");
    setTimeout(function () { location.href = url; }, 180);
  });
  /* bfcache restore (back/forward): undo the exit fade */
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      docEl.classList.remove("page-exit");
      docEl.classList.add("ready");
    }
  });

  /* ================= REVEALS (IO, fire once, unobserve) ================= */
  /* stagger inside groups */
  document.querySelectorAll("[data-rv-group]").forEach(function (group) {
    var kids = group.querySelectorAll(".rv");
    for (var i = 0; i < kids.length; i++) kids[i].style.transitionDelay = (i * 70) + "ms";
  });
  var rvEls = document.querySelectorAll(".rv");
  if (!reduced && "IntersectionObserver" in window && rvEls.length) {
    var rvIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.style.willChange = "transform, opacity";
        el.classList.add("in");
        el.addEventListener("transitionend", function done() {
          el.style.willChange = "auto";
          el.style.transitionDelay = "";
          el.removeEventListener("transitionend", done);
        });
        rvIO.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    rvEls.forEach(function (el) { rvIO.observe(el); });
  } else {
    rvEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ================= NAV SOLID (IO sentinel — no scroll listener) ======= */
  var nav = document.querySelector(".nav");
  var sentinel = document.getElementById("top-sentinel");
  if (nav && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      nav.classList.toggle("is-solid", !en[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  } else if (nav) {
    nav.classList.add("is-solid");
  }

  /* ================= SCROLL PROGRESS (single rAF-wrapped listener) ====== */
  var prog = document.getElementById("scrollProgress");
  if (prog && !reduced) {
    var progTicking = false;
    var updateProg = function () {
      progTicking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
    };
    window.addEventListener("scroll", function () {
      if (!progTicking) { progTicking = true; requestAnimationFrame(updateProg); }
    }, { passive: true });
    updateProg();
  }

  /* ================= COUNTERS ================= */
  function tween(dur, onUpdate, onDone) {
    var s = performance.now();
    (function step(now) {
      var t = Math.min((now - s) / dur, 1);
      onUpdate(1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(step);
      else if (onDone) onDone();
    })(s);
  }
  function renderCount(el, v) {
    var dec = el.dataset.decimals ? +el.dataset.decimals : 0;
    var out = dec ? v.toFixed(dec) : String(Math.round(v));
    if ("comma" in el.dataset) out = Number(out).toLocaleString("en-US");
    el.textContent = out;
  }
  /* markup ships final values (no-JS/SEO safe); zero them before animating */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (!reduced && "IntersectionObserver" in window) {
      counters.forEach(function (el) { renderCount(el, 0); });
      var cIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target, target = parseFloat(el.dataset.count);
          tween(1300, function (e) { renderCount(el, target * e); });
          cIO.unobserve(el);
        });
      }, { rootMargin: "0px 0px -5% 0px" });
      counters.forEach(function (el) { cIO.observe(el); });
    } else {
      counters.forEach(function (el) { renderCount(el, parseFloat(el.dataset.count)); });
    }
  }

  /* ================= FIGURES (CSS-driven; JS adds .fig-in + numbers) ==== */
  function countFigNums(scope) {
    scope.querySelectorAll(".f4-num").forEach(function (num) {
      var target = +num.dataset.target;
      if (reduced) { num.textContent = target.toFixed(3); return; }
      tween(1100, function (e) { num.textContent = (target * e).toFixed(3); });
    });
  }
  var figs = document.querySelectorAll(".rx-fig");
  if (figs.length) {
    if (!reduced && "IntersectionObserver" in window) {
      figs.forEach(function (f) {
        f.querySelectorAll(".f4-num").forEach(function (n) { n.textContent = "0.000"; });
      });
      var fIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("fig-in");
          countFigNums(en.target);
          fIO.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -10% 0px" });
      figs.forEach(function (f) { fIO.observe(f); });
    } else {
      figs.forEach(function (f) { f.classList.add("fig-in"); countFigNums(f); });
    }
  }

  /* ================= HERO WEBGL (home only, desktop only, lazy) ========= */
  var canvas = document.getElementById("webgl");
  var conn = navigator.connection || {};
  if (canvas && !reduced && window.innerWidth >= 768 && !conn.saveData) {
    var loadThree = function () {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js";
      s.onload = initWebGL;
      document.head.appendChild(s);
    };
    if (document.readyState === "complete") setTimeout(loadThree, 150);
    else window.addEventListener("load", function () { setTimeout(loadThree, 150); });
  }

  function initWebGL() {
    if (typeof THREE === "undefined") return;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.z = 3.1;
    var group = new THREE.Group();
    scene.add(group);

    /* point cloud — halved vs v1 (2000 → 1000) */
    var N = 1000;
    var positions = new Float32Array(N * 3);
    var colors = new Float32Array(N * 3);
    var cA = new THREE.Color(0x31e8ff), cB = new THREE.Color(0xf2f0ea);
    function noise3(x, y, z) {
      return Math.sin(x * 3.1 + y * 1.7) * 0.5 + Math.sin(y * 2.3 + z * 2.9) * 0.3 + Math.sin(z * 3.7 + x * 1.3) * 0.2;
    }
    for (var i = 0; i < N; i++) {
      var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
      var sq = Math.sqrt(1 - u * u);
      var x = sq * Math.cos(th), y = u, z = sq * Math.sin(th);
      var r = 0.82 + Math.random() * 0.22 + noise3(x * 2, y * 2, z * 2) * 0.12;
      var px = x * 1.32 * r;
      var py = (y * 0.92 - Math.abs(x) * 0.06) * r;
      var pz = z * 1.08 * r;
      if (Math.abs(px) < 0.11 && py > 0.1) py -= 0.07;
      positions[i * 3] = px; positions[i * 3 + 1] = py; positions[i * 3 + 2] = pz;
      var c = Math.random() < 0.14 ? cA : cB;
      var f = 0.35 + Math.random() * 0.65;
      colors[i * 3] = c.r * f; colors[i * 3 + 1] = c.g * f; colors[i * 3 + 2] = c.b * f;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    /* soft round sprite so points aren't hard squares */
    var spr = document.createElement("canvas");
    spr.width = spr.height = 64;
    var sctx = spr.getContext("2d");
    var grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,.8)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.028, vertexColors: true, transparent: true, opacity: 0.85,
      map: new THREE.CanvasTexture(spr), alphaTest: 0.01,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    group.add(pts);

    /* synapse lines via spatial hash — halved cap (2600 → 1300) */
    var linePos = [];
    var cell = 0.26, grid = {};
    function key(a, b, c) { return a + "," + b + "," + c; }
    for (var i2 = 0; i2 < N; i2++) {
      var gx = Math.floor(positions[i2 * 3] / cell), gy = Math.floor(positions[i2 * 3 + 1] / cell), gz = Math.floor(positions[i2 * 3 + 2] / cell);
      (grid[key(gx, gy, gz)] = grid[key(gx, gy, gz)] || []).push(i2);
    }
    var maxLines = 1300, thr2 = 0.2 * 0.2;
    outer:
    for (var a = 0; a < N; a++) {
      var ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
      var cgx = Math.floor(ax / cell), cgy = Math.floor(ay / cell), cgz = Math.floor(az / cell);
      for (var dx = 0; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) for (var dz = -1; dz <= 1; dz++) {
        var bucket = grid[key(cgx + dx, cgy + dy, cgz + dz)];
        if (!bucket) continue;
        for (var bi = 0; bi < bucket.length; bi++) {
          var b = bucket[bi];
          if (b <= a) continue;
          var ddx = positions[b * 3] - ax, ddy = positions[b * 3 + 1] - ay, ddz = positions[b * 3 + 2] - az;
          if (ddx * ddx + ddy * ddy + ddz * ddz < thr2) {
            linePos.push(ax, ay, az, positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]);
            if (linePos.length / 6 >= maxLines) break outer;
          }
        }
      }
    }
    var lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePos), 3));
    group.add(new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial({
      color: 0x31e8ff, transparent: true, opacity: 0.07,
      blending: THREE.AdditiveBlending, depthWrite: false
    })));

    group.position.x = 0.9;
    group.rotation.z = 0.12;

    var mouseX = 0, mouseY = 0, tX = 0, tY = 0;
    if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      window.addEventListener("mousemove", function (e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    function resize() {
      var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      group.position.x = w < 900 ? 0 : 0.9;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* pause when hero off-screen or tab hidden */
    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(canvas);
    }
    var t0 = performance.now();
    (function frame(now) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      var t = (now - t0) * 0.001;
      tX += (mouseX - tX) * 0.03; tY += (mouseY - tY) * 0.03;
      group.rotation.y = t * 0.07 + tX * 0.25;
      group.rotation.x = Math.sin(t * 0.13) * 0.06 + tY * 0.18;
      group.scale.setScalar(1 + Math.sin(t * 0.5) * 0.015);
      renderer.render(scene, camera);
    })(t0);
    canvas.classList.add("is-on");
  }
})();
