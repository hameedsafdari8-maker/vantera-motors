/* Catalog: filter + search + sort, and the recommendation questionnaire */
(function () {
  "use strict";

  const all = VANTERA.motorcycles;
  const grid = document.getElementById("catalog");
  const count = document.getElementById("result-count");
  const search = document.getElementById("search");
  const sort = document.getElementById("sort");
  const chips = Array.from(document.querySelectorAll("[data-filter]"));

  const state = { category: "all", query: "", sort: "default" };

  const sorters = {
    "default": null,
    "price-asc": function (a, b) { return a.price - b.price; },
    "price-desc": function (a, b) { return b.price - a.price; },
    "power-asc": function (a, b) { return a.horsepower - b.horsepower; },
    "power-desc": function (a, b) { return b.horsepower - a.horsepower; },
    "speed-asc": function (a, b) { return a.topSpeed - b.topSpeed; },
    "speed-desc": function (a, b) { return b.topSpeed - a.topSpeed; }
  };

  function matches(bike) {
    if (state.category !== "all" && bike.category !== state.category) return false;
    const q = state.query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [bike.name, bike.category, bike.engine, bike.tagline, bike.description, bike.horsepower + " hp", bike.id].join(" ").toLowerCase();
    // every word typed must appear somewhere
    return q.split(/\s+/).every(function (word) { return haystack.indexOf(word) !== -1; });
  }

  function render() {
    let list = all.filter(matches);
    if (sorters[state.sort]) list = list.slice().sort(sorters[state.sort]);

    if (!list.length) {
      grid.innerHTML = '<div class="empty"><h2>NO MACHINES FOUND</h2><p>Nothing matches your search. Try another word or clear the filters.</p>' +
        '<button type="button" class="btn btn-ghost" id="clear-filters"><span>CLEAR FILTERS</span></button></div>';
      document.getElementById("clear-filters").addEventListener("click", reset);
    } else {
      grid.innerHTML = list.map(function (bike) { return VANTERA.cardHTML(bike, all.indexOf(bike)); }).join("");
      VanteraUI.initPage(grid);
    }
    count.innerHTML = "SHOWING <b>" + list.length + "</b> OF " + all.length + " MACHINES";
  }

  function setCategory(value) {
    state.category = value;
    chips.forEach(function (chip) { chip.setAttribute("aria-pressed", String(chip.dataset.filter === value)); });
  }

  function reset() {
    setCategory("all");
    state.query = "";
    state.sort = "default";
    search.value = "";
    sort.value = "default";
    render();
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () { setCategory(chip.dataset.filter); render(); });
  });
  search.addEventListener("input", function () { state.query = search.value; render(); });
  sort.addEventListener("change", function () { state.sort = sort.value; render(); });

  // Allow links such as motorcycles.html?category=Touring
  const params = new URLSearchParams(location.search);
  const wanted = params.get("category");
  if (wanted) {
    const hit = VANTERA.categories.find(function (c) { return c.toLowerCase() === wanted.toLowerCase(); });
    if (hit) setCategory(hit);
  }
  render();

  /* ---------- Recommendation questionnaire ---------- */

  const form = document.getElementById("match-form");
  const result = document.getElementById("match-result");
  const error = document.getElementById("match-error");
  const placeholder = result.innerHTML;

  const labels = {
    experience: { beginner: "a newer rider", intermediate: "an intermediate rider", advanced: "an experienced rider" },
    style: { city: "city riding", sport: "sport riding", touring: "touring", performance: "pure performance" }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = new FormData(form);
    const answers = {
      experience: data.get("experience"),
      style: data.get("style"),
      priority: data.get("priority"),
      budget: data.get("budget")
    };
    const missing = Object.keys(answers).filter(function (k) { return !answers[k]; });
    if (missing.length) {
      error.textContent = "Please answer every question (" + missing.length + " left).";
      return;
    }
    error.textContent = "";

    const match = VanteraAI.recommend(answers);
    const bike = match.best.bike;
    const alt = match.runnerUp.bike;
    const reasons = match.best.reasons.slice(0, 4);
    if (!reasons.length) reasons.push("It is the closest overall fit to your answers across the catalog.");

    result.innerHTML =
      '<div class="match-card">' +
      '<img src="' + VANTERA.heroImage(bike, 1100) + '" alt="' + bike.name + ' motorcycle" loading="lazy" width="1100" height="620">' +
      '<div class="match-info">' +
      '<p class="eyebrow">YOUR VANTERA MATCH</p>' +
      '<h3>' + bike.name + '</h3>' +
      '<p class="muted">' + bike.category + ' · ' + bike.tagline + '</p>' +
      '<div><p class="eyebrow" style="margin-bottom:12px;color:var(--muted)">WHY IT MATCHES</p><ul class="match-why">' +
      reasons.map(function (r) { return "<li>" + r + "</li>"; }).join("") + "</ul></div>" +
      '<div class="mini-specs"><div><b>' + bike.horsepower + '</b><span>HP</span></div><div><b>' + bike.topSpeed +
      '</b><span>KM/H</span></div><div><b>' + bike.engine.replace(" CC", "") + '</b><span>CC</span></div><div><b>' +
      VANTERA.formatPrice(bike.price) + '</b><span>FROM</span></div></div>' +
      '<a class="btn btn-solid btn-arrow" href="motorcycle-detail.html?model=' + bike.id + '"><span>VIEW MOTORCYCLE</span></a>' +
      '<p class="match-alt">Also consider the <a href="motorcycle-detail.html?model=' + alt.id + '">' + alt.name + '</a> (' + VANTERA.formatPrice(alt.price) + ').</p>' +
      "</div></div>";

    if (window.matchMedia("(max-width: 960px)").matches) {
      result.scrollIntoView({ behavior: VanteraUI.reduceMotion ? "auto" : "smooth", block: "start" });
    }
  });

  form.addEventListener("reset", function () {
    error.textContent = "";
    result.innerHTML = placeholder;
  });
})();
