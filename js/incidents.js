/**
 * NEXORA: THE ECHO PROTOCOL
 * incidents.js — GLOBAL INCIDENT ENGINE
 * ============================================================
 * One shared, company-wide incident at a time. A single root cause
 * (network instability / Echo interference) produces role-specific
 * degraded-service symptoms across every department simultaneously.
 *
 * Only the TECH role can run recovery (cross-role dependency). A solo
 * player who is not on Tech is never stuck: IT auto-resolves after
 * ~8 game-minutes.
 *
 * Self-contained classic script (IIFE). Reads game state via the
 * NEXORA global only — never edits game-state.js. Exposes:
 *   window.INCIDENTS.restore()  — hook a terminal command can call.
 *
 * z-index budget (must sit above the desktop, below overlays):
 *   desktop windows ......... 200+
 *   echo-lockdown wash ...... 8990
 *   verdict / board buttons . 8994
 *   incident banner ......... 8995   ← here (thin top strip)
 *   verdict overlay ......... 9500+
 */

window.INCIDENTS = (function () {
  'use strict';

  // ── SAFE ACCESSORS (NEXORA may be undefined very early) ─────────
  function nx() { return (typeof NEXORA !== 'undefined') ? NEXORA : null; }
  function started() { try { return !!(nx() && nx().state && nx().state.started); } catch (e) { return false; } }
  function currentRole() { try { return (nx() && nx().state && nx().state.currentRole) || null; } catch (e) { return null; } }
  function minutes() {
    try {
      var n = nx();
      if (!n) return 0;
      if (typeof n.getMinutes === 'function') return n.getMinutes();
      if (typeof n.elapsedMinutes === 'function') return n.elapsedMinutes();
      return 0;
    } catch (e) { return 0; }
  }
  function notify(title, body, type, dur) {
    try { if (nx() && nx().showNotification) nx().showNotification(title, body, type || 'info', dur || 6000); } catch (e) {}
  }
  function chat(role, msg, color) {
    try { if (nx() && nx().addChatMessage) nx().addChatMessage(role || 'system', msg, color); } catch (e) {}
  }

  // ── INCIDENT DEFINITIONS ────────────────────────────────────────
  // Atmospheric + realistic. NOT labelled as puzzles. Two on the timeline.
  var INCIDENTS = [
    {
      id: 'network-anomaly',
      fireAt: 45,                       // ~T+45
      title: 'NETWORK ANOMALY',
      banner: '⚠ NEXORA NETWORK — DEGRADED · services unstable',
      chatFrom: 'tech',
      chatColor: '#ffaa00',
      chatLine: '⚠ NETWORK ANOMALY — packet loss climbing across the internal fabric. Several department services are timing out. Investigating.',
      notifTitle: 'NEXORA NETWORK',
      notifBody: 'Network instability detected — some services may be unavailable.',
      severity: 'warning',
      accent: 'var(--warn, #ffaa00)',
      // Root-cause line surfaced to Tech on restore.
      resolveLine: '✅ Infrastructure restored — services back online. Root cause: transient routing loop on the internal fabric, cleared.'
    },
    {
      id: 'echo-interference',
      fireAt: 90,                       // ~T+90
      title: 'ECHO INTERFERENCE',
      banner: '⚠ NEXORA NETWORK — DEGRADED · Echo processes interfering with services',
      chatFrom: 'tech',
      chatColor: '#7b2fff',
      chatLine: '⚠ ECHO INTERFERENCE — the Echo process is actively degrading department systems. Outbound calls being rewritten. This is not a normal fault.',
      notifTitle: 'NEXORA CORE',
      notifBody: 'Echo processes are interfering with company systems — services degraded.',
      severity: 'danger',
      accent: 'var(--danger, #ff2255)',
      resolveLine: '✅ Infrastructure restored — services back online. The interference traced directly to the Echo process (Research-07 → Echo-Core). It was not an outage — Echo was reaching into the services.'
    }
  ];

  // Per-role degraded-service symptom strings (blueprint). Shown to
  // whichever role is active while an incident is live.
  var SYMPTOMS = {
    finance:   { svc: 'Banking Service',       msg: 'Banking service unavailable — database connection failed' },
    hr:        { svc: 'Employee Database',     msg: 'Employee database unavailable' },
    ops:       { svc: 'Camera Grid',           msg: 'CAM-05 / CAM-06 — Signal lost' },
    marketing: { svc: 'NEXORA PULSE',          msg: 'NEXORA PULSE — server timeout' },
    legal:     { svc: 'Contract Vault',        msg: 'Contract Vault — connection error' },
    product:   { svc: 'Echo Research Server',  msg: 'Echo Research server — cannot connect' },
    exec:      { svc: 'Board Portal',          msg: 'Board Portal — service unavailable' },
    // Tech sees the ROOT CAUSE, not a symptom — and can act on it.
    tech:      { svc: 'CRITICAL INFRASTRUCTURE', msg: '⚠ CRITICAL INFRASTRUCTURE INCIDENT — Research-07 → Echo-Core', root: true }
  };

  var AUTO_RESTORE_MINUTES = 8;  // IT auto-resolves so solo players aren't stuck.

  // ── RUNTIME STATE ───────────────────────────────────────────────
  var active = null;             // the currently-firing incident definition
  var firedAtMinute = 0;         // game-minute the active incident fired
  var fired = {};                // { incidentId: true } — never re-fires
  var lastRole = null;           // to detect role switches while active
  var styleInjected = false;

  // ── SCOPED STYLE (injected once) ────────────────────────────────
  function injectStyle() {
    if (styleInjected) return;
    try {
      if (document.getElementById('incident-style')) { styleInjected = true; return; }
      var st = document.createElement('style');
      st.id = 'incident-style';
      st.textContent = [
        '#incident-banner{',
        '  position:fixed; left:0; right:0; top:48px; z-index:8995;',
        '  display:flex; align-items:center; justify-content:center; gap:12px;',
        '  flex-wrap:wrap;',
        '  padding:6px 14px; box-sizing:border-box;',
        '  font-family:var(--font-mono,\'Share Tech Mono\',monospace);',
        '  font-size:12px; letter-spacing:1px; line-height:1.4;',
        '  color:#fff; text-align:center;',
        '  border-top:1px solid rgba(255,255,255,0.08);',
        '  border-bottom:1px solid rgba(0,0,0,0.4);',
        '  box-shadow:0 2px 14px rgba(0,0,0,0.5);',
        '  pointer-events:none;',                 // strip is decorative; button re-enables
        '  animation:incidentPulse 1.6s ease-in-out infinite;',
        '}',
        '#incident-banner .inc-msg{ font-weight:bold; }',
        '#incident-banner .inc-recover{',
        '  pointer-events:auto;',                 // the one interactive part
        '  cursor:pointer; border:1px solid rgba(255,255,255,0.85);',
        '  background:rgba(0,0,0,0.35); color:#fff;',
        '  font-family:var(--font-mono,\'Share Tech Mono\',monospace);',
        '  font-size:11px; letter-spacing:1px; font-weight:bold;',
        '  padding:3px 12px; border-radius:3px; white-space:nowrap;',
        '  transition:background .15s, transform .15s;',
        '}',
        '#incident-banner .inc-recover:hover{ background:rgba(255,255,255,0.18); transform:translateY(-1px); }',
        '#incident-banner .inc-hint{ opacity:0.85; font-size:11px; }',
        '@keyframes incidentPulse{ 0%,100%{ filter:brightness(1); } 50%{ filter:brightness(1.35); } }',
        // Responsive: stack tighter on narrow screens.
        '@media (max-width:640px){',
        '  #incident-banner{ font-size:11px; padding:5px 10px; gap:8px; }',
        '  #incident-banner .inc-hint{ display:none; }',
        '}'
      ].join('\n');
      (document.head || document.documentElement).appendChild(st);
      styleInjected = true;
    } catch (e) { /* non-fatal */ }
  }

  // ── BANNER ──────────────────────────────────────────────────────
  function renderBanner() {
    if (!active) return;
    injectStyle();
    try {
      var host = document.body || document.documentElement;
      if (!host) return;
      var bar = document.getElementById('incident-banner');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'incident-banner';
        host.appendChild(bar);
      }
      // Amber/red wash based on severity.
      bar.style.background = (active.severity === 'danger')
        ? 'linear-gradient(90deg, rgba(255,34,85,0.92), rgba(123,47,255,0.92))'
        : 'linear-gradient(90deg, rgba(255,170,0,0.92), rgba(255,34,85,0.85))';

      var isTech = (currentRole() === 'tech');
      var recoverHtml = isTech
        ? '<button class="inc-recover" type="button" title="Run infrastructure recovery">▶ Run Recovery</button>'
        : '<span class="inc-hint">TECH must run recovery to restore services</span>';

      bar.innerHTML =
        '<span class="inc-msg">' + escape(active.banner) + '</span>' + recoverHtml;

      var btn = bar.querySelector('.inc-recover');
      if (btn) btn.onclick = function () { restore('tech'); };
    } catch (e) { /* non-fatal */ }
  }

  function removeBanner() {
    try {
      var bar = document.getElementById('incident-banner');
      if (bar) bar.remove();
    } catch (e) {}
    try { if (document.body) document.body.classList.remove('incident-active'); } catch (e) {}
  }

  function escape(s) {
    try {
      if (nx() && nx().escapeHtml) return nx().escapeHtml(s);
    } catch (e) {}
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── ROLE SYMPTOM ────────────────────────────────────────────────
  // Show the given (current) role its believable degraded-service message.
  function showSymptomFor(role) {
    if (!active || !role) return;
    var sym = SYMPTOMS[role];
    if (!sym) return;
    try {
      var type = sym.root ? 'danger' : (active.severity || 'warning');
      var title = sym.root ? '⚠ INFRASTRUCTURE ALERT' : (sym.svc + ' — Error');
      notify(title, sym.msg, type, 7000);
    } catch (e) {}
  }

  // ── FIRE ────────────────────────────────────────────────────────
  function fire(inc) {
    if (active || fired[inc.id]) return;
    active = inc;
    fired[inc.id] = true;
    firedAtMinute = minutes();
    lastRole = currentRole();

    try { if (document.body) document.body.classList.add('incident-active'); } catch (e) {}

    // System chat line + Windows-style notification.
    chat(inc.chatFrom, inc.chatLine, inc.chatColor);
    notify(inc.notifTitle, inc.notifBody, inc.severity, 8000);

    renderBanner();

    // Current role's role-specific symptom.
    showSymptomFor(lastRole);
  }

  // ── RESTORE ─────────────────────────────────────────────────────
  // Cross-role dependency: only TECH clears it (button or terminal hook).
  // `by` defaults to 'tech'; an 'auto' restore is the IT fallback.
  function restore(by) {
    if (!active) return false;
    var mode = by || 'tech';

    // Guard the cross-role rule for player-initiated restores.
    if (mode !== 'auto' && currentRole() !== 'tech') {
      notify('Recovery Locked', 'Only the TECH / ENGINEERING console can run infrastructure recovery.', 'warning', 6000);
      return false;
    }

    var inc = active;
    active = null;
    removeBanner();

    if (mode === 'auto') {
      chat('system', '✅ ' + inc.title + ' resolved — IT restored services automatically. (No manual recovery was run in time.)', '#00cc88');
      notify('Services Restored', 'IT resolved the incident — services are back online.', 'info', 7000);
    } else {
      chat('tech', inc.resolveLine, '#00cc88');
      chat('system', '✅ Infrastructure restored — services back online.', '#00cc88');
      notify('Infrastructure Restored', 'Recovery complete — services back online.', 'info', 8000);
    }
    return true;
  }

  // ── POLL LOOP ───────────────────────────────────────────────────
  // Mirrors verdict.js: wait for the game to start, then drive the
  // timeline off elapsed game-minutes.
  function tick() {
    try {
      if (!started()) return;
      var min = minutes();

      // Fire scheduled incidents.
      if (!active) {
        for (var i = 0; i < INCIDENTS.length; i++) {
          var inc = INCIDENTS[i];
          if (!fired[inc.id] && min >= inc.fireAt) { fire(inc); break; }
        }
      }

      if (active) {
        // Watch for role switches while an incident is live — show the
        // newly-active role its own symptom, and refresh the banner so the
        // Tech recovery button appears/disappears appropriately.
        var role = currentRole();
        if (role !== lastRole) {
          lastRole = role;
          renderBanner();
          showSymptomFor(role);
        }

        // Auto-restore fallback so solo players aren't stuck degraded.
        if (min - firedAtMinute >= AUTO_RESTORE_MINUTES) {
          restore('auto');
        }
      }
    } catch (e) { /* never let the loop die */ }
  }

  var loop = setInterval(tick, 4000);

  // ── PUBLIC API ──────────────────────────────────────────────────
  return {
    // Terminal / external hook. Callable with no args (acts as Tech).
    restore: function () { return restore('tech'); },
    // Introspection helpers (handy for terminal commands / debugging).
    active: function () { return active ? active.id : null; },
    isActive: function () { return !!active; },
    _tick: tick,
    _loop: loop
  };
})();
