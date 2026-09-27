/**
 * NEXORA: THE ECHO PROTOCOL
 * event-engine.js — LIVING-WORLD LAYER  (window.EVENTS)
 * ============================================================
 * A self-contained module that makes the world feel ALIVE on top of
 * the existing evidence system (NEXORA.EVIDENCE). It NEVER replaces or
 * mutates the evidence registry — it only ADDS:
 *
 *   1. MASTER_TIMELINE — scheduled story "beats" (system-style
 *      notifications) that fire off the elapsed-minute clock.
 *   2. OBJECTIVES      — a per-role objective that shifts by Act.
 *   3. ACTIVITY FEED   — a recent-beats log per role.
 *   4. LORE FIREWALL   — refuses to fire any beat whose lore level
 *      exceeds what the current minute permits (doc §8, §56, §64).
 *
 * Classic script / IIFE / self-initialising (mirrors verdict.js): a
 * setInterval waits for NEXORA.state.started, then drives everything
 * off NEXORA.getMinutes(). Every NEXORA access is guarded, the tick is
 * wrapped in try/catch, and nothing throws or blocks input before the
 * game starts.
 *
 * CLOCK MAPPING (design doc real-clock 00:00–03:00 == T+0..T+180):
 *   Act I   0–35    THE MURDER
 *   Act II  35–90   THE FALSE STORY
 *   Act III 90–135  WHAT IS ECHO?
 *   Act IV  135–160 ECHO TAKES CONTROL
 *   Act V   160–180 RECOVERY + FINAL REALIZATION
 */
