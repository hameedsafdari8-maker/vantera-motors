/* ==========================================================================
   VANTERA MOTORS — single source of truth
   Every page (catalog, detail, AI assistant, recommender) reads from here.
   Loaded as a normal <script>, so it also works when opening files directly.
   ========================================================================== */

(function () {
  // Unsplash photo IDs. Swap any ID to change a picture across the whole site.
  const PHOTO = {
    hero: "1558981806-ec527fa84c39",
    road: "1449426468159-d96dbf08f19f",
    studio: "1568772585407-9361f9bf3a87",
    night: "1558980394-4c7c9299fe96",
    detail: "1558981403-c5f9899a28bc",
    rider: "1517846693594-1567da72af75",
    sport: "1609630875171-b1321377ee65",
    garage: "1571068316344-75bc76f77890",
    touring: "1591637333184-19aa84b3e01f",
    naked: "1547549082-6bc09f2049ae",
    classic: "1571068316344-75bc76f77890",
    city: "1580310614729-ccd69652491d"
  };

  function img(key, width) {
    return "https://images.unsplash.com/photo-" + PHOTO[key] + "?auto=format&fit=crop&q=75&w=" + (width || 1400);
  }

  // Colour options. "filter" is the CSS treatment applied to the photo,
  // because one photograph cannot be repainted for real.
  const COLORS = [
    { id: "obsidian", name: "Obsidian", swatch: "#0b0b0b", filter: "none" },
    { id: "crimson", name: "Crimson", swatch: "#c1121f", filter: "sepia(1) saturate(4) hue-rotate(-35deg) brightness(.85)" },
    { id: "ivory", name: "Ivory", swatch: "#e8e1d0", filter: "grayscale(1) sepia(.35) brightness(1.25) contrast(.9)" },
    { id: "graphite", name: "Graphite", swatch: "#4a4a4a", filter: "grayscale(1) contrast(1.1) brightness(.9)" }
  ];

  /* Scores (1–10) feed the recommender and the AI assistant.
     beginner: how forgiving the bike is. comfort / tech / design: character. */
  const motorcycles = [
    {
      id: "vxr1000", name: "VXR 1000", category: "Superbike", price: 28900,
      horsepower: 220, torque: 112, engine: "998 CC", topSpeed: 299, acceleration: 2.9,
      weight: 198, gearbox: "6-SPEED", style: ["performance", "sport"],
      scores: { beginner: 1, comfort: 3, tech: 9, design: 9, speed: 10 },
      photo: "hero", gallery: ["road", "detail", "night"],
      tagline: "The reason the name exists.",
      description: "A 998 cc inline-four tuned for the track and civilised enough for the road. The VXR 1000 is the flagship of the VXR platform.",
      overview: "Every line on the VXR 1000 serves airflow. The fairing is carved in a wind tunnel, the frame is a twin-spar aluminium casting, and the electronics read the road 1,000 times a second.",
      engineText: "A short-stroke 998 cc inline-four with titanium valves revs to 14,500 rpm. A cross-plane crank gives it a deep, hard-edged note and brutal mid-range pull.",
      designText: "Sharp, low and asymmetrical. A single crimson blade runs the length of the tank, the only colour on an otherwise monochrome machine.",
      techText: "Six-axis IMU, cornering ABS, launch control, quickshifter both ways, and a 6.5-inch TFT with lap timing.",
      features: ["Six-axis IMU", "Cornering ABS", "Launch control", "Bi-directional quickshifter", "Carbon wheels (option)"]
    },
    {
      id: "vxr1000r", name: "VXR 1000 R", category: "Superbike", price: 34900,
      horsepower: 232, torque: 115, engine: "998 CC", topSpeed: 305, acceleration: 2.8,
      weight: 194, gearbox: "6-SPEED", style: ["performance"],
      scores: { beginner: 0, comfort: 2, tech: 10, design: 9, speed: 10 },
      photo: "sport", gallery: ["detail", "night", "road"],
      tagline: "Homologation special. Zero compromise.",
      description: "The VXR 1000 R adds carbon aero, semi-active suspension and 12 extra horsepower for riders who live on track days.",
      overview: "The R is the VXR with every remaining compromise removed. Winglets add real downforce at speed, and the semi-active suspension re-tunes itself every corner.",
      engineText: "Same 998 cc block with higher compression, lighter rods and a race-derived exhaust system. 232 hp at 13,800 rpm.",
      designText: "Exposed carbon, matte finish, minimal graphics. It looks fast because it is.",
      techText: "Semi-active suspension, race ABS with rear-lift mitigation, pit-lane limiter and a data logger.",
      features: ["Semi-active suspension", "Carbon winglets", "Race ABS", "Data logger", "Pit-lane limiter"]
    },
    {
      id: "r9", name: "R9", category: "Sport", price: 16900,
      horsepower: 119, torque: 93, engine: "890 CC", topSpeed: 242, acceleration: 3.5,
      weight: 189, gearbox: "6-SPEED", style: ["sport", "city"],
      scores: { beginner: 6, comfort: 6, tech: 7, design: 8, speed: 7 },
      photo: "studio", gallery: ["road", "rider", "detail"],
      tagline: "Quick enough to thrill. Kind enough to learn on.",
      description: "A three-cylinder sport bike that rewards progress. The R9 delivers real pace without the ferocity of a superbike.",
      overview: "The R9 is built for riders who want a sport bike they can actually use. Upright enough for daily commutes, sharp enough for Sunday canyon runs.",
      engineText: "An 890 cc triple with a flat torque curve. Power arrives early and smoothly, so confidence builds quickly.",
      designText: "Compact and muscular, with a short tail and a clean, uncluttered profile.",
      techText: "Three riding modes, traction control, switchable ABS and a 5-inch TFT with smartphone connectivity.",
      features: ["Three riding modes", "Traction control", "Switchable ABS", "5-inch TFT", "Slipper clutch"]
    },
    {
      id: "corsa600", name: "Corsa 600", category: "Sport", price: 13400,
      horsepower: 118, torque: 66, engine: "599 CC", topSpeed: 255, acceleration: 3.3,
      weight: 186, gearbox: "6-SPEED", style: ["sport", "performance"],
      scores: { beginner: 4, comfort: 4, tech: 6, design: 8, speed: 8 },
      photo: "night", gallery: ["road", "studio", "detail"],
      tagline: "The high-revving classic, refined.",
      description: "A 599 cc four-cylinder that loves redline. Lightweight, precise and priced for the keen rider.",
      overview: "The Corsa 600 is pure feedback. Light controls, a screaming top end and a chassis that tells you everything.",
      engineText: "A 599 cc inline-four that makes its best power above 11,000 rpm, with a thrilling intake howl.",
      designText: "Aggressive twin-headlight face and a tight, track-focused silhouette.",
      techText: "Traction control, ride-by-wire throttle and a quickshifter as standard.",
      features: ["Quickshifter", "Traction control", "Ride-by-wire", "Adjustable suspension"]
    },
    {
      id: "s700", name: "S700", category: "Naked", price: 9900,
      horsepower: 75, torque: 68, engine: "689 CC", topSpeed: 205, acceleration: 3.9,
      weight: 179, gearbox: "6-SPEED", style: ["city", "sport"],
      scores: { beginner: 9, comfort: 7, tech: 6, design: 7, speed: 5 },
      photo: "city", gallery: ["naked", "rider", "road"],
      tagline: "Your first great motorcycle.",
      description: "A friendly parallel-twin naked bike: light, accessible and quick enough to stay exciting for years.",
      overview: "The S700 is for the rider who wants a motorcycle that feels right from the first ride. Low seat, light clutch, linear power.",
      engineText: "A 689 cc parallel-twin tuned for smooth, usable torque from 3,000 rpm. Superb in traffic, fun on back roads.",
      designText: "Clean, compact and unfussy. A bold LED headlight and exposed trellis frame give it character.",
      techText: "ABS, selectable power modes and an easy-to-read LCD dashboard.",
      features: ["Low 790 mm seat", "ABS", "Two power modes", "LED lighting"]
    },
    {
      id: "nightfall", name: "Nightfall", category: "Naked", price: 18500,
      horsepower: 165, torque: 109, engine: "998 CC", topSpeed: 252, acceleration: 3.1,
      weight: 191, gearbox: "6-SPEED", style: ["performance", "sport"],
      scores: { beginner: 2, comfort: 5, tech: 8, design: 10, speed: 8 },
      photo: "naked", gallery: ["night", "detail", "road"],
      tagline: "All the power. None of the bodywork.",
      description: "A stripped-back hypernaked built on the VXR engine. Raw, loud and unapologetically dramatic.",
      overview: "Nightfall is the VXR without the fairing, and a lot more attitude. Upright, wide-barred and brutally fast, with a presence that stops a street.",
      engineText: "A retuned 998 cc four with a fatter mid-range. 165 hp and a bark from the twin underslung exhausts.",
      designText: "Black on black on black. A single red accent line along the subframe is the only concession.",
      techText: "Wheelie control, cornering ABS, cruise control and a full-colour TFT dash.",
      features: ["Wheelie control", "Cornering ABS", "Cruise control", "Full-colour TFT"]
    },
    {
      id: "meridian", name: "Meridian GT", category: "Touring", price: 21900,
      horsepower: 134, torque: 117, engine: "1100 CC", topSpeed: 225, acceleration: 3.8,
      weight: 238, gearbox: "6-SPEED", style: ["touring"],
      scores: { beginner: 3, comfort: 10, tech: 8, design: 7, speed: 5 },
      photo: "touring", gallery: ["road", "rider", "classic"],
      tagline: "A thousand miles before breakfast.",
      description: "A refined long-distance tourer with wind protection, a deep torque curve and a 400 km range.",
      overview: "The Meridian GT exists to make distance disappear. An electrically adjustable screen, heated grips and an upright riding position keep you fresh all day.",
      engineText: "A 1100 cc twin with huge low-down torque and relaxed cruising at 4,000 rpm in sixth.",
      designText: "Long, calm lines and integrated luggage. It looks expensive and travels like it.",
      techText: "Adaptive cruise control, tyre-pressure monitoring, heated grips and seat, and a navigation-ready TFT.",
      features: ["Adaptive cruise control", "Electric screen", "Heated grips + seat", "Integrated luggage"]
    },
    {
      id: "atlas", name: "Atlas Adventure", category: "Touring", price: 17600,
      horsepower: 105, torque: 105, engine: "850 CC", topSpeed: 210, acceleration: 4.2,
      weight: 224, gearbox: "6-SPEED", style: ["touring", "city"],
      scores: { beginner: 5, comfort: 9, tech: 7, design: 6, speed: 4 },
      photo: "classic", gallery: ["road", "touring", "rider"],
      tagline: "Take the long way. Every time.",
      description: "An adventure tourer built to leave the tarmac. Tall, tough and comfortable over any distance.",
      overview: "The Atlas takes the Meridian's comfort and adds ground clearance and long-travel suspension. Gravel, mountain passes, motorways: it does it all.",
      engineText: "An 850 cc twin tuned for torque and reliability, with a 20-litre tank for serious range.",
      designText: "Upright, purposeful and functional. Every surface has a job.",
      techText: "Off-road ABS mode, traction control, cruise control and a 5-inch TFT.",
      features: ["Off-road ABS", "Long-travel suspension", "Cruise control", "20 L tank"]
    }
  ];

  function formatPrice(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function findById(id) {
    return motorcycles.find(function (m) { return m.id === id; });
  }

  // Build image URLs on demand so the width can suit the layout.
  function heroImage(m, w) { return img(m.photo, w || 1600); }
  function galleryImages(m, w) { return m.gallery.map(function (k) { return img(k, w || 1000); }); }

  // One card template shared by the homepage and the catalog.
  function cardHTML(m, index) {
    const num = String(index + 1).padStart(2, "0");
    return '<a class="machine-card" href="motorcycle-detail.html?model=' + m.id + '" data-id="' + m.id + '" aria-label="' + m.name + ', ' + m.category + ', from ' + formatPrice(m.price) + '">' +
      '<div class="machine-media"><img src="' + heroImage(m, 1000) + '" alt="' + m.name + ' ' + m.category.toLowerCase() + ' motorcycle, ' + m.tagline.replace(/"/g, "") + '" loading="lazy" width="1000" height="700"></div>' +
      '<div class="machine-top"><span class="machine-num" aria-hidden="true">' + num + '</span><span class="machine-cat">' + m.category + '</span></div>' +
      '<div class="machine-body">' +
      '<h3 class="machine-name"><small>VANTERA</small>' + m.name + '</h3>' +
      '<p class="machine-tagline">' + m.tagline + '</p>' +
      '<dl class="machine-specs"><div><dt>Engine</dt><dd>' + m.engine + '</dd></div><div><dt>Power</dt><dd>' + m.horsepower + ' HP</dd></div><div><dt>Top speed</dt><dd>' + m.topSpeed + ' KM/H</dd></div></dl>' +
      '<div class="machine-foot"><div class="machine-price"><small>FROM</small><b>' + formatPrice(m.price) + '</b></div>' +
      '<span class="machine-cta">VIEW MACHINE <span aria-hidden="true">→</span></span></div></div></a>';
  }

  window.VANTERA = {
    cardHTML: cardHTML,
    motorcycles: motorcycles,
    colors: COLORS,
    categories: ["Superbike", "Sport", "Naked", "Touring"],
    photo: function (key, w) { return img(key, w); },
    heroImage: heroImage,
    galleryImages: galleryImages,
    formatPrice: formatPrice,
    findById: findById,
    featuredIds: ["vxr1000", "r9", "s700", "nightfall"]
  };
})();
