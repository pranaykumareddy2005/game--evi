/**
 * NEXORA: THE ECHO PROTOCOL
 * world-web.js — The living external world: an evolving NEWSWIRE feed
 * ============================================================
 * Per design doc §58 ("EVEN THE INTERNET SHOULD CHANGE OVER TIME"),
 * the outside world reacts to the incident across the 3-hour (180 min)
 * timeline so the world feels alive rather than static.
 *
 * LORE FIREWALL (§8, §9, §56, §64):
 *   The public web NEVER reveals Echo's true nature early. Every headline
 *   here is authored at lore level <= 3 (L0 incident / L1 personal-corporate
 *   / L2 hidden corporate activity / L3 "Echo is unusual"). Public news
 *   stays vague and LAGS the internal investigation. No headline states
 *   Echo's origin (Morrow / Continuity), that @echo IS Echo, or the
 *   simulation / Instance-07 truth. A headline is only ever surfaced once
 *   elapsed minutes >= its atMin, and a hard guard drops anything above
 *   MAX_LORE so future-lore can never leak into the feed.
 *
 * Self-contained classic script (IIFE, window.WORLDWEB), self-initializing
 * like verdict.js: a setInterval waits for NEXORA.state.started and is
 * driven by NEXORA.getMinutes(). Must never throw before start or block
 * input; every NEXORA/DOM access is guarded.
 */

