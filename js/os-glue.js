/* ============================================================================
 * os-glue.js — NEXORA → Windows-7 v6 migration bridge (Finance spike)
 * ----------------------------------------------------------------------------
 * Mounts the modular NEXORA game onto v6's real window manager WITHOUT touching
 * index.html, win7-roles.js, game-state.js or any existing NEXORA module.
 *
 * How the Finance flow works end-to-end:
 *   storyboard.js STORYBOARD.init()  → home / mode-select / role-select
 *     → Single Player → FINANCE → STORYBOARD.startGame()
 *       → NEXORA.setRole('finance')            (game-state.js)
 *         ↳ its own win7 branch calls loadWin7Role('finance'), which NO-OPS here
 *           because NEXORA's #win7-shell was dropped from nexora-os.html.
 *         ↳ our wrapper then runs osBootRole('finance'):
 *              - hides v6 boot/login splash
 *              - V6.enterDesktop()  → real v6 desktop + Start menu + taskbar
 *              - repaints v6's #desktop-icons with the Finance role icons,
 *                each dblclick → WIN7_ACTIONS[icon.action](icon)
 *   A Finance app (openFinancePro / openDocVault / openAnomalyScanner …) calls
 *   the global openWindow(title, html, opts), which we override to route through
 *   V6.openWindow('docwin', …) → a REAL v6 window. Evidence still logs via
 *   NEXORA.markFound (unchanged inside win7-roles.js).
 * ==========================================================================*/
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.V6) {
      console.error('[os-glue] window.V6 bridge missing — v6 engine did not export.');
      return;
    }

    // ── a. Route every NEXORA html-string window through a real v6 window ──
    // win7-roles.js calls the bare global openWindow(title, html, opts); we
    // shadow the game-state.js global so those windows render inside v6.
    window.openWindow = function (title, html, opts) {
      opts = opts || {};
      return window.V6.openWindow('docwin', {
        title: title,
        html: html,
        width: opts.width,
        height: opts.height,
        singleton: false
      });
    };

    // ── c. Boot a role's desktop onto the v6 engine ────────────────────────
    const bootedRoles = new Set();

    function osBootRole(roleKey) {
      if (bootedRoles.has(roleKey)) return;

      // NEXORA / STORYBOARD / WIN7_* are top-level `const` globals (lexical
      // bindings, reachable as bare identifiers but NOT as window.X).
      const role = (typeof NEXORA !== 'undefined' && NEXORA.ROLES && NEXORA.ROLES[roleKey]) || null;

      // Tech / terminal roles: reveal the NEXORA terminal shell, DO NOT boot the
      // v6 desktop. NEXORA.setRole already called initTerminal() for these.
      // (Out of scope for this spike — stub only.)
      if (role && role.shell === 'terminal') {
        const ts = document.getElementById('terminal-shell');
        if (ts) ts.classList.add('active');
        return;
      }

      // win7 roles (finance, hr, ops, marketing, legal, product, exec)
      const roleDef = (typeof WIN7_ROLES !== 'undefined') ? WIN7_ROLES[roleKey] : null;
      if (!roleDef) return; // unknown/unbooted role — no-op for the spike
      bootedRoles.add(roleKey);

      // Hide v6's own boot + login splash (auto-boot was neutralized, so they
      // are still in their initial state and would otherwise cover the screen).
      document.getElementById('boot')?.classList.add('hidden');
      document.getElementById('login')?.classList.add('hidden');

      // Bring up the REAL v6 desktop: shows #desktop, renders default icons,
      // Start menu, taskbar + clock, plays startup chrome.
      window.V6.enterDesktop();

      // Replace v6's default desktop icons with this role's app icons.
      paintRoleIcons(roleDef);
    }

    function paintRoleIcons(roleDef) {
      const host = document.getElementById('desktop-icons'); // v6's container
      if (!host) return;
      host.innerHTML = '';
      roleDef.icons.forEach(icon => {
        const d = document.createElement('div');
        d.className = 'desk-icon';
        d.innerHTML =
          `<div class="icon-art" style="font-size:34px;line-height:44px">${icon.emoji || '📄'}</div>` +
          `<div class="icon-label">${icon.label}</div>`;
        d.addEventListener('click', () => {
          document.querySelectorAll('#desktop-icons .desk-icon')
            .forEach(x => x.classList.remove('selected'));
          d.classList.add('selected');
        });
        if (icon.locked) {
          d.addEventListener('dblclick', () =>
            NEXORA.showNotification('Access Denied',
              'ECHO has restricted access to this module.', 'danger'));
        } else if (icon.action) {
          // Mirrors loadWin7Role's dispatch (win7-roles.js ~123).
          d.addEventListener('dblclick', () => WIN7_ACTIONS[icon.action]?.(icon));
        }
        host.appendChild(d);
      });
    }

    // Wrap NEXORA.setRole so a role boot also drives the v6 desktop. startGame()
    // (storyboard.js) calls NEXORA.setRole(role) exactly, so this fires on the
    // storyboard → role selection. Guarded to run each role's boot only once.
    if (typeof NEXORA !== 'undefined' && typeof NEXORA.setRole === 'function') {
      const _setRole = NEXORA.setRole;
      NEXORA.setRole = function (k) {
        _setRole.call(NEXORA, k);
        try { osBootRole(k); } catch (e) { console.error('[os-glue] osBootRole failed', e); }
      };
    }

    // Expose for debugging / the role-switcher fallback.
    window.osBootRole = osBootRole;

    // ── b. Start the NEXORA game UI (home / mode / role select) ────────────
    const sel = document.getElementById('role-select');
    if (sel) sel.disabled = true; // matches index.html: locked until game starts
    if (typeof STORYBOARD !== 'undefined' && typeof STORYBOARD.init === 'function') {
      STORYBOARD.init();
    } else {
      console.error('[os-glue] STORYBOARD.init unavailable.');
    }
  });
})();
