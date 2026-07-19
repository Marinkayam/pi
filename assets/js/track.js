/* PI-2026-0314 · lightweight first-party visit analytics.
 * Records: entrance, section views, clicks, scroll depth, AMA use, time on page.
 * Batches events to /api/track (best effort, sendBeacon on exit). No cookies. */
(function () {
  'use strict';
  var API = '/api/track';
  var uid = function () {
    return (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(16).slice(2);
  };

  var visitId = uid();                                  // one per entrance
  var visitorId = null, returning = false;
  try {
    visitorId = localStorage.getItem('pi-visitor');
    returning = !!visitorId;
    if (!visitorId) { visitorId = uid(); localStorage.setItem('pi-visitor', visitorId); }
  } catch (e) { visitorId = uid(); }

  var queue = [], started = Date.now(), activeMs = 0, lastTick = Date.now(),
      visible = !document.hidden, maxScroll = 0, ended = false;

  function push(type, label, extra) {
    var e = { t: Date.now(), type: type, label: label == null ? '' : String(label) };
    if (extra) for (var k in extra) e[k] = extra[k];
    queue.push(e);
  }
  function flush(useBeacon) {
    if (!queue.length) return;
    var body = JSON.stringify({ visitId: visitId, visitorId: visitorId, events: queue.splice(0, queue.length) });
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(API, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
    }
  }
  function tickActive() { var n = Date.now(); if (visible) activeMs += n - lastTick; lastTick = n; }

  // entrance
  push('page_view', document.title, {
    referrer: document.referrer, path: location.pathname + location.search,
    screen: innerWidth + 'x' + innerHeight, returning: returning
  });

  // section views (once each)
  try {
    var seen = {};
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, id = el.id || '';
        if (seen[id]) return; seen[id] = 1;
        var eb = el.querySelector('.eyebrow, .sec-head h2, h2');
        var label = ((eb && eb.textContent) || id || '').trim().slice(0, 80);
        push('section_view', label);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('section[id]').forEach(function (s) { io.observe(s); });
  } catch (e) {}

  // clicks on links / buttons / chips / magnetic CTAs
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a,button,.ama-chip,[data-magnetic]');
    if (!a) return;
    var label = (a.getAttribute('aria-label') || a.textContent || a.getAttribute('href') || '').trim().slice(0, 80);
    push('click', label, { href: a.getAttribute('href') || '' });
  }, true);

  // scroll depth milestones
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var d = Math.round((h.scrollTop + innerHeight) / h.scrollHeight * 100);
    [25, 50, 75, 100].forEach(function (m) { if (d >= m && maxScroll < m) { maxScroll = m; push('scroll_depth', String(m)); } });
  }, { passive: true });

  // AMA events: the widget calls window.va('event', { name, data }) — capture them
  if (!window.va) {
    window.va = function (kind, payload) {
      try {
        var d = (payload && payload.data) || {};
        push((payload && payload.name) || 'ama_event', d.chip != null ? d.chip : (d.index != null ? d.index : ''), d);
      } catch (e) {}
    };
  }

  document.addEventListener('visibilitychange', function () {
    tickActive(); visible = !document.hidden;
    if (document.hidden) flush(true);
  });

  setInterval(function () { flush(false); }, 6000);

  function end() {
    if (ended) return; ended = true; tickActive();
    push('session_end', '', { durationMs: Date.now() - started, activeMs: activeMs, maxScroll: maxScroll });
    flush(true);
  }
  window.addEventListener('pagehide', end);
  window.addEventListener('beforeunload', end);
  setTimeout(function () { flush(false); }, 1500);
})();
