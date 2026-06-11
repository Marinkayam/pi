/* ============================================================
   DUAL VULNERABILITY ASSESSMENT — interaction layer
   Kinetic type · text writes on scroll · GSAP + ScrollTrigger + Lenis
   ============================================================ */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- DATA ---------------- */
  const PI_RECON = [
    { divider: "pass 1 · surface" },
    { name: "pi.security · one line, one pun", kind: "web",
      intel: "entire public surface: one sentence and a pie pun. Operational discipline noted.",
      url: "https://pi.security" },
    { name: "press: geektime · calcalist · ynet · newswire", kind: "press",
      intel: "$35M seed+A · 23 employees · TLV + SF. Asked why not $31.4M: “we try not to make irrational decisions.”",
      url: "https://www.geektime.co.il/pi-security-funding/" },
    { name: "linkedin.com/in/yoniramon · launch post", kind: "social",
      intel: "founding principle extracted: learn once, never pay for the same lesson twice.",
      url: "https://www.linkedin.com/in/yoniramon" },
    { name: "W. Isaacson, “Elon Musk” · Y.R., Twitter takeover", kind: "book",
      intel: "10+ years securing Tesla; appears in the biography securing Twitter during the takeover." },
    { divider: "pass 2 · network" },
    { name: "Brightmind Partners · fund DNA, portfolio graph", kind: "vc",
      intel: "operator-led fund; partners ex-Armis, Tanium, Exabeam. Deep technical diligence is the brand." },
    { name: "S. Ward · feed history, 30 days back", kind: "vc",
      intel: "30 days pre-wire, quoting Glasswing: verify, disclose, patch: three bottlenecks, not one." },
    { name: "Third Point · Kurtz · Armis founders · backer map", kind: "vc",
      intel: "CrowdStrike’s CEO and Armis’ founders backing remediation. Insiders betting against their own dashboards." },
    { name: "same-day round detected: Aryon (also Brightmind)", kind: "vc",
      intel: "two security rounds, one fund, one day (June 10). Brightmind is consolidating the category." },
    { divider: "pass 3 · thesis" },
    { name: "Anthropic · Project Glasswing, first update", kind: "ai",
      intel: "10,000+ critical vulnerabilities in month one. 530 disclosed. 75 patched. The bottleneck moved.",
      url: "https://www.anthropic.com/research/glasswing-initial-update" },
    { name: "Claude-Mythos references across launch coverage", kind: "ai",
      intel: "Pi builds on Mythos-class models. So does this candidate, daily, with authored agent skills.",
      url: "https://www.anthropic.com/news/expanding-project-glasswing" },
    { name: "3 namesakes found (cameras, guards, robots) · disambiguated", kind: "meta", amber: true,
      intel: "noise removed: a CCTV vendor, a guard service, a robotics firm. Locked on the right Pi." },
  ];

  const ME_SOURCES = [
    { name: "marinka.me", kind: "web",
      intel: "shipped AI products recovered: Claude Vision PWA, API content studio, ops-automation builder. Designed, coded, deployed solo. fix vector: zero handoff tax between design and production.",
      url: "https://marinka.me" },
    { name: "npm · @monto/ui-v2", kind: "npm",
      intel: "design system built from zero, published as code: 200+ React components live in production. fix vector: the pattern is designed once, encoded once. The violation can’t recur.",
      url: "https://www.npmjs.com/package/@monto/ui-v2" },
    { name: "monto.io · two production platforms", kind: "work",
      intel: "sole designer on B2B fintech platforms moving real money: approvals, exceptions, trust surfaces. ~860 violations fixed at the system level. fix vector: remediation at the root, not the symptom. Pi’s founding principle, applied to design.",
      url: "https://monto.io" },
    { name: "linkedin.com · AI-design writing", kind: "social",
      intel: "public record of design governance encoded as agent context: AI ships on-system UI, unsupervised. fix vector: the exact discipline an autonomous platform needs to earn human trust." },
    { name: "College of Management · GenAI course", kind: "edu",
      intel: "teaches Generative AI to ~200 students/year. fix vector: translating machine reasoning for humans is the day job. That is the unowned surface at Pi." },
    { name: "shipped side projects", kind: "lab",
      intel: "builds the tool instead of writing the ticket; leads a competitive acrobatics team. Risk appetite calibrated. fix vector: ships at machine speed on Pi’s own stack, Claude-Mythos, daily." },
  ];

  const CHAIN = [
    { tag: "glasswing", text: "Anthropic’s Glasswing: 10,000+ critical vulnerabilities found in one month. 530 disclosed. The internet patched 75." },
    { tag: "your lead investor", text: "Ward, 30 days before wiring $35M: verify, disclose, patch. Three bottlenecks, not one." },
    { tag: "deduction", text: "Offense now scales at machine speed. The only defense left is remediation velocity. Pi exists to collapse bottleneck #3." },
    { tag: "convergence", text: "Pi runs on Claude-Mythos. The candidate builds with the same models daily. Design governance as agent context. Same stack. Different surface." },
  ];

  const EVIDENCE = [
    { src: "headcount", text: "23 employees, Tel Aviv + San Francisco. Designers: 0." },
    { src: "founding principle", text: "Learn once. Never pay for the same lesson twice." },
    { src: "product", text: "Context is the moat, yet the surface where humans trust an autonomous fix has no owner." },
    { src: "customers", text: "A leading AI lab and cybersecurity firms. Maximum design literacy, minimum patience." },
  ];

  const TIMELINE = [
    { period: "now", role: "Principal Product Designer · Monto, B2B fintech", detail: "Sole designer. Two production platforms. Owns the design system end to end." },
    { period: "ongoing", role: "Lecturer, Generative AI · College of Management", detail: "~200 students/year." },
    { period: "origin", role: "Global Art Direction · Moog.it", detail: "Lancôme, Guinness, Stella Artois." },
  ];

  const ARTIFACTS = [
    { name: "@monto/ui-v2", tag: "design system", detail: "Built from zero. Published npm package. 200+ React components in production." },
    { name: "platform remediation", tag: "root cause", detail: "~860 violations found, fixed at the system level. Recurrence: prevented." },
    { name: "Claude Skills suite", tag: "ai infra", detail: "Design governance encoded as agent context. AI ships on-system UI, unsupervised." },
    { name: "shipped AI products", tag: "end to end", detail: "Claude Vision PWA, Claude API content studio, ops-automation builder. Designed, coded, deployed. Solo." },
  ];

  const MATCH = [
    { pi: "Context separates signal from noise", me: "Three recon passes before the first pixel of this page" },
    { pi: "Learn once, never pay twice", me: "Fix the pattern, publish the package, make the violation impossible" },
    { pi: "Autonomous fixes need human trust", me: "Years designing trust surfaces in fintech: approvals, exceptions, money on the line" },
    { pi: "Ship at machine speed", me: "Figma to production component with Claude Code. No handoff tax" },
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
  };

  /* ---------------- BUILD DOM ---------------- */
  function buildLog(target, items) {
    const ul = $(target);
    items.forEach((it) => {
      if (it.divider) { ul.appendChild(el("li", "div", `── ${it.divider}`)); return; }
      const li = el("li", it.amber ? "amber" : "");
      const expandable = it.intel !== undefined;

      const row = el("div", "log__row");
      row.appendChild(el("span", "src", `<b>[${it.kind}]</b> ${it.name}`));
      const right = el("span", "log__right");
      right.appendChild(el("span", "stat", it.amber ? "✓ resolved" : "✓ indexed"));
      if (expandable) right.appendChild(el("span", "log__tog", "+"));
      row.appendChild(right);
      li.appendChild(row);

      if (expandable) {
        li.classList.add("expandable");
        li.setAttribute("role", "button");
        li.setAttribute("tabindex", "0");
        li.setAttribute("aria-expanded", "false");

        const intel = el("div", "log__intel");
        const inner = el("div", "log__intel-in");
        inner.appendChild(document.createTextNode(`⤷ ${it.intel || "—"}`));
        if (it.url) {
          inner.appendChild(document.createTextNode(" "));
          const a = el("a", "log__source", "[source ↗]");
          a.href = it.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.addEventListener("click", (e) => e.stopPropagation());
          inner.appendChild(a);
        }
        intel.appendChild(inner);
        li.appendChild(intel);

        const toggle = () => {
          const open = li.classList.toggle("is-open");
          li.setAttribute("aria-expanded", open ? "true" : "false");
        };
        li.addEventListener("click", toggle);
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
        });
      }
      ul.appendChild(li);
    });
  }

  function buildChain() {
    const wrap = $("#chain");
    CHAIN.forEach((c, i) => {
      const item = el("div", "chain-item" + (i === CHAIN.length - 1 ? " is-end" : ""));
      item.appendChild(el("span", "chain-tag", c.tag));
      const p = el("p", "statement", c.text);
      p.setAttribute("data-write", "");
      item.appendChild(p);
      wrap.appendChild(item);
    });
  }

  function buildRows(target, items, cls, map) {
    const dl = $(target);
    dl.classList.add(cls);
    items.forEach((it) => {
      const row = el("div", "row");
      row.appendChild(el("dt", "row__key", map.key(it)));
      row.appendChild(el("dd", "row__val", map.val(it)));
      dl.appendChild(row);
    });
  }

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

  function buildMatch() {
    const wrap = $("#match");
    MATCH.forEach((m) => {
      const card = el("article", "card card--match");
      card.appendChild(el("p", "card__pi", `PI · ${m.pi}`));
      card.appendChild(el("p", "card__fix", m.me));
      wrap.appendChild(card);
    });
  }

  buildLog("#scanPi", PI_RECON);
  buildLog("#scanMe", ME_SOURCES);
  buildChain();
  buildCards("#evidence", EVIDENCE, { crit: true, icons: ["users", "book", "layers", "shield"], title: (e) => e.src, body: (e) => e.text });
  buildRows("#trace", TIMELINE, "rows--ok", { key: (t) => t.period, val: (t) => `${t.role}<small>${t.detail}</small>` });
  buildCards("#artifacts", ARTIFACTS, { icons: ["package", "wrench", "cpu", "rocket"], label: (a) => a.tag, title: (a) => a.name, body: (a) => a.detail });
  buildMatch();

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
    gsap.from(".hero__meta, .hero__sub, .hero__cue, .ticker", { opacity: 0, y: 12, duration: 0.7, ease: "power3.out", stagger: 0.09, delay: 0.4 });
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
      ["deploying counter-scan: marina", "ok"],
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
        setTimeout(finish, 950);
      }
    }, 195);
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
