/**
 * NEXORA: THE ECHO PROTOCOL
 * consolidation.js — Act V "Reconstruction Ritual" (§60–§62)
 * ============================================================
 * In the final act (T+160, or slightly earlier once the team has
 * logged a lot of evidence), Echo begins interfering with the data.
 * Each department CONSOLIDATES and SUBMITS its findings into a shared
 * reconstruction — a deliberate team beat between "we know it's Daniel"
 * and the scored Final Verdict.
 *
 * This module is fully self-contained: it never edits other files,
 * exposes window.CONSOLIDATE, and self-initialises with a poll that
 * waits for NEXORA.state.started (mirrors verdict.js). It must not
 * throw before the game starts and must never block input.
 *
 * Reads (globals, never mutated destructively):
 *   NEXORA.state.started / currentRole / evidenceFound (Set of ids)
 *   NEXORA.EVIDENCE (id -> {id,label,role,unlocksAt})
 *   NEXORA.getMinutes(), NEXORA.ROLES
 *   NEXORA.addChatMessage(role,msg,color), NEXORA.showNotification
 *   NEXORA.escapeHtml
 */

window.CONSOLIDATE = (function () {
  'use strict';

  // ── CONFIG ───────────────────────────────────────────────────
  var LS_KEY          = 'nexora_consolidation';
  var UNLOCK_MIN      = 160;   // canon: reconstruction opens at T+160
  var EARLY_MIN       = 150;   // slightly earlier if the team is far ahead
  var EARLY_EVIDENCE  = 16;    // …once this many pieces are logged
  var TOTAL_DEPTS     = 8;

  // §61 — each department's evidence CATEGORY.
  var CATEGORY = {
    tech:      'Digital',
    finance:   'Financial',
    hr:        'Motive / People',
    ops:       'Location / Physical',
    marketing: 'Communication',
    legal:     'Ownership / Authorization',
    product:   'Echo / Research',
    exec:      'Strategic'
  };

  // ── STATE ────────────────────────────────────────────────────
  var unlocked   = false;   // reconstruction step is available
  var announced  = false;   // one-time story notification fired
  var panelOpen  = false;
  var lastRole   = null;    // to detect NEXORA.state.currentRole changes
  var consolidated = loadConsolidated();  // Set<roleKey>

  // ── PERSISTENCE ──────────────────────────────────────────────
  function loadConsolidated() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch (e) { /* storage unavailable — keep working in-memory */ }
    return new Set();
  }

  function saveConsolidated() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(consolidated)));
    } catch (e) { /* non-fatal */ }
  }

  // ── HELPERS ──────────────────────────────────────────────────
  function esc(s) {
    try {
      if (window.NEXORA && NEXORA.escapeHtml) return NEXORA.escapeHtml(s);
    } catch (e) { /* fall through */ }
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function currentRole() {
    try { return (NEXORA.state && NEXORA.state.currentRole) || 'tech'; }
    catch (e) { return 'tech'; }
  }

  function roleMeta(role) {
    try {
      var r = NEXORA.ROLES && NEXORA.ROLES[role];
      if (r) return r;
    } catch (e) { /* fall through */ }
    return { label: (role || 'DEPARTMENT').toUpperCase(), color: '#8aaabb' };
  }

  function categoryFor(role) { return CATEGORY[role] || 'Departmental'; }

  // Evidence THIS role has logged (unlocked + documented).
  function loggedForRole(role) {
    var out = [];
    try {
      var ev = NEXORA.EVIDENCE || {};
      var found = (NEXORA.state && NEXORA.state.evidenceFound) || new Set();
      Object.keys(ev).forEach(function (id) {
        var e = ev[id];
        if (e && e.role === role && found.has && found.has(id)) out.push(e);
      });
      out.sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
    } catch (e) { /* return whatever we have */ }
    return out;
  }

  function deptCount() {
    // Cap at 8 (defensive against any stray persisted keys).
    var n = 0;
    consolidated.forEach(function (k) { if (NEXORA.ROLES && NEXORA.ROLES[k]) n++; });
    return Math.min(n, TOTAL_DEPTS);
  }

  // ── SCOPED STYLE (injected once) ─────────────────────────────
  function injectStyle() {
    try {
      if (document.getElementById('consolidate-style')) return;
      var st = document.createElement('style');
      st.id = 'consolidate-style';
      st.textContent = [
        '#consolidate-btn{',
        '  position:fixed; bottom:120px; left:50%; transform:translateX(-50%);',
        '  z-index:8994; cursor:pointer;',
        '  background:var(--panel,#0e1420); border:2px solid var(--echo,#7b2fff);',
        '  border-radius:4px; color:#e6d8ff;',
        '  font-family:var(--font-display,"Share Tech Mono",monospace);',
        '  font-size:11px; letter-spacing:2px; text-transform:uppercase;',
        '  padding:10px 22px; max-width:92vw;',
        '  box-shadow:0 0 20px rgba(123,47,255,0.45);',
        '  transition:box-shadow .2s, transform .15s;',
        '  animation:consolidatePulse 2.2s ease-in-out infinite;',
        '}',
        '#consolidate-btn:hover{ box-shadow:0 0 30px rgba(123,47,255,0.75); transform:translateX(-50%) translateY(-1px); }',
        '#consolidate-btn.done{ border-color:var(--safe,#00cc88); color:#c9ffe4; box-shadow:0 0 18px rgba(0,204,136,0.4); animation:none; }',
        '@keyframes consolidatePulse{ 0%,100%{ box-shadow:0 0 16px rgba(123,47,255,0.4); } 50%{ box-shadow:0 0 28px rgba(123,47,255,0.75); } }',
        '#consolidate-overlay{',
        '  position:fixed; inset:0; z-index:9350;',
        '  background:rgba(6,8,16,0.95);',
        '  display:flex; align-items:flex-start; justify-content:center;',
        '  overflow-y:auto; padding:40px 0;',
        '  font-family:var(--font-mono,"Share Tech Mono",monospace);',
        '}',
        '#consolidate-overlay .cns-card{',
        '  max-width:680px; width:92%; padding:32px;',
        '  background:var(--panel,#0e1420); border:1px solid var(--echo,#7b2fff);',
        '  border-radius:8px; box-shadow:0 0 60px rgba(0,0,0,0.8);',
        '}',
        '#consolidate-overlay .cns-ev{',
        '  display:flex; align-items:flex-start; gap:10px;',
        '  padding:8px 10px; margin-bottom:5px; cursor:pointer;',
        '  background:var(--surface,#0a0f1a); border:1px solid var(--border,#22304a);',
        '  border-left:3px solid var(--echo,#7b2fff); border-radius:4px;',
        '  font-size:12px; color:#c8d8ff; line-height:1.5;',
        '}',
        '#consolidate-overlay .cns-ev:hover{ border-color:var(--border-glow,#3a5a80); }',
        '#consolidate-overlay .cns-ev .cns-id{ color:#7f9ac0; font-weight:bold; letter-spacing:1px; }',
        '#consolidate-overlay .cns-btn{',
        '  background:var(--echo,#7b2fff); border:none; color:#fff;',
        '  font-family:var(--font-display,"Share Tech Mono",monospace);',
        '  font-size:11px; letter-spacing:2px; text-transform:uppercase;',
        '  padding:12px 28px; border-radius:4px; cursor:pointer;',
        '}',
        '#consolidate-overlay .cns-cancel{',
        '  background:transparent; border:1px solid var(--border,#22304a); color:#6080aa;',
        '  font-family:var(--font-mono,"Share Tech Mono",monospace);',
        '  font-size:11px; padding:12px 20px; border-radius:4px; cursor:pointer;',
        '}',
        '@media (max-width:640px){',
        '  #consolidate-btn{ bottom:96px; font-size:10px; padding:9px 14px; letter-spacing:1px; }',
        '  #consolidate-overlay .cns-card{ padding:22px; }',
        '}'
      ].join('\n');
      (document.head || document.documentElement).appendChild(st);
    } catch (e) { /* non-fatal */ }
  }

  // ── FLOATING BUTTON ──────────────────────────────────────────
  function getButton() {
    try {
      if (document.getElementById('consolidate-btn')) return;
      if (!document.body) return;
      injectStyle();
      var btn = document.createElement('button');
      btn.id = 'consolidate-btn';
      btn.type = 'button';
      btn.onclick = openPanel;
      document.body.appendChild(btn);
      refreshButton();
    } catch (e) { /* non-fatal */ }
  }

  function refreshButton() {
    try {
      var btn = document.getElementById('consolidate-btn');
      if (!btn) return;
      var role = currentRole();
      var count = deptCount();
      if (consolidated.has(role)) {
        btn.classList.add('done');
        btn.textContent = '✓ SUBMITTED  ·  ' + count + '/' + TOTAL_DEPTS + ' DEPTS';
      } else {
        btn.classList.remove('done');
        btn.textContent = '📋 SUBMIT EVIDENCE  ·  ' + count + '/' + TOTAL_DEPTS + ' DEPTS';
      }
    } catch (e) { /* non-fatal */ }
  }

  // ── PANEL ────────────────────────────────────────────────────
  function progressLine() {
    var count = deptCount();
    var complete = count >= TOTAL_DEPTS;
    var color = complete ? 'var(--safe,#00cc88)' : 'var(--echo,#7b2fff)';
    var nudge = complete
      ? '<div style="margin-top:8px;color:var(--safe,#00cc88);font-size:11px;letter-spacing:1px;">◆ Reconstruction complete — submit your Final Verdict.</div>'
      : '<div style="margin-top:8px;color:#6a80a0;font-size:11px;">The reconstruction feeds the verdict — every department strengthens the final case.</div>';
    return '<div style="background:var(--surface,#0a0f1a);border:1px solid var(--border,#22304a);' +
      'border-radius:6px;padding:12px 14px;margin-bottom:20px;">' +
      '<div style="font-size:11px;letter-spacing:1px;color:' + color + ';">' +
      'Departments consolidated: <strong style="color:#fff">' + count + ' / ' + TOTAL_DEPTS + '</strong></div>' +
      nudge + '</div>';
  }

  function evidenceListHtml(items) {
    if (!items.length) {
      return '<div style="background:var(--surface,#0a0f1a);border:1px dashed var(--border,#22304a);' +
        'border-radius:6px;padding:18px;text-align:center;color:#6a80a0;font-size:12px;line-height:1.6;">' +
        'No evidence logged for this department yet.<br>' +
        '<span style="color:#57708f;font-size:11px;">You can still confirm the department was reviewed for the reconstruction.</span></div>';
    }
    return items.map(function (e) {
      return '<label class="cns-ev">' +
        '<input type="checkbox" class="cns-check" value="' + esc(e.id) + '" checked ' +
        'style="accent-color:var(--echo,#7b2fff);margin-top:2px;">' +
        '<span><span class="cns-id">' + esc(e.id) + '</span> — ' + esc(e.label) + '</span>' +
        '</label>';
    }).join('');
  }

  function openPanel() {
    try {
      if (!window.NEXORA || !NEXORA.state) return;
      closePanel();

      var role = currentRole();
      var meta = roleMeta(role);
      var cat  = categoryFor(role);
      var items = loggedForRole(role);
      var already = consolidated.has(role);

      var overlay = document.createElement('div');
      overlay.id = 'consolidate-overlay';
      overlay.addEventListener('click', function (ev) {
        if (ev.target === overlay) closePanel();
      });

      overlay.innerHTML =
        '<div class="cns-card">' +
          '<div style="font-family:var(--font-display,\'Share Tech Mono\',monospace);font-size:13px;' +
            'letter-spacing:3px;color:var(--echo,#7b2fff);margin-bottom:6px;text-transform:uppercase;">' +
            '📋 Reconstruction — ' + esc(meta.label) + '</div>' +
          '<div style="font-size:12px;color:' + (meta.color || '#8aaabb') + ';letter-spacing:1px;margin-bottom:14px;">' +
            'Evidence category: <strong>' + esc(cat) + '</strong></div>' +

          '<div style="font-size:11px;color:#8aaabb;line-height:1.8;margin-bottom:20px;' +
            'border-left:2px solid var(--echo,#7b2fff);padding-left:12px;">' +
            'Echo is interfering with the record. Consolidate your department\'s findings into the shared ' +
            'reconstruction before the data degrades.<br>' +
            '<span style="color:#6a80a0">Naming the killer was only the first stage — this reconstruction feeds ' +
            'the Final Verdict, where the questions about Echo itself decide how deep the truth runs.</span>' +
          '</div>' +

          progressLine() +

          (already
            ? '<div style="background:rgba(0,204,136,0.08);border:1px solid var(--safe,#00cc88);border-radius:6px;' +
              'padding:10px 12px;margin-bottom:16px;color:#c9ffe4;font-size:11px;letter-spacing:1px;">' +
              '✓ This department has already been submitted. You may re-submit to update the reconstruction.</div>'
            : '') +

          '<div style="font-family:var(--font-display,\'Share Tech Mono\',monospace);font-size:10px;' +
            'letter-spacing:2px;color:#6a80a0;margin-bottom:10px;text-transform:uppercase;">' +
            esc(cat) + ' evidence to submit</div>' +

          '<div id="cns-list">' + evidenceListHtml(items) + '</div>' +

          '<div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;">' +
            '<button type="button" class="cns-btn" id="cns-submit">Submit to reconstruction</button>' +
            '<button type="button" class="cns-cancel" id="cns-cancel">Cancel</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);
      panelOpen = true;
      lastRole = role;

      var sub = document.getElementById('cns-submit');
      var can = document.getElementById('cns-cancel');
      if (sub) sub.onclick = function () { submit(role); };
      if (can) can.onclick = closePanel;
    } catch (e) { /* never block input */ }
  }

  function closePanel() {
    try {
      var o = document.getElementById('consolidate-overlay');
      if (o) o.remove();
    } catch (e) { /* ignore */ }
    panelOpen = false;
  }

  // ── SUBMIT ───────────────────────────────────────────────────
  function submit(role) {
    try {
      role = role || currentRole();
      var meta = roleMeta(role);
      var cat  = categoryFor(role);

      var n = 0;
      try {
        var boxes = document.querySelectorAll('#consolidate-overlay .cns-check');
        for (var i = 0; i < boxes.length; i++) if (boxes[i].checked) n++;
      } catch (e) { /* count stays 0 */ }

      consolidated.add(role);
      saveConsolidated();

      var color = meta.color || '#8aaabb';
      var msg = (n > 0)
        ? '📋 Submitted ' + n + ' piece(s) of ' + cat + ' evidence to the reconstruction.'
        : '📋 ' + cat + ' department reviewed for the reconstruction — no evidence to submit.';
      try { if (NEXORA.addChatMessage) NEXORA.addChatMessage(role, msg, color); } catch (e) {}

      var count = deptCount();
      try {
        if (NEXORA.showNotification) {
          if (count >= TOTAL_DEPTS) {
            NEXORA.showNotification('Reconstruction Complete',
              'All ' + TOTAL_DEPTS + ' departments consolidated. Submit your Final Verdict.', 'echo', 7000);
          } else {
            NEXORA.showNotification('Evidence Submitted',
              esc(cat) + ' findings added — ' + count + '/' + TOTAL_DEPTS + ' departments consolidated.', 'info', 5000);
          }
        }
      } catch (e) {}

      closePanel();
      refreshButton();
    } catch (e) { /* never block input */ }
  }

  // ── AVAILABILITY ─────────────────────────────────────────────
  function checkAvailability() {
    try {
      if (unlocked) { watchRole(); return; }
      if (!window.NEXORA || !NEXORA.state) return;

      var min = 0;
      try { min = NEXORA.getMinutes ? NEXORA.getMinutes() : 0; } catch (e) { min = 0; }
      var found = 0;
      try { found = (NEXORA.state.evidenceFound && NEXORA.state.evidenceFound.size) || 0; } catch (e) { found = 0; }

      var ready = (min >= UNLOCK_MIN) || (min >= EARLY_MIN && found >= EARLY_EVIDENCE);
      if (!ready) return;

      unlocked = true;
      getButton();

      if (!announced) {
        announced = true;
        try {
          if (NEXORA.showNotification) {
            NEXORA.showNotification('⚠ Reconstruction Mode',
              'Echo is interfering. Consolidate your department\'s findings.', 'echo', 9000);
          }
        } catch (e) {}
      }
    } catch (e) { /* non-fatal */ }
  }

  // Reflect NEXORA.state.currentRole changes on the button + open panel.
  function watchRole() {
    try {
      var role = currentRole();
      if (role === lastRole) return;
      lastRole = role;
      refreshButton();
      if (panelOpen) openPanel();  // re-render for the newly active department
    } catch (e) { /* non-fatal */ }
  }

  // ── SELF-INIT (mirrors verdict.js) ───────────────────────────
  var poll = setInterval(function () {
    try {
      if (window.NEXORA && NEXORA.state && NEXORA.state.started) {
        checkAvailability();
      }
    } catch (e) { /* never throw from the poll */ }
  }, 5000);

  return {
    checkAvailability: checkAvailability,
    open: openPanel,
    close: closePanel,
    isConsolidated: function (role) { try { return consolidated.has(role || currentRole()); } catch (e) { return false; } },
    departments: function () { return deptCount(); },
    _poll: poll
  };

})();
