/* ============================================================
   DUAL VULNERABILITY ASSESSMENT — interaction layer
   GSAP + ScrollTrigger + Lenis · data injection · cursor
   ============================================================ */
(function () {
  "use strict";

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
  function buildScan(target, items) {
    const ul = $(target);
    items.forEach((it) => {
      if (it.divider) {
        ul.appendChild(el("li", "div", `── ${it.divider} ──`));
        return;
      }
      const li = el("li", it.amber ? "amber" : "");
      li.appendChild(el("span", "src", `<b>[${it.kind}]</b> ${it.name}`));
      li.appendChild(el("span", "stat", it.amber ? "✓ resolved" : "✓ indexed"));
      ul.appendChild(li);
    });
  }

  function buildChain() {
    const ol = $("#chain");
    CHAIN.forEach((c) => {
      const li = el("li");
      li.appendChild(el("span", "chain__node"));
      li.appendChild(el("span", "chain__tag", c.tag));
      li.appendChild(el("p", "chain__text", c.text));
      ol.appendChild(li);
    });
    const li = el("li");
    li.appendChild(el("span", "chain__node"));
    li.appendChild(el("span", "chain__tag", "conclusion"));
    li.appendChild(el("p", "chain__text", "conclusion reached independently · drift from your launch narrative: 0"));
    ol.appendChild(li);
  }

  function buildEvidence() {
    const wrap = $("#evidence");
    EVIDENCE.forEach((e) => {
      const row = el("div", "ev");
      row.appendChild(el("span", "ev__src", e.src));
      row.appendChild(el("span", "ev__txt", e.text));
      wrap.appendChild(row);
    });
  }

  function buildTrace() {
    const wrap = $("#trace");
    TIMELINE.forEach((t) => {
      const row = el("div", "row");
      const top = el("div", "trace__top");
      top.appendChild(el("span", "trace__period mono", t.period));
      top.appendChild(el("span", "trace__role", t.role));
      row.appendChild(top);
      row.appendChild(el("span", "trace__detail", t.detail));
      wrap.appendChild(row);
    });
  }

  function buildArtifacts() {
    const wrap = $("#artifacts");
    ARTIFACTS.forEach((a) => {
      const row = el("div", "row");
      const top = el("div", "artifacts__top");
      top.appendChild(el("span", "artifacts__name", a.name));
      top.appendChild(el("span", "tag", a.tag));
      row.appendChild(top);
      row.appendChild(el("span", "artifacts__detail", a.detail));
      wrap.appendChild(row);
    });
  }

  function buildMatch() {
    const wrap = $("#match");
    MATCH.forEach((m) => {
      const row = el("div", "match__row");
      row.appendChild(el("span", "match__pi", `<b>PI:</b> ${m.pi}`));
      row.appendChild(el("span", "match__me", `<b>FIX:</b> ${m.me}`));
      wrap.appendChild(row);
    });
  }

  buildScan("#scanPi", PI_RECON);
  buildScan("#scanMe", ME_SOURCES);
  buildChain();
  buildEvidence();
  buildTrace();
  buildArtifacts();
  buildMatch();

  /* ---------------- BOOT SEQUENCE ---------------- */
  function runBoot(done) {
    const boot = $("#boot");
    const bar = $("#bootBar");
    const pct = $("#bootPct");
    const status = $("#bootStatus");
    const stages = ["initializing", "loading recon kernel", "resolving target", "ready"];
    if (reduced) {
      boot.classList.add("is-done");
      done();
      return;
    }
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(100, p + Math.random() * 16 + 6);
      bar.style.width = p + "%";
      pct.textContent = Math.round(p) + "%";
      status.textContent = stages[Math.min(stages.length - 1, Math.floor((p / 100) * stages.length))];
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          boot.classList.add("is-done");
          done();
        }, 260);
      }
    }, 130);
  }

  /* ---------------- HERO TITLE ---------------- */
  function animateHero() {
    if (reduced || typeof gsap === "undefined") {
      document.querySelectorAll(".hero__title .word").forEach((w) => (w.style.transform = "none"));
      document.querySelectorAll(".hero .reveal-up").forEach((n) => n.classList.add("is-revealed"));
      return;
    }
    gsap.set(".hero__title .word", { yPercent: 110 });
    gsap.to(".hero__title .word", {
      yPercent: 0, duration: 1.05, ease: "power4.out", stagger: 0.08, delay: 0.1,
    });
    document.querySelectorAll(".hero .reveal-up").forEach((n) => n.classList.add("is-revealed"));
    gsap.fromTo(".hero .reveal-up",
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, delay: 0.45 }
    );
  }

  /* ---------------- SCROLL / GSAP ---------------- */
  function initScroll() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      document.querySelectorAll(".reveal-up").forEach((n) => n.classList.add("is-revealed"));
      document.querySelectorAll(".scan li").forEach((n) => n.classList.add("is-in"));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    /* Lenis smooth scroll */
    let lenis = null;
    if (!reduced && typeof Lenis !== "undefined") {
      lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    /* progress rail */
    const railFill = $("#railFill");
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => { railFill.style.width = (self.progress * 100).toFixed(2) + "%"; },
    });

    /* generic reveals */
    gsap.utils.toArray(".reveal-up").forEach((node) => {
      if (node.closest(".hero")) return;
      ScrollTrigger.create({
        trigger: node, start: "top 86%", once: true,
        onEnter: () => {
          node.classList.add("is-revealed");
          gsap.fromTo(node, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
        },
      });
    });

    /* section heads — wipe in */
    gsap.utils.toArray(".section__head").forEach((head) => {
      gsap.from(head, {
        scrollTrigger: { trigger: head, start: "top 88%", once: true },
        y: 18, opacity: 0, duration: 0.7, ease: "power3.out",
      });
    });

    /* terminal scan lines — staggered, "live scan" */
    gsap.utils.toArray("[data-terminal]").forEach((term) => {
      const lines = term.querySelectorAll(".scan li");
      const sum = term.querySelector("[data-sum]");
      gsap.set(sum, { opacity: 0 });
      ScrollTrigger.create({
        trigger: term, start: "top 78%", once: true,
        onEnter: () => {
          lines.forEach((li, i) => {
            gsap.to(li, { opacity: li.classList.contains("div") ? 0.5 : 1, x: 0, duration: 0.4, delay: i * 0.12, ease: "power2.out", onStart: () => li.classList.add("is-in") });
          });
          gsap.to(sum, { opacity: 1, duration: 0.5, delay: lines.length * 0.12 + 0.2 });
        },
      });
    });

    /* chain nodes pop */
    gsap.utils.toArray("#chain li").forEach((li, i) => {
      gsap.from(li, {
        scrollTrigger: { trigger: li, start: "top 88%", once: true },
        x: -16, opacity: 0, duration: 0.6, ease: "power3.out", delay: (i % 2) * 0.05,
      });
    });

    /* evidence / trace / artifact / match rows */
    [".evidence .ev", ".trace .row", ".artifacts .row", ".match__row"].forEach((sel) => {
      gsap.utils.toArray(sel).forEach((row) => {
        gsap.from(row, {
          scrollTrigger: { trigger: row, start: "top 90%", once: true },
          y: 14, opacity: 0, duration: 0.55, ease: "power2.out",
        });
      });
    });

    /* finding name glitch */
    const fname = $(".glitch");
    if (fname) {
      ScrollTrigger.create({
        trigger: fname, start: "top 80%", once: true,
        onEnter: () => { fname.classList.add("go"); setTimeout(() => fname.classList.remove("go"), 600); },
      });
    }

    /* diff lines cascade */
    gsap.from(".diff__line", {
      scrollTrigger: { trigger: ".diff", start: "top 82%", once: true },
      x: -10, opacity: 0, duration: 0.4, ease: "power2.out", stagger: 0.09,
    });

    /* subtle parallax on cards */
    gsap.utils.toArray(".finding, .asset, .cta").forEach((card) => {
      gsap.fromTo(card, { y: 30 }, {
        y: -30, ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1 },
      });
    });
  }

  /* ---------------- CURSOR + MAGNETIC ---------------- */
  function initCursor() {
    if (reduced || window.matchMedia("(hover:none)").matches || typeof gsap === "undefined") return;
    const cursor = $("#cursor");
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3" });
    window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });

    document.querySelectorAll("a, [data-magnetic]").forEach((node) => {
      node.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      node.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });

    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: mx * 0.3, y: my * 0.4, duration: 0.4, ease: "power3" });
      });
      btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" }));
    });
  }

  /* ---------------- INIT ---------------- */
  window.addEventListener("DOMContentLoaded", () => {
    initCursor();
    runBoot(() => {
      animateHero();
      initScroll();
    });
  });
})();
