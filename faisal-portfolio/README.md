# MFP · Research — portfolio site

Multi-page static site for Mohammed Faisal Parvez (ML & Edge AI Engineer / Independent Researcher).

## Structure

```
index.html                    /            home (hero, metrics, about, featured, contact footer)
research/index.html           /research    full research index (F-01…F-04)
research/<slug>/index.html    /research/…  deep-linkable finding pages:
                                           selective-refusal · prompt-priming · 1bit-vision · sim-to-real
about/index.html              /about       bio, experience, capabilities, education
models/index.html             /models      HuggingFace open models
404.html                                   styled not-found page
assets/css/main.css                        shared styles
assets/js/main.js                          shared behavior (reveals, counters, WebGL hero)
assets/og.png                              Open Graph image (1200×630)
assets/resume.pdf                          downloadable resume
build.js                                   page generator — single source of truth for content
serve.js                                   local dev server with clean URLs + 404
```

## Editing content

**Do not edit the generated HTML directly** — edit `build.js` (all copy, findings, meta
descriptions live there) or the shared `assets/` files, then run:

```
node build.js
```

## Local preview

```
node serve.js     # http://localhost:8080  (clean URLs + 404 work like real hosting)
```

Opening `index.html` via `file://` mostly works, but directory links (`research/`) need the server.

## Deploying

Any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages). The `404.html` at root is
picked up automatically by GitHub Pages / Netlify. After deploying, set `SITE` at the top of
`build.js` to the production origin (e.g. `https://example.com`) and rebuild — this emits
absolute `og:image`/canonical URLs, which social platforms require.

## Regenerating assets

OG image and resume are rendered from `assets/og-src.html` / `assets/resume-src.html` via
headless Edge:

```
msedge --headless --disable-gpu --screenshot=assets/og.png --window-size=1200,630 assets/og-src.html
msedge --headless --disable-gpu --print-to-pdf=assets/resume.pdf --no-pdf-header-footer assets/resume-src.html
```

## Performance notes (keep these invariants)

- Only `transform` and `opacity` are animated; SVG figures use scale transforms + stroke-dashoffset.
- All scroll reveals are IntersectionObserver, fire once, then unobserve. The only scroll
  listener (progress bar) is rAF-throttled. Nav solid-state uses an IO sentinel, not scroll.
- No `backdrop-filter` anywhere; panels are semi-transparent solid fills.
- WebGL hero: home only, ≥768px only, lazy-loaded after `window.load`, ~1,000 particles,
  pixel ratio capped at 1.75, paused when off-screen or tab hidden.
- Preloader: first visit per session (`sessionStorage.mfpPre`), hard-capped at 1.5s.
- `prefers-reduced-motion`: all motion off, all content visible.
