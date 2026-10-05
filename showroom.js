/* Showroom: interactive showcase + test-ride booking form */
(function () {
  "use strict";

  /* ---------- Showcase ---------- */
  const showcase = document.getElementById("showcase");
  const bikes = VANTERA.featuredIds.map(VANTERA.findById);

  showcase.innerHTML = bikes.map(function (m) {
    return '<a class="show-item" href="motorcycle-detail.html?model=' + m.id + '" aria-label="View ' + m.name + '">' +
      '<img src="' + VANTERA.heroImage(m, 900) + '" alt="' + m.name + ' ' + m.category.toLowerCase() + ' motorcycle on the showroom floor" loading="lazy" width="900" height="1200">' +
      '<div class="show-info"><small>' + m.category.toUpperCase() + '</small><h3>' + m.name + '</h3>' +
      '<div class="show-extra">' + m.horsepower + ' HP · ' + m.engine + ' · ' + m.topSpeed + ' KM/H<br>From ' + VANTERA.formatPrice(m.price) +
      '<span>VIEW MACHINE →</span></div></div></a>';
  }).join("");

  if (VanteraUI.finePointer && !VanteraUI.reduceMotion) {
    showcase.querySelectorAll(".show-item").forEach(function (item) {
      const img = item.querySelector("img");
      item.addEventListener("mousemove", function (e) {
        const box = item.getBoundingClientRect();
        const x = (e.clientX - box.left) / box.width - 0.5;
        const y = (e.clientY - box.top) / box.height - 0.5;
        img.style.transform = "translate(" + (-x * 28).toFixed(1) + "px," + (-y * 18).toFixed(1) + "px) scale(1.06)";
      });
      item.addEventListener("mouseleave", function () { img.style.transform = ""; });
    });
  }

  /* ---------- Test-ride form ---------- */
  const form = document.getElementById("ride-form");
  const success = document.getElementById("ride-success");
  const bikeSelect = document.getElementById("r-bike");
  const dateInput = document.getElementById("r-date");

  VANTERA.motorcycles.forEach(function (m) {
    const option = document.createElement("option");
    option.value = m.id;
    option.textContent = m.name + " — " + m.category;
    bikeSelect.appendChild(option);
  });

  // ?model=vxr1000 (from the detail page) preselects the motorcycle
  const wanted = new URLSearchParams(location.search).get("model");
  if (wanted && VANTERA.findById(wanted.toLowerCase())) bikeSelect.value = wanted.toLowerCase();

  // earliest selectable date = today (local time)
  const now = new Date();
  const pad = function (n) { return String(n).padStart(2, "0"); };
  dateInput.min = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());

  const R = VanteraForms.rules;
  VanteraForms.attach(form, {
    name: R.minLength("Name", 2),
    email: R.email,
    phone: R.phone,
    bike: function (v) { return v ? "" : "Choose a motorcycle."; },
    date: R.futureDate,
    time: function (v) { return v ? "" : "Choose a preferred time."; }
  }, function () {
    VanteraForms.showSuccess(form, success);
  });

  document.getElementById("ride-again").addEventListener("click", function () {
    VanteraForms.reset(form, success);
  });
})();
