/* PI-2026-0314 · AMA console widget
 * Self-contained: injects its own styles, mounts into #ama-root.
 * Embed:  <div id="ama-root"></div><script src="/ama-widget.js" defer></script>
 * Design tokens mirror the site: paper/ink, IBM Plex Mono. Override the
 * CSS custom properties below to map onto your existing variables.
 */
(function () {
  'use strict';

  const CHIPS = [
    'Why her as the first design hire?',
    'What has she shipped solo?',
    "What's her biggest weakness?",
    "Ask something the CV won't tell you",
  ];
  const QUERY_LIMIT = 10;
  const API = '/api/ama';

  // ---- session -------------------------------------------------------------
  const sessionId =
    sessionStorage.getItem('pi-ama-session') ||
    (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
  sessionStorage.setItem('pi-ama-session', sessionId);

  const history = []; // { role, content }
  let sent = Number(sessionStorage.getItem('pi-ama-sent') || 0);
  let busy = false;

  const track = (name, data) => {
    try {
      window.va && window.va('event', Object.assign({ name }, data ? { data } : {}));
    } catch (_) {}
  };

  // ---- styles --------------------------------------------------------------
  const css = `
  #ama-root{--ama-paper:#FBFDFD;--ama-ink:#101418;--ama-ink-soft:#5A646E;
    --ama-line:#D9DDE0;--ama-mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
    font-family:var(--ama-mono);color:var(--ama-ink);}
  .ama-console{border:1px solid var(--ama-line);background:var(--ama-paper);
    max-width:760px;margin:0 auto;display:flex;flex-direction:column;}
  .ama-head{display:flex;justify-content:space-between;align-items:center;gap:12px;
    border-bottom:1px solid var(--ama-line);padding:10px 16px;font-size:11px;
    letter-spacing:.12em;color:var(--ama-ink-soft);flex-wrap:wrap;}
  .ama-head b{color:var(--ama-ink);font-weight:600;}
  .ama-live{display:inline-block;width:7px;height:7px;border-radius:50%;
    background:var(--ama-ink);margin-right:6px;animation:ama-blink 1.4s steps(2) infinite;}
  @media (prefers-reduced-motion:reduce){.ama-live{animation:none;}}
  @keyframes ama-blink{50%{opacity:.25;}}
  .ama-log{padding:20px 16px;display:flex;flex-direction:column;gap:14px;
    min-height:220px;max-height:420px;overflow-y:auto;font-size:13.5px;line-height:1.65;}
  .ama-msg-user{color:var(--ama-ink-soft);}
  .ama-msg-user::before{content:'you        > ';white-space:pre;}
  .ama-msg-ai{white-space:pre-wrap;}
  .ama-msg-ai::before{content:'pi-analyst > ';white-space:pre;color:var(--ama-ink-soft);}
  .ama-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 14px;}
  .ama-chip{font-family:inherit;font-size:11.5px;letter-spacing:.02em;cursor:pointer;
    border:1px solid var(--ama-line);background:transparent;color:var(--ama-ink);
    padding:7px 12px;transition:border-color .15s;}
  .ama-chip:hover,.ama-chip:focus-visible{border-color:var(--ama-ink);outline:none;}
  .ama-inputrow{display:flex;align-items:center;gap:8px;border-top:1px solid var(--ama-line);
    padding:12px 16px;}
  .ama-prefix{font-size:13px;color:var(--ama-ink-soft);white-space:pre;}
  .ama-input{flex:1;border:0;background:transparent;font-family:inherit;font-size:13.5px;
    color:var(--ama-ink);}
  .ama-input:focus{outline:none;}
  .ama-send{font-family:inherit;font-size:11px;letter-spacing:.12em;cursor:pointer;
    border:1px solid var(--ama-ink);background:var(--ama-ink);color:var(--ama-paper);
    padding:8px 14px;}
  .ama-send:disabled{opacity:.4;cursor:default;}
  .ama-foot{display:flex;justify-content:space-between;gap:12px;padding:8px 16px 12px;
    font-size:10.5px;letter-spacing:.1em;color:var(--ama-ink-soft);flex-wrap:wrap;}
  .ama-limit a{color:var(--ama-ink);}
  @media (max-width:600px){.ama-log{max-height:50vh;}}
  `;

  // ---- mount ---------------------------------------------------------------
  function mount() {
    const root = document.getElementById('ama-root');
    if (!root) return;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    root.innerHTML = `
      <div class="ama-console" role="region" aria-label="AI analyst console">
        <div class="ama-head">
          <span><span class="ama-live" aria-hidden="true"></span><b>PI-ANALYST</b> · LIVE</span>
          <span>SESSION MONITORED · nothing pre-scripted</span>
        </div>
        <div class="ama-log" id="ama-log" aria-live="polite"></div>
        <div class="ama-chips" id="ama-chips"></div>
        <div class="ama-inputrow">
          <span class="ama-prefix">pi-analyst &gt;</span>
          <input class="ama-input" id="ama-input" type="text" maxlength="500"
                 placeholder="ask about the fix…" aria-label="Ask the analyst" />
          <button class="ama-send" id="ama-send">RUN</button>
        </div>
        <div class="ama-foot">
          <span>model: claude · answers generated live</span>
          <span id="ama-counter"></span>
        </div>
      </div>`;

    const log = root.querySelector('#ama-log');
    const input = root.querySelector('#ama-input');
    const send = root.querySelector('#ama-send');
    const chipsEl = root.querySelector('#ama-chips');
    const counter = root.querySelector('#ama-counter');

    CHIPS.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'ama-chip';
      b.type = 'button';
      b.textContent = c;
      b.addEventListener('click', () => {
        track('ama_chip_click', { chip: c });
        ask(c, c);
      });
      chipsEl.appendChild(b);
    });

    let opened = false;
    input.addEventListener('focus', () => {
      if (!opened) {
        opened = true;
        track('ama_open');
      }
    });

    send.addEventListener('click', () => ask(input.value.trim(), null));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') ask(input.value.trim(), null);
    });

    updateCounter();

    function updateCounter() {
      const left = Math.max(0, QUERY_LIMIT - sent);
      counter.textContent = `queries remaining: ${left}/${QUERY_LIMIT}`;
    }

    function bubble(cls, text) {
      const d = document.createElement('div');
      d.className = cls;
      d.textContent = text;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    }

    function limitReached() {
      const d = document.createElement('div');
      d.className = 'ama-msg-ai ama-limit';
      d.innerHTML =
        'Query limit reached. The rest is answered in person. ' +
        '<a href="mailto:contact@pi.security?subject=Re:%20PI-2026-0314%20%C2%B7%20DesignFunctionNotFound&bcc=marina.rudinsky@gmail.com">APPLY FIX ›</a>';
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      input.disabled = true;
      send.disabled = true;
    }

    async function ask(text, chip) {
      if (!text || busy) return;
      if (sent >= QUERY_LIMIT) {
        limitReached();
        return;
      }
      busy = true;
      send.disabled = true;
      input.value = '';
      chipsEl.style.display = 'none';

      bubble('ama-msg-user', text);
      history.push({ role: 'user', content: text });
      sent += 1;
      sessionStorage.setItem('pi-ama-sent', String(sent));
      track('ama_message_sent', { index: sent });
      updateCounter();

      const aiEl = bubble('ama-msg-ai', '');
      let reply = '';

      try {
        const r = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, sessionId, chip }),
        });

        if (r.status === 429) {
          const j = await r.json().catch(() => ({}));
          aiEl.remove();
          if (j.error === 'query_limit') limitReached();
          else bubble('ama-msg-ai', 'Rate limit engaged. Try again in a bit.');
          return;
        }
        if (!r.ok || !r.body) {
          aiEl.textContent = 'Channel disrupted. Retry, or escalate: marina.rudinsky@gmail.com';
          return;
        }

        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, i).trim();
            buf = buf.slice(i + 1);
            if (!line.startsWith('data:')) continue;
            try {
              const evt = JSON.parse(line.slice(5).trim());
              if (evt.type === 'content_block_delta' && evt.delta && evt.delta.type === 'text_delta') {
                reply += evt.delta.text;
                aiEl.textContent = reply;
                log.scrollTop = log.scrollHeight;
              }
            } catch (_) {}
          }
        }
        history.push({ role: 'assistant', content: reply });
      } catch (e) {
        aiEl.textContent = 'Channel disrupted. Retry, or escalate: marina.rudinsky@gmail.com';
      } finally {
        busy = false;
        if (sent < QUERY_LIMIT) send.disabled = false;
        else limitReached();
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
