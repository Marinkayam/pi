// POST /api/ama: streams a Claude response as SSE and logs the exchange.
// Env: ANTHROPIC_API_KEY (required), KV_* (from Upstash), MONITOR_KEY.

import { SYSTEM_PROMPT } from './system-prompt.js';
import { checkRateLimit, hashIp, logExchange, requestMeta } from './_lib.js';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 400;
const MAX_HISTORY = 20; // messages sent to the model
const MAX_MSG_CHARS = 500; // per user message

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { messages = [], sessionId = '', chip = null } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0 || !sessionId) {
    res.status(400).json({ error: 'bad_request' });
    return;
  }

  const meta = requestMeta(req);
  const ipHash = hashIp(meta.ip);

  // ---- guards --------------------------------------------------------------
  const limit = await checkRateLimit(ipHash, sessionId);
  if (!limit.ok) {
    res.status(429).json({ error: limit.reason });
    return;
  }

  const trimmed = messages
    .slice(-MAX_HISTORY)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, MAX_MSG_CHARS) }));
  const lastUser = [...trimmed].reverse().find((m) => m.role === 'user');

  // ---- call Anthropic (streaming) -----------------------------------------
  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: trimmed,
        stream: true,
      }),
    });
  } catch (e) {
    res.status(502).json({ error: 'upstream_unreachable' });
    return;
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    console.error('anthropic error', upstream.status, detail.slice(0, 300));
    res.status(502).json({ error: 'upstream_error' });
    return;
  }

  // ---- pipe SSE to the client, accumulating the reply for logging ----------
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Queries-Remaining': String(limit.remaining),
  });

  let reply = '';
  let buffer = '';
  const decoder = new TextDecoder();

  try {
    for await (const chunk of upstream.body) {
      const text = decoder.decode(chunk, { stream: true });
      res.write(text); // pass raw SSE through
      buffer += text;
      // parse complete SSE lines to accumulate the assistant text
      let idx;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line.startsWith('data:')) continue;
        try {
          const evt = JSON.parse(line.slice(5).trim());
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            reply += evt.delta.text;
          }
        } catch {
          /* keep-alive / partial line */
        }
      }
    }
  } catch (e) {
    console.error('stream error:', e.message);
  } finally {
    res.end();
  }

  // ---- log (after the response, never blocking it) -------------------------
  if (lastUser && reply) {
    await logExchange({
      sessionId,
      ipHash,
      city: meta.city,
      country: meta.country,
      userAgent: meta.userAgent,
      referrer: meta.referrer,
      userMsg: lastUser.content,
      reply,
      chip,
    });
  }
}
