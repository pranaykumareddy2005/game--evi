/**
 * NEXORA: THE ECHO PROTOCOL
 * onboarding.js — First-run coach overlay + lightweight tooltips
 * ============================================================
 * Self-contained IIFE. Read-only use of NEXORA globals.
 * Exposes window.ONBOARD (with .replay()).
 */
window.ONBOARD = (function () {
  'use strict';

  var FLAG = 'nexora_onboarded';
  var OVERLAY_ID = 'onboard-overlay';
  var STYLE_ID = 'onboard-style';
  var watchInterval = null;
  var tooltipsDone = false;

  // ── localStorage helpers (never throw) ──────────────────────
  function wasShown() {
    try { return localStorage.getItem(FLAG) === '1'; }
    catch (e) { return false; }
  }
  function markShown() {
    try { localStorage.setItem(FLAG, '1'); } catch (e) {}
  }

  // ── Role hint ───────────────────────────────────────────────
  function roleHint() {
    try {
      var role = NEXORA.state.currentRole;
      var def = NEXORA.ROLES && NEXORA.ROLES[role];
      if (def && def.label) {
        // Strip emoji/leading symbols, keep readable label text.
        var txt = String(def.label).replace(/\s+/g, ' ').trim();
        return 'You are playing: ' + txt;
      }
    } catch (e) {}
    return '';
  }

  // ── Steps ───────────────────────────────────────────────────
  var STEPS = [
    {
      title: '🔍 Find evidence',
      body: "Open your department's tools (desktop icons, or the terminal if you're Tech). Evidence unlocks over the 3-hour timeline — keep re-checking your apps."
    },
    {
      title: '💬 Share findings',
      body: "No single department can solve this. Use the chat (💬 bottom-right) to compare notes — some clues only make sense combined across teams."
    },
    {
      title: '⬡ Build the case',
      body: "Open the ⬡ BOARD (bottom-left) to connect evidence and mark suspects, then hit SUBMIT FINAL VERDICT when you're ready."
    }
  ];

  // ── Styles ──────────────────────────────────────────────────
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css = ''
      + '#' + OVERLAY_ID + '{position:fixed;inset:0;z-index:9300;display:flex;'
      + 'align-items:center;justify-content:center;padding:16px;box-sizing:border-box;'
      + 'background:rgba(3,6,12,0.86);backdrop-filter:blur(3px);'
      + 'font-family:var(--font-mono,monospace);animation:onbFade .25s ease;}'
      + '#' + OVERLAY_ID + ' .onb-card{position:relative;width:100%;max-width:460px;'
      + 'box-sizing:border-box;background:var(--panel,#0c1017);'
      + 'border:1px solid var(--border-glow,rgba(0,255,65,0.35));'
      + 'border-radius:10px;padding:26px 22px 20px;'
      + 'box-shadow:0 0 30px rgba(0,0,0,0.6),0 0 18px var(--echo,rgba(0,255,65,0.25));'
      + 'color:#e6f0ea;}'
      + '#' + OVERLAY_ID + ' .onb-role{font-size:11px;letter-spacing:1px;'
      + 'text-transform:uppercase;color:var(--pulse,#00e0ff);margin:0 0 12px;'
      + 'opacity:.85;word-break:break-word;}'
      + '#' + OVERLAY_ID + ' .onb-title{font-family:var(--font-display,var(--font-mono,monospace));'
      + 'font-size:20px;margin:0 0 12px;color:var(--echo,#00ff41);line-height:1.25;}'
      + '#' + OVERLAY_ID + ' .onb-body{font-size:14px;line-height:1.6;margin:0 0 20px;'
      + 'color:#cdd8d2;}'
      + '#' + OVERLAY_ID + ' .onb-dots{display:flex;gap:8px;margin:0 0 18px;}'
      + '#' + OVERLAY_ID + ' .onb-dot{width:9px;height:9px;border-radius:50%;'
      + 'background:rgba(255,255,255,0.18);transition:background .2s,transform .2s;}'
      + '#' + OVERLAY_ID + ' .onb-dot.active{background:var(--echo,#00ff41);transform:scale(1.15);}'
      + '#' + OVERLAY_ID + ' .onb-actions{display:flex;justify-content:space-between;'
      + 'align-items:center;gap:12px;flex-wrap:wrap;}'
      + '#' + OVERLAY_ID + ' button{font-family:var(--font-mono,monospace);font-size:13px;'
      + 'cursor:pointer;border-radius:6px;padding:9px 16px;transition:filter .15s,background .15s;}'
      + '#' + OVERLAY_ID + ' .onb-skip{background:transparent;color:#8a988f;'
      + 'border:1px solid rgba(255,255,255,0.15);}'
      + '#' + OVERLAY_ID + ' .onb-skip:hover{color:#cdd8d2;border-color:rgba(255,255,255,0.3);}'
      + '#' + OVERLAY_ID + ' .onb-next{background:var(--echo,#00ff41);color:#04120a;'
      + 'border:1px solid var(--echo,#00ff41);font-weight:700;letter-spacing:.5px;}'
      + '#' + OVERLAY_ID + ' .onb-next:hover{filter:brightness(1.12);}'
      + '@keyframes onbFade{from{opacity:0}to{opacity:1}}'
      + '@media (max-width:480px){#' + OVERLAY_ID + ' .onb-card{padding:22px 16px 16px;}'
      + '#' + OVERLAY_ID + ' .onb-title{font-size:18px;}}';
    try {
      var el = document.createElement('style');
      el.id = STYLE_ID;
      el.textContent = css;
      document.head.appendChild(el);
    } catch (e) {}
  }

  // ── Coach sequence ──────────────────────────────────────────
  function show() {
    try {
      if (document.getElementById(OVERLAY_ID)) return; // already open
      injectStyle();

      var idx = 0;
      var overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;

      var card = document.createElement('div');
      card.className = 'onb-card';

      var roleEl = document.createElement('p');
      roleEl.className = 'onb-role';
      var hint = roleHint();
      if (hint) roleEl.textContent = hint; else roleEl.style.display = 'none';

      var titleEl = document.createElement('h2');
      titleEl.className = 'onb-title';

      var bodyEl = document.createElement('p');
      bodyEl.className = 'onb-body';

      var dotsEl = document.createElement('div');
      dotsEl.className = 'onb-dots';
      var dots = [];
      for (var i = 0; i < STEPS.length; i++) {
        var d = document.createElement('span');
        d.className = 'onb-dot';
        dotsEl.appendChild(d);
        dots.push(d);
      }

      var actions = document.createElement('div');
      actions.className = 'onb-actions';

      var skipBtn = document.createElement('button');
      skipBtn.className = 'onb-skip';
      skipBtn.type = 'button';
      skipBtn.textContent = 'Skip';

      var nextBtn = document.createElement('button');
      nextBtn.className = 'onb-next';
      nextBtn.type = 'button';

      actions.appendChild(skipBtn);
      actions.appendChild(nextBtn);

      card.appendChild(roleEl);
      card.appendChild(titleEl);
      card.appendChild(bodyEl);
      card.appendChild(dotsEl);
      card.appendChild(actions);
      overlay.appendChild(card);
      document.body.appendChild(overlay);

      function render() {
        var s = STEPS[idx];
        titleEl.textContent = s.title;
        bodyEl.textContent = s.body;
        for (var j = 0; j < dots.length; j++) {
          dots[j].className = 'onb-dot' + (j === idx ? ' active' : '');
        }
        nextBtn.textContent = (idx === STEPS.length - 1) ? "Let's go" : 'Next';
      }

      function close() {
        markShown();
        try { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); } catch (e) {}
        applyTooltips();
      }

      nextBtn.addEventListener('click', function () {
        if (idx < STEPS.length - 1) { idx++; render(); }
        else { close(); }
      });
      skipBtn.addEventListener('click', close);
      overlay.addEventListener('click', function (ev) {
        if (ev.target === overlay) close();
      });

      render();
    } catch (e) {
      // If anything fails, still flag as shown so we don't loop.
      markShown();
    }
  }

  // ── Tooltips ────────────────────────────────────────────────
  var TIP_MAP = {
    '#chat-toggle': 'Cross-team chat — share findings',
    '#role-select': 'Switch department (single player)',
    '#verdict-btn': 'Submit your final verdict',
    '#board-toggle': 'Open the investigation board',
    '#board-btn': 'Open the investigation board'
  };

  function setTip(sel, text) {
    try {
      var el = document.querySelector(sel);
      if (el && !el.getAttribute('title')) el.setAttribute('title', text);
    } catch (e) {}
  }

  function applyTooltips() {
    try {
      for (var sel in TIP_MAP) {
        if (Object.prototype.hasOwnProperty.call(TIP_MAP, sel)) setTip(sel, TIP_MAP[sel]);
      }
    } catch (e) {}
  }

  // True once every TIP_MAP control that exists in the DOM carries a title,
  // so the observer can stop early instead of churning for the full timeout.
  function allTooltipsResolved() {
    try {
      for (var sel in TIP_MAP) {
        if (!Object.prototype.hasOwnProperty.call(TIP_MAP, sel)) continue;
        var el = document.querySelector(sel);
        if (el && !el.getAttribute('title')) return false;
      }
      return true;
    } catch (e) { return true; }
  }

  function startTooltipWatch() {
    if (tooltipsDone) return;
    tooltipsDone = true;
    applyTooltips();
    // Late-appearing controls (verdict/board buttons) — observe + delayed passes.
    // Narrow the observer's lifetime: disconnect as soon as every present
    // control is titled, and cap the fallback at ~10s (was 60s) to cut churn.
    // The timed passes below still catch any control that appears afterward.
    try {
      if (typeof MutationObserver !== 'undefined' && document.body) {
        var mo = new MutationObserver(function () {
          try {
            applyTooltips();
            if (allTooltipsResolved()) { try { mo.disconnect(); } catch (e) {} }
          } catch (e) {}
        });
        mo.observe(document.body, { childList: true, subtree: true });
        // Stop observing after a short window to stay light.
        setTimeout(function () { try { mo.disconnect(); } catch (e) {} }, 10000);
      }
    } catch (e) {}
    setTimeout(applyTooltips, 1500);
    setTimeout(applyTooltips, 5000);
  }

  // ── Self-init ───────────────────────────────────────────────
  function tick() {
    try {
      if (typeof NEXORA === 'undefined' || !NEXORA.state || !NEXORA.state.started) return;
      startTooltipWatch();
      if (!wasShown()) show();
      if (watchInterval) { clearInterval(watchInterval); watchInterval = null; }
    } catch (e) {}
  }

  try { watchInterval = setInterval(tick, 1000); } catch (e) {}

  // ── Public API ──────────────────────────────────────────────
  return {
    replay: function () {
      try { localStorage.removeItem(FLAG); } catch (e) {}
      show();
    },
    show: show
  };
})();
