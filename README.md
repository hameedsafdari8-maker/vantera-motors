# VANTERA MOTORS

**ENGINEERED TO BE DESIRED.**

A premium, multi-page motorcycle brand website built with plain HTML, CSS and JavaScript. VANTERA is a **fictional** brand created for a university web design project. All models, prices, contact details and history are invented.

## Features

- Cinematic home page with hero parallax, animated spec counters and a flagship section
- Motorcycle catalog with working **category filter, search and sorting** (price, power, top speed)
- Detail page for every model, driven by `?model=` (for example `motorcycle-detail.html?model=vxr1000`)
- **Colour selector** with animated transition (a CSS colour treatment on one photograph)
- Animated performance rings and bars that fill when scrolled into view
- Showroom page with an interactive machine showcase and a validated **test-ride form**
- **VANTERA AI** concierge panel plus a four-question **recommendation engine**
- About page with story, philosophy and timeline; contact page with a validated form
- Loading screen, custom cursor (desktop only), scroll progress bar, page transitions, magnetic buttons
- Responsive from 320 px to 1920 px, keyboard accessible, `prefers-reduced-motion` supported

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home |
| `motorcycles.html` | Catalog, filtering, search, sorting, recommendation questionnaire |
| `motorcycle-detail.html` | Model detail page (`?model=id`) |
| `showroom.html` | Showroom, delivery, test-ride booking |
| `about.html` | Brand story and timeline |
| `contact.html` | Contact details and form |

## Technologies

HTML5 · CSS3 (custom properties, grid, clip-path) · vanilla JavaScript · GSAP + ScrollTrigger (CDN, used only for parallax) · SVG · Google Fonts (Oswald, Inter) · Unsplash photography.

No frameworks, no build step, no Node.js needed.

## Folder structure

```
vantera-motors/
├── index.html
├── motorcycles.html
├── motorcycle-detail.html
├── showroom.html
├── about.html
├── contact.html
├── css/
│   ├── style.css          design tokens, components, page styles
│   ├── animations.css     keyframes, reveal states, reduced-motion rules
│   └── responsive.css     breakpoints
├── js/
│   ├── data.js            THE motorcycle dataset (single source of truth) + card template
│   ├── main.js            header/footer, loader, cursor, reveals, counters, transitions
│   ├── forms.js           shared form-validation helper
│   ├── ai.js              AI concierge panel + recommendation engine
│   ├── home.js            featured machines, hero mouse parallax
│   ├── motorcycles.js     catalog filter / search / sort + questionnaire
│   ├── detail.js          builds the detail page from ?model=
│   ├── showroom.js        showcase + test-ride form
│   └── contact.js         contact form
├── assets/
│   ├── logo.svg
│   ├── icons/favicon.svg
│   ├── icons/fallback.svg   shown if an external photo fails to load
│   └── images/
├── api/
│   └── chat.js            OPTIONAL serverless endpoint (does not run on GitHub Pages)
└── README.md
```

The header, footer, loader and AI panel are injected by `main.js` and `ai.js`, so they are edited in one place.

## Run locally

Any static server works. From the project folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` by double-clicking also works, but a local server is closer to real hosting.

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Create VANTERA Motors website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/vantera-motors.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)` → Save.** The site appears at `https://YOUR-USERNAME.github.io/vantera-motors/` after a minute. All paths are relative, so the repository name does not matter.

## How the data flows

`js/data.js` defines the `motorcycles` array once. The catalog, detail page, showroom, AI assistant and recommender all read it. To add a bike, add one object to that array. Every page updates.

## How the AI demo works

The default mode is labelled **VANTERA AI DEMO** in the panel. It is **not a language model**. `js/ai.js` looks for keywords (fastest, cheapest, beginner, "compare X and Y", a model name plus "price") and builds answers from the dataset. It cannot answer questions outside that scope, and it says so.

The questionnaire on the Motorcycles page uses the same scoring function (`VanteraAI.recommend`). Each bike has scores in `data.js`; your answers add or subtract points for budget, experience, riding style and priority, and the top score wins.

## Connecting a real AI API safely

> ⚠️ **NEVER put an OpenAI, Anthropic or any other secret API key in frontend JavaScript.** Everything in a GitHub Pages site is public. Anyone can read the key and run up your bill.

The safe pattern is a small server-side function that holds the key:

1. Deploy `api/chat.js` to a serverless host (Vercel, Netlify Functions, Cloudflare Workers).
2. Add `ANTHROPIC_API_KEY` (or your provider's key) in the host's **environment variables** dashboard. Also set `ALLOWED_ORIGIN` to your GitHub Pages URL.
3. In `js/ai.js`, set `AI_ENDPOINT` to the deployed URL, for example `"https://your-project.vercel.app/api/chat"`.
4. The browser sends `{ messages: [...] }` to your endpoint; the endpoint calls the AI provider and returns `{ reply: "..." }`.

If the endpoint is empty or fails, the site automatically falls back to the local demo, so it never breaks. The endpoint also trims input, limits length and restricts the origin. For production, add rate limiting too.

## Notes and credits

- Photography is loaded from [Unsplash](https://unsplash.com) (free license). Check the photo IDs at the top of `js/data.js` and replace any you prefer. If an image fails, a local SVG fallback appears.
- The colour selector applies a CSS filter to one photograph. It is a preview treatment, not a real repaint.
- Forms validate in the browser and send nothing anywhere.
- No real motorcycle manufacturer logos or marks are used.
