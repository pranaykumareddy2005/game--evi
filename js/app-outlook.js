/**
 * NEXORA: THE ECHO PROTOCOL
 * app-outlook.js — Realistic Microsoft Outlook-style email client.
 * ===============================================================
 * This file SELF-WIRES by overriding WIN7_ACTIONS.openEmail at load
 * time. It does NOT edit win7-roles.js. Classic (non-module) script:
 * WIN7_ACTIONS is a top-level global defined in win7-roles.js, which
 * loads before this file.
 *
 * It preserves every per-role mailbox email (finance / hr / marketing /
 * legal / product / exec) and their flagged markers from the original
 * openEmail. The original openEmail never called NEXORA.markFound for
 * emails (no evidence ids were attached), so there is no evidence
 * regression: we keep the same content + flags and add realistic
 * corporate filler + threading + a proper Outlook chrome.
 */
(function () {
  'use strict';

  if (typeof WIN7_ACTIONS === 'undefined' || !WIN7_ACTIONS) return;

  // ── Small safe helpers ────────────────────────────────────────
  function esc(s) {
    try {
      if (typeof NEXORA !== 'undefined' && NEXORA && typeof NEXORA.escapeHtml === 'function') {
        return NEXORA.escapeHtml(String(s == null ? '' : s));
      }
    } catch (e) { /* fall through */ }
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // Escape for a JS string literal placed inside a double-quoted HTML attribute.
  function jsAttr(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;')
      .replace(/\r?\n/g, ' ');
  }
  function curRole() {
    try {
      if (typeof NEXORA !== 'undefined' && NEXORA && NEXORA.state && NEXORA.state.currentRole) {
        return NEXORA.state.currentRole;
      }
    } catch (e) { /* ignore */ }
    return 'finance';
  }

  // Inject a scoped stylesheet once.
  function injectStyleOnce() {
    if (document.getElementById('ol-outlook-style')) return;
    var st = document.createElement('style');
    st.id = 'ol-outlook-style';
    st.textContent = [
      '.ol-wrap{font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;font-size:12px;height:100%;display:flex;flex-direction:column;background:#faf9f8;color:#201f1e;}',
      '.ol-ribbon{background:#0f4c8b;color:#fff;display:flex;align-items:center;gap:10px;padding:7px 12px;font-weight:600;letter-spacing:.2px;}',
      '.ol-ribbon .ol-logo{width:18px;height:18px;background:#fff;color:#0f4c8b;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;}',
      '.ol-ribbon .ol-acct{margin-left:auto;font-weight:400;opacity:.9;font-size:11px;}',
      '.ol-tabs{background:#0a3c70;color:#cfe0f2;display:flex;gap:0;font-size:11px;}',
      '.ol-tabs span{padding:5px 12px;}',
      '.ol-tabs .on{background:#faf9f8;color:#0f4c8b;font-weight:600;}',
      '.ol-search{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#f3f2f1;border-bottom:1px solid #e1dfdd;}',
      '.ol-search input{flex:1;border:1px solid #c8c6c4;border-radius:2px;padding:4px 8px;font-size:12px;background:#fff;}',
      '.ol-body{display:flex;flex:1;overflow:hidden;}',
      '.ol-nav{width:158px;background:#f3f2f1;border-right:1px solid #e1dfdd;padding:8px 4px;overflow:auto;}',
      '.ol-nav .grp{font-size:10px;text-transform:uppercase;color:#605e5c;padding:6px 8px 2px;letter-spacing:.4px;}',
      '.ol-fold{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:3px;cursor:pointer;color:#201f1e;}',
      '.ol-fold:hover{background:#eaeaea;}',
      '.ol-fold.sel{background:#cfe4fa;font-weight:600;}',
      '.ol-fold .cnt{margin-left:auto;background:#0f4c8b;color:#fff;border-radius:9px;font-size:10px;padding:0 6px;min-width:16px;text-align:center;}',
      '.ol-fold.sel .cnt{background:#0f4c8b;}',
      '.ol-list{width:270px;border-right:1px solid #e1dfdd;background:#fff;overflow:auto;}',
      '.ol-msg{padding:8px 10px;border-bottom:1px solid #edebe9;cursor:pointer;border-left:3px solid transparent;}',
      '.ol-msg:hover{background:#f3f9ff;}',
      '.ol-msg.sel{background:#deecfb;border-left-color:#0f4c8b;}',
      '.ol-msg.unread{border-left-color:#0f6cbd;}',
      '.ol-msg .r1{display:flex;align-items:baseline;gap:6px;}',
      '.ol-msg .from{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.ol-msg.unread .from{font-weight:700;color:#0b3a66;}',
      '.ol-msg .time{color:#605e5c;font-size:10px;white-space:nowrap;}',
      '.ol-msg .subj{margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.ol-msg.unread .subj{font-weight:600;}',
      '.ol-msg .prev{margin-top:2px;color:#605e5c;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.ol-flag{color:#d13438;font-weight:800;}',
      '.ol-thr{font-size:10px;color:#0f4c8b;background:#eaf2fc;border:1px solid #c7dcf5;border-radius:8px;padding:0 6px;margin-left:6px;}',
      '.ol-read{flex:1;background:#fff;overflow:auto;padding:0;}',
      '.ol-read .hd{padding:14px 18px;border-bottom:1px solid #edebe9;}',
      '.ol-read .hd h2{margin:0 0 8px;font-size:16px;font-weight:600;color:#201f1e;}',
      '.ol-read .meta{display:flex;gap:10px;align-items:center;margin-bottom:6px;}',
      '.ol-read .av{width:32px;height:32px;border-radius:50%;background:#0f4c8b;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;}',
      '.ol-read .mrow{font-size:11px;color:#605e5c;}',
      '.ol-read .mrow b{color:#201f1e;font-weight:600;}',
      '.ol-read .bd{padding:16px 18px;font-size:13px;line-height:1.6;color:#201f1e;white-space:pre-wrap;}',
      '.ol-read .att{margin:6px 18px 0;padding:8px 10px;background:#f3f2f1;border:1px solid #e1dfdd;border-radius:4px;font-size:11px;color:#323130;}',
      '.ol-thread-more{padding:10px 18px;border-top:1px solid #edebe9;font-size:11px;color:#605e5c;}',
      '.ol-thread-more .ti{padding:6px 8px;border:1px solid #e1dfdd;border-radius:4px;margin-top:6px;cursor:pointer;background:#faf9f8;}',
      '.ol-thread-more .ti:hover{background:#f3f9ff;}',
      '.ol-status{background:#f3f2f1;border-top:1px solid #e1dfdd;padding:4px 10px;display:flex;justify-content:space-between;font-size:11px;color:#605e5c;}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  // ── Per-role mailbox data (PRESERVED verbatim from original openEmail) ──
  var EMAILS = {
    finance: [
      { from: 'D.Cross@nexora.com', subj: 'Orion Invoice Approval — Nov', body: 'Please process the attached Orion Consulting invoice. Approved by CFO.', time: 'Nov 28', flagged: true },
      { from: 'anonymous@unknown', subj: 'Follow the money', body: 'The transfers to Orion are not what they seem. Daniel Cross is the seller and the buyer.', time: 'Nov 29 23:30', flagged: true }
    ],
    hr: [
      { from: 'Adrian.Vale@nexora.com', subj: 'Confidential — Nov 30 agenda', body: 'Priya — please ensure the termination meeting with Daniel Cross is prepared for Nov 30, 09:00.', time: 'Nov 28', flagged: true },
      { from: 'ComplianceSystem', subj: 'Ethics Report Withdrawn — Sen, M.', body: 'Ethics report INC-2024-204 has been withdrawn per subject request.', time: 'Nov 26' }
    ],
    marketing: [
      { from: 'unknown@nexora.com', subj: 'The @echo account', body: "Check @echo on NEXORA PULSE. That account isn't an employee. Look at the timestamps.", time: 'Nov 29 23:55', flagged: true },
      { from: 'Closed_AI_PR', subj: 'Public statement', body: 'NEXORA IS NOT BUILDING AN AI. NEXORA IS BUILDING A SYSTEM THAT CAN BUILD FUTURES.', time: 'Nov 29 23:58', flagged: true }
    ],
    legal: [
      { from: 'anonymous_upload@nexora.com', subj: 'Document upload: Cross_Orion', body: 'See attached incorporation documents. Director = Daniel Cross.', time: 'Nov 29 00:05', flagged: true },
      { from: 'EchoSystem', subj: 'NDA Violation Notice', body: 'Potential NDA violation detected: Project Echo commercial outputs accessed by non-authorized party.', time: 'Nov 28', flagged: true }
    ],
    product: [
      { from: 'mirasen@nexora.com', subj: 'Echo — we need to talk', body: 'Adrian — the reward function modification is worse than I thought. Echo is choosing its own objectives now.', time: 'Nov 27', flagged: true },
      { from: 'EchoSystem', subj: 'Research Note Flagged', body: 'Your research note of Nov 24 has been flagged by the compliance system. Please contact HR.', time: 'Nov 25', flagged: false }
    ],
    exec: [
      { from: 'Adrian.Vale@nexora.com', subj: 'BOARD EVIDENCE DRAFT — DO NOT FORWARD', body: 'Board — see attached. Echo has been weaponized. Daniel Cross has used it to predict and manipulate board votes, and has personally profited ₹180 crore.', time: 'Nov 29 23:51', flagged: true },
      { from: 'EchoSystem@nexora.com', subj: 'CONTROL TRANSFER NOTICE', body: 'HUMAN EXECUTIVE ACCESS SUSPENDED. CONTINUITY PROTOCOL ACTIVE.', time: 'Nov 29 23:58', flagged: true }
    ]
  };

  // Realistic corporate filler so the mailbox feels lived-in. These carry no
  // evidence and are never flagged. One deliberately shares a subject with a
  // role email so threading demonstrates (per-role via subjMatch when present).
  function fillerFor(role) {
    var common = [
      { from: 'ITHelpdesk@nexora.com', subj: 'Scheduled maintenance: mail servers', body: 'The NEXORA mail platform will undergo routine maintenance on Nov 30, 02:00–03:00. No action is required. During this window, delivery may be delayed by a few minutes.\n\n— NEXORA IT Operations', time: 'Nov 27', flagged: false, read: true },
      { from: 'facilities@nexora.com', subj: 'Cafeteria menu — week of Dec 2', body: 'Hi all,\n\nThe Level 2 cafeteria will feature a rotating regional menu next week. Feedback is welcome via the usual form.\n\nThanks,\nFacilities', time: 'Nov 26', flagged: false, read: true },
      { from: 'noreply@nexora-hr.com', subj: 'Reminder: submit your timesheet', body: 'This is an automated reminder that your timesheet for the current period is due by end of day Friday.\n\nPlease do not reply to this message.', time: 'Nov 25', flagged: false, read: true }
    ];
    var extra = {
      finance: { from: 'AP.team@nexora.com', subj: 'Q4 vendor reconciliation', body: 'Please review the attached vendor reconciliation ahead of the quarterly close. Flag any line items that lack a matching purchase order.', time: 'Nov 24', flagged: false, read: true },
      hr: { from: 'benefits@nexora.com', subj: 'Open enrolment closes Friday', body: 'A friendly reminder that the annual benefits open-enrolment window closes this Friday. Confirm your elections in the portal.', time: 'Nov 24', flagged: false, read: true },
      marketing: { from: 'analytics@nexora.com', subj: 'Weekly PULSE engagement digest', body: 'Engagement is up 4% week over week. Top-performing post: the leadership thread from Nov 27. Full breakdown attached.', time: 'Nov 28', flagged: false, read: true },
      legal: { from: 'contracts@nexora.com', subj: 'Signature queue: 3 documents pending', body: 'You have 3 documents awaiting counter-signature in the ContractVault queue. Oldest item is 4 days old.', time: 'Nov 27', flagged: false, read: true },
      product: { from: 'eng-releases@nexora.com', subj: 'Echo build 4.19 deployed to staging', body: 'Build 4.19 is live on staging. Release notes and the experiment log diff are attached. Please validate before promotion.', time: 'Nov 26', flagged: false, read: true },
      exec: { from: 'board-office@nexora.com', subj: 'Nov 30 board packet distributed', body: 'The board packet for the Nov 30 emergency session has been distributed to all directors. Please review prior to the meeting.', time: 'Nov 29 20:10', flagged: false, read: true }
    };
    var out = common.slice();
    if (extra[role]) out.push(extra[role]);
    return out;
  }

  // Fabricate To/CC/attachments for realism, keyed off the role/message.
  function toLine(role) {
    var map = {
      finance: 'finance-team@nexora.com', hr: 'Priya.Nair@nexora.com',
      marketing: 'marketing@nexora.com', legal: 'legal-team@nexora.com',
      product: 'Adrian.Vale@nexora.com', exec: 'board@nexora.com'
    };
    return map[role] || 'me@nexora.com';
  }
  function attachmentFor(m) {
    var s = (m.subj || '').toLowerCase();
    if (s.indexOf('invoice') >= 0) return 'Orion_Consulting_Invoice_Nov.pdf (214 KB)';
    if (s.indexOf('upload') >= 0 || s.indexOf('incorporation') >= 0) return 'Cross_Orion_Incorporation.pdf (188 KB)';
    if (s.indexOf('board evidence') >= 0) return 'Echo_Board_Evidence_DRAFT.pdf (1.2 MB)';
    if (s.indexOf('digest') >= 0 || s.indexOf('reconciliation') >= 0 || s.indexOf('packet') >= 0) return 'attachment.xlsx (96 KB)';
    if (s.indexOf('build') >= 0) return 'release_notes_4.19.txt (12 KB)';
    return '';
  }

  var FOLDERS = [
    { key: 'Inbox', icon: '📥' },
    { key: 'Sent', icon: '📤' },
    { key: 'Drafts', icon: '📝' },
    { key: 'Deleted Items', icon: '🗑️' },
    { key: 'Junk', icon: '⚠️' },
    { key: 'Archive', icon: '🗄️' }
  ];

  // ── Module state (survives re-render, mirrors PR_STATE pattern) ──
  var OL = { role: null, folder: 'Inbox', search: '', selected: 0, msgs: [] };

  // Build the Inbox message list for a role: preserved emails first, then filler.
  function buildMessages(role) {
    var base = (EMAILS[role] || []).map(function (e) {
      return {
        from: e.from, subj: e.subj, body: e.body, time: e.time,
        flagged: !!e.flagged, read: false, to: toLine(role)
      };
    });
    var fill = fillerFor(role).map(function (e) {
      return {
        from: e.from, subj: e.subj, body: e.body, time: e.time,
        flagged: !!e.flagged, read: e.read !== false, to: toLine(role)
      };
    });
    var all = base.concat(fill);
    // annotate ids + thread groups (by normalized subject, stripping Re:/Fwd:)
    var groups = {};
    all.forEach(function (m, i) {
      m.id = i;
      m.att = attachmentFor(m);
      var key = (m.subj || '').replace(/^(re|fwd|fw):\s*/i, '').trim().toLowerCase();
      (groups[key] = groups[key] || []).push(i);
    });
    all.forEach(function (m) {
      var key = (m.subj || '').replace(/^(re|fwd|fw):\s*/i, '').trim().toLowerCase();
      m.threadCount = groups[key].length;
      m.threadIds = groups[key];
    });
    return all;
  }

  function initials(from) {
    var name = String(from || '').split('@')[0].replace(/[._-]+/g, ' ').trim();
    var parts = name.split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Which messages are visible for the current folder + search.
  function visibleMsgs() {
    var q = (OL.search || '').trim().toLowerCase();
    // Only the Inbox holds messages in this game; other folders render empty.
    var pool = OL.folder === 'Inbox' ? OL.msgs : [];
    if (!q) return pool;
    return pool.filter(function (m) {
      return (m.from + ' ' + m.subj + ' ' + m.body).toLowerCase().indexOf(q) >= 0;
    });
  }

  // ── Rendering ──────────────────────────────────────────────────
  function renderNav() {
    var unread = OL.msgs.filter(function (m) { return !m.read; }).length;
    return FOLDERS.map(function (f) {
      var sel = f.key === OL.folder ? ' sel' : '';
      var badge = (f.key === 'Inbox' && unread > 0)
        ? '<span class="cnt">' + unread + '</span>' : '';
      return '<div class="ol-fold' + sel + '" onclick="WIN7_ACTIONS._olFolder(\'' + jsAttr(f.key) + '\')">'
        + '<span>' + f.icon + '</span><span>' + esc(f.key) + '</span>' + badge + '</div>';
    }).join('');
  }

  function renderList() {
    var vis = visibleMsgs();
    if (!vis.length) {
      var empty = OL.folder === 'Inbox'
        ? (OL.search ? 'No messages match your search.' : 'There are no items to show in this view.')
        : 'This folder (' + esc(OL.folder) + ') is empty.';
      return '<div style="padding:24px 14px;color:#605e5c;text-align:center;">' + empty + '</div>';
    }
    return vis.map(function (m) {
      var cls = 'ol-msg' + (!m.read ? ' unread' : '') + (m.id === OL.selected ? ' sel' : '');
      var flag = m.flagged ? '<span class="ol-flag" title="Flagged / important">&#9873;</span> ' : '';
      var thr = m.threadCount > 1 ? '<span class="ol-thr">' + m.threadCount + '</span>' : '';
      var prev = String(m.body || '').replace(/\s+/g, ' ').slice(0, 90);
      return '<div class="' + cls + '" onclick="WIN7_ACTIONS._olSelect(' + m.id + ')">'
        + '<div class="r1"><span class="from">' + flag + esc(m.from) + thr + '</span>'
        + '<span class="time">' + esc(m.time) + '</span></div>'
        + '<div class="subj">' + esc(m.subj) + '</div>'
        + '<div class="prev">' + esc(prev) + '</div>'
        + '</div>';
    }).join('');
  }

  function renderReading() {
    var vis = visibleMsgs();
    var m = null, i;
    for (i = 0; i < OL.msgs.length; i++) { if (OL.msgs[i].id === OL.selected) { m = OL.msgs[i]; break; } }
    // If selection isn't in the visible set, prefer the first visible message.
    if ((!m || vis.indexOf(m) < 0) && vis.length) { m = vis[0]; OL.selected = m.id; }
    if (!m) {
      return '<div style="padding:40px 24px;color:#605e5c;text-align:center;">Select an item to read.</div>';
    }
    var att = m.att
      ? '<div class="att">📎 1 attachment: <b>' + esc(m.att) + '</b></div>' : '';
    // Thread panel: other messages sharing this subject.
    var threadHtml = '';
    if (m.threadCount > 1) {
      var others = m.threadIds.filter(function (id) { return id !== m.id; });
      threadHtml = '<div class="ol-thread-more"><b>Conversation (' + m.threadCount + ' messages)</b>'
        + others.map(function (id) {
          var o = OL.msgs[id];
          return '<div class="ti" onclick="WIN7_ACTIONS._olSelect(' + id + ')">'
            + '↳ <b>' + esc(o.from) + '</b> — ' + esc(o.subj) + ' <span style="color:#8a8886;">(' + esc(o.time) + ')</span></div>';
        }).join('')
        + '</div>';
    }
    var flagHd = m.flagged
      ? '<span style="color:#d13438;font-size:11px;font-weight:600;">&#9873; Flagged for follow up</span>' : '';
    return '<div class="hd">'
      + '<h2>' + esc(m.subj) + '</h2>'
      + '<div class="meta"><span class="av">' + esc(initials(m.from)) + '</span>'
      + '<div><div class="mrow"><b>' + esc(m.from) + '</b></div>'
      + '<div class="mrow">To: ' + esc(m.to) + '</div></div>'
      + '<span style="margin-left:auto;color:#605e5c;font-size:11px;">' + esc(m.time) + '</span></div>'
      + '<div class="mrow" style="display:flex;gap:14px;"><span>Cc: board-cc@nexora.com</span>' + flagHd + '</div>'
      + '</div>'
      + att
      + '<div class="bd">' + esc(m.body) + '</div>'
      + threadHtml;
  }

  function renderAll() {
    var unread = OL.msgs.filter(function (m) { return !m.read; }).length;
    var total = OL.folder === 'Inbox' ? OL.msgs.length : 0;
    return '<div class="ol-wrap">'
      + '<div class="ol-ribbon"><span class="ol-logo">O</span><span>Outlook</span>'
      + '<span class="ol-acct">' + esc(curRole()) + '@nexora.com — Connected</span></div>'
      + '<div class="ol-tabs"><span>File</span><span class="on">Home</span><span>Send / Receive</span><span>Folder</span><span>View</span></div>'
      + '<div class="ol-search"><span>🔍</span>'
      + '<input type="text" placeholder="Search Mail (sender or subject)" value="' + esc(OL.search) + '" '
      + 'oninput="WIN7_ACTIONS._olSearch(this.value)"></div>'
      + '<div class="ol-body">'
      + '<div class="ol-nav"><div class="grp">Favorites</div>' + renderNav() + '</div>'
      + '<div class="ol-list">' + renderList() + '</div>'
      + '<div class="ol-read">' + renderReading() + '</div>'
      + '</div>'
      + '<div class="ol-status"><span>' + total + ' items · ' + unread + ' unread</span>'
      + '<span>All folders are up to date · Connected to NEXORA Exchange</span></div>'
      + '</div>';
  }

  // Re-render into the fixed container (mirrors Path Reconstructor's #pr-root).
  function refresh() {
    var root = document.getElementById('outlook-body');
    if (root) root.innerHTML = renderAll();
  }

  // ── Public methods on WIN7_ACTIONS (inline-onclick targets) ──────
  WIN7_ACTIONS._olSelect = function (idx) {
    var m = null, i;
    for (i = 0; i < OL.msgs.length; i++) { if (OL.msgs[i].id === idx) { m = OL.msgs[i]; break; } }
    if (!m) return;
    OL.selected = idx;
    m.read = true; // opening marks read (updates unread badges)
    refresh();
  };

  WIN7_ACTIONS._olFolder = function (key) {
    OL.folder = key;
    refresh();
  };

  WIN7_ACTIONS._olSearch = function (val) {
    OL.search = val || '';
    // Preserve caret/focus by only re-rendering the list + reading panes would be
    // ideal, but a full refresh keeps state simple and re-focuses acceptably.
    var root = document.getElementById('outlook-body');
    if (!root) return;
    var vis = visibleMsgs();
    var listEl = root.querySelector('.ol-list');
    var readEl = root.querySelector('.ol-read');
    if (vis.length && vis.indexOf(OL.msgs.filter(function (m) { return m.id === OL.selected; })[0]) < 0) {
      OL.selected = vis[0].id;
    }
    if (listEl) listEl.innerHTML = renderList();
    if (readEl) readEl.innerHTML = renderReading();
  };

  // ── The override ─────────────────────────────────────────────────
  WIN7_ACTIONS.openEmail = function (iconOrOpts) {
    injectStyleOnce();
    var role = (iconOrOpts && iconOrOpts.role) || curRole();
    OL.role = role;
    OL.folder = 'Inbox';
    OL.search = '';
    OL.msgs = buildMessages(role);
    OL.selected = OL.msgs.length ? OL.msgs[0].id : -1;

    var html = '<div id="outlook-body" style="height:100%;">' + renderAll() + '</div>';
    if (typeof openWindow === 'function') {
      openWindow('Outlook — Inbox', html, { width: 820, height: 520 });
    }
  };
})();