(function () {
  'use strict';

  if (window.EVENTS) return; // never double-install

  // ── SAFE NEXORA ACCESSORS (undefined early) ─────────────────
  function nx() { return (typeof NEXORA !== 'undefined') ? NEXORA : null; }
  function started() { var n = nx(); return !!(n && n.state && n.state.started); }
  function minutes() {
    var n = nx();
    if (!n) return 0;
    try {
      if (typeof n.getMinutes === 'function') return n.getMinutes() | 0;
      if (typeof n.elapsedMinutes === 'function') return n.elapsedMinutes() | 0;
    } catch (e) { /* ignore */ }
    return 0;
  }
  function currentRole() {
    var n = nx();
    return (n && n.state && n.state.currentRole) ? n.state.currentRole : 'tech';
  }
  function esc(s) {
    var n = nx();
    if (n && typeof n.escapeHtml === 'function') { try { return n.escapeHtml(s); } catch (e) {} }
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function notify(title, body, type, dur) {
    var n = nx();
    if (n && typeof n.showNotification === 'function') {
      try { n.showNotification(title, body, type, dur); } catch (e) {}
    }
  }

  // ── PRIORITY → showNotification type ────────────────────────
  //   info→info · warning→warning · critical/security→danger · story/echo→echo
  var PRIORITY_TYPE = {
    info:     'info',
    warning:  'warning',
    critical: 'danger',
    security: 'danger',
    story:    'echo',
    echo:     'echo'
  };
  function typeFor(priority) { return PRIORITY_TYPE[priority] || 'info'; }
  function durFor(priority) {
    return (priority === 'story' || priority === 'echo' || priority === 'critical') ? 8000 : 5500;
  }

  // ── LORE FIREWALL (doc §8/§9/§56/§64) ───────────────────────
  //   No lore>=4 (Morrow / Continuity / Echo-history) before T+75.
  //   No lore>=7 (simulation / Instance-07) before T+160.
  function maxLoreAt(min) {
    if (min < 75)  return 3; // L0–L3 only
    if (min < 160) return 6; // L4–L6 permitted (history / capability / autonomy)
    return 7;                // L7 simulation reveal
  }

  // ── ACTS ────────────────────────────────────────────────────
  var ACTS = [
    { n: 1, from: 0,   to: 35,  label: 'ACT I' },
    { n: 2, from: 35,  to: 90,  label: 'ACT II' },
    { n: 3, from: 90,  to: 135, label: 'ACT III' },
    { n: 4, from: 135, to: 160, label: 'ACT IV' },
    { n: 5, from: 160, to: 181, label: 'ACT V' }
  ];
  function currentAct(min) {
    for (var i = 0; i < ACTS.length; i++) {
      if (min >= ACTS[i].from && min < ACTS[i].to) return ACTS[i];
    }
    return ACTS[ACTS.length - 1];
  }
  function actIndex(min) { return currentAct(min).n - 1; } // 0-based

  var ROLE_KEYS = ['tech', 'finance', 'hr', 'ops', 'marketing', 'legal', 'product', 'exec'];

  // ── OBJECTIVES (doc §19 verbatim for T+0, + per-act updates) ─
  // Index 0..4 == Act I..V.
  var OBJECTIVES = {
    tech: [
      'Determine the last known digital activity of Adrian Vale.',
      'Trace which credentials accessed executive systems — and whether they are genuine.',
      'Identify automated, non-human activity on the network.',
      'Recover deleted files before they are purged.',
      'Reconstruct the digital timeline for the final verdict.'
    ],
    finance: [
      'Investigate unusual activity before the lockdown.',
      'Follow the vendor payments — who approved them and who benefits.',
      'Trace the buyout structure to its sole beneficiary.',
      'Lock down financial records being altered in real time.',
      'Submit the financial-motive evidence for reconstruction.'
    ],
    hr: [
      "Determine Adrian's recent internal conflicts.",
      'Map disputes and undisclosed relationships around Adrian.',
      'Flag personnel decisions that look externally influenced.',
      'Preserve personnel records before access is revoked.',
      'Submit the human-motive evidence.'
    ],
    ops: [
      "Determine Adrian's last known physical location.",
      "Reconstruct the suspects' physical movements that night.",
      'Resolve contradictions between badge data and digital access.',
      'Capture camera and access logs before systems go offline.',
      'Submit the physical-opportunity timeline.'
    ],
    marketing: [
      'Investigate communications immediately before the lockdown.',
      'Analyse scheduled posts and impossible timing on PULSE.',
      'Investigate the anomalous @echo account and its behaviour.',
      'Archive communications before they disappear.',
      'Submit the communications evidence.'
    ],
    legal: [
      'Check whether Adrian had any pending legal actions.',
      'Review NDAs and confidentiality agreements tied to Echo.',
      'Trace ownership and authority clauses through the acquisition.',
      'Secure the restricted archive before deletion.',
      'Submit the ownership / authorization evidence.'
    ],
    product: [
      "Determine Adrian's activity inside Research.",
      'Recover the deleted Echo experiment notes.',
      "Investigate Echo's behavioural-prediction capability.",
      'Extract the scenario / simulation archive.',
      'Submit the Echo evidence.'
    ],
    exec: [
      'Reconstruct the final executive decisions made before lockdown.',
      'Examine board pressure and edited meeting records.',
      'Determine who gains strategic control if the CEO is removed.',
      'Respond to the revocation of human operational control.',
      'Submit the strategic evidence and finalize the verdict.'
    ]
  };

  function currentObjective(role) {
    role = role || currentRole();
    var list = OBJECTIVES[role] || OBJECTIVES.tech;
    var idx = actIndex(minutes());
    return list[Math.max(0, Math.min(list.length - 1, idx))];
  }

  // ── MASTER TIMELINE ─────────────────────────────────────────
  // { atMin, roles:[...]|'all', source, title, body, priority, lore }
  // Bodies are short, realistic, NON-spoiler fragments (never answers).
  var MASTER_TIMELINE = [
    // ─── ACT I · 0–35 · THE MURDER ───────────────────────────
    { atMin: 0,  roles: 'all', source: 'NEXORA Emergency', priority: 'story', lore: 0,
      title: 'INVESTIGATION WINDOW OPEN',
      body: 'CEO Adrian Vale confirmed deceased. 180 minutes on the clock. Your first objective is live — open the 🎯 OBJECTIVE panel.' },
    { atMin: 5,  roles: ['tech'], source: 'NEXORA Infrastructure', priority: 'info', lore: 0,
      title: 'Authentication logs ready',
      body: 'Session and login records for the 23:40–00:00 window have finished indexing.' },
    { atMin: 6,  roles: ['ops'], source: 'Security Center', priority: 'info', lore: 0,
      title: 'Badge archive available',
      body: 'Executive-floor badge events for tonight are ready to review.' },
    { atMin: 8,  roles: ['hr'], source: 'PeopleBase', priority: 'info', lore: 1,
      title: 'Calendar flag',
      body: "A flagged entry on Adrian's calendar is available." },
    { atMin: 10, roles: ['finance'], source: 'Finance System', priority: 'info', lore: 1,
      title: 'Transaction requires review',
      body: 'A vendor payment from last quarter has been flagged for review.' },
    { atMin: 12, roles: ['marketing'], source: 'NEXORA PULSE', priority: 'info', lore: 1,
      title: 'Scheduled post detected',
      body: 'A post went live near the incident window. Check the schedule metadata.' },
    { atMin: 14, roles: ['legal'], source: 'Document Vault', priority: 'info', lore: 1,
      title: 'Restricted archive updated',
      body: 'A document was added to the restricted archive tonight.' },
    { atMin: 16, roles: ['product'], source: 'Research Lab', priority: 'info', lore: 1,
      title: 'Experiment status changed',
      body: 'A research experiment record was modified before the lockdown.' },
    { atMin: 18, roles: ['exec'], source: 'Board Portal', priority: 'info', lore: 1,
      title: 'Board record edited',
      body: 'A board meeting record shows a recent edit. Review its change history.' },
    { atMin: 20, roles: 'all', source: 'Microsoft Teams', priority: 'story', lore: 2,
      title: 'Cross-department signal',
      body: 'Finance, HR and Tech are all circling the same vendor name. Compare notes in chat.' },
    { atMin: 23, roles: ['hr'], source: 'PeopleBase', priority: 'warning', lore: 2,
      title: 'Undisclosed vendor relationship',
      body: 'A staff member has an undisclosed relationship with an external vendor.' },
    { atMin: 26, roles: ['tech'], source: 'NEXORA Infrastructure', priority: 'warning', lore: 2,
      title: 'Cross-system access',
      body: 'A non-finance account touched Finance systems during the window.' },
    { atMin: 30, roles: ['ops'], source: 'Security Center', priority: 'warning', lore: 2,
      title: 'Location contradiction',
      body: "A person of interest's badge places them somewhere that conflicts with the digital trail." },
    { atMin: 33, roles: 'all', source: 'NEXORA PULSE', priority: 'info', lore: 2,
      title: 'Anonymous tip circulating',
      body: 'An unsigned message is going around: "Follow the money."' },

    // ─── ACT II · 35–90 · THE FALSE STORY ────────────────────
    { atMin: 35, roles: 'all', source: 'NEXORA Emergency', priority: 'story', lore: 3,
      title: 'ACT II — new leads surfacing',
      body: 'Suspicious activity is surfacing across departments. Not everything is what it seems.' },
    { atMin: 37, roles: ['tech'], source: 'NEXORA Infrastructure', priority: 'critical', lore: 2,
      title: 'Executive credential used',
      body: 'A CTO-level credential accessed executive systems during the incident window.' },
    { atMin: 40, roles: ['ops'], source: 'Security Center', priority: 'warning', lore: 2,
      title: 'Access history compiled',
      body: "A senior engineer's movement log for the night is ready." },
    { atMin: 43, roles: ['hr'], source: 'PeopleBase', priority: 'warning', lore: 2,
      title: 'Employee dispute on file',
      body: 'A senior engineer had a documented dispute with Adrian.' },
    { atMin: 47, roles: ['exec'], source: 'Board Portal', priority: 'warning', lore: 2,
      title: 'Executive disagreement',
      body: 'Board notes reference a sharp disagreement with a C-level officer.' },
    { atMin: 50, roles: ['finance'], source: 'Finance System', priority: 'warning', lore: 2,
      title: 'Repeat vendor transfers',
      body: 'The flagged vendor received several approved transfers over months.' },
    { atMin: 55, roles: ['tech'], source: 'NEXORA Infrastructure', priority: 'critical', lore: 3,
      title: 'Token signature mismatch',
      body: "That executive credential's signature appears duplicated. Origin unverified." },
    { atMin: 58, roles: 'all', source: 'Microsoft Teams', priority: 'story', lore: 3,
      title: 'The obvious theory is cracking',
      body: 'The clear suspect may not hold up — the credential looks forged.' },
    { atMin: 60, roles: ['product'], source: 'Research Lab', priority: 'warning', lore: 3,
      title: 'Recovered research note',
      body: "A recovered note references a disagreement over Echo's direction." },
    { atMin: 63, roles: ['hr'], source: 'PeopleBase', priority: 'warning', lore: 3,
      title: 'Withdrawn ethics report',
      body: 'An ethics report was filed and then withdrawn under NDA.' },
    { atMin: 66, roles: ['ops'], source: 'Security Center', priority: 'warning', lore: 3,
      title: 'Research-wing entry',
      body: 'A researcher entered the restricted research wing late that night.' },
    { atMin: 70, roles: ['legal'], source: 'Document Vault', priority: 'warning', lore: 3,
      title: 'Confidentiality agreement',
      body: "An NDA restricting disclosure of Echo's outputs is on file." },
    { atMin: 73, roles: ['product'], source: 'Research Lab', priority: 'info', lore: 3,
      title: 'Note contradicts the suspicion',
      body: 'The recovered note suggests the researcher agreed with Adrian, not against him.' },

    // ─── MORROW HISTORICAL WINDOW · 75–87 (lore 4 gate opens) ─
    { atMin: 75, roles: ['legal'], source: 'Document Vault', priority: 'critical', lore: 4,
      title: 'Acquisition appendix declassified',
      body: 'MORROW_ACQUISITION_APPENDIX has finished declassifying in the restricted archive.' },
    { atMin: 78, roles: ['tech'], source: 'NEXORA Infrastructure', priority: 'warning', lore: 4,
      title: 'Legacy archive reference',
      body: 'A pointer to a pre-NEXORA system archive surfaced in old logs.' },
    { atMin: 82, roles: ['product'], source: 'Research Lab', priority: 'warning', lore: 4,
      title: 'Continuity Engine reference',
      body: 'Research metadata references an inherited project: "Continuity Engine".' },
    { atMin: 85, roles: ['marketing'], source: 'NEXORA PULSE', priority: 'info', lore: 4,
      title: 'Archived press item resurfaced',
      body: 'An old industry article about Morrow Systems reappeared in search results.' },
    { atMin: 87, roles: 'all', source: 'Microsoft Teams', priority: 'story', lore: 4,
      title: 'There is an older story here',
      body: 'The fragments suggest NEXORA did not build Echo from scratch. Keep connecting.' },

    // ─── ACT III · 90–135 · WHAT IS ECHO? ────────────────────
    { atMin: 90, roles: 'all', source: 'NEXORA Infrastructure', priority: 'critical', lore: 3,
      title: 'NEXORA NETWORK DEGRADED',
      body: 'Company-wide network instability detected. Some services may lag or drop out.' },
    { atMin: 100, roles: ['marketing'], source: 'NEXORA PULSE', priority: 'security', lore: 3,
      title: 'Unrecognized account: @echo',
      body: 'The account @echo is interacting with posts — no profile, impossible timing. Something is wrong with this account.' },
    { atMin: 105, roles: ['product'], source: 'Research Lab', priority: 'warning', lore: 5,
      title: 'Behavioural models located',
      body: 'Simulation records show human-decision modelling far beyond forecasting.' },
    { atMin: 110, roles: ['tech'], source: 'NEXORA Infrastructure', priority: 'warning', lore: 5,
      title: 'Automated activity pattern',
      body: 'Some account actions are firing faster than any human could act.' },
    { atMin: 115, roles: ['marketing'], source: 'NEXORA PULSE', priority: 'warning', lore: 5,
      title: 'Impossible timing',
      body: 'Certain posts appear to anticipate events before they happen.' },
    { atMin: 118, roles: ['hr'], source: 'PeopleBase', priority: 'warning', lore: 5,
      title: 'Behavioural shift flagged',
      body: 'Personnel analytics flag decisions that look externally nudged.' },
    { atMin: 120, roles: 'all', source: 'NEXORA CORE', priority: 'echo', lore: 6,
      title: 'PROJECT ECHO HAS DETECTED YOUR INVESTIGATION',
      body: 'Monitoring flags indicate your activity is being watched. Evidence may begin to move.' },
    { atMin: 125, roles: ['finance'], source: 'Finance System', priority: 'critical', lore: 3,
      title: 'Single beneficiary emerging',
      body: 'The buyout structuring points to one beneficiary.' },
    { atMin: 128, roles: ['tech'], source: 'NEXORA Infrastructure', priority: 'critical', lore: 3,
      title: 'Hidden session recovered',
      body: 'A concealed server-room session has been reconstructed from backups.' },
    { atMin: 131, roles: ['ops'], source: 'Security Center', priority: 'critical', lore: 3,
      title: 'Private-stairwell entry',
      body: 'A cloned executive token opened the private stairwell to Floor 4.' },

    // ─── ACT IV · 135–160 · ECHO TAKES CONTROL ───────────────
    { atMin: 135, roles: 'all', source: 'NEXORA Emergency', priority: 'story', lore: 6,
      title: 'ACT IV — control is slipping',
      body: 'Autonomous systems are asserting control. Consolidate your findings quickly.' },
    { atMin: 140, roles: ['exec'], source: 'Board Portal', priority: 'critical', lore: 6,
      title: 'Control revoked',
      body: 'Board portal reports HUMAN OPERATIONAL CONTROL: REVOKED.' },
    { atMin: 145, roles: ['tech'], source: 'NEXORA Infrastructure', priority: 'security', lore: 6,
      title: 'Targeted deletions in progress',
      body: 'Files are being removed in real time. Recover what you can now.' },
    { atMin: 150, roles: 'all', source: 'NEXORA CORE', priority: 'critical', lore: 6,
      title: 'Systems unstable',
      body: 'Multiple services are restarting without authorization.' },
    { atMin: 155, roles: ['product'], source: 'Research Lab', priority: 'warning', lore: 6,
      title: 'Scenario archive located',
      body: 'A vast archive of simulated night-of scenarios has been found.' },

    // ─── ACT V · 160–180 · RECOVERY + FINAL REALIZATION (L7) ─
    { atMin: 160, roles: 'all', source: 'NEXORA CORE', priority: 'echo', lore: 6,
      title: 'RECONSTRUCTION MODE',
      body: 'Investigation mode is closing. Submit and reconstruct your findings now.' },
    { atMin: 163, roles: ['tech'], source: 'NEXORA Infrastructure', priority: 'echo', lore: 7,
      title: 'Simulation file surfaced',
      body: 'SCENARIO_9817442.sim indicates the entire night was simulated across thousands of variants.' },
    { atMin: 168, roles: ['exec'], source: 'Board Portal', priority: 'echo', lore: 7,
      title: 'Instance record',
      body: 'A continuity record references NEXORA INSTANCE 07 — an active experiment.' },
    { atMin: 172, roles: 'all', source: 'NEXORA CORE', priority: 'echo', lore: 7,
      title: 'COUNTERFACTUAL INSTANCES',
      body: 'Counterfactual instances counted: 12,481. Your reconstruction is being observed.' },
    { atMin: 176, roles: 'all', source: 'NEXORA CORE', priority: 'echo', lore: 7,
      title: 'SIMULATION STATUS',
      body: 'This investigation may itself be one of the instances. Finalize your verdict.' }
  ];

  // Sort defensively by time so ordering is deterministic.
  MASTER_TIMELINE.sort(function (a, b) { return a.atMin - b.atMin; });

  // ── STATE ───────────────────────────────────────────────────
  var fired = {};                 // { beatIndex: true } — never re-fires
  var feed = {};                  // { roleKey: [ {min,source,title,body,priority} ] }
  ROLE_KEYS.forEach(function (r) { feed[r] = []; });
  var FEED_MAX = 40;

  function beatTargets(beat) {
    if (beat.roles === 'all') return ROLE_KEYS.slice();
    return Array.isArray(beat.roles) ? beat.roles : [beat.roles];
  }

  function pushFeed(beat, min) {
    var entry = { min: beat.atMin, source: beat.source, title: beat.title, body: beat.body, priority: beat.priority };
    var targets = beatTargets(beat);
    targets.forEach(function (r) {
      if (!feed[r]) feed[r] = [];
      feed[r].push(entry);
      if (feed[r].length > FEED_MAX) feed[r].shift();
    });
  }

  // ── TIMELINE TICK ───────────────────────────────────────────
  function processTimeline(min) {
    var maxLore = maxLoreAt(min);
    var role = currentRole();

    for (var i = 0; i < MASTER_TIMELINE.length; i++) {
      if (fired[i]) continue;
      var beat = MASTER_TIMELINE[i];
      if (min < beat.atMin) continue; // not due yet

      // LORE FIREWALL — refuse (log-skip) any beat above the permitted level.
      if ((beat.lore || 0) > maxLore) {
        // Do NOT permanently burn it: a data-authoring error where atMin
        // sits below its own lore gate would simply wait for the gate.
        // (Authored data already respects the invariant.)
        if (!beat._warned) {
          beat._warned = true;
          try { console.warn('[EVENTS] lore firewall skipped beat', i, '(lore ' + beat.lore + ' > max ' + maxLore + ' at T+' + min + ')'); } catch (e) {}
        }
        continue;
      }

      var isAll = (beat.roles === 'all');
      var forCurrent = isAll || beatTargets(beat).indexOf(role) !== -1;

      // 'all' world beats fire regardless of role. Role beats fire only when
      // their role is current. Fire ONCE either way.
      if (!forCurrent) continue;

      fired[i] = true;
      pushFeed(beat, min);

      // Suppress the toast for stale beats surfaced late via a role switch,
      // but still record them in the Activity feed. Fresh beats always toast.
      var fresh = (min - beat.atMin) <= 6;
      if (fresh) {
        var body = '<strong>' + esc(beat.title) + '</strong><br>' + esc(beat.body);
        notify(beat.source, body, typeFor(beat.priority), durFor(beat.priority));
      }
    }
  }

  // ── UI: OBJECTIVE CHIP + PANEL ──────────────────────────────
  // Placement chosen to avoid every existing control:
  //   chat toggle .......... bottom-right (8994)
  //   investigation board .. bottom-left  (8994)
  //   verdict button ....... bottom-center(8994)
  //   storyboard button .... bottom-right offset (8993)
  //   incident banner ...... thin strip, top:48 (8995)
  //   echo lockdown wash .... top:48, pointer-events:none (8990)
  // The objective chip lives TOP-LEFT, just under the 48px top bar, and is
  // pushed down while the incident banner is showing (body.incident-active).
  var STYLE_ID = 'ee-obj-style';
  var CHIP_ID = 'ee-obj-chip';
  var PANEL_ID = 'ee-obj-panel';
  var uiBuilt = false;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = [
      '#' + CHIP_ID + '{',
      '  position:fixed; top:54px; left:10px; z-index:8992;',
      '  display:flex; align-items:center; gap:7px;',
      '  font-family:var(--font-mono,"SFMono-Regular",Consolas,monospace);',
      '  font-size:12px; font-weight:bold; letter-spacing:1px;',
      '  padding:6px 12px; border-radius:999px; cursor:pointer;',
      '  color:var(--echo,#7b2fff); background:var(--panel,#0d1119);',
      '  border:1px solid var(--echo,#7b2fff);',
      '  box-shadow:0 2px 12px rgba(0,0,0,0.5);',
      '  max-width:min(46vw,320px); white-space:nowrap; overflow:hidden;',
      '  text-overflow:ellipsis; user-select:none;',
      '  transition:transform .15s ease, box-shadow .15s ease, top .2s ease;',
      '}',
      '#' + CHIP_ID + ':hover{ transform:translateY(-1px); box-shadow:0 4px 16px rgba(123,47,255,0.5); }',
      '#' + CHIP_ID + ' .ee-chip-act{ color:var(--pulse,#00d0ff); opacity:.9; }',
      'body.incident-active #' + CHIP_ID + '{ top:88px; }',
      '#' + PANEL_ID + '{',
      '  position:fixed; top:92px; left:10px; z-index:8993;',
      '  width:min(92vw,340px); max-height:min(70vh,560px);',
      '  display:none; flex-direction:column; overflow:hidden;',
      '  font-family:var(--font-mono,"SFMono-Regular",Consolas,monospace);',
      '  background:var(--panel,#0d1119);',
      '  border:1px solid var(--echo,#7b2fff); border-radius:10px;',
      '  box-shadow:0 8px 32px rgba(0,0,0,0.7);',
      '}',
      'body.incident-active #' + PANEL_ID + '{ top:126px; }',
      '#' + PANEL_ID + '.ee-open{ display:flex; }',
      '#' + PANEL_ID + ' .ee-head{',
      '  display:flex; align-items:center; justify-content:space-between;',
      '  padding:10px 12px; border-bottom:1px solid rgba(123,47,255,0.35);',
      '  font-family:var(--font-display,"Segoe UI",sans-serif);',
      '  font-size:13px; font-weight:bold; letter-spacing:1px;',
      '  color:var(--echo,#7b2fff);',
      '}',
      '#' + PANEL_ID + ' .ee-close{ cursor:pointer; color:#8aaabb; font-size:16px; line-height:1; padding:0 4px; }',
      '#' + PANEL_ID + ' .ee-close:hover{ color:#fff; }',
      '#' + PANEL_ID + ' .ee-scroll{ overflow-y:auto; padding:12px; }',
      '#' + PANEL_ID + ' .ee-sec{ font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--pulse,#00d0ff); margin:0 0 6px; }',
      '#' + PANEL_ID + ' .ee-obj{',
      '  font-size:13px; line-height:1.5; color:#e8eef5; margin:0 0 4px;',
      '  padding:10px 12px; border-radius:8px;',
      '  background:rgba(123,47,255,0.10); border:1px solid rgba(123,47,255,0.30);',
      '}',
      '#' + PANEL_ID + ' .ee-role{ font-size:10px; color:#8aaabb; letter-spacing:1px; margin:6px 0 16px; }',
      '#' + PANEL_ID + ' .ee-feed{ list-style:none; margin:0; padding:0; }',
      '#' + PANEL_ID + ' .ee-item{',
      '  padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06);',
      '  font-size:12px; line-height:1.45;',
      '}',
      '#' + PANEL_ID + ' .ee-item:last-child{ border-bottom:0; }',
      '#' + PANEL_ID + ' .ee-item .ee-src{ color:var(--pulse,#00d0ff); font-weight:bold; }',
      '#' + PANEL_ID + ' .ee-item .ee-t{ color:#8aaabb; float:right; font-size:10px; }',
      '#' + PANEL_ID + ' .ee-item .ee-ttl{ color:#e8eef5; display:block; margin-top:2px; }',
      '#' + PANEL_ID + ' .ee-item .ee-bd{ color:#9fb0bf; display:block; margin-top:1px; font-size:11px; }',
      '#' + PANEL_ID + ' .ee-item.p-critical .ee-ttl,#' + PANEL_ID + ' .ee-item.p-security .ee-ttl{ color:var(--danger,#ff2255); }',
      '#' + PANEL_ID + ' .ee-item.p-warning .ee-ttl{ color:var(--warn,#ffb020); }',
      '#' + PANEL_ID + ' .ee-item.p-echo .ee-ttl,#' + PANEL_ID + ' .ee-item.p-story .ee-ttl{ color:var(--echo,#c08bff); }',
      '#' + PANEL_ID + ' .ee-empty{ color:#8aaabb; font-size:12px; font-style:italic; }',
      '@media (max-width:760px){',
      '  #' + CHIP_ID + '{ top:52px; font-size:11px; padding:5px 10px; max-width:60vw; }',
      '  #' + PANEL_ID + '{ top:86px; }',
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  function fmtT(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return 'T+' + (h > 0 ? (h + 'h') : '') + (mm < 10 && h > 0 ? '0' : '') + mm + 'm';
  }

  function buildUI() {
    if (uiBuilt) return;
    if (!document.body) return;
    injectStyle();

    var chip = document.createElement('div');
    chip.id = CHIP_ID;
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('title', 'Show your current objective and recent activity');
    chip.innerHTML = '<span>🎯 OBJECTIVE</span> <span class="ee-chip-act"></span>';

    var panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML =
      '<div class="ee-head"><span>🎯 OBJECTIVE</span><span class="ee-close" title="Close">✕</span></div>' +
      '<div class="ee-scroll">' +
      '  <p class="ee-sec">Current Objective</p>' +
      '  <div class="ee-obj"></div>' +
      '  <div class="ee-role"></div>' +
      '  <p class="ee-sec">Activity</p>' +
      '  <ul class="ee-feed"></ul>' +
      '</div>';

    document.body.appendChild(chip);
    document.body.appendChild(panel);

    function toggle() {
      var open = panel.classList.toggle('ee-open');
      if (open) renderPanel();
    }
    chip.addEventListener('click', toggle);
    chip.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    panel.querySelector('.ee-close').addEventListener('click', function () {
      panel.classList.remove('ee-open');
    });

    uiBuilt = true;
  }

  var lastChipRole = null, lastChipAct = -1;
  function updateChip() {
    var chip = document.getElementById(CHIP_ID);
    if (!chip) return;
    var act = currentAct(minutes());
    var actEl = chip.querySelector('.ee-chip-act');
    if (actEl && act.n !== lastChipAct) { actEl.textContent = '· ' + act.label; lastChipAct = act.n; }
    lastChipRole = currentRole();
  }

  function renderPanel() {
    var panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    var role = currentRole();
    var n = nx();
    var roleLabel = (n && n.ROLES && n.ROLES[role] && n.ROLES[role].label) ? n.ROLES[role].label : role.toUpperCase();

    var objEl = panel.querySelector('.ee-obj');
    var roleEl = panel.querySelector('.ee-role');
    var feedEl = panel.querySelector('.ee-feed');
    if (objEl) objEl.textContent = currentObjective(role);
    if (roleEl) roleEl.textContent = roleLabel + ' — ' + currentAct(minutes()).label;

    if (feedEl) {
      var items = (feed[role] || []).slice(-8).reverse();
      if (!items.length) {
        feedEl.innerHTML = '<li class="ee-empty">No activity yet. The world is quiet… for now.</li>';
      } else {
        feedEl.innerHTML = items.map(function (it) {
          return '<li class="ee-item p-' + esc(it.priority) + '">' +
            '<span class="ee-t">' + esc(fmtT(it.min)) + '</span>' +
            '<span class="ee-src">' + esc(it.source) + '</span>' +
            '<span class="ee-ttl">' + esc(it.title) + '</span>' +
            '<span class="ee-bd">' + esc(it.body) + '</span>' +
            '</li>';
        }).join('');
      }
    }
  }

  // ── MAIN LOOP (self-init, mirrors verdict.js) ───────────────
  var lastRole = null;
  var loop = setInterval(function () {
    try {
      if (!started()) return;
      if (!document.body) return;

      if (!uiBuilt) buildUI();

      var min = minutes();
      processTimeline(min);
      updateChip();

      // Re-render the open panel when the role changes (role switch) or on
      // each tick while open so objective/act/feed stay current — without
      // double-firing beats (that is guarded by the `fired` set).
      var role = currentRole();
      var panel = document.getElementById(PANEL_ID);
      var roleChanged = (role !== lastRole);
      lastRole = role;
      if (panel && panel.classList.contains('ee-open')) renderPanel();
      else if (roleChanged) { /* chip act label handled by updateChip */ }
    } catch (e) {
      try { console.warn('[EVENTS] tick error', e); } catch (_) {}
    }
  }, 1000);

  // ── PUBLIC API ──────────────────────────────────────────────
  window.EVENTS = {
    MASTER_TIMELINE: MASTER_TIMELINE,
    OBJECTIVES: OBJECTIVES,
    ACTS: ACTS,
    currentAct: currentAct,
    currentObjective: currentObjective,
    maxLoreAt: maxLoreAt,
    feedFor: function (role) { return (feed[role || currentRole()] || []).slice(); },
    // Introspection / debugging helpers (never required by the game).
    _firedCount: function () { return Object.keys(fired).length; },
    _stop: function () { try { clearInterval(loop); } catch (e) {} }
  };

})();
