# PI-2026-0314 — Dual Vulnerability Assessment

An awwwards-style landing page that reframes a designer's portfolio as a live
security assessment. One critical finding — `DesignFunctionNotFound` — and one
available fix: a principal product designer who reads the backend spec, encodes
patterns as code, and ships at machine speed.

## Stack

- **three.js** (ES module via importmap) — a noise-displaced point-cloud "scan
  target" with a sweeping scan band, orbital rings, a drifting particle field,
  and mouse parallax. Custom GLSL (simplex noise) for the displacement.
- **GSAP + ScrollTrigger** — title reveal, scroll-driven section/terminal
  reveals, parallax, glitch, progress rail.
- **Lenis** — smooth scroll, synced to ScrollTrigger.
- No build step. All libraries load from CDN.

## Run

```bash
npm start          # serves at http://localhost:5173
# or just open index.html directly in a browser
```

## Design notes

- Cinematic dark palette, editorial type (Space Grotesk + IBM Plex Mono).
- Fully responsive (mobile-first); `viewport-fit=cover` + `100svh` for mobile
  browser chrome.
- Honors `prefers-reduced-motion`: WebGL renders a static frame, all reveals and
  the boot sequence resolve instantly, decorative grain/scanlines are disabled.
- Graceful degradation: if GSAP/Lenis fail to load, all content reveals
  immediately and remains fully readable.

## Structure

```
index.html              markup + all copy
assets/css/style.css    design system, layout, responsive, reduced-motion
assets/js/scene.js      three.js hero (ES module)
assets/js/main.js       data injection, boot, GSAP/Lenis, cursor, magnetic CTAs
```
