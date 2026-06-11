# PI-2026-0314 — Dual Vulnerability Assessment

An awwwards-style landing page that reframes a designer's portfolio as a live
security assessment. One critical finding — `DesignFunctionNotFound` — and one
available fix: a principal product designer who reads the backend spec, encodes
patterns as code, and ships at machine speed.

## Stack

- **Kinetic typography** — an editorial, box-free layout where body copy is
  large type that *writes itself onscreen as you scroll*: words fill from a ghost
  tone to full ink, and scan-log/evidence lines brighten in sequence, scrubbed to
  scroll position.
- **three.js** (ES module via importmap) — a lightweight noise-displaced
  point-cloud "scan target" with a sweeping scan band, orbital rings, a drifting
  particle field, and mouse parallax. Custom GLSL (simplex noise) for displacement.
- **GSAP + ScrollTrigger** — hero title reveal, scroll-write scrubs, progress rail.
- **Lenis** — snappy smooth scroll (low lerp), synced to ScrollTrigger.
- No preloader, no build step. All libraries load from CDN.

## Run

```bash
npm start          # serves at http://localhost:5173
# or just open index.html directly in a browser
```

## Design notes

- Dark editorial palette, type-forward (Space Grotesk + IBM Plex Mono), hairline
  dividers instead of cards.
- Fully responsive (mobile-first); `viewport-fit=cover` + `100svh` for mobile
  browser chrome.
- Honors `prefers-reduced-motion`: WebGL renders a static frame, all text is fully
  written (no ghost state), grain disabled.
- Graceful degradation: if GSAP/Lenis fail to load, all copy is fully legible.

## Structure

```
index.html              markup + all copy
assets/css/style.css    design system, layout, responsive, reduced-motion
assets/js/scene.js      three.js hero (ES module)
assets/js/main.js       data injection, scroll-write, GSAP/Lenis, cursor, CTAs
```
