# PI-2026-0314 · Live AMA — Setup & Go-Live

The "Ask the analyst" console in §04 is fully coded and committed. It needs a
**Vercel** deploy to run (GitHub Pages is static and can't run the `/api`
functions). Follow the steps below. **You never paste the API key anywhere but
Vercel's Environment Variables screen** — not in code, not in chat.

---

## What's in the repo

```
api/
  ama.js            chat endpoint: streams Claude (SSE), enforces limits, logs
  monitor.js        read-only API for the /monitor dashboard
  system-prompt.js  the analyst's dossier — edit the facts here freely
  _lib.js           Upstash Redis, rate limits, logging (shared; degrades gracefully)
ama-widget.js       the console UI (self-contained, mounts into #ama-root in §04)
monitor.html        the "INTERCEPTED SESSIONS" admin dashboard
index.html          §04 now contains the ice tiles + intro + <div id="ama-root">
```

Model: `claude-sonnet-4-6`, `max_tokens: 400`, streaming. Change the model or
limits in `api/ama.js`; edit the analyst's facts in `api/system-prompt.js`.

---

## Go live on Vercel (≈10 minutes)

### 1. Connect the repo
Vercel → **Add New… → Project → Import Git Repository** → `Marinkayam/pi`.
- **Framework Preset: Other**
- Build command: none · Output directory: `.` (root)
- Deploy. You get a `*.vercel.app` URL.

> The `api/` folder is auto-detected as serverless functions. `package.json`
> already has `"type": "module"` so the ESM functions run correctly.

### 2. Add the API key (this is the only place the key ever lives)
Vercel → your project → **Settings → Environment Variables**, add:

| Name | Value | Environments |
|---|---|---|
| `ANTHROPIC_API_KEY` | *your Anthropic key* | Production + Preview |
| `MONITOR_KEY` | *a long random string* (this is the dashboard password) | Production + Preview |

Get a key at **console.anthropic.com → API Keys**. Paste it into the Vercel
field only. **Redeploy** after adding env vars (Deployments → ⋯ → Redeploy).

### 3. (Optional but recommended) Upstash Redis — enables limits + transcripts
Vercel → **Storage → Marketplace → Upstash → Redis → Connect** to the project.
This auto-adds `KV_REST_API_URL` + `KV_REST_API_TOKEN`.
- Without it: the chat still works, but there are no per-session limits and no
  transcript logging (the `/monitor` dashboard will be empty).
- With it: 10 queries/session, 30 requests/hour per IP, 60-day transcripts.

### 4. (Optional) Web Analytics
Vercel → **Analytics → Enable Web Analytics**, then add Vercel's analytics
snippet to `index.html`. The widget already fires `ama_open`,
`ama_chip_click`, `ama_message_sent` events when `window.va` exists.

---

## Using it

- **Chat:** loads on every visit. Ask anything about Marina; answers stream live.
- **Dashboard:** `https://<your-domain>/monitor.html?key=<MONITOR_KEY>`
  Summary stats · sessions table (city/country) · click a row for the full
  transcript. Wrong/missing key → ACCESS DENIED (the API returns 404).
- **Privacy:** only a salted hash of the IP is stored (never the raw IP), plus
  city/country from Vercel headers. The `SESSION MONITORED` line in the console
  is the disclosure — keep it. Transcripts auto-expire after 60 days.

---

## Test locally (optional)

```bash
npm i -g vercel
# create .env.local with the three vars (see .env.local.example)
vercel dev        # serves the site + functions at http://localhost:3000
```

---

## Security reminders

- The API key belongs **only** in Vercel Environment Variables. Never commit it,
  never paste it in chat, never put it in client-side code — the widget calls
  your own `/api/ama`, which reads the key server-side.
- If a key is ever exposed, rotate it in the Anthropic console immediately.

---

## Move the domain (after Vercel is live)

Once the Vercel URL works, point people there (optionally a custom domain like
`pi.marinka.me`). The GitHub Pages copy at `marinkayam.github.io/pi/` can stay as
a backup or add a redirect — your call.
