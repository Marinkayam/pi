// Shared helpers: Upstash Redis (REST), rate limits, conversation logging.
// Zero npm dependencies: plain fetch against the Upstash REST API.
// Required env vars: KV_REST_API_URL, KV_REST_API_TOKEN (auto-added by
// the Upstash integration on Vercel), MONITOR_KEY.

import crypto from 'node:crypto';

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;

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

const VISIT_TTL_SECONDS = 60 * 24 * 3600; // keep visit records for 60 days

/** Upsert one visitor's event stream (site analytics). Best-effort, never throws. */
export async function logVisit({ visitId, visitorId, ipHash, city, country, userAgent, referrer, events }) {
  try {
    const key = `visit:${visitId}`;
    const [got] = await redis(['GET', key]);
    const now = Date.now();
    const v = got?.result
      ? JSON.parse(got.result)
      : {
          visitId, visitorId, startedAt: now, ipHash, city, country, userAgent,
          referrer: referrer || '', path: '', screen: '', returning: false,
          events: [], maxScroll: 0, amaMessages: 0, durationMs: 0,
        };
    v.lastAt = now;
    for (const e of events || []) {
      if (!e || !e.type) continue;
      const ev = {
        t: Number(e.t) || now,
        type: String(e.type).slice(0, 40),
        label: String(e.label ?? '').slice(0, 160),
      };
      if (e.type === 'page_view') {
        v.path = String(e.path || '').slice(0, 200);
        v.screen = String(e.screen || '').slice(0, 24);
        v.returning = !!e.returning;
        if (e.referrer) v.referrer = String(e.referrer).slice(0, 300);
      }
      if (e.type === 'scroll_depth') v.maxScroll = Math.max(v.maxScroll, Number(e.label) || 0);
      if (e.type === 'session_end' && e.durationMs) v.durationMs = Number(e.durationMs);
      if (e.type === 'ama_message_sent') v.amaMessages = (v.amaMessages || 0) + 1;
      v.events.push(ev);
    }
    if (v.events.length > 400) v.events = v.events.slice(-400);
    await redis(
      ['SET', key, JSON.stringify(v)],
      ['EXPIRE', key, String(VISIT_TTL_SECONDS)],
      ['ZADD', 'visit:index', String(v.startedAt), visitId],
    );
  } catch (e) {
    console.error('logVisit failed:', e.message);
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
