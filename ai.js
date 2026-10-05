/* ==========================================================================
   VANTERA AI — concierge panel + recommendation engine

   MODE 1 (default): VANTERA AI DEMO. A local, rule-based assistant that reads
                     js/data.js. It is NOT a language model; it matches
                     keywords and answers from the catalog.
   MODE 2 (optional): set AI_ENDPOINT below to a serverless function that
                     calls a real LLM. The API key lives on the server only.
                     See README.md → "Connecting a real AI API".
   ========================================================================== */

(function () {
  "use strict";

  // Leave empty for demo mode. Example for Vercel/Netlify: "/api/chat"
  const AI_ENDPOINT = "";

  const M = VANTERA.motorcycles;
  const fmt = VANTERA.formatPrice;

  /* ---------- Recommendation engine (also used by the questionnaire) ----- */

  function recommend(answers) {
    const scored = M.map(function (bike) {
      let score = 0;
      const reasons = [];

      // Budget
      if (answers.budget === "under15") {
        if (bike.price <= 15000) { score += 30; reasons.push("Fits your budget at " + fmt(bike.price) + "."); }
        else score -= 60;
      } else if (answers.budget === "15to25") {
        if (bike.price >= 15000 && bike.price <= 25000) { score += 20; reasons.push("Sits inside your budget at " + fmt(bike.price) + "."); }
        else if (bike.price < 15000) score += 8;
        else score -= 60;
      } else if (answers.budget === "25plus") {
        if (bike.price >= 25000) { score += 12; reasons.push("A flagship-level machine, priced from " + fmt(bike.price) + "."); }
        else if (bike.price >= 15000) score += 6;
      }

      // Experience
      const level = bike.scores.beginner;
      if (answers.experience === "beginner") {
        score += level * 4;
        if (level <= 2) score -= 30;
        if (level >= 6) reasons.push("Forgiving power delivery makes it a confident choice for a newer rider.");
      } else if (answers.experience === "intermediate") {
        if (level >= 3 && level <= 7) { score += 15; reasons.push("A balanced step up: exciting without being intimidating."); }
      } else if (answers.experience === "advanced") {
        score += (10 - level) * 2;
        if (level <= 3) reasons.push("Its performance will reward an experienced rider.");
      }

      // Riding style
      if (bike.style.indexOf(answers.style) !== -1) {
        score += 25;
        reasons.push("Built for " + answers.style + " riding.");
      }
      if (answers.style === "touring" && bike.category === "Touring") score += 10;
      if (answers.style === "performance" && bike.category === "Superbike") score += 10;

      // Priority
      const keyMap = { comfort: "comfort", speed: "speed", technology: "tech", design: "design" };
      const key = keyMap[answers.priority];
      if (key) {
        score += bike.scores[key] * 4;
        if (bike.scores[key] >= 8) reasons.push("Scores " + bike.scores[key] + "/10 for " + answers.priority + ".");
      }

      return { bike: bike, score: score, reasons: reasons };
    });

    scored.sort(function (a, b) { return b.score - a.score; });
    return { best: scored[0], runnerUp: scored[1] };
  }

  /* ---------- Local assistant -------------------------------------------- */

  const EXTRA_ALIASES = {
    vxr1000: ["vxr"],
    vxr1000r: ["vxr 1000r", "vxr1000 r"],
    corsa600: ["corsa"],
    meridian: ["meridian", "meridian gt"],
    atlas: ["atlas", "adventure"],
    nightfall: ["night fall"]
  };

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Finds every motorcycle named in the text, longest names first so that
  // "VXR 1000 R" is not mistaken for "VXR 1000".
  function findBikes(text) {
    const aliases = [];
    M.forEach(function (m) {
      const base = m.name.toLowerCase();
      [base, m.id, base.replace(/\s+/g, "")].concat(EXTRA_ALIASES[m.id] || []).forEach(function (a) {
        aliases.push({ alias: a, bike: m });
      });
    });
    aliases.sort(function (a, b) { return b.alias.length - a.alias.length; });

    let remaining = " " + text + " ";
    const found = [];
    aliases.forEach(function (entry) {
      const re = new RegExp("(^|[^a-z0-9])" + escapeRe(entry.alias) + "(?=$|[^a-z0-9])");
      const index = remaining.search(re);
      if (index !== -1 && !found.some(function (f) { return f.bike === entry.bike; })) {
        found.push({ bike: entry.bike, index: index });
        remaining = remaining.replace(re, function (match, lead) {
          return lead + new Array(match.length - lead.length + 1).join(" ");
        });
      }
    });
    return found.sort(function (a, b) { return a.index - b.index; }).map(function (f) { return f.bike; });
  }

  function sortedBy(key, direction, list) {
    return (list || M).slice().sort(function (a, b) {
      const av = key.split(".").reduce(function (o, k) { return o[k]; }, a);
      const bv = key.split(".").reduce(function (o, k) { return o[k]; }, b);
      return direction === "asc" ? av - bv : bv - av;
    });
  }

  function parseBudget(text) {
    const match = text.match(/(?:under|below|less than|max(?:imum)?|budget of|up to)\s*\$?\s*([\d,.]+)\s*(k)?/);
    if (!match) return null;
    let value = parseFloat(match[1].replace(/,/g, ""));
    if (match[2] || value < 1000) value *= 1000;
    return isNaN(value) ? null : value;
  }

  function comparison(a, b) {
    const rows = [
      ["Category", a.category, b.category],
      ["Price", fmt(a.price), fmt(b.price)],
      ["Power", a.horsepower + " HP", b.horsepower + " HP"],
      ["Torque", a.torque + " NM", b.torque + " NM"],
      ["Top speed", a.topSpeed + " KM/H", b.topSpeed + " KM/H"],
      ["0–100 KM/H", a.acceleration + " SEC", b.acceleration + " SEC"],
      ["Weight", a.weight + " KG", b.weight + " KG"]
    ];
    const faster = a.topSpeed >= b.topSpeed ? a : b;
    const cheaper = a.price <= b.price ? a : b;
    const easier = a.scores.beginner >= b.scores.beginner ? a : b;
    const comfy = a.scores.comfort >= b.scores.comfort ? a : b;
    return {
      text: faster.name + " is the faster machine, " + cheaper.name + " is easier on the wallet, " +
        easier.name + " is the more approachable ride, and " + comfy.name + " is the more comfortable one over distance.",
      table: { head: ["", a.name, b.name], rows: rows },
      bikes: [a, b]
    };
  }

  function answer(raw) {
    const text = raw.toLowerCase().replace(/[^\w\s$.,'-]/g, " ").replace(/\s+/g, " ").trim();
    const bikes = findBikes(text);
    const has = function (re) { return re.test(text); };

    if (!text) return { text: "Ask me about any VANTERA motorcycle: power, price, comfort, or which one suits you." };

    if (has(/^(hi|hello|hey|good (morning|afternoon|evening))\b/) && text.split(" ").length < 4) {
      return { text: "Welcome to VANTERA. I can compare models, find the fastest or most comfortable machine, or recommend a bike for how you ride. What would you like to know?" };
    }

    // Compare
    if (has(/compar|\bvs\b|versus|difference|better than/) && bikes.length >= 2) {
      return comparison(bikes[0], bikes[1]);
    }
    if (has(/compar|\bvs\b|versus|difference/)) {
      return { text: "Tell me which two to compare, for example: “Compare VXR 1000 and R9”. Our models: " + M.map(function (m) { return m.name; }).join(", ") + "." };
    }

    // Price of a specific model
    if (bikes.length && has(/price|cost|how much|\$|afford|pay/)) {
      return {
        text: bikes.map(function (b) { return b.name + " starts at " + fmt(b.price) + "."; }).join(" "),
        bikes: bikes.slice(0, 2)
      };
    }

    // Cheapest / budget
    if (has(/cheap|budget|affordable|under|below|less than|up to|entry/)) {
      const limit = parseBudget(text);
      if (limit) {
        const within = sortedBy("scores.beginner", "desc", M.filter(function (m) { return m.price <= limit; }));
        if (!within.length) return { text: "Nothing in the range yet. Our most accessible model is the " + sortedBy("price", "asc")[0].name + " at " + fmt(sortedBy("price", "asc")[0].price) + "." };
        return { text: within.length + " model" + (within.length > 1 ? "s" : "") + " fit under " + fmt(limit) + ". Here are the best matches:", bikes: within.slice(0, 3) };
      }
      const cheapest = sortedBy("price", "asc")[0];
      return { text: "The most accessible VANTERA is the " + cheapest.name + " at " + fmt(cheapest.price) + ". " + cheapest.description, bikes: [cheapest] };
    }

    // Top speed
    if (has(/fastest|top speed|highest speed|quickest|max speed/)) {
      const list = sortedBy("topSpeed", "desc");
      return { text: "The " + list[0].name + " is our fastest, with a top speed of " + list[0].topSpeed + " KM/H and 0–100 in " + list[0].acceleration + " seconds. Runner-up: " + list[1].name + " at " + list[1].topSpeed + " KM/H.", bikes: list.slice(0, 2) };
    }

    // Power
    if (has(/powerful|horsepower|\bhp\b|most power|highest power|strongest/) && !bikes.length) {
      const list = sortedBy("horsepower", "desc");
      return { text: "The most powerful is the " + list[0].name + " with " + list[0].horsepower + " HP from its " + list[0].engine + " engine. Next: " + list[1].name + " at " + list[1].horsepower + " HP.", bikes: list.slice(0, 2) };
    }

    // Lightest
    if (has(/lightest|light weight|lightweight|least weight/)) {
      const list = sortedBy("weight", "asc");
      return { text: "The " + list[0].name + " is our lightest at " + list[0].weight + " KG.", bikes: [list[0]] };
    }

    // Beginner
    if (has(/beginner|first bike|first motorcycle|new rider|learn|starter|new to/)) {
      const list = sortedBy("scores.beginner", "desc");
      return { text: "For a newer rider I'd start with the " + list[0].name + " (" + fmt(list[0].price) + "): " + list[0].tagline + " If you want more performance as you progress, look at the " + list[1].name + ".", bikes: list.slice(0, 2) };
    }

    // Touring / comfort
    if (has(/long.?distance|touring|tour\b|road trip|highway|comfort|passenger|distance/)) {
      const list = sortedBy("scores.comfort", "desc");
      return { text: "For long distances the " + list[0].name + " is the one: " + list[0].tagline + " For lighter adventure riding consider the " + list[1].name + ".", bikes: list.slice(0, 2) };
    }

    // City
    if (has(/city|commut|urban|traffic|daily|everyday/)) {
      const list = sortedBy("scores.beginner", "desc", M.filter(function (m) { return m.style.indexOf("city") !== -1; }));
      return { text: "For city riding I'd choose the " + list[0].name + ": light, narrow and easy to place in traffic. The " + list[1].name + " is a sportier alternative.", bikes: list.slice(0, 2) };
    }

    // Track / sporty
    if (has(/track|race|sporty|superbike|performance/) && !bikes.length) {
      const list = sortedBy("horsepower", "desc", M.filter(function (m) { return m.category === "Superbike"; }));
      return { text: "For track days, start with the " + list[0].name + ". The " + list[1].name + " is the road-friendly flagship.", bikes: list.slice(0, 2) };
    }

    // Lineup
    if (has(/models|lineup|line up|catalog|what do you (have|sell|offer)|all bikes|range/)) {
      return { text: "We build " + M.length + " models across four categories: Superbike, Sport, Naked and Touring. Browse the full range on the Motorcycles page.", bikes: VANTERA.featuredIds.map(VANTERA.findById) };
    }

    // Test ride / contact
    if (has(/test ride|book|ride one|try/)) {
      return { text: "You can book a test ride on the Showroom page. Choose a model, a date and a time, and a VANTERA specialist will confirm.", link: { href: "showroom.html#test-ride", label: "BOOK A TEST RIDE" } };
    }
    if (has(/contact|phone|email|hours|open|address|where/)) {
      return { text: "Our studio details and opening hours are on the Contact page.", link: { href: "contact.html", label: "CONTACT" } };
    }
    if (has(/recommend|suggest|which (one|bike|motorcycle)|match|help me (choose|pick)/)) {
      return { text: "Answer four quick questions and I'll find your match.", link: { href: "motorcycles.html#match", label: "FIND MY MATCH" } };
    }

    // A single model, no other intent
    if (bikes.length) {
      const b = bikes[0];
      return { text: b.name + " (" + b.category + "): " + b.description + " " + b.horsepower + " HP, " + b.engine + ", " + b.topSpeed + " KM/H, from " + fmt(b.price) + ".", bikes: [b] };
    }

    return { text: "I can compare models, find the fastest or most comfortable machine, or recommend a bike for you. Try one of the suggestions below." };
  }

  /* ---------- Optional real-AI mode -------------------------------------- */

  async function askServer(history) {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    });
    if (!response.ok) throw new Error("Endpoint returned " + response.status);
    const data = await response.json();
    if (!data.reply) throw new Error("Empty reply");
    return { text: String(data.reply) };
  }

  /* ---------- Panel UI ---------------------------------------------------- */

  const SUGGESTIONS = [
    "Which motorcycle is best for beginners?",
    "Which one has the highest top speed?",
    "What is the most powerful motorcycle?",
    "Compare VXR 1000 and R9",
    "Best for long-distance riding?",
    "How much does the VXR 1000 cost?",
    "Recommend a motorcycle for city riding"
  ];

  let panel, log, input, fab, lastOpener;
  const history = [];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function bikeCard(bike) {
    const card = el("a", "ai-bike");
    card.href = "motorcycle-detail.html?model=" + encodeURIComponent(bike.id);
    card.appendChild(el("strong", "", bike.name));
    card.appendChild(el("span", "", bike.horsepower + " HP · " + bike.topSpeed + " KM/H · " + fmt(bike.price)));
    card.appendChild(el("em", "", "VIEW →"));
    return card;
  }

  function tableNode(table) {
    const node = el("table", "ai-table");
    const head = el("tr");
    table.head.forEach(function (h) { head.appendChild(el("th", "", h)); });
    node.appendChild(head);
    table.rows.forEach(function (row) {
      const tr = el("tr");
      row.forEach(function (cell, i) { tr.appendChild(el(i === 0 ? "th" : "td", "", cell)); });
      node.appendChild(tr);
    });
    return node;
  }

  function addMessage(role, reply) {
    const bubble = el("div", "ai-msg ai-" + role);
    bubble.appendChild(el("p", "", reply.text));
    if (reply.table) bubble.appendChild(tableNode(reply.table));
    if (reply.bikes) {
      const wrap = el("div", "ai-bikes");
      reply.bikes.forEach(function (b) { wrap.appendChild(bikeCard(b)); });
      bubble.appendChild(wrap);
    }
    if (reply.link) {
      const a = el("a", "btn btn-solid btn-sm", "");
      a.href = reply.link.href;
      a.appendChild(el("span", "", reply.link.label));
      bubble.appendChild(a);
    }
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
    return bubble;
  }

  async function send(question) {
    const clean = question.trim().slice(0, 300);
    if (!clean) return;
    addMessage("user", { text: clean });
    history.push({ role: "user", content: clean });

    const typing = el("div", "ai-msg ai-bot ai-typing");
    typing.setAttribute("aria-label", "VANTERA AI is typing");
    typing.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;

    let reply;
    if (AI_ENDPOINT) {
      try { reply = await askServer(history); }
      catch (err) { reply = answer(clean); reply.text += " (Live AI is unavailable, so this answer came from the local demo.)"; }
    } else {
      await new Promise(function (resolve) { setTimeout(resolve, VanteraUI.reduceMotion ? 0 : 450); });
      reply = answer(clean);
    }

    typing.remove();
    addMessage("bot", reply);
    history.push({ role: "assistant", content: reply.text });
  }

  function open(opener) {
    lastOpener = opener || document.activeElement;
    panel.classList.add("is-open");
    fab.setAttribute("aria-expanded", "true");
    setTimeout(function () { input.focus({ preventScroll: true }); }, 250);
  }

  function close() {
    panel.classList.remove("is-open");
    fab.setAttribute("aria-expanded", "false");
    if (lastOpener && lastOpener.focus) lastOpener.focus({ preventScroll: true });
  }

  function mount() {
    const badge = AI_ENDPOINT ? "VANTERA AI" : "VANTERA AI DEMO";
    const note = AI_ENDPOINT
      ? "Answers are generated by a language model through a secure server endpoint."
      : "Demo assistant: answers come from the VANTERA catalog using local rules, not a language model.";

    document.body.insertAdjacentHTML("beforeend",
      '<button type="button" class="ai-fab" id="ai-fab" aria-expanded="false" aria-controls="ai-panel" aria-label="Open VANTERA AI concierge">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="currentColor"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" fill="currentColor" opacity=".6"/></svg>' +
      "<span>AI</span></button>" +
      '<section class="ai-panel" id="ai-panel" role="dialog" aria-labelledby="ai-title">' +
      '<header class="ai-head"><div><span class="ai-badge">' + badge + '</span>' +
      '<h2 id="ai-title">VANTERA AI</h2><p>YOUR DIGITAL MOTORCYCLE SPECIALIST.</p></div>' +
      '<button type="button" class="ai-close" id="ai-close" aria-label="Close AI concierge">&times;</button></header>' +
      '<p class="ai-note">' + note + "</p>" +
      '<div class="ai-log" id="ai-log" role="log" aria-live="polite"></div>' +
      '<div class="ai-chips" id="ai-chips"></div>' +
      '<form class="ai-form" id="ai-form"><label class="sr-only" for="ai-input">Ask VANTERA AI a question</label>' +
      '<input id="ai-input" type="text" maxlength="300" autocomplete="off" placeholder="Ask about a motorcycle…">' +
      '<button type="submit" aria-label="Send question">SEND</button></form></section>');

    panel = document.getElementById("ai-panel");
    log = document.getElementById("ai-log");
    input = document.getElementById("ai-input");
    fab = document.getElementById("ai-fab");

    const chips = document.getElementById("ai-chips");
    SUGGESTIONS.forEach(function (s) {
      const chip = el("button", "ai-chip", s);
      chip.type = "button";
      chip.addEventListener("click", function () { send(s); });
      chips.appendChild(chip);
    });

    addMessage("bot", { text: "Welcome to VANTERA. Ask me anything about our motorcycles, or tap a suggestion below." });

    fab.addEventListener("click", function () {
      panel.classList.contains("is-open") ? close() : open(fab);
    });
    document.getElementById("ai-close").addEventListener("click", close);
    document.getElementById("ai-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const value = input.value;
      input.value = "";
      send(value);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) close();
    });
    // Any element with data-ai-open (nav button, footer link, hero link) opens the panel.
    document.addEventListener("click", function (e) {
      const trigger = e.target.closest("[data-ai-open]");
      if (trigger) open(trigger);
    });
  }

  mount();
  window.VanteraAI = { recommend: recommend, answer: answer, open: open, close: close };
})();
