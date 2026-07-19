// POST /api/track — receives a batch of visitor events and logs them.
// Body: { visitId, visitorId, events: [{ t, type, label, ... }] }
// Best-effort: always returns 204, never blocks the page.

import { hashIp, requestMeta, logVisit } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  try {
    const { visitId = '', visitorId = '', events = [] } = req.body || {};
    if (visitId && Array.isArray(events) && events.length) {
      const meta = requestMeta(req);
      await logVisit({
        visitId: String(visitId).slice(0, 64),
        visitorId: String(visitorId).slice(0, 64),
        ipHash: hashIp(meta.ip),
        city: meta.city,
        country: meta.country,
        userAgent: meta.userAgent,
        referrer: meta.referrer,
        events: events.slice(0, 60),
      });
    }
  } catch (e) {
    console.error('track error:', e.message);
  }
  res.status(204).end();
}