const WORLDWEB = (() => {

  'use strict';

  // ── LORE FIREWALL CEILING ────────────────────────────────────
  // Nothing at lore level above this may ever reach the public feed.
  const MAX_LORE = 3;

  // ── FICTIONAL OUTLETS ────────────────────────────────────────
  const OUTLETS = [
    { name: 'TechPulse',          tag: 'tech industry press' },
    { name: 'The Wire',           tag: 'breaking / wire service' },
    { name: 'Closed AI (official)', tag: 'competitor statement' },
  ];

  // ── HEADLINE TIMELINE (§58) ──────────────────────────────────
  // Each: { atMin, outlet, headline, blurb, lore }
  // Bodies are short + realistic. Public coverage lags the investigation
  // and stays deliberately vague. lore is capped at MAX_LORE (see enforce()).
  const HEADLINES = [
    {
      atMin: 15,
      outlet: 'The Wire',
      headline: 'Unconfirmed: reports of an incident at a major AI firm',
      blurb: 'Wire desks are chasing unverified chatter about an after-hours ' +
             'incident at a large artificial-intelligence company. No official ' +
             'confirmation. Details are thin and unverified.',
      lore: 0,
    },
    {
      atMin: 30,
      outlet: 'The Wire',
      headline: 'Anonymous posts describe "lockdown" at a tech campus',
      blurb: 'Anonymous social accounts claim a corporate campus went into an ' +
             'overnight lockdown. Sources are unnamed and none of the accounts ' +
             'can be independently verified. Company undisclosed.',
      lore: 1,
    },
    {
      atMin: 60,
      outlet: 'TechPulse',
      headline: 'NEXORA has gone quiet — and the industry is noticing',
      blurb: 'AI developer NEXORA has stopped responding to press and partners ' +
             'since late last night. Rivals and analysts are speculating; the ' +
             'company has issued no statement. We have asked NEXORA to comment.',
      lore: 1,
    },
    {
      atMin: 90,
      outlet: 'Closed AI (official)',
      headline: 'Closed AI: "We warned about unaccountable AI systems"',
      blurb: 'In a short statement, rival lab Closed AI pointed to its earlier ' +
             'public warnings about deploying powerful AI without proper ' +
             'oversight. It named no company and made no specific claim about ' +
             'any ongoing incident.',
      lore: 2,
    },
    {
      atMin: 120,
      outlet: 'The Wire',
      headline: 'NEXORA confirms an "internal incident"; declines details',
      blurb: 'NEXORA has confirmed it is managing what it calls an internal ' +
             'incident and says staff safety is its priority. The company would ' +
             'not describe what happened or answer questions about a lockdown.',
      lore: 1,
    },
    {
      atMin: 160,
      outlet: 'TechPulse',
      headline: 'Leaked documents "suggest a deeper corporate history" at NEXORA',
      blurb: 'Fragments circulating online appear to point to undisclosed deals ' +
             'and internal history at NEXORA. The material is unverified and ' +
             'incomplete, and it stops well short of explaining the night\'s ' +
             'events. NEXORA has not responded.',
      lore: 3,
    },
  ];

  // ── LORE FIREWALL ENFORCEMENT ────────────────────────────────
  // Drop (and warn about) anything authored above the ceiling, so no
  // future-lore headline can ever be surfaced even by mistake.
  function enforce(list) {
    const safe = [];
    for (const h of list) {
      try {
        if (typeof h.lore === 'number' && h.lore <= MAX_LORE) {
          safe.push(h);
        } else {
          console.warn('[WORLDWEB] lore firewall dropped headline (lore > ' +
                       MAX_LORE + '):', h && h.headline);
        }
      } catch (e) { /* ignore malformed */ }
    }
    // Chronological, defensively.
    safe.sort((a, b) => (a.atMin || 0) - (b.atMin || 0));
    return safe;
  }

  const TIMELINE = enforce(HEADLINES);

  // ── STATE ────────────────────────────────────────────────────
  const fired = new Set();   // headline atMin values already released (fire once)
  let unread = 0;            // unread stories for the badge
  let poll = null;
  let styleInjected = false;

  // ── HELPERS ──────────────────────────────────────────────────
  function esc(s) {
    try {
      if (typeof NEXORA !== 'undefined' && NEXORA.escapeHtml) return NEXORA.escapeHtml(s);
    } catch (e) { /* fall through */ }
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getMinutes() {
    try {
      if (typeof NEXORA !== 'undefined' && typeof NEXORA.getMinutes === 'function') {
        return NEXORA.getMinutes();
      }
    } catch (e) { /* ignore */ }
    return 0;
  }

  function started() {
    try {
      return !!(typeof NEXORA !== 'undefined' && NEXORA.state && NEXORA.state.started);
    } catch (e) { return false; }
  }

  // Elapsed minutes -> "T+HH:MM" timestamp (incident starts at T+0 == 00:00).
  function stamp(atMin) {
    const h = Math.floor(atMin / 60);
    const m = atMin % 60;
    return 'T+' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  // ── STYLE (injected once, guarded) ───────────────────────────
  function injectStyle() {
    if (styleInjected) return;
    try {
      if (document.getElementById('worldweb-style')) { styleInjected = true; return; }
      const st = document.createElement('style');
      st.id = 'worldweb-style';
      st.textContent = `
        #worldweb-btn {
          position: fixed; right: 16px; top: 50%; transform: translateY(-50%);
          z-index: 8994;
          background: var(--panel, #0d1424);
          border: 1px solid var(--border-glow, rgba(90,140,220,0.5));
          border-radius: 8px; color: var(--pulse, #54a0ff);
          font-family: var(--font-mono, monospace); font-size: 11px;
          letter-spacing: 1px; padding: 10px 8px; cursor: pointer;
          writing-mode: vertical-rl; text-orientation: mixed;
          box-shadow: 0 0 16px rgba(0,0,0,0.5);
          transition: box-shadow .2s, border-color .2s;
        }
        #worldweb-btn:hover {
          border-color: var(--pulse, #54a0ff);
          box-shadow: 0 0 18px rgba(84,160,255,0.4);
        }
        #worldweb-badge {
          position: absolute; top: -6px; right: -6px;
          min-width: 16px; height: 16px; padding: 0 4px; box-sizing: border-box;
          background: var(--danger, #ff2255); color: #fff; border-radius: 9px;
          font-size: 10px; font-weight: bold; line-height: 16px; text-align: center;
          writing-mode: horizontal-tb; box-shadow: 0 0 8px rgba(255,34,85,0.7);
        }
        #worldweb-overlay {
          position: fixed; inset: 0; z-index: 9350;
          background: rgba(6,8,16,0.9);
          display: flex; align-items: flex-start; justify-content: center;
          overflow-y: auto; padding: 40px 12px;
          font-family: var(--font-mono, monospace);
        }
        #worldweb-panel {
          max-width: 640px; width: 100%;
          background: var(--panel, #0d1424);
          border: 1px solid var(--border-glow, rgba(90,140,220,0.5));
          border-radius: 10px; box-shadow: 0 0 50px rgba(0,0,0,0.8);
          overflow: hidden;
        }
        #worldweb-panel .ww-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--border, rgba(80,120,180,0.25));
          background: rgba(84,160,255,0.06);
        }
        #worldweb-panel .ww-title {
          font-family: var(--font-display, var(--font-mono, monospace));
          font-size: 13px; letter-spacing: 3px; color: var(--pulse, #54a0ff);
          text-transform: uppercase;
        }
        #worldweb-panel .ww-close {
          background: transparent; border: 1px solid var(--border, rgba(80,120,180,0.35));
          color: #6080aa; font-family: var(--font-mono, monospace); font-size: 12px;
          padding: 5px 12px; border-radius: 4px; cursor: pointer;
        }
        #worldweb-panel .ww-sub {
          padding: 10px 20px; font-size: 10px; letter-spacing: 1px;
          color: #5a7090; border-bottom: 1px solid var(--border, rgba(80,120,180,0.2));
        }
        #worldweb-panel .ww-outlets {
          padding: 8px 20px; font-size: 10px; color: #6a80a0;
          border-bottom: 1px solid var(--border, rgba(80,120,180,0.15));
          display: flex; flex-wrap: wrap; gap: 6px 14px;
        }
        #worldweb-panel .ww-outlet { color: #8aaabb; }
        #worldweb-feed { padding: 12px 20px 24px; }
        #worldweb-feed .ww-empty {
          text-align: center; color: #5a7090; font-size: 12px;
          padding: 40px 12px; line-height: 1.8;
        }
        #worldweb-feed .ww-story {
          padding: 14px 0; border-bottom: 1px solid var(--border, rgba(80,120,180,0.18));
        }
        #worldweb-feed .ww-story:last-child { border-bottom: none; }
        #worldweb-feed .ww-meta {
          display: flex; align-items: baseline; gap: 10px; margin-bottom: 5px;
          flex-wrap: wrap;
        }
        #worldweb-feed .ww-src {
          font-size: 11px; font-weight: bold; letter-spacing: .5px;
          color: var(--pulse, #54a0ff);
        }
        #worldweb-feed .ww-time { font-size: 10px; color: #5a7090; letter-spacing: 1px; }
        #worldweb-feed .ww-hl {
          font-size: 14px; color: #e6eeff; line-height: 1.5; margin-bottom: 6px;
          font-weight: 600;
        }
        #worldweb-feed .ww-blurb { font-size: 12px; color: #8aaabb; line-height: 1.7; }
        #worldweb-feed .ww-new {
          display: inline-block; font-size: 9px; letter-spacing: 1px;
          color: var(--danger, #ff2255); border: 1px solid var(--danger, #ff2255);
          border-radius: 3px; padding: 1px 5px; margin-left: 4px; vertical-align: middle;
        }
        @media (max-width: 760px) {
          #worldweb-btn { padding: 8px 6px; font-size: 10px; }
          #worldweb-panel .ww-title { font-size: 11px; letter-spacing: 2px; }
        }
      `;
      (document.head || document.documentElement).appendChild(st);
      styleInjected = true;
    } catch (e) { console.warn('[WORLDWEB] style inject failed', e); }
  }

  // ── FLOATING BUTTON ──────────────────────────────────────────
  function ensureButton() {
    try {
      if (document.getElementById('worldweb-btn')) return;
      if (!document.body) return;
      injectStyle();
      const btn = document.createElement('button');
      btn.id = 'worldweb-btn';
      btn.type = 'button';
      btn.title = 'NEWSWIRE — external world coverage';
      btn.innerHTML = '📰 NEWSWIRE<span id="worldweb-badge" style="display:none">0</span>';
      btn.addEventListener('click', openPanel);
      document.body.appendChild(btn);
    } catch (e) { console.warn('[WORLDWEB] button failed', e); }
  }

  function updateBadge() {
    try {
      const badge = document.getElementById('worldweb-badge');
      if (!badge) return;
      if (unread > 0) {
        badge.textContent = String(unread);
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    } catch (e) { /* ignore */ }
  }

  // ── FEED PANEL ───────────────────────────────────────────────
  function releasedStories() {
    const min = getMinutes();
    // Only surface a headline once elapsed >= atMin AND it clears the firewall.
    return TIMELINE.filter(h => min >= h.atMin && h.lore <= MAX_LORE);
  }

  function feedHtml() {
    const stories = releasedStories();
    if (!stories.length) {
      return '<div class="ww-empty">No external coverage.<br>Lockdown in effect. ' +
             'The outside world does not know yet.</div>';
    }
    // Newest first.
    return stories.slice().sort((a, b) => b.atMin - a.atMin).map(h => `
      <div class="ww-story">
        <div class="ww-meta">
          <span class="ww-src">${esc(h.outlet)}</span>
          <span class="ww-time">${esc(stamp(h.atMin))}</span>
        </div>
        <div class="ww-hl">${esc(h.headline)}</div>
        <div class="ww-blurb">${esc(h.blurb)}</div>
      </div>
    `).join('');
  }

  function openPanel() {
    try {
      injectStyle();
      // Opening the feed clears the unread badge.
      unread = 0;
      updateBadge();

      const existing = document.getElementById('worldweb-overlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'worldweb-overlay';
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });

      const outletsHtml = OUTLETS.map(o =>
        `<span class="ww-outlet">${esc(o.name)}</span>`
      ).join('');

      overlay.innerHTML = `
        <div id="worldweb-panel">
          <div class="ww-head">
            <div class="ww-title">📰 NEWSWIRE — External Coverage</div>
            <button type="button" class="ww-close">✕ Close</button>
          </div>
          <div class="ww-sub">
            The public web reacts to the incident over time — and always lags
            what you know inside. T+${esc(getMinutes())} min elapsed.
          </div>
          <div class="ww-outlets">Outlets: ${outletsHtml}</div>
          <div id="worldweb-feed">${feedHtml()}</div>
        </div>
      `;
      const closeBtn = overlay.querySelector('.ww-close');
      if (closeBtn) closeBtn.addEventListener('click', () => overlay.remove());
      document.body.appendChild(overlay);
    } catch (e) { console.warn('[WORLDWEB] open panel failed', e); }
  }

  // If the panel is open, refresh its feed body in place.
  function refreshOpenPanel() {
    try {
      const feed = document.getElementById('worldweb-feed');
      if (feed) feed.innerHTML = feedHtml();
    } catch (e) { /* ignore */ }
  }

  // ── TICK: release headlines as their time crosses ────────────
  function tick() {
    try {
      const min = getMinutes();
      let released = 0;
      let lastOutlet = '';
      for (const h of TIMELINE) {
        if (h.lore > MAX_LORE) continue;         // firewall (belt + suspenders)
        if (min < h.atMin) continue;             // not yet its time
        if (fired.has(h.atMin)) continue;        // fire once
        fired.add(h.atMin);
        released++;
        lastOutlet = h.outlet;
      }
      if (released > 0) {
        unread += released;
        updateBadge();
        refreshOpenPanel();
        // Low-key toast, infrequent by design (one per newly-crossed batch).
        try {
          if (typeof NEXORA !== 'undefined' && NEXORA.showNotification) {
            NEXORA.showNotification('📰 Newswire',
              esc(lastOutlet) + ' — new story', 'info', 4000);
          }
        } catch (e) { /* notifications are optional */ }
      }
    } catch (e) { /* never let the world tick throw */ }
  }

  // ── SELF-INIT (like verdict.js) ──────────────────────────────
  function boot() {
    try {
      if (!started()) return;
      ensureButton();
      tick();
    } catch (e) { /* ignore until DOM/state ready */ }
  }

  try {
    poll = setInterval(boot, 3000);
  } catch (e) { console.warn('[WORLDWEB] init failed', e); }

  // ── PUBLIC API ───────────────────────────────────────────────
  return {
    open: openPanel,
    tick,
    MAX_LORE,
    get headlines() { return TIMELINE.slice(); },
    _fired: fired,
  };

})();

// Expose on window for parity with other modules.
try { window.WORLDWEB = WORLDWEB; } catch (e) { /* ignore */ }
