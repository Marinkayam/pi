// GET /api/analytics?key=XXX           → stats + recent visits (summaries)
// GET /api/analytics?key=XXX&visit=ID  → full event timeline for one visit
// Wrong/missing key → 404.

import { redis } from './_lib.js';

export default async function handler(req, res) {
  const { key = '', visit = '' } = req.query || {};
  if (!process.env.MONITOR_KEY || key !== process.env.MONITOR_KEY) {
    res.status(404).send('Not found');
    return;
  }

  try {
    if (visit) {
      const [got] = await redis(['GET', `visit:${visit}`]);
      if (!got?.result) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      res.status(200).json(JSON.parse(got.result));
      return;
    }

    const [idx] = await redis(['ZREVRANGE', 'visit:index', '0', '199']);
    const ids = idx?.result || [];
    if (!ids.length) {
      res.status(200).json({ stats: emptyStats(), visits: [] });
      return;
    }

    const results = await redis(...ids.map((id) => ['GET', `visit:${id}`]));
    const visits = results.map((r) => (r?.result ? safeParse(r.result) : null)).filter(Boolean);

    const uniqueVisitors = new Set(visits.map((v) => v.visitorId)).size;
    const durations = visits.map((v) => v.durationMs || 0).filter(Boolean);
    const avgDurationMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const amaVisits = visits.filter((v) => (v.amaMessages || 0) > 0).length;
    const refCounts = {};
    for (const v of visits) {
      const r = refDomain(v.referrer);
      refCounts[r] = (refCounts[r] || 0) + 1;
    }
    const topRef = Object.entries(refCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'direct';

    res.status(200).json({
      stats: { totalVisits: visits.length, uniqueVisitors, avgDurationMs, amaVisits, topRef },
      visits: visits.map((v) => ({
        visitId: v.visitId,
        visitorId: v.visitorId,
        startedAt: v.startedAt,
        lastAt: v.lastAt,
        city: v.city,
        country: v.country,
        referrer: v.referrer,
        returning: !!v.returning,
        durationMs: v.durationMs || 0,
        maxScroll: v.maxScroll || 0,
        amaMessages: v.amaMessages || 0,
        sections: (v.events || []).filter((e) => e.type === 'section_view').length,
        clicks: (v.events || []).filter((e) => e.type === 'click').length,
      })),
    });
  } catch (e) {
    console.error('analytics error:', e.message);
    res.status(500).json({ error: 'internal' });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
function emptyStats() {
  return { totalVisits: 0, uniqueVisitors: 0, avgDurationMs: 0, amaVisits: 0, topRef: 'direct' };
}
function refDomain(r) {
  if (!r) return 'direct';
  try { return new URL(r).hostname.replace(/^www\./, ''); } catch { return 'direct'; }
}
