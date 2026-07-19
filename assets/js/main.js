/* ============================================================
   DUAL VULNERABILITY ASSESSMENT — interaction layer
   Kinetic type · text writes on scroll · GSAP + ScrollTrigger + Lenis
   ============================================================ */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- DATA ---------------- */
  /* §01 — mirrors "Security is dragging behind development" + 3 cards */
  const PROBLEM = [
    { t: "CV overload", b: "Hundreds of applicants, identical portfolios, everyone ‘passionate about UX.’ Hard to identify what actually matters." },
    { t: "Pretty screens, no systems", b: "Polished Dribbble shots don’t survive contact with an agentic security platform. You need someone who designs the system, not the screen." },
    { t: "Design stops at handoff", b: "Most designers ship a Figma link and move on. What you build needs design that ships as code and keeps working." },
  ];

  /* §02 — mirrors their 4-step Ingest / Detect / Remediate / Enforce */
  const STEPS = [
    { n: "01", t: "Ingest everything", b: "I read the backend spec, the codebase, and the support tickets before opening a design tool. Design starts from how the system actually works." },
    { n: "02", t: "Detect root causes", b: "I fix the pattern, not the screen. One decision, applied across every surface." },
    { n: "03", t: "Remediate in context", b: "Design delivered as working code, straight into developer workflows. Proof: the page you're reading." },
    { n: "04", t: "Enforce what was learned", b: "Design system as code plus agent context. Violations get prevented, not reviewed." },
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* line icons (stroke = currentColor) — drawn in on reveal, idle motion after */
  const I = (p, motion) => `<svg class="${motion || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICONS = {
    users: I('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 6a3 3 0 0 1 0 5.6"/><path d="M19 20c0-2.4-1-3.8-2.5-4.6"/>', "i-pulse"),
    book: I('<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 17h13"/><path d="M9 8h6M9 11.5h4"/>', "i-pulse"),
    layers: I('<path d="M12 3 21 8l-9 5-9-5z"/><path d="M3 12.5l9 5 9-5"/><path d="M3 17l9 5 9-5"/>', "i-float"),
    shield: I('<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>', "i-pulse"),
    package: I('<path d="M12 3 21 8v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/><path d="M7.5 5.5l9 5"/>', "i-float"),
    wrench: I('<path d="M15 7a4 4 0 0 1-5.2 5.2L5 17l2 2 4.8-4.8A4 4 0 0 0 17 9z"/><circle cx="6" cy="18" r="1" />', "i-swing"),
    cpu: I('<rect x="7" y="7" width="10" height="10" rx="2.5"/><rect x="10.5" y="10.5" width="3" height="3" rx="1"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/>', "i-pulse"),
    rocket: I('<path d="M5 15c-1.4 2.2-1.4 4.4-1.4 4.4s2.2 0 4.4-1.4"/><path d="M9 15l-3-3c1-6 5-9 12-9 0 7-3 11-9 12z"/><circle cx="14" cy="10" r="1.7"/><path d="M15.5 3.5c2 .8 4.2 3 5 5"/>', "i-launch"),
    /* CV overload — a pile of résumés stacking up */
    docstack: I('<path d="M4.5 8.5v8A2 2 0 0 0 6.5 18.5H13"/><path d="M9 4.5h4.5l3 3v8.5A1.6 1.6 0 0 1 14.9 17.6H8.6A1.6 1.6 0 0 1 7 16V6.1A1.6 1.6 0 0 1 8.6 4.5Z"/><path d="M13.5 4.5v3.2h3"/><path d="M9.6 11h4.2M9.6 13.6h4.2M9.6 8.6h2.2"/>', "i-float"),
    /* Pretty screens, no systems — a polished picture/shot in a frame */
    gallery: I('<rect x="3.5" y="5" width="17" height="14" rx="2.6"/><circle cx="8.8" cy="10" r="1.5"/><path d="M4.4 16.6l4.4-4 3 2.6 3.4-3.4 4.4 4.4"/>', "i-float"),
    /* Design stops at handoff — an arrow leaving the file, trailing off to nothing */
    handoff: I('<rect x="3.5" y="6" width="8.5" height="12" rx="2"/><path d="M6.8 10.4h2.4M6.8 13.4h3.4"/><path d="M12.5 12H18"/><path d="M15.4 9l3 3-3 3"/><path d="M20.4 12h1.1"/>', "i-swing"),
  };

  /* ---------------- BUILD DOM ---------------- */
  function buildCards(target, items, opts) {
    const wrap = $(target);
    items.forEach((it, i) => {
      const card = el("article", "card" + (opts.crit ? " card--crit" : ""));
      card.appendChild(el("div", "card__icon", ICONS[opts.icons[i % opts.icons.length]]));
      if (opts.label) card.appendChild(el("p", "card__label", opts.label(it)));
      card.appendChild(el("h3", "card__title", opts.title(it)));
      card.appendChild(el("p", "card__body", opts.body(it)));
      wrap.appendChild(card);
    });
  }


  /* uniform pathLength so CSS can draw every shape with one rule */
  document.querySelectorAll(".card__icon svg *").forEach((n) => n.setAttribute("pathLength", "100"));

  /* ---------------- SCROLL-WRITE HELPERS ---------------- */
  function splitWords(node) {
    const text = node.textContent;
    node.textContent = "";
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((tok) => {
      if (tok === "") return;
      if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = tok;
      frag.appendChild(s);
    });
    node.appendChild(frag);
    return node.querySelectorAll(".w");
  }

  /* ---------------- INIT ---------------- */
  function init() {
    const haveGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

    /* reduced motion: no autoplaying video — show poster with controls */
    if (reduced) {
      document.querySelectorAll(".vid__player").forEach((v) => {
        v.removeAttribute("autoplay");
        v.controls = true;
        v.pause && v.pause();
      });
    }

    if (reduced || !haveGsap) {
      // static, fully legible
      document.querySelectorAll(".t-line").forEach((l) => l.classList.add("live"));
      document.querySelectorAll("[data-write]").forEach((n) => (n.style.color = "var(--ink)"));
      document.querySelectorAll(".log li, #chain .chain-item, .rows .row, .plain li").forEach((n) => (n.style.opacity = 1));
      document.querySelectorAll(".card").forEach((n) => { n.style.opacity = 1; n.style.transform = "none"; });
      document.querySelectorAll(".cards").forEach((g) => g.classList.add("is-in"));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* Lenis — snappy, not floaty */
    if (typeof Lenis !== "undefined") {
      const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    /* progress rail */
    const railFill = $("#railFill");
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => { railFill.style.width = (self.progress * 100).toFixed(2) + "%"; } });

    /* TEXT WRITES ON SCROLL — words fill ghost→ink, tied to scroll */
    gsap.utils.toArray("[data-write]").forEach((node) => {
      const words = splitWords(node);
      gsap.to(words, {
        color: "#16203A",
        ease: "none",
        stagger: 0.5,
        scrollTrigger: { trigger: node, start: "top 88%", end: "top 45%", scrub: 0.3 },
      });
    });

    /* log lines + rows + pairs — dim→bright, sequential with scroll */
    const groups = [
      { sel: ".log", child: "li" },
      { sel: "#chain", child: ".chain-item" },
      { sel: ".rows", child: ".row" },
    ];
    groups.forEach(({ sel, child }) => {
      gsap.utils.toArray(sel).forEach((container) => {
        const kids = container.querySelectorAll(child);
        if (!kids.length) return;
        gsap.to(kids, {
          opacity: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: { trigger: container, start: "top 90%", end: "top 50%", scrub: 0.3 },
        });
      });
    });

    /* plain behaviors list — quick fade as it enters */
    gsap.utils.toArray(".plain li").forEach((li) => {
      gsap.fromTo(li, { opacity: 0.18, x: -8 }, {
        opacity: 1, x: 0, duration: 0.5, ease: "power2.out",
        scrollTrigger: { trigger: li, start: "top 88%", once: true },
      });
    });

    /* cards — staggered rise per row; icons draw in once visible */
    gsap.utils.toArray(".cards").forEach((grid) => {
      gsap.to(grid.querySelectorAll(".card"), {
        opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.1,
        scrollTrigger: { trigger: grid, start: "top 85%", once: true, onEnter: () => grid.classList.add("is-in") },
      });
    });

    /* section headers / kickers / summaries — snappy reveal */
    gsap.utils.toArray(".sec-head, .kicker, .summary, .cmd, .note, .diff, .actions, .footnote, .vid").forEach((node) => {
      gsap.from(node, {
        opacity: 0, y: 12, duration: 0.55, ease: "power2.out",
        scrollTrigger: { trigger: node, start: "top 92%", once: true },
      });
    });
  }

  /* ---------------- HERO INTRO — title decrypts (after boot) ---------------- */
  const GLYPHS = "abcdefghijklmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ0123456789#$%&";

  function decodeLine(line, delay) {
    const text = line.textContent;
    line.textContent = "";
    const chars = [];
    for (const c of text) {
      const s = document.createElement("span");
      s.className = c === "." ? "ch dot" : "ch scrambling";
      s.textContent = c;
      line.appendChild(s);
      chars.push({ el: s, target: c });
    }
    setTimeout(() => {
      line.classList.add("live");
      const start = performance.now();
      const iv = setInterval(() => {
        const t = performance.now() - start;
        let pending = 0;
        chars.forEach((c, i) => {
          if (c.target === ".") { c.el.textContent = c.target; c.el.classList.remove("scrambling"); return; }
          if (t > 240 + i * 52) {
            c.el.textContent = c.target;
            c.el.classList.remove("scrambling");
          } else {
            c.el.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
            pending += 1;
          }
        });
        if (!pending) clearInterval(iv);
      }, 38);
    }, delay);
  }

  function playHero() {
    if (typeof gsap === "undefined" || reduced) {
      document.querySelectorAll(".t-line").forEach((l) => l.classList.add("live"));
      return;
    }
    const lines = document.querySelectorAll(".t-line");
    lines.forEach((line, i) => decodeLine(line, 60 + i * 160));
    gsap.from(".hero__kicker, .hero__sub, .hero__cta, .ticker", { opacity: 0, y: 12, duration: 0.7, ease: "power3.out", stagger: 0.09, delay: 0.4 });
    gsap.from(".hero__art", { opacity: 0, duration: 1.1, ease: "power2.out", delay: 0.55 });

    /* hero drifts away as you scroll into the report */
    gsap.to(".hero__inner", {
      yPercent: -14, opacity: 0.25, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 35%", scrub: 0.4 },
    });
  }

  /* ---------------- PAINTED HERO ART (swaps in when the asset exists) ---------------- */
  function initHeroArt() {
    const svg = document.querySelector("svg.hero__art");
    if (!svg) return;
    const img = new Image();
    img.onload = () => {
      img.className = "hero__art hero__art--painted";
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      svg.replaceWith(img);
    };
    img.src = "assets/img/hero-art.webp"; // 404 → keep SVG fallback
  }

  /* ---------------- CROSSHAIR TRACKER ---------------- */
  function initXhair() {
    const hero = $("#hero");
    const xhair = $("#xhair");
    if (!hero || !xhair || reduced || window.matchMedia("(hover:none)").matches) return;
    const v = xhair.querySelector(".xh-v");
    const h = xhair.querySelector(".xh-h");
    const coords = $("#xhCoords");
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      v.style.left = x + "px";
      h.style.top = y + "px";
      coords.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
      coords.textContent = `x.${String(Math.round(x)).padStart(4, "0")} · y.${String(Math.round(y)).padStart(4, "0")} · tracking`;
    });
  }

  /* ---------------- SECURITY-SCAN BOOT ---------------- */
  function runBoot(done) {
    const boot = $("#boot");
    const bar = $("#bootBar");
    const pct = $("#bootPct");
    const status = $("#bootStatus");
    const linesEl = $("#bootLines");
    const finish = () => { boot.classList.add("is-done"); if (done) done(); };

    // reduced / no-gsap: init() already revealed the hero — just clear the loader
    if (reduced || typeof gsap === "undefined") { boot.classList.add("is-done"); return; }

    const hex = () => "0x" + ((Math.random() * 0xffffff) | 0).toString(16).padStart(6, "0").toUpperCase();
    const lines = [
      ["init pi-recon kernel v4.2.1", "ok"],
      ["loading exploit signatures … 48,213", "ok"],
      ["handshake TLS1.3 · ECDHE-P521", hex()],
      ["port sweep 0–65535 · open: 80, 443, 0314", "ok"],
      ["fingerprint pi.security → match", hex()],
      ["loading candidate profile: marina", "ok"],
      ["context graph · 12 sources indexed", "ok"],
    ];
    const phases = ["SCANNING", "DECRYPTING", "TRACING"];
    lines.forEach(([l]) => {
      const li = el("li");
      li.appendChild(el("span", null, l));
      li.appendChild(el("span", "ok"));
      linesEl.appendChild(li);
    });
    const lis = linesEl.querySelectorAll("li");

    let i = 0;
    const total = lines.length;
    const iv = setInterval(() => {
      if (i < total) {
        lis[i].classList.add("in");
        lis[i].querySelector(".ok").textContent = lines[i][1];
        i += 1;
      }
      const p = Math.round((i / total) * 100);
      bar.style.width = p + "%";
      pct.textContent = (p < 10 ? "0" : "") + p + "%";
      status.textContent = phases[Math.min(phases.length - 1, Math.floor((i / total) * phases.length))];
      if (i >= total) {
        clearInterval(iv);
        bar.style.width = "100%";
        pct.textContent = "100%";
        boot.classList.add("locked");
        status.textContent = "ACCESS GRANTED";
        setTimeout(finish, 420);
      }
    }, 115);
  }

  /* ---------------- CURSOR + MAGNETIC ---------------- */
  function initCursor() {
    if (reduced || window.matchMedia("(hover:none)").matches || typeof gsap === "undefined") return;
    const cursor = $("#cursor");
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.22, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.22, ease: "power3" });
    window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });
    document.querySelectorAll("a, [data-magnetic]").forEach((node) => {
      node.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      node.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4, ease: "power3" });
      });
      btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" }));
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    init();
    initCursor();
    initXhair();
    initHeroArt();
    runBoot(playHero);
  });
})();
