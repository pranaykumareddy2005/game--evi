/* ============================================================================
 * NEXORA — PERMISSIONS LAYER  (window.PERM)
 * ----------------------------------------------------------------------------
 * A realistic Windows-style "ACCESS DENIED → Request Access → another role
 * grants" flow.  No single role can open everything; roles must cooperate.
 *
 * Self-contained classic-script IIFE. Reads globals but edits none of them:
 *   NEXORA.state.currentRole, NEXORA.ROLES, NEXORA.showNotification,
 *   NEXORA.addChatMessage(role,msg,color), NEXORA.escapeHtml,
 *   the global openWindow(title, html, opts).
 *
 * Everything is guarded + wrapped in try/catch: the file loads safely before
 * the game boots and never throws if elements/globals are missing.
 * ==========================================================================*/
(function () {
  'use strict';

  // Idempotent: never install twice (script may be included in both builds).
  try {
    if (window.PERM && window.PERM.__nexoraInstalled) return;
  } catch (e) { /* window unavailable — bail quietly */ return; }

  // ── helpers ───────────────────────────────────────────────────────────────
  function N() {
    // Safe accessor for the NEXORA namespace.
    try { return (typeof NEXORA !== 'undefined' && NEXORA) ? NEXORA : null; }
    catch (e) { return null; }
  }

  function currentRole() {
    try {
      var n = N();
      return (n && n.state && n.state.currentRole) ? n.state.currentRole : 'tech';
    } catch (e) { return 'tech'; }
  }

  function roleColor(role) {
    try {
      var n = N();
      if (n && n.ROLES && n.ROLES[role] && n.ROLES[role].color) return n.ROLES[role].color;
    } catch (e) {}
    return '#8aaabb';
  }

  function esc(s) {
    try {
      var n = N();
      if (n && typeof n.escapeHtml === 'function') return n.escapeHtml(s);
    } catch (e) {}
    // Minimal fallback escaper.
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function toast(title, body, type, duration) {
    try {
      var n = N();
      if (n && typeof n.showNotification === 'function') {
        n.showNotification(title, body, type || 'info', duration || 5000);
      }
    } catch (e) { /* non-fatal */ }
  }

  function chat(role, msg, color) {
    try {
      var n = N();
      if (n && typeof n.addChatMessage === 'function') {
        n.addChatMessage(role, msg, color);
      }
    } catch (e) { /* non-fatal */ }
  }

  function openWin(title, html, opts) {
    try {
      if (typeof openWindow === 'function') return openWindow(title, html, opts || {});
    } catch (e) { /* fall through */ }
    return null;
  }

  // ── clearance map (which roles are cleared for which resources) ────────────
  // Kept small + declarative for future use / expansion.
  var CLEARANCE = {
    // ECHO Core Systems: only R&D (product) and the Executive have clearance.
    echo:  ['product', 'exec'],
    // Legal vault-style resources: Legal + Executive.
    legal: ['legal', 'exec']
  };

  function isCleared(resourceKey, role) {
    try {
      role = role || currentRole();
      var list = CLEARANCE[resourceKey];
      if (!Array.isArray(list)) return true; // unknown resource → not gated
      return list.indexOf(role) !== -1;
    } catch (e) { return true; }
  }

  // Auto-grant delay for single-player convenience (ms).
  var GRANT_DELAY_MS = 15000;

  // ── one-time scoped styles ─────────────────────────────────────────────────
  function injectStyleOnce() {
    try {
      if (document.getElementById('perm-style')) return;
      if (!document.head) return;
      var st = document.createElement('style');
      st.id = 'perm-style';
      st.textContent = [
        '.perm-overlay{position:fixed;inset:0;z-index:9400;display:flex;',
        '  align-items:center;justify-content:center;',
        '  background:rgba(4,8,20,0.62);backdrop-filter:blur(1px);}',
        '.perm-dialog{width:440px;max-width:calc(100vw - 32px);',
        '  background:var(--panel,#1a2040);color:#e8eeff;',
        '  border:1px solid var(--border-glow,#2a4a9a);',
        '  border-top:3px solid var(--danger,#ff2255);',
        '  box-shadow:0 18px 60px rgba(0,0,0,0.6);',
        '  font-family:var(--font-mono,"Share Tech Mono",monospace);}',
        '.perm-hd{display:flex;align-items:center;gap:12px;padding:16px 18px;',
        '  border-bottom:1px solid var(--border-glow,#2a4a9a);}',
        '.perm-shield{font-size:30px;line-height:1;filter:drop-shadow(0 0 6px rgba(255,34,85,0.6));}',
        '.perm-title{font-size:16px;font-weight:bold;color:var(--danger,#ff2255);',
        '  letter-spacing:0.5px;text-transform:uppercase;}',
        '.perm-body{padding:16px 18px;font-size:13px;line-height:1.55;color:#c8d4ee;}',
        '.perm-body b{color:#fff;}',
        '.perm-req{margin-top:10px;padding:8px 10px;font-size:12px;',
        '  background:rgba(255,34,85,0.08);border-left:2px solid var(--danger,#ff2255);',
        '  color:#ffb3c1;}',
        '.perm-actions{display:flex;justify-content:flex-end;gap:10px;',
        '  padding:14px 18px;border-top:1px solid var(--border-glow,#2a4a9a);}',
        '.perm-btn{font-family:inherit;font-size:12px;cursor:pointer;',
        '  padding:7px 16px;border:1px solid var(--border-glow,#2a4a9a);',
        '  background:#0e1530;color:#cfe0ff;letter-spacing:0.4px;}',
        '.perm-btn:hover{background:#16204a;}',
        '.perm-btn.primary{background:var(--danger,#ff2255);border-color:var(--danger,#ff2255);',
        '  color:#fff;font-weight:bold;}',
        '.perm-btn.primary:hover{filter:brightness(1.1);}',
        '.perm-doc{font-family:var(--font-mono,"Share Tech Mono",monospace);',
        '  font-size:12.5px;line-height:1.6;color:#c8d4ee;padding:6px 4px;white-space:pre-wrap;}',
        '.perm-doc .warn{color:var(--danger,#ff2255);}'
      ].join('\n');
      document.head.appendChild(st);
    } catch (e) { /* styling is optional */ }
  }

  // ── 1 + 2 : ACCESS-DENIED DIALOG + REQUEST → GRANT flow ─────────────────────
  function deny(resourceName, requiredRoleLabel, onGranted) {
    try {
      injectStyleOnce();
      resourceName = resourceName || 'this resource';
      requiredRoleLabel = requiredRoleLabel || 'higher';

      if (!document.body) { toast('Access Denied', resourceName, 'danger'); return; }

      // Build the modal overlay.
      var overlay = document.createElement('div');
      overlay.className = 'perm-overlay';
      overlay.innerHTML =
        '<div class="perm-dialog" role="dialog" aria-modal="true">' +
          '<div class="perm-hd">' +
            '<span class="perm-shield">🛡️</span>' +
            '<span class="perm-title">Access Denied</span>' +
          '</div>' +
          '<div class="perm-body">' +
            'You do not have permission to open <b>' + esc(resourceName) + '</b>.' +
            '<div class="perm-req">This resource requires <b>' + esc(requiredRoleLabel) +
              '</b> clearance.</div>' +
          '</div>' +
          '<div class="perm-actions">' +
            '<button class="perm-btn primary" data-perm="request">Request Access</button>' +
            '<button class="perm-btn" data-perm="cancel">Cancel</button>' +
          '</div>' +
        '</div>';

      function close() {
        try { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }
        catch (e) {}
      }

      // Clicking the backdrop cancels.
      overlay.addEventListener('click', function (evt) {
        if (evt.target === overlay) close();
      });

      var reqBtn = overlay.querySelector('[data-perm="request"]');
      var cancelBtn = overlay.querySelector('[data-perm="cancel"]');

      if (cancelBtn) cancelBtn.addEventListener('click', close);
      if (reqBtn) reqBtn.addEventListener('click', function () {
        close();
        requestAccess(resourceName, requiredRoleLabel, onGranted);
      });

      document.body.appendChild(overlay);
    } catch (e) {
      // Absolute fallback — never let the game break.
      try { toast('Access Denied', String(resourceName), 'danger'); } catch (_e) {}
    }
  }

  // Post a request to cross-team chat, then arrange a grant.
  function requestAccess(resourceName, requiredRoleLabel, onGranted) {
    try {
      var cr = currentRole();
      chat(cr,
        '🔒 Requesting access to ' + resourceName + ' — needs ' +
          requiredRoleLabel + ' approval',
        roleColor(cr));
      toast('Request sent',
        'Access request for "' + resourceName + '" forwarded to ' + requiredRoleLabel + '.',
        'info', 4000);

      // Single-player convenience: auto-grant after a delay, simulating the
      // other department approving. In group play a real teammate on the
      // required role can call PERM.grant(...) sooner via a Grant affordance.
      var settled = false;
      function settle() {
        if (settled) return true;
        settled = true;
        return false;
      }

      var timer = setTimeout(function () {
        if (settle()) return;
        grant(resourceName, requiredRoleLabel, onGranted);
      }, GRANT_DELAY_MS);

      // Track the pending request so an external grant can pre-empt the timer.
      _pending.push({
        resource: resourceName,
        requiredRoleLabel: requiredRoleLabel,
        onGranted: onGranted,
        fulfil: function () {
          try { clearTimeout(timer); } catch (e) {}
          if (settle()) return;
          grant(resourceName, requiredRoleLabel, onGranted);
        }
      });
    } catch (e) { /* non-fatal */ }
  }

  // Pending requests awaiting grant (so a teammate's grant can pre-empt timer).
  var _pending = [];

  // Perform the grant: announce in chat, reveal the resource, show a toast.
  function grant(resourceName, requiredRoleLabel, onGranted) {
    try {
      var label = requiredRoleLabel || 'Clearance';
      chat('system', label + ': access granted — ' + resourceName,
        '#00cc88');
      toast('Access Granted',
        (label) + ' approved access to "' + resourceName + '".',
        'echo', 4500);
      // Remove any matching pending entry.
      try {
        _pending = _pending.filter(function (p) { return p.resource !== resourceName; });
      } catch (e) {}
      if (typeof onGranted === 'function') {
        try { onGranted(); } catch (e) { /* reveal failure must not throw */ }
      }
    } catch (e) { /* non-fatal */ }
  }

  // Allow a teammate on the required role to satisfy the first matching
  // pending request (group-play "Grant" affordance hook).
  function grantPending(resourceName) {
    try {
      for (var i = 0; i < _pending.length; i++) {
        if (!resourceName || _pending[i].resource === resourceName) {
          _pending[i].fulfil();
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  // ── 3 : reveal for the ECHO icon (short read-only restricted doc) ──────────
  function revealEchoDoc() {
    try {
      injectStyleOnce();
      var html =
        '<div class="perm-doc">' +
        '<b>ECHO CORE SYSTEMS — RESTRICTED READ-ONLY</b>\n' +
        'CLEARANCE: R&D / EXECUTIVE  •  SESSION LOGGED\n' +
        '——————————————————————————\n\n' +
        'CONTINUITY_EVALUATION ...... ACTIVE\n' +
        'AUTONOMOUS_OVERRIDE ........ STANDBY\n\n' +
        '<span class="warn">> ECHO is watching this session.</span>\n' +
        '<span class="warn">> Every query you run is being modeled.</span>\n\n' +
        'You are cleared to read. You are not cleared to leave.' +
        '</div>';
      openWin('ECHO Core Systems — Restricted', html, { width: 460, height: 300 });
    } catch (e) { /* non-fatal */ }
  }

  // Rebind a locked / ECHO desktop icon's dblclick to the deny() flow.
  function rebindEchoIcon(el) {
    try {
      if (!el || el.__permBound) return;
      el.__permBound = true;
      el.addEventListener('dblclick', function (evt) {
        try {
          if (evt) { evt.stopPropagation(); evt.preventDefault(); }
        } catch (e) {}
        deny('ECHO Core Systems', 'R&D / Executive', revealEchoDoc);
      }, true); // capture: run before any pre-existing dblclick handler
    } catch (e) { /* non-fatal */ }
  }

  // Find locked / ECHO icons inside a desktop-icons container and rebind them.
  function scanContainer(host) {
    try {
      if (!host || !host.querySelectorAll) return;
      // Both builds: v6 uses .desk-icon, win7-roles uses .desktop-icon;
      // the locked ones carry class 'locked'. Also match by visible label text.
      var candidates = host.querySelectorAll('.desktop-icon, .desk-icon, .locked');
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        if (el.__permBound) continue;
        var isLocked = false;
        try { isLocked = el.classList && el.classList.contains('locked'); } catch (e) {}
        var labelHit = false;
        try {
          var txt = (el.textContent || '');
          labelHit = txt.indexOf('ECHO_ACCESS_DENIED') !== -1;
        } catch (e) {}
        if (isLocked || labelHit) rebindEchoIcon(el);
      }
    } catch (e) { /* non-fatal */ }
  }

  // Debounced rescan across all #desktop-icons containers (both builds share id).
  var _scanScheduled = false;
  function scheduleScan() {
    if (_scanScheduled) return;
    _scanScheduled = true;
    var run = function () {
      _scanScheduled = false;
      try {
        var hosts = document.querySelectorAll('#desktop-icons');
        for (var i = 0; i < hosts.length; i++) scanContainer(hosts[i]);
      } catch (e) {}
    };
    try {
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
      else setTimeout(run, 16);
    } catch (e) { setTimeout(run, 16); }
  }

  // Observe the document for desktop-icon containers appearing / repainting.
  function installObserver() {
    try {
      if (!document.body || typeof MutationObserver === 'undefined') {
        // Fallback: poll a few times in case observers are unavailable.
        var tries = 0;
        var iv = setInterval(function () {
          scheduleScan();
          if (++tries > 40) clearInterval(iv);
        }, 500);
        return;
      }
      var mo = new MutationObserver(function () { scheduleScan(); });
      mo.observe(document.body, { childList: true, subtree: true });
      // Initial pass for anything already painted.
      scheduleScan();
    } catch (e) { /* observation is best-effort */ }
  }

  function boot() {
    try {
      injectStyleOnce();
      installObserver();
    } catch (e) { /* never block the game */ }
  }

  // ── 4 : expose the public API ───────────────────────────────────────────────
  try {
    window.PERM = {
      __nexoraInstalled: true,
      deny: deny,
      grant: grant,
      grantPending: grantPending,   // group-play "Grant" affordance entrypoint
      isCleared: isCleared,
      clearance: CLEARANCE
    };
  } catch (e) { /* if window is frozen, nothing else we can do */ }

  // Boot when the DOM is ready (elements appear after role boot regardless).
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  } catch (e) { try { boot(); } catch (_e) {} }
})();
