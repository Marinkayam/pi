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
    { name: "pi.security — one line, one pun", kind: "web" },
    { name: "press: geektime · calcalist · ynet · newswire", kind: "press" },
    { name: "linkedin.com/in/yoniramon — launch post", kind: "social" },
    { name: "W. Isaacson, “Elon Musk” — Y.R., Twitter takeover", kind: "book" },
    { divider: "pass 2 · network" },
    { name: "Brightmind Partners — fund DNA, portfolio graph", kind: "vc" },
    { name: "S. Ward — feed history, 30 days back", kind: "vc" },
    { name: "Third Point · Kurtz · Armis founders — backer map", kind: "vc" },
    { name: "same-day round detected: Aryon (also Brightmind)", kind: "vc" },
    { divider: "pass 3 · thesis" },
    { name: "Anthropic — Project Glasswing, first update", kind: "ai" },
    { name: "Claude-Mythos references across launch coverage", kind: "ai" },
    { name: "3 namesakes found (cameras, guards, robots) — disambiguated", kind: "meta", amber: true },
  ];

  const ME_SOURCES = [
    { name: "marinka.me", kind: "web" },
    { name: "npm — @monto/ui-v2", kind: "npm" },
    { name: "monto.io — two production platforms", kind: "work" },
    { name: "linkedin.com — AI-design writing", kind: "social" },
    { name: "College of Management — GenAI course", kind: "edu" },
    { name: "shipped side projects", kind: "lab" },
  ];

  const CHAIN = [
    { tag: "glasswing", text: "Anthropic’s Glasswing: 10,000+ critical vulnerabilities found in one month. 530 disclosed. The internet patched 75." },
    { tag: "your lead investor", text: "Ward, 30 days before wiring you $35M: no one can hire their way out of that backlog. Verify, disclose, patch — three bottlenecks, not one." },
    { tag: "deduction", text: "Offense now scales at machine speed. The only defense left is remediation velocity. Pi exists to collapse bottleneck #3." },
    { tag: "convergence", text: "Pi runs on Claude-Mythos. I build with the same models daily — design governance encoded as agent context. Same stack. Different surface. Same thesis." },
  ];

  const EVIDENCE = [
    { src: "headcount", text: "23 employees, Tel Aviv + San Francisco. Designers: 0." },
    { src: "founding principle", text: "Learn once. Never pay for the same lesson twice." },
    { src: "product", text: "Context is the moat — yet the surface where humans trust an autonomous fix has no owner." },
    { src: "customers", text: "A leading AI lab and cybersecurity firms. Maximum design literacy, minimum patience." },
  ];

  const TIMELINE = [
    { period: "now", role: "Principal Product Designer — Monto, B2B fintech", detail: "Sole designer. Two production platforms. Owns the design system end to end." },
    { period: "ongoing", role: "Lecturer, Generative AI — College of Management", detail: "~200 students/year." },
    { period: "origin", role: "Global Art Direction — Moog.it", detail: "Lancôme, Guinness, Stella Artois." },
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
    { pi: "Autonomous fixes need human trust", me: "Years designing trust surfaces in fintech — approvals, exceptions, money on the line" },
    { pi: "Ship at machine speed", me: "Figma to production component with Claude Code. No handoff tax" },
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* ---------------- BUILD DOM ---------------- */
  function buildLog(target, items) {
    const ul = $(target);
    items.forEach((it) => {
      if (it.divider) { ul.appendChild(el("li", "div", `── ${it.divider}`)); return; }
      const li = el("li", it.amber ? "amber" : "");
      li.appendChild(el("span", "src", `<b>[${it.kind}]</b> ${it.name}`));
      li.appendChild(el("span", "stat", it.amber ? "✓ resolved" : "✓ indexed"));
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

  function buildMatch() {
    const wrap = $("#match");
    MATCH.forEach((m) => {
      const pair = el("div", "pair");
      pair.appendChild(el("p", "pi", `<b>PI</b> · ${m.pi}`));
      const fix = el("p", "fix", `<b>FIX</b>${m.me}`);
      fix.setAttribute("data-write", "");
      pair.appendChild(fix);
      wrap.appendChild(pair);
    });
  }

  buildLog("#scanPi", PI_RECON);
  buildLog("#scanMe", ME_SOURCES);
  buildChain();
  buildRows("#evidence", EVIDENCE, "rows--crit", { key: (e) => e.src, val: (e) => e.text });
  buildRows("#trace", TIMELINE, "rows--ok", { key: (t) => t.period, val: (t) => `${t.role}<small>${t.detail}</small>` });
  buildRows("#artifacts", ARTIFACTS, "rows--ok", { key: (a) => a.tag, val: (a) => `${a.name}<small>${a.detail}</small>` });
  buildMatch();

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

    if (reduced || !haveGsap) {
      // static, fully legible
      document.querySelectorAll(".t-line").forEach((l) => l.classList.add("live"));
      document.querySelectorAll("[data-write]").forEach((n) => (n.style.color = "var(--ink)"));
      document.querySelectorAll(".log li, #chain .chain-item, .rows .row, #match .pair, .plain li").forEach((n) => (n.style.opacity = 1));
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
        color: "#0E1411",
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
      { sel: "#match", child: ".pair" },
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

    /* tags / kickers / summaries — snappy reveal */
    gsap.utils.toArray(".tag, .kicker, .summary, .cmd, .note, .role, .cta-kicker, .diff, .actions, .footnote").forEach((node) => {
      gsap.from(node, {
        opacity: 0, y: 12, duration: 0.55, ease: "power2.out",
        scrollTrigger: { trigger: node, start: "top 92%", once: true },
      });
    });
  }

  /* ---------------- HERO INTRO — title decrypts (after boot) ---------------- */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&<>/\\";

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

    /* hero drifts away as you scroll into the report */
    gsap.to(".hero__inner", {
      yPercent: -14, opacity: 0.25, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 35%", scrub: 0.4 },
    });
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

    const lines = [
      "establishing secure channel",
      "pi-recon v4 · three-pass",
      "fingerprinting target: pi.security",
      "isolating signal from noise",
      "cross-referencing 12 sources",
    ];
    lines.forEach((l) => {
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
        lis[i].querySelector(".ok").textContent = "ok";
        i += 1;
      }
      const p = Math.round((i / total) * 100);
      bar.style.width = p + "%";
      pct.textContent = (p < 10 ? "0" : "") + p + "%";
      if (i >= total) {
        clearInterval(iv);
        bar.style.width = "100%";
        pct.textContent = "100%";
        boot.classList.add("locked");
        status.textContent = "TARGET LOCKED";
        setTimeout(finish, 460);
      }
    }, 165);
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
    runBoot(playHero);
  });
})();
