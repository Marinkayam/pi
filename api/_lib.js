// Shared helpers: Upstash Redis (REST), rate limits, conversation logging.
// Zero npm dependencies: plain fetch against the Upstash REST API.
// Required env vars: KV_REST_API_URL, KV_REST_API_TOKEN (auto-added by
// the Upstash integration on Vercel), MONITOR_KEY.

import crypto from 'node:crypto';

const URL_ = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;

/** Run a pipeline of Redis commands. Each command is an array, e.g. ['GET','key']. */
export async function redis(...commands) {
  if (!URL_ || !TOKEN) return commands.map(() => ({ result: null }));
  const r = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return r.json(); // [{ result }, ...]
}

export function hashIp(ip) {
  const salt = process.env.MONITOR_KEY || 'pi-2026-0314';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 16);
}

const IP_LIMIT_PER_HOUR = 30;
const SESSION_QUERY_LIMIT = 10;

/**
 * Enforce both limits. Returns { ok, remaining, reason }.
 * remaining = queries left in this session AFTER this one.
 */
export async function checkRateLimit(ipHash, sessionId) {
  const hour = Math.floor(Date.now() / 3600000);
  const ipKey = `rl:ip:${ipHash}:${hour}`;
  const sessKey = `rl:sess:${sessionId}`;
  const [ipRes, , sessRes] = await redis(
    ['INCR', ipKey],
    ['EXPIRE', ipKey, '3600'],
    ['INCR', sessKey],
    ['EXPIRE', sessKey, '86400'],
  );
  const ipCount = Number(ipRes?.result ?? 0);
  const sessCount = Number(sessRes?.result ?? 0);
  if (ipCount > IP_LIMIT_PER_HOUR) return { ok: false, remaining: 0, reason: 'ip_limit' };
  if (sessCount > SESSION_QUERY_LIMIT) return { ok: false, remaining: 0, reason: 'query_limit' };
  return { ok: true, remaining: Math.max(0, SESSION_QUERY_LIMIT - sessCount) };
}

const CONV_TTL_SECONDS = 60 * 24 * 3600; // keep transcripts for 60 days

/** Append one exchange to the session transcript and index it. */
export async function logExchange({ sessionId, ipHash, city, country, userAgent, referrer, userMsg, reply, chip }) {
  try {
    const key = `conv:${sessionId}`;
    const [got] = await redis(['GET', key]);
    const now = Date.now();
    const conv = got?.result
      ? JSON.parse(got.result)
      : { sessionId, startedAt: now, ipHash, city, country, userAgent, referrer, chipUsed: [], messages: [] };
    conv.lastAt = now;
    if (chip && !conv.chipUsed.includes(chip)) conv.chipUsed.push(chip);
    conv.messages.push({ role: 'user', content: userMsg, ts: now });
    conv.messages.push({ role: 'assistant', content: reply, ts: Date.now() });
    await redis(
      ['SET', key, JSON.stringify(conv)],
      ['EXPIRE', key, String(CONV_TTL_SECONDS)],
      ['ZADD', 'conv:index', String(now), sessionId],
    );
  } catch (e) {
    // Logging must never break the chat.
    console.error('logExchange failed:', e.message);
  }
}

export function requestMeta(req) {
  return {
    ip: (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown',
    city: decodeURIComponent(req.headers['x-vercel-ip-city'] || ''),
    country: req.headers['x-vercel-ip-country'] || '',
    userAgent: req.headers['user-agent'] || '',
    referrer: req.headers['referer'] || '',
  };
}
