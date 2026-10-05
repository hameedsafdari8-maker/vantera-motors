/* ==========================================================================
   VANTERA MOTORS — shared behaviour (runs on every page)
   - injects header, footer, loader, cursor, progress bar
   - navigation, mobile menu, page transitions
   - reveal / split-text / counters / parallax / magnetic buttons
   Everything degrades gracefully if GSAP (CDN) is unavailable.
   ========================================================================== */

(function () {
  "use strict";

  const doc = document.documentElement;
  const body = document.body;
  const page = body.dataset.page || "";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const FALLBACK_IMAGE = "assets/icons/fallback.svg";

  if (!reduceMotion) doc.classList.add("js-motion");
  if (window.gsap && window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- 1. Layout pieces ------------------------------------------ */

  const NAV = [
    ["index.html", "HOME", "home"],
    ["motorcycles.html", "MOTORCYCLES", "motorcycles"],
    ["showroom.html", "SHOWROOM", "showroom"],
    ["about.html", "ABOUT", "about"],
    ["contact.html", "CONTACT", "contact"]
  ];

  const EMBLEM =
    '<svg class="emblem" viewBox="0 0 72 72" aria-hidden="true" focusable="false">' +
    '<path d="M6 8 L36 64 L66 8" fill="none" stroke="currentColor" stroke-width="6"/>' +
    '<path d="M20 8 L36 38 L52 8" fill="none" stroke="currentColor" stroke-width="6" opacity=".5"/>' +
    '<path d="M0 42 L34 42 L40 48 L0 48 Z" fill="#C1121F"/></svg>';

  function navLinks(extraClass) {
    return NAV.map(function (item) {
      const current = item[2] === page ? ' aria-current="page"' : "";
      return '<a class="nav-link ' + (extraClass || "") + '" href="' + item[0] + '"' + current + ">" + item[1] + "</a>";
    }).join("");
  }

  function buildLayout() {
    const loader =
      '<div class="loader" id="loader" aria-hidden="true">' +
      '<div class="loader-inner">' + EMBLEM +
      '<span class="loader-word">VANTERA</span><span class="loader-sub">MOTORS</span>' +
      '<div class="loader-bar"><span id="loader-fill"></span></div>' +
      '<span class="loader-pct"><span id="loader-pct">0</span>%</span></div></div>';

    const header =
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<div class="scroll-progress" id="scroll-progress" aria-hidden="true"></div>' +
      '<header class="site-header" id="site-header"><div class="nav-inner">' +
      '<a class="brand" href="index.html" aria-label="VANTERA MOTORS — home">' + EMBLEM +
      '<span class="brand-text"><b>VANTERA</b><i>MOTORS</i></span></a>' +
      '<nav class="nav-links" aria-label="Primary">' + navLinks() + "</nav>" +
      '<div class="nav-actions">' +
      '<button type="button" class="nav-ai" data-ai-open><span class="dot"></span>AI CONCIERGE</button>' +
      '<a class="btn btn-solid btn-sm" href="showroom.html#test-ride" data-magnetic><span>BOOK A RIDE</span></a></div>' +
      '<button type="button" class="burger" id="burger" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">' +
      "<span></span><span></span><span></span></button></div>" +
      '<div class="mobile-menu" id="mobile-menu"><nav class="mobile-nav" aria-label="Mobile">' +
      NAV.map(function (item, i) {
        const current = item[2] === page ? ' aria-current="page"' : "";
        return '<a class="mobile-link" style="--i:' + i + '" href="' + item[0] + '"' + current +
          '><small>0' + (i + 1) + "</small>" + item[1] + "</a>";
      }).join("") +
      '</nav><div class="mobile-actions">' +
      '<button type="button" class="btn btn-ghost" data-ai-open><span>AI CONCIERGE</span></button>' +
      '<a class="btn btn-solid" href="showroom.html#test-ride"><span>BOOK A RIDE</span></a></div></div></header>';

    const footer =
      '<footer class="site-footer"><div class="container footer-grid">' +
      '<div class="footer-brand"><a class="brand" href="index.html" aria-label="VANTERA MOTORS — home">' + EMBLEM +
      '<span class="brand-text"><b>VANTERA</b><i>MOTORS</i></span></a>' +
      '<p class="footer-tag">ENGINEERED TO BE DESIRED.</p></div>' +
      '<nav class="footer-col" aria-label="Footer"><h2>Explore</h2>' +
      '<a href="motorcycles.html">Motorcycles</a><a href="showroom.html">Showroom</a>' +
      '<a href="about.html">About</a><a href="contact.html">Contact</a></nav>' +
      '<div class="footer-col"><h2>Ride</h2><a href="showroom.html#test-ride">Book a test ride</a>' +
      '<a href="showroom.html#delivery">Private delivery</a><button type="button" class="link-btn" data-ai-open>AI Concierge</button></div>' +
      '<div class="footer-col"><h2>Visit</h2><p>VANTERA Design Studio<br>Via dei Motori 21<br>Bologna, Italy</p>' +
      '<a href="mailto:hello@vantera.example">hello@vantera.example</a></div></div>' +
      '<div class="container footer-bottom"><p>&copy; <span id="year"></span> VANTERA MOTORS. A fictional brand created for a university project. ' +
      'Models, prices and history are invented. Photography via Unsplash.</p></div></footer>';

    const extras =
      '<div class="cursor-dot" id="cursor-dot" aria-hidden="true"></div>' +
      '<div class="cursor-ring" id="cursor-ring" aria-hidden="true"><i></i></div>' +
      '<div class="curtain" id="curtain" aria-hidden="true"></div>';

    body.insertAdjacentHTML("afterbegin", loader + header);
    body.insertAdjacentHTML("beforeend", footer + extras);
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- 2. Loader -------------------------------------------------- */

  let isReady = false;
  const readyCallbacks = [];

  function onReady(fn) {
    if (isReady) fn();
    else readyCallbacks.push(fn);
  }

  function markReady() {
    if (isReady) return;
    isReady = true;
    doc.classList.add("is-loaded");
    readyCallbacks.splice(0).forEach(function (fn) { fn(); });
  }

  function initLoader() {
    const loader = document.getElementById("loader");
    const fill = document.getElementById("loader-fill");
    const pct = document.getElementById("loader-pct");
    if (!loader) { markReady(); return; }

    let seen = false;
    try { seen = sessionStorage.getItem("vt-seen") === "1"; sessionStorage.setItem("vt-seen", "1"); } catch (e) { /* storage blocked */ }
    if (seen) loader.classList.add("is-quick");

    const minTime = seen ? 150 : 800;
    const t0 = performance.now();
    let progress = 0;
    let finished = false;

    function paint(value) {
      fill.style.transform = "scaleX(" + value / 100 + ")";
      pct.textContent = Math.round(value);
    }

    const timer = setInterval(function () {
      progress = Math.min(progress + Math.random() * 9 + 3, 92);
      paint(progress);
    }, 60);

    function finish() {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      paint(100);
      const wait = Math.max(0, minTime - (performance.now() - t0));
      setTimeout(function () {
        loader.classList.add("is-done");
        markReady();
        setTimeout(function () { loader.remove(); }, 900);
      }, wait + 200);
    }

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    setTimeout(finish, 2500); // never hold the visitor hostage to a slow image
  }

  /* ---------- 3. Navigation ---------------------------------------------- */

  function initNav() {
    const header = document.getElementById("site-header");
    const burger = document.getElementById("burger");
    const progressBar = document.getElementById("scroll-progress");

    function setMenu(open) {
      body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        const first = document.querySelector(".mobile-link");
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 350);
      }
    }

    burger.addEventListener("click", function () {
      setMenu(!body.classList.contains("menu-open"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("menu-open")) {
        setMenu(false);
        burger.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && body.classList.contains("menu-open")) setMenu(false);
    });
    document.getElementById("mobile-menu").addEventListener("click", function (e) {
      if (e.target.closest("[data-ai-open]")) setMenu(false);
    });

    // Header style + scroll progress, throttled to one update per frame.
    let ticking = false;
    function update() {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 40);
      const max = doc.scrollHeight - window.innerHeight;
      progressBar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 4. Page transitions ---------------------------------------- */

  function initTransitions() {
    document.addEventListener("click", function (e) {
      const link = e.target.closest("a[href]");
      if (!link || e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;
      if (/^(mailto|tel):/i.test(link.getAttribute("href"))) return;

      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page / anchor

      e.preventDefault();
      doc.classList.add("is-leaving");
      body.classList.remove("menu-open");
      setTimeout(function () { location.href = link.href; }, reduceMotion ? 0 : 420);
    });

    // Coming back with the browser's back button restores the page from cache.
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) doc.classList.remove("is-leaving");
    });
  }

  /* ---------- 5. Custom cursor (desktop only) ---------------------------- */

  function initCursor() {
    if (!finePointer) return;
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    const interactive = "a, button, [role='button'], input, select, textarea, label, summary, [data-cursor]";
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;

    doc.classList.add("has-cursor");

    function follow() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      raf = (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1) ? requestAnimationFrame(follow) : 0;
    }

    window.addEventListener("mousemove", function (e) {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      doc.classList.add("cursor-visible");
      if (!raf) raf = requestAnimationFrame(follow);
    }, { passive: true });

    document.addEventListener("mouseover", function (e) {
      ring.classList.toggle("is-active", !!e.target.closest(interactive));
    });
    document.addEventListener("mouseleave", function () { doc.classList.remove("cursor-visible"); });
    window.addEventListener("mousedown", function () { ring.classList.add("is-down"); });
    window.addEventListener("mouseup", function () { ring.classList.remove("is-down"); });
  }

  /* ---------- 6. Reveal, split text, counters, parallax, magnetic -------- */

  const revealObserver = ("IntersectionObserver" in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" })
    : null;

  const counterObserver = ("IntersectionObserver" in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 })
    : null;

  // Wraps every word in two spans so each can slide up from behind a mask.
  // Walks text nodes only, so inline markup such as <span class="accent"> survives.
  function splitWords(el) {
    let index = 0;
    function walk(node) {
      Array.from(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          const fragment = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { fragment.appendChild(document.createTextNode(" ")); return; }
            const outer = document.createElement("span");
            const inner = document.createElement("span");
            outer.className = "w";
            inner.className = "wi";
            inner.textContent = part;
            inner.style.setProperty("--i", index++);
            outer.appendChild(inner);
            fragment.appendChild(outer);
          });
          node.replaceChild(fragment, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    }
    walk(el);
  }

  function runCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = parseInt(el.dataset.duration || "1600", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";

    function format(value) {
      const text = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");
      return prefix + text + suffix;
    }

    if (reduceMotion || isNaN(target)) { el.textContent = format(target || 0); return; }

    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initReveals(root) {
    root.querySelectorAll("[data-reveal]:not([data-seen]), [data-split]:not([data-seen]), [data-stagger]:not([data-seen])").forEach(function (el) {
      el.dataset.seen = "1";
      if (el.hasAttribute("data-split")) splitWords(el);
      if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay + "ms";
      if (revealObserver && !reduceMotion) revealObserver.observe(el);
      else el.classList.add("is-visible");
    });
  }

  function initCounters(root) {
    root.querySelectorAll("[data-count]:not([data-cseen])").forEach(function (el) {
      el.dataset.cseen = "1";
      if (counterObserver && !reduceMotion) counterObserver.observe(el);
      else runCounter(el);
    });
  }

  function initParallax(root) {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    root.querySelectorAll("[data-parallax]:not([data-pseen])").forEach(function (el) {
      el.dataset.pseen = "1";
      const speed = parseFloat(el.dataset.parallax) || 8;
      window.gsap.fromTo(el, { yPercent: -speed }, {
        yPercent: speed,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  function initMagnetic(root) {
    if (!finePointer || reduceMotion) return;
    root.querySelectorAll("[data-magnetic]:not([data-mseen])").forEach(function (el) {
      el.dataset.mseen = "1";
      el.addEventListener("mousemove", function (e) {
        const box = el.getBoundingClientRect();
        const dx = e.clientX - (box.left + box.width / 2);
        const dy = e.clientY - (box.top + box.height / 2);
        el.style.transform = "translate(" + dx * 0.22 + "px," + dy * 0.3 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  // Call this after injecting new HTML (catalog cards, for example).
  function initPage(root) {
    const scope = root || document;
    initReveals(scope);
    initCounters(scope);
    initParallax(scope);
    initMagnetic(scope);
  }

  /* ---------- 7. Images --------------------------------------------------- */

  // If an external photo fails, swap in a local SVG so the layout never breaks.
  document.addEventListener("error", function (e) {
    const el = e.target;
    if (el && el.tagName === "IMG" && !el.dataset.fallback) {
      el.dataset.fallback = "1";
      el.removeAttribute("srcset");
      el.src = FALLBACK_IMAGE;
      el.classList.add("img-fallback");
    }
  }, true);

  /* ---------- Boot --------------------------------------------------------- */

  buildLayout();
  initNav();
  initTransitions();
  initCursor();
  initLoader();
  initPage(document);

  window.VanteraUI = {
    onReady: onReady,
    initPage: initPage,
    reduceMotion: reduceMotion,
    finePointer: finePointer,
    hasGsap: !!window.gsap
  };
})();
