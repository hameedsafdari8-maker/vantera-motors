/* ==========================================================================
   OPTIONAL serverless endpoint for VANTERA AI (Mode 2)

   GitHub Pages is static hosting, so this file does NOT run there. Deploy it
   to a serverless host (Vercel, Netlify Functions, Cloudflare Workers...) and
   put the API key in that host's environment variables, never in this repo.

   Vercel example:  /api/chat.js  →  https://your-project.vercel.app/api/chat
   Then set AI_ENDPOINT in js/ai.js to that full URL.

   Request:  POST { "messages": [ { "role": "user", "content": "..." } ] }
   Response: { "reply": "text" }
   ========================================================================== */

// The same catalog facts the website uses, trimmed for the prompt.
const CATALOG = [
  "VXR 1000 — Superbike, $28,900, 220 HP, 998 CC, 299 km/h, 0-100 in 2.9 s, 198 kg",
  "VXR 1000 R — Superbike, $34,900, 232 HP, 998 CC, 305 km/h, 0-100 in 2.8 s, 194 kg",
  "R9 — Sport, $16,900, 119 HP, 890 CC, 242 km/h, 3.5 s, 189 kg",
  "Corsa 600 — Sport, $13,400, 118 HP, 599 CC, 255 km/h, 3.3 s, 186 kg",
  "S700 — Naked, $9,900, 75 HP, 689 CC, 205 km/h, 3.9 s, 179 kg (best for beginners)",
  "Nightfall — Naked, $18,500, 165 HP, 998 CC, 252 km/h, 3.1 s, 191 kg",
  "Meridian GT — Touring, $21,900, 134 HP, 1100 CC, 225 km/h, 3.8 s, 238 kg (most comfortable)",
  "Atlas Adventure — Touring, $17,600, 105 HP, 850 CC, 210 km/h, 4.2 s, 224 kg"
].join("\n");

const SYSTEM_PROMPT =
  "You are VANTERA AI, the digital motorcycle specialist for VANTERA MOTORS, a fictional brand. " +
  "Answer only from this catalog. If asked something outside it, say so politely. Be concise and confident.\n\n" + CATALOG;

// Allow only your own site to call the endpoint (set ALLOWED_ORIGIN in the host's env vars).
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://your-username.github.io";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const apiKey = process.env.ANTHROPIC_API_KEY; // set in the host dashboard, never in code
  if (!apiKey) return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });

  // Validate and trim what the browser sends: never trust client input.
  const incoming = Array.isArray(req.body && req.body.messages) ? req.body.messages : [];
  const messages = incoming
    .slice(-10)
    .filter(function (m) { return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"; })
    .map(function (m) { return { role: m.role, content: m.content.slice(0, 500) }; });
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Send at least one user message" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });
    if (!response.ok) return res.status(502).json({ error: "Upstream AI error" });
    const data = await response.json();
    const reply = (data.content || []).map(function (b) { return b.text || ""; }).join("").trim();
    return res.status(200).json({ reply: reply });
  } catch (err) {
    return res.status(500).json({ error: "Could not reach the AI service" });
  }
};
