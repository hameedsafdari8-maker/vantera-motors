/* Homepage: featured machines + hero mouse parallax */
(function () {
  "use strict";

  const grid = document.getElementById("featured-grid");
  if (grid) {
    VANTERA.featuredIds.forEach(function (id) {
      const bike = VANTERA.findById(id);
      const index = VANTERA.motorcycles.indexOf(bike);
      grid.insertAdjacentHTML("beforeend", VANTERA.cardHTML(bike, index));
    });
    VanteraUI.initPage(grid);
  }

  // Subtle mouse parallax on the hero photo (desktop, motion allowed only)
  const hero = document.querySelector(".hero");
  const media = document.querySelector(".hero-media img");
  if (hero && media && VanteraUI.finePointer && !VanteraUI.reduceMotion) {
    hero.addEventListener("mousemove", function (e) {
      const box = hero.getBoundingClientRect();
      const x = (e.clientX - box.left) / box.width - 0.5;
      const y = (e.clientY - box.top) / box.height - 0.5;
      media.style.setProperty("--mx", (-x * 26).toFixed(1) + "px");
      media.style.setProperty("--my", (-y * 16).toFixed(1) + "px");
    });
    hero.addEventListener("mouseleave", function () {
      media.style.setProperty("--mx", "0px");
      media.style.setProperty("--my", "0px");
    });
  }
})();
