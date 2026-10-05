/* Motorcycle detail page: reads ?model=vxr1000 and builds the whole page from data.js */
(function () {
  "use strict";

  const root = document.getElementById("detail-root");
  const all = VANTERA.motorcycles;
  const fmt = VANTERA.formatPrice;

  const params = new URLSearchParams(location.search);
  const id = (params.get("model") || "vxr1000").toLowerCase();
  const bike = VANTERA.findById(id);

  function notFound() {
    document.title = "Model not found | VANTERA MOTORS";
    root.innerHTML =
      '<div class="notfound"><p class="eyebrow" style="justify-self:center">404</p>' +
      '<h1 class="h-section">MACHINE NOT FOUND</h1>' +
      '<p class="muted">We could not find a model called “' + id.replace(/[<>&"]/g, "") + '”.</p>' +
      '<div class="hero-actions" style="justify-content:center"><a class="btn btn-solid" href="motorcycles.html"><span>BROWSE ALL MOTORCYCLES</span></a></div></div>';
  }

  if (!bike) { notFound(); return; }

  const cc = parseInt(bike.engine, 10);
  const maxHp = Math.max.apply(null, all.map(function (m) { return m.horsepower; }));
  const maxTorque = Math.max.apply(null, all.map(function (m) { return m.torque; }));
  const maxSpeed = Math.max.apply(null, all.map(function (m) { return m.topSpeed; }));
  const powerToWeight = Math.round(bike.horsepower / bike.weight * 1000);
  const maxP2W = Math.max.apply(null, all.map(function (m) { return Math.round(m.horsepower / m.weight * 1000); }));

  document.title = bike.name + " | VANTERA MOTORS";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", bike.name + ": " + bike.description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", bike.name + " | VANTERA MOTORS");

  function ring(label, value, decimals, unit, pct, note) {
    return '<div class="ring" style="--pct:' + pct.toFixed(3) + '" data-reveal>' +
      '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="track" cx="60" cy="60" r="50"/><circle class="fill" cx="60" cy="60" r="50"/></svg>' +
      '<div class="ring-center"><b data-count="' + value + '" data-decimals="' + decimals + '">0</b><small>' + unit + '</small></div>' +
      '<h3>' + label + '</h3><p>' + note + '</p></div>';
  }

  function bar(label, pct, note) {
    return '<div class="bar-row" style="--pct:' + pct.toFixed(3) + '" data-reveal><span>' + label + '</span>' +
      '<div class="bar-track" role="img" aria-label="' + label + ': ' + Math.round(pct * 100) + ' percent"><div class="bar-fill"></div></div>' +
      '<span class="bar-note">' + note + '</span></div>';
  }

  function specRow(name, value) {
    return '<div class="spec-row"><dt>' + name + '</dt><dd>' + value + '</dd></div>';
  }

  const swatches = VANTERA.colors.map(function (c, i) {
    return '<button type="button" class="swatch" data-color="' + c.id + '" aria-pressed="' + (i === 0) + '" aria-label="' + c.name + ' colour">' +
      '<i style="--c:' + c.swatch + '"></i><span class="swatch-name">' + c.name.toUpperCase() + '</span></button>';
  }).join("");

  const gallery = VANTERA.galleryImages(bike, 1200).map(function (src, i) {
    return '<figure data-reveal="clip"><img src="' + src + '" alt="' + bike.name + ' gallery photograph ' + (i + 1) + '" loading="lazy" width="1200" height="800"></figure>';
  }).join("");

  const sameCategory = all.filter(function (m) { return m.id !== bike.id && m.category === bike.category; });
  const others = all.filter(function (m) { return m.id !== bike.id && m.category !== bike.category; });
  const related = sameCategory.concat(others).slice(0, 3);

  root.innerHTML =
    /* ---- Hero ---- */
    '<section class="detail-hero" aria-labelledby="bike-title">' +
    '<div class="detail-ghost" aria-hidden="true">' + bike.name.split(" ")[0] + '</div>' +
    '<div class="container"><div class="detail-grid">' +
    '<div class="detail-title">' +
    '<nav class="crumbs" aria-label="Breadcrumb"><a href="motorcycles.html">MOTORCYCLES</a><span>/</span><a href="motorcycles.html?category=' + bike.category + '">' + bike.category.toUpperCase() + '</a></nav>' +
    '<h1 id="bike-title">' + bike.name + '</h1>' +
    '<p class="lead">' + bike.tagline + '</p>' +
    '<div class="price-tag"><small>STARTING PRICE</small><b>' + fmt(bike.price) + '</b></div>' +
    '<div class="detail-actions">' +
    '<a class="btn btn-solid btn-arrow" href="showroom.html?model=' + bike.id + '#test-ride" data-magnetic><span>BOOK A TEST RIDE</span></a>' +
    '<button type="button" class="btn btn-ghost" data-ai-open><span>ASK VANTERA AI</span></button></div></div>' +
    '<div><div class="stage"><img id="stage-img" src="' + VANTERA.heroImage(bike, 1600) + '" alt="' + bike.name + ' ' + bike.category.toLowerCase() + ' motorcycle in Obsidian" fetchpriority="high" width="1600" height="1000">' +
    '<span class="stage-label" id="stage-label">OBSIDIAN</span><span class="stage-note">COLOUR PREVIEW</span></div>' +
    '<div class="swatches" role="group" aria-label="Choose a colour"><span class="swatches-label">COLOUR</span>' + swatches + '</div></div>' +
    '</div></div>' +
    /* ---- Stats ---- */
    '<div class="stat-grid" data-stagger>' +
    '<div class="stat"><b data-count="' + cc + '">0</b><span>CC</span></div>' +
    '<div class="stat"><b data-count="' + bike.horsepower + '">0</b><span>HP</span></div>' +
    '<div class="stat"><b data-count="' + bike.topSpeed + '">0</b><span>KM/H</span></div>' +
    '<div class="stat"><b data-count="' + bike.torque + '">0</b><span>NM</span></div>' +
    '<div class="stat"><b data-count="' + bike.weight + '">0</b><span>KG</span></div>' +
    '<div class="stat"><b>' + bike.gearbox + '</b><span>GEARBOX</span></div>' +
    '</div></section>' +

    /* ---- Sections ---- */
    '<div class="container">' +
    '<section class="detail-section" id="overview" aria-labelledby="h-overview"><div class="detail-two"><div><p class="eyebrow">01</p><h2 id="h-overview" data-split>OVERVIEW</h2></div><div><p data-reveal>' + bike.overview + '</p><p data-reveal style="margin-top:18px">' + bike.description + '</p></div></div></section>' +

    '<section class="detail-section" id="performance" aria-labelledby="h-performance"><div><p class="eyebrow">02</p><h2 class="h-section" id="h-performance" data-split style="margin-top:18px">PERFORMANCE</h2></div>' +
    '<div class="perf-grid">' +
    ring("HORSEPOWER", bike.horsepower, 0, "HP", bike.horsepower / maxHp, "vs. " + maxHp + " HP range best") +
    ring("TORQUE", bike.torque, 0, "NM", bike.torque / maxTorque, "vs. " + maxTorque + " NM range best") +
    ring("TOP SPEED", bike.topSpeed, 0, "KM/H", bike.topSpeed / maxSpeed, "vs. " + maxSpeed + " KM/H range best") +
    ring("0–100 KM/H", bike.acceleration, 1, "SEC", Math.min(1, 2.7 / bike.acceleration), "Shorter is faster") +
    '</div><div class="bars">' +
    bar("POWER-TO-WEIGHT", powerToWeight / maxP2W, powerToWeight + " HP / TONNE") +
    bar("BEGINNER-FRIENDLY", bike.scores.beginner / 10, bike.scores.beginner + " / 10") +
    bar("LONG-DISTANCE COMFORT", bike.scores.comfort / 10, bike.scores.comfort + " / 10") +
    bar("TECHNOLOGY", bike.scores.tech / 10, bike.scores.tech + " / 10") +
    '</div></section>' +

    '<section class="detail-section" id="engine" aria-labelledby="h-engine"><div class="detail-two"><div><p class="eyebrow">03</p><h2 id="h-engine" data-split>ENGINE</h2></div><div><p data-reveal>' + bike.engineText + '</p></div></div></section>' +

    '<section class="detail-section" id="design" aria-labelledby="h-design"><div class="detail-two"><div><p class="eyebrow">04</p><h2 id="h-design" data-split>DESIGN</h2></div><div><p data-reveal>' + bike.designText + '</p></div></div></section>' +

    '<section class="detail-section" id="technology" aria-labelledby="h-tech"><div class="detail-two"><div><p class="eyebrow">05</p><h2 id="h-tech" data-split>TECHNOLOGY</h2></div><div><p data-reveal>' + bike.techText + '</p>' +
    '<ul class="feature-list" data-stagger>' + bike.features.map(function (f) { return "<li>" + f + "</li>"; }).join("") + '</ul></div></div></section>' +

    '<section class="detail-section" id="specifications" aria-labelledby="h-specs"><div class="detail-two"><div><p class="eyebrow">06</p><h2 id="h-specs" data-split>SPECIFICATIONS</h2></div>' +
    '<dl class="spec-table" data-reveal>' +
    specRow("Category", bike.category) + specRow("Engine", bike.engine) + specRow("Power", bike.horsepower + " HP") +
    specRow("Torque", bike.torque + " NM") + specRow("Top speed", bike.topSpeed + " KM/H") + specRow("0–100 KM/H", bike.acceleration + " SEC") +
    specRow("Weight", bike.weight + " KG") + specRow("Gearbox", bike.gearbox) + specRow("Power-to-weight", powerToWeight + " HP / tonne") +
    specRow("Colours", VANTERA.colors.map(function (c) { return c.name; }).join(", ")) + specRow("Starting price", fmt(bike.price)) +
    '</dl></div></section>' +

    '<section class="detail-section" id="gallery" aria-labelledby="h-gallery"><p class="eyebrow">07</p><h2 class="h-section" id="h-gallery" data-split style="margin-top:18px">GALLERY</h2><div class="gallery">' + gallery + '</div></section>' +

    '<section class="detail-section" aria-labelledby="h-related"><p class="eyebrow">MORE FROM VANTERA</p><h2 class="h-section" id="h-related" data-split style="margin-top:18px">ALSO CONSIDER</h2>' +
    '<div class="related-grid" data-stagger>' + related.map(function (m) { return VANTERA.cardHTML(m, all.indexOf(m)); }).join("") + '</div></section>' +
    '</div>';

  /* ---------- Colour selector ---------- */

  const stage = document.getElementById("stage-img");
  const stageLabel = document.getElementById("stage-label");
  const buttons = Array.from(root.querySelectorAll(".swatch"));

  function pickColor(colorId) {
    const color = VANTERA.colors.find(function (c) { return c.id === colorId; });
    if (!color) return;
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.color === colorId)); });
    stage.classList.add("is-swapping");
    setTimeout(function () {
      stage.style.filter = color.filter;
      stage.alt = bike.name + " " + bike.category.toLowerCase() + " motorcycle in " + color.name;
      stageLabel.textContent = color.name.toUpperCase();
      stage.classList.remove("is-swapping");
    }, VanteraUI.reduceMotion ? 0 : 260);
    try { sessionStorage.setItem("vt-color-" + bike.id, colorId); } catch (e) { /* storage blocked */ }
  }

  buttons.forEach(function (b) { b.addEventListener("click", function () { pickColor(b.dataset.color); }); });
  try {
    const saved = sessionStorage.getItem("vt-color-" + bike.id);
    if (saved && saved !== "obsidian") pickColor(saved);
  } catch (e) { /* storage blocked */ }

  VanteraUI.initPage(root);
})();
