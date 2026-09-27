/**
 * NEXORA: THE ECHO PROTOCOL
 * app-word.js — Microsoft Word app with TRACK CHANGES (self-wiring add-on)
 * =======================================================================
 * Adds a realistic Word window to the LEGAL and EXECUTIVE desktops that
 * reveals document tampering of a NEXORA board directive: Adrian Vale's
 * original "discontinued immediately" was quietly changed by Daniel Cross
 * to "reviewed at a later date". The player discovers this by turning
 * Track Changes markup on.
 *
 * Loads AFTER win7-roles.js (classic script). WIN7_ROLES / WIN7_ACTIONS
 * are globals. Everything is guarded so a missing global can never throw.
 */
(function () {
  'use strict';

  // ── 1. Register the action on the shared launcher table ───────────────
  if (typeof WIN7_ACTIONS === 'undefined') return;

  var esc = (typeof NEXORA !== 'undefined' && NEXORA.escapeHtml)
    ? NEXORA.escapeHtml
    : function (s) { return String(s == null ? '' : s); };

  // Track which view is showing so the toggle button knows what to flip to.
  // Module-level so it survives re-renders of the #wd-doc container.
  var WD_MODE = 'markup'; // 'markup' = All Markup (tampering visible), 'final' = Final (clean)

  // ── Tie the discovery into the case file ──────────────────────────────
  function wdRegisterEvidence() {
    try {
      if (typeof NEXORA === 'undefined') return;
      if (NEXORA.isUnlocked && NEXORA.isUnlocked('H-02')) {
        if (NEXORA.markFound) NEXORA.markFound('H-02');
        if (NEXORA.showNotification) {
          NEXORA.showNotification(
            'Track Changes',
            'This board directive was altered. Adrian Vale’s original wording was overwritten by another author.',
            'danger'
          );
        }
      }
    } catch (e) { /* never let evidence wiring break the UI */ }
  }

  // ── The tracked document body (two render modes) ──────────────────────
  // FINAL: the accepted/clean text a casual reader would see.
  // MARKUP: strikethrough deletions + underlined insertions with authorship.
  function wdDocInner(mode) {
    if (mode === 'final') {
      // "Final" view — all edits silently applied. Looks innocent.
      return ''
        + '<p class="wd-meta">CONFIDENTIAL — BOARD OF DIRECTORS ONLY</p>'
        + '<h1 class="wd-h1">NEXORA TECHNOLOGIES — BOARD DIRECTIVE</h1>'
        + '<p class="wd-sub">Re: Project Echo — Continuity &amp; Governance</p>'
        + '<div class="wd-fields">'
        +   '<div><span class="wd-lbl">Author:</span> Adrian Vale, Chief Executive Officer</div>'
        +   '<div><span class="wd-lbl">Date:</span> 30 November 2024</div>'
        +   '<div><span class="wd-lbl">Document:</span> Board_Directive_v3.docx</div>'
        + '</div>'
        + '<p class="wd-p">To the Board,</p>'
        + '<p class="wd-p">Following the quarterly review of our autonomous forecasting platform, '
        +   'I am issuing the following directive regarding Project Echo.</p>'
        + '<p class="wd-p"><strong>Resolution 1.</strong> Project Echo should be reviewed at a later date.</p>'
        + '<p class="wd-p"><strong>Resolution 2.</strong> Standard operational oversight will continue '
        +   'under the existing management structure.</p>'
        + '<p class="wd-p">Signed,<br>Adrian Vale</p>';
    }

    // "All Markup" view — the tampering is visible.
    return ''
      + '<p class="wd-meta">CONFIDENTIAL — BOARD OF DIRECTORS ONLY</p>'
      + '<h1 class="wd-h1">NEXORA TECHNOLOGIES — BOARD DIRECTIVE</h1>'
      + '<p class="wd-sub">Re: Project Echo — Continuity &amp; Governance</p>'
      + '<div class="wd-fields">'
      +   '<div><span class="wd-lbl">Author:</span> Adrian Vale, Chief Executive Officer</div>'
      +   '<div><span class="wd-lbl">Date:</span> '
      +     '<span class="wd-del" title="Deleted by Daniel Cross">26 November 2024</span> '
      +     '<span class="wd-ins" title="Inserted by Daniel Cross">30 November 2024</span>'
      +     '<sup class="wd-mark">[2]</sup></div>'
      +   '<div><span class="wd-lbl">Document:</span> Board_Directive_v3.docx</div>'
      + '</div>'
      + '<p class="wd-p">To the Board,</p>'
      + '<p class="wd-p">Following the quarterly review of our autonomous forecasting platform, '
      +   'I am issuing the following directive regarding Project Echo.</p>'
      + '<p class="wd-p"><strong>Resolution 1.</strong> Project Echo should be '
      +   '<span class="wd-del" title="Deleted by Daniel Cross">discontinued immediately, pending independent audit.</span> '
      +   '<span class="wd-ins" title="Inserted by Daniel Cross">reviewed at a later date.</span>'
      +   '<sup class="wd-mark">[1]</sup></p>'
      + '<p class="wd-p"><strong>Resolution 2.</strong> Standard operational oversight will continue '
      +   'under the existing management structure.</p>'
      + '<p class="wd-p wd-del-block" title="Deleted by Daniel Cross">'
      +   '<strong>Resolution 3.</strong> The Board is to be advised of the platform’s '
      +   '₹180 crore market-exposure position, which must be unwound before any further trading.'
      +   '<sup class="wd-mark">[3]</sup></p>'
      + '<p class="wd-p">Signed,<br>Adrian Vale</p>';
  }

  // ── The revision list (Reviewing Pane) — the payoff ───────────────────
  function wdReviewingPane() {
    var rows = [
      {
        n: '[1]', who: 'Daniel Cross', when: '29 Nov 2024, 23:44',
        act: 'Replaced text', from: '“discontinued immediately, pending independent audit.”',
        to: '“reviewed at a later date.”'
      },
      {
        n: '[2]', who: 'Daniel Cross', when: '29 Nov 2024, 23:45',
        act: 'Changed date', from: '26 November 2024', to: '30 November 2024'
      },
      {
        n: '[3]', who: 'Daniel Cross', when: '29 Nov 2024, 23:46',
        act: 'Deleted paragraph',
        from: 'Resolution 3 — ₹180 crore market-exposure disclosure', to: '(removed)'
      }
    ];
    var body = rows.map(function (r) {
      return ''
        + '<div class="wd-rev">'
        +   '<div class="wd-rev-head"><span class="wd-rev-n">' + esc(r.n) + '</span> '
        +     '<span class="wd-rev-who">' + esc(r.who) + '</span> '
        +     '<span class="wd-rev-when">' + esc(r.when) + '</span></div>'
        +   '<div class="wd-rev-act">' + esc(r.act) + '</div>'
        +   '<div class="wd-rev-diff"><span class="wd-del">' + esc(r.from) + '</span> '
        +     '&rarr; <span class="wd-ins">' + esc(r.to) + '</span></div>'
        + '</div>';
    }).join('');
    return ''
      + '<div class="wd-pane-title">Revisions</div>'
      + '<div class="wd-pane-sub">3 changes by 1 reviewer</div>'
      + body
      + '<div class="wd-pane-note">All revisions authored by <strong>Daniel Cross</strong>. '
      +   'Original author of record: <strong>Adrian Vale</strong>.</div>';
  }

  // Re-render just the document canvas + pane (fixed-id container pattern).
  function wdRender() {
    var host = document.getElementById('wd-doc');
    if (!host) return;
    var showMarkup = (WD_MODE === 'markup');
    host.innerHTML = ''
      + '<div class="wd-page">' + wdDocInner(WD_MODE) + '</div>'
      + (showMarkup
          ? '<div class="wd-pane">' + wdReviewingPane() + '</div>'
          : '');
    // Reflect state in the ribbon toggle button label, if present.
    var btn = document.getElementById('wd-toggle-btn');
    if (btn) {
      btn.textContent = showMarkup ? 'All Markup ▾' : 'Final ▾';
      btn.className = 'wd-ribbon-toggle' + (showMarkup ? ' on' : '');
    }
    var tcState = document.getElementById('wd-tc-state');
    if (tcState) tcState.textContent = showMarkup ? 'ON' : 'ON';
    if (showMarkup) wdRegisterEvidence();
  }

  // Exposed toggle for the inline onclick handlers.
  WIN7_ACTIONS._wdToggleMarkup = function () {
    WD_MODE = (WD_MODE === 'markup') ? 'final' : 'markup';
    wdRender();
  };

  // ── The launcher ──────────────────────────────────────────────────────
  WIN7_ACTIONS.openTrackedDoc = function () {
    WD_MODE = 'markup'; // open showing the tampering, per the evidence beat

    var style = ''
      + '<style>'
      + '.wd-root{font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;background:#f3f2f1;'
      +   'height:100%;display:flex;flex-direction:column;color:#201f1e;font-size:12px;}'
      + '.wd-titlebar{background:#2b579a;color:#fff;padding:6px 12px;font-weight:bold;'
      +   'display:flex;align-items:center;gap:8px;font-size:12px;}'
      + '.wd-titlebar .wd-doctype{opacity:.85;font-weight:normal;margin-left:auto;}'
      // Ribbon tab strip
      + '.wd-tabs{background:#2b579a;display:flex;gap:2px;padding:0 8px;}'
      + '.wd-tab{color:#dde6f5;padding:6px 12px;font-size:12px;cursor:default;'
      +   'border-top-left-radius:3px;border-top-right-radius:3px;}'
      + '.wd-tab.active{background:#f3f2f1;color:#2b579a;font-weight:bold;}'
      // Ribbon body (Review tab controls)
      + '.wd-ribbon{background:#f3f2f1;border-bottom:1px solid #d6d3d1;padding:6px 8px;'
      +   'display:flex;align-items:stretch;gap:10px;}'
      + '.wd-group{display:flex;flex-direction:column;align-items:center;'
      +   'border-right:1px solid #e1dfdd;padding:0 12px 2px;}'
      + '.wd-group:last-child{border-right:0;}'
      + '.wd-group-btns{display:flex;gap:8px;align-items:flex-start;flex:1;}'
      + '.wd-group-name{font-size:10px;color:#605e5c;margin-top:2px;}'
      + '.wd-cmd{display:flex;flex-direction:column;align-items:center;justify-content:center;'
      +   'font-size:10px;color:#201f1e;padding:2px 4px;min-width:44px;gap:2px;cursor:default;}'
      + '.wd-cmd .wd-ico{font-size:18px;line-height:1;}'
      + '.wd-ribbon-toggle{cursor:pointer;border:1px solid #b7b5b2;background:#fff;'
      +   'border-radius:3px;padding:3px 8px;font-size:11px;color:#201f1e;}'
      + '.wd-ribbon-toggle.on{background:#dbe7ff;border-color:#2b579a;color:#20408a;font-weight:bold;}'
      + '.wd-tc-pill{font-size:9px;background:#2b579a;color:#fff;border-radius:8px;'
      +   'padding:1px 6px;margin-top:2px;}'
      // Canvas + page
      + '.wd-canvas{flex:1;overflow:auto;background:#a6a6a6;padding:18px;'
      +   'display:flex;gap:16px;align-items:flex-start;justify-content:center;}'
      + '.wd-page{background:#fff;width:460px;max-width:100%;padding:40px 44px;'
      +   'box-shadow:0 3px 10px rgba(0,0,0,.35);font-family:"Calibri","Segoe UI",sans-serif;'
      +   'font-size:13px;line-height:1.55;color:#1a1a1a;flex:0 0 auto;}'
      + '.wd-meta{font-size:10px;letter-spacing:.5px;color:#a11;font-weight:bold;margin:0 0 14px;}'
      + '.wd-h1{font-size:19px;color:#1a1a1a;margin:0 0 2px;font-weight:bold;}'
      + '.wd-sub{font-size:12px;color:#555;margin:0 0 16px;font-style:italic;}'
      + '.wd-fields{font-size:11px;color:#333;border-left:3px solid #2b579a;'
      +   'padding:6px 10px;background:#f7f9fc;margin:0 0 16px;}'
      + '.wd-fields div{margin:1px 0;}'
      + '.wd-lbl{color:#666;display:inline-block;min-width:70px;}'
      + '.wd-p{margin:0 0 11px;}'
      // Track-changes markup
      + '.wd-del{color:#c0392b;text-decoration:line-through;}'
      + '.wd-ins{color:#8e44ad;text-decoration:underline;}'
      + '.wd-del-block{color:#c0392b;text-decoration:line-through;'
      +   'border-left:2px solid #c0392b;padding-left:8px;}'
      + '.wd-mark{color:#c0392b;font-weight:bold;font-size:9px;cursor:help;}'
      // Reviewing pane
      + '.wd-pane{background:#fbfbfa;border:1px solid #d6d3d1;width:240px;max-width:100%;'
      +   'padding:12px;font-size:11px;box-shadow:0 3px 10px rgba(0,0,0,.25);flex:0 0 auto;}'
      + '.wd-pane-title{font-weight:bold;font-size:13px;color:#2b579a;}'
      + '.wd-pane-sub{color:#605e5c;font-size:10px;margin:2px 0 10px;}'
      + '.wd-rev{border-top:1px solid #eceae8;padding:8px 0;}'
      + '.wd-rev-head{display:flex;flex-wrap:wrap;gap:5px;align-items:baseline;}'
      + '.wd-rev-n{color:#c0392b;font-weight:bold;}'
      + '.wd-rev-who{font-weight:bold;color:#8e44ad;}'
      + '.wd-rev-when{color:#8a8886;font-size:10px;}'
      + '.wd-rev-act{color:#333;margin:2px 0;font-style:italic;}'
      + '.wd-rev-diff{font-size:10px;line-height:1.5;}'
      + '.wd-pane-note{margin-top:12px;padding:8px;background:#fff4f4;border:1px solid #f0c8c8;'
      +   'border-radius:3px;color:#7a1f1f;font-size:10px;}'
      // Status bar
      + '.wd-status{background:#2b579a;color:#fff;font-size:11px;padding:3px 12px;'
      +   'display:flex;justify-content:space-between;align-items:center;}'
      + '</style>';

    var tabs = ['File', 'Home', 'Insert', 'Layout', 'References', 'Review', 'View'];
    var tabHtml = tabs.map(function (t) {
      return '<div class="wd-tab' + (t === 'Review' ? ' active' : '') + '">' + esc(t) + '</div>';
    }).join('');

    // Review-tab ribbon: Tracking group (Track Changes toggle ON + Show Markup) and Changes.
    var ribbon = ''
      + '<div class="wd-ribbon">'
      +   '<div class="wd-group">'
      +     '<div class="wd-group-btns">'
      +       '<div class="wd-cmd"><span class="wd-ico">💬</span>New<br>Comment</div>'
      +     '</div><div class="wd-group-name">Comments</div>'
      +   '</div>'
      +   '<div class="wd-group">'
      +     '<div class="wd-group-btns">'
      +       '<div class="wd-cmd">'
      +         '<span class="wd-ico">✍️</span>Track<br>Changes'
      +         '<span class="wd-tc-pill">TRACKING <span id="wd-tc-state">ON</span></span>'
      +       '</div>'
      +       '<div class="wd-cmd">Show<br>Markup:'
      +         '<button id="wd-toggle-btn" class="wd-ribbon-toggle on" '
      +           'onclick="WIN7_ACTIONS._wdToggleMarkup()">All Markup ▾</button>'
      +       '</div>'
      +     '</div><div class="wd-group-name">Tracking</div>'
      +   '</div>'
      +   '<div class="wd-group">'
      +     '<div class="wd-group-btns">'
      +       '<div class="wd-cmd"><span class="wd-ico">✅</span>Accept</div>'
      +       '<div class="wd-cmd"><span class="wd-ico">❌</span>Reject</div>'
      +       '<div class="wd-cmd"><span class="wd-ico">◀</span>Prev</div>'
      +       '<div class="wd-cmd"><span class="wd-ico">▶</span>Next</div>'
      +     '</div><div class="wd-group-name">Changes</div>'
      +   '</div>'
      + '</div>';

    var html = ''
      + style
      + '<div class="wd-root">'
      +   '<div class="wd-titlebar">📘 Board_Directive_v3.docx'
      +     '<span class="wd-doctype">Word</span></div>'
      +   '<div class="wd-tabs">' + tabHtml + '</div>'
      +   ribbon
      +   '<div class="wd-canvas"><div id="wd-doc"></div></div>'
      +   '<div class="wd-status">'
      +     '<span>Page 1 of 1 · Track Changes: On</span>'
      +     '<span>Reviewing Pane · 100%</span>'
      +   '</div>'
      + '</div>';

    if (typeof openWindow === 'function') {
      openWindow('Board_Directive_v3.docx - Word', html, { width: 760, height: 560 });
    }

    // Populate the fixed-id container after the window is in the DOM.
    setTimeout(wdRender, 0);
  };

  // ── 2. Add the desktop icon to Legal and Executive roles ──────────────
  if (typeof WIN7_ROLES !== 'undefined') {
    ['legal', 'exec'].forEach(function (r) {
      if (WIN7_ROLES[r] && WIN7_ROLES[r].icons) {
        WIN7_ROLES[r].icons.push({
          emoji: '📘',
          label: 'Board_Directive_v3.docx',
          action: 'openTrackedDoc'
        });
      }
    });
  }

})();
