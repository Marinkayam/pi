// GET /api/monitor?key=XXX            → stats + latest sessions (summaries)
// GET /api/monitor?key=XXX&session=ID → full transcript of one session
// Wrong/missing key → 404 (the endpoint "doesn't exist").

import { redis } from './_lib.js';

export default async function handler(req, res) {
  const { key = '', session = '' } = req.query || {};
  if (!process.env.MONITOR_KEY || key !== process.env.MONITOR_KEY) {
    res.status(404).send('Not found');
    return;
  }

  try {
    if (session) {
      const [got] = await redis(['GET', `conv:${session}`]);
      if (!got?.result) {
        res.status(404).json({ error: 'session_not_found' });
        return;
      }
      res.status(200).json(JSON.parse(got.result));
      return;
    }

    const [idx] = await redis(['ZREVRANGE', 'conv:index', '0', '99']);
    const ids = idx?.result || [];
    if (ids.length === 0) {
      res.status(200).json({ stats: emptyStats(), sessions: [] });
      return;
    }

    const results = await redis(...ids.map((id) => ['GET', `conv:${id}`]));
    const sessions = results
      .map((r) => (r?.result ? safeParse(r.result) : null))
      .filter(Boolean);

    const totalQueries = sessions.reduce((n, s) => n + s.messages.filter((m) => m.role === 'user').length, 0);
    const chipCounts = {};
    for (const s of sessions) for (const c of s.chipUsed || []) chipCounts[c] = (chipCounts[c] || 0) + 1;
    const topChip = Object.entries(chipCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '·';

    res.status(200).json({
      stats: {
        totalSessions: sessions.length,
        totalQueries,
        avgQueries: sessions.length ? +(totalQueries / sessions.length).toFixed(1) : 0,
        topChip,
      },
      sessions: sessions.map((s) => ({
        sessionId: s.sessionId,
        startedAt: s.startedAt,
        lastAt: s.lastAt,
        city: s.city,
        country: s.country,
        queries: s.messages.filter((m) => m.role === 'user').length,
        chipUsed: s.chipUsed || [],
        firstQuestion: s.messages.find((m) => m.role === 'user')?.content || '',
      })),
    });
  } catch (e) {
    console.error('monitor error:', e.message);
    res.status(500).json({ error: 'internal' });
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function emptyStats() {
  return { totalSessions: 0, totalQueries: 0, avgQueries: 0, topChip: '·' };
}
