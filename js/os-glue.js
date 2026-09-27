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

    // ── c. Role → v6 desktop / terminal switching (all 8 roles) ────────────
    // Ensure the NEXORA terminal shell can fully overlay the v6 desktop.
    (function ensureTerminalOverlay() {
      const s = document.createElement('style');
      s.textContent = '#terminal-shell.active{position:fixed;inset:0;z-index:9000;display:flex;}';
      document.head.appendChild(s);
    })();

    let desktopEntered = false;
    let shownRole = null;

    function isTechRole(roleKey) {
      const r = (typeof NEXORA !== 'undefined' && NEXORA.ROLES) ? NEXORA.ROLES[roleKey] : null;
      return !!(r && r.shell === 'terminal');
    }

    // Show a role: Tech → terminal overlay (hide v6 desktop); win7 role → v6
    // desktop with that role's icons. Idempotent per role via shownRole guard,
    // so it works for the initial boot AND every later single-player switch.
    function osBootRole(roleKey) {
      if (!roleKey || roleKey === shownRole) return;
      shownRole = roleKey;

      const ts = document.getElementById('terminal-shell');
      const screen = document.getElementById('screen'); // v6 desktop root

      if (isTechRole(roleKey)) {
        if (ts) ts.classList.add('active');
        if (screen) screen.style.visibility = 'hidden';
        return;
      }

      // win7 role
      if (ts) ts.classList.remove('active');
      if (screen) screen.style.visibility = '';
      document.getElementById('boot')?.classList.add('hidden');
      document.getElementById('login')?.classList.add('hidden');
      if (!desktopEntered) {
        try { window.V6.enterDesktop(); } catch (e) { console.error('[os-glue] enterDesktop', e); }
        desktopEntered = true;
      }
      const roleDef = (typeof WIN7_ROLES !== 'undefined') ? WIN7_ROLES[roleKey] : null;
      if (roleDef) paintRoleIcons(roleDef);
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

      // Also surface v6's real built-in Windows-7 apps on every role desktop,
      // so it reads as an actual workstation (File Explorer, Task Manager,
      // Notepad, Control Panel, Recycle Bin) — per the "real PC" blueprint.
      const builtins = [
        { app: 'explorer', emoji: '🗂️', label: 'Computer' },
        { app: 'taskmgr',  emoji: '📊', label: 'Task Manager' },
        { app: 'notepad',  emoji: '📝', label: 'Notepad' },
        { app: 'control',  emoji: '⚙️', label: 'Control Panel' },
      ];
      builtins.forEach(b => {
        if (!window.V6.APP_META || !window.V6.APP_META[b.app]) return; // only if v6 has it
        const d = document.createElement('div');
        d.className = 'desk-icon';
        d.innerHTML =
          `<div class="icon-art" style="font-size:34px;line-height:44px">${b.emoji}</div>` +
          `<div class="icon-label">${b.label}</div>`;
        d.addEventListener('click', () => {
          document.querySelectorAll('#desktop-icons .desk-icon').forEach(x => x.classList.remove('selected'));
          d.classList.add('selected');
        });
        d.addEventListener('dblclick', () => {
          try { window.V6.openWindow(b.app, { singleton: true }); } catch (e) { console.error('[os-glue] open builtin', b.app, e); }
        });
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

    // Catch role switches that bypass the wrapper: NEXORA.nextRole() and the
    // role-switcher dropdown both call the module-INTERNAL setRole closure, so
    // watch currentRole and re-show the v6 desktop / terminal on any change.
    setInterval(() => {
      try {
        if (typeof NEXORA !== 'undefined' && NEXORA.state && NEXORA.state.started) {
          const cr = NEXORA.state.currentRole;
          if (cr && cr !== shownRole) osBootRole(cr);
        }
      } catch (e) { /* ignore */ }
    }, 400);

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
