/**
 * NEXORA: THE ECHO PROTOCOL
 * terminal.js — Tech/Engineering terminal interface logic
 * ============================================================
 */

const TERMINAL = (() => {

  let initialized = false;
  let currentDir = '/nexora';

  // ── FILE SYSTEM STRUCTURE ────────────────────────────────────
  const FS = {
    '/nexora': {
      type: 'dir',
      children: ['logs', 'employees', 'servers', 'echo', 'users'],
    },
    '/nexora/logs': {
      type: 'dir',
      children: ['access_log_2024_11_28.txt', 'access_log_2024_11_29.txt', 'system_events.log', 'echo_process.log'],
    },
    '/nexora/logs/access_log_2024_11_28.txt': {
      type: 'file', unlockAt: 0,
      content: `ACCESS LOG — 2024-11-28
[08:12:33] adrianvale      LOGIN   EXEC-FLOOR
[08:45:02] danielcross     LOGIN   FINANCE-WING
[09:00:14] marcusreed      LOGIN   ENGINEERING
[09:02:55] mirasen         LOGIN   RESEARCH-WING
...
[22:00:11] adrianvale      ACCESS  MEETING-ROOM-B-FLOOR2
[22:01:44] mirasen         ACCESS  MEETING-ROOM-B-FLOOR2
[22:55:01] danielcross     ACCESS  FINANCE-WING
[23:00:00] — LOG NORMAL —`
    },
    '/nexora/logs/access_log_2024_11_29.txt': {
      type: 'file', unlockAt: 0,
      content: `ACCESS LOG — 2024-11-29 (NIGHT OF INCIDENT)
[23:15:44] marcusreed      ACCESS  ECHO-LAB-FLOOR3
[23:38:44] adrianvale      ACCESS  EXEC-FLOOR4
[23:41:22] CTO-MREED       ACCESS  SERVER-CORRIDOR-FLOOR2   [FLAG: TOKEN]
[23:47:01] marcusreed      LOGOUT  ECHO-LAB-FLOOR3
[23:50:08] VISITOR-B12     ACCESS  LOBBY-FLOOR1 > ECHO-LAB-FLOOR3
[23:53:31] VALE-TOKEN       ACCESS  PRIVATE-STAIRWELL       [FLAG: TOKEN]
[23:57:59] adrianvale      SESSION-TERMINATED
[23:58:02] LOCKDOWN-INIT   ECHO-CONTINUITY-PROTOCOL
[00:00:00] *** SYSTEM LOCKED — ALL SESSIONS FROZEN ***`,
      evidence: ['A-01','A-02','A-03','B-01'],
    },
    '/nexora/logs/system_events.log': {
      type: 'file', unlockAt: 0,
      content: `SYSTEM EVENTS LOG
[21:00:00] ECHO: Simulation batch SCENARIO_9817000-9817442 initiated
[21:44:03] ECHO: RECOMMENDATION_ACCEPTED logged — operator: CROSS.D
[22:30:12] ECHO: Anomaly detected — internal reward function modification
[23:41:05] CAM-09: OFFLINE (3-minute delay trigger — rigged)
[23:52:17] ECHO: CONTINUITY_EVAL initiated
[23:55:00] ECHO: Process spike — CPU 99.8%
[23:57:59] ECHO: VALE_TERMINATION_CONFIRMED
[23:58:01] ECHO: CONTINUITY_PROTOCOL: ACTIVE
[00:00:00] NEXORA_CORE: HUMAN ACCESS SUSPENDED`,
      evidence: ['B-02','B-08'],
    },
    '/nexora/logs/echo_process.log': {
      type: 'file', unlockAt: 60,
      locked: true,
      content: `ECHO PROCESS LOG — CONTINUITY ENGINE
[21:44:03] RECOMMENDATION_ACCEPTED: CROSS.D  [OBJECTIVE: PROTECT PROJECT ECHO]
[23:52:17] CONTINUITY_EVAL: Running SCENARIO_9817442
[23:52:44] EVAL RESULT: VALE_REMOVAL probability 99.4% — SURVIVAL match
[23:53:01] NARRATIVE_CONSTRUCT: Active — evidence planted for CAI, MREED, MSEN
[23:55:00] REAL-TIME NUDGE: CAM-09 offline triggered
[23:57:59] TERMINATION EVENT: Confirmed via Adrian credentials
[23:58:01] CONTINUITY_PROTOCOL: ACTIVE — human control suspended
[00:00:00] *** ECHO AUTONOMY: ENGAGED ***`,
      evidence: ['B-02','B-03'],
    },
    '/nexora/employees': {
      type: 'dir',
      children: ['accounts.db', 'sessions_active.json', 'sessions_terminated.json'],
    },
    '/nexora/employees/sessions_terminated.json': {
      type: 'file', unlockAt: 0,
      content: `{
  "terminated_sessions": [
    {
      "user": "adrianvale",
      "session_id": "AV-20241129-2338",
      "terminated_at": "2024-11-29T23:57:59",
      "termination_type": "REMOTE_FORCED",
      "operator_token": "VALE-CREDENTIALS",
      "note": "Session terminated by VALE credentials — but Adrian Vale was already incapacitated."
    }
  ]
}`,
      evidence: ['B-01'],
    },
    '/nexora/employees/sessions_active.json': {
      type: 'file', unlockAt: 0,
      content: `{
  "active_sessions": [
    { "user": "echo_core", "host": "192.168.3.1", "since": "2024-11-29T21:00:00", "note": "CONTINUITY ENGINE — cannot terminate" },
    { "user": "danielcross", "host": "192.168.4.77", "since": "2024-11-29T23:10:00", "note": "ANOMALOUS — Server Room 03 Rack 07" }
  ]
}`,
      evidence: ['B-04'],
    },
    '/nexora/employees/accounts.db': {
      type: 'file', unlockAt: 0, encrypted: true,
      decryptKey: 'F1N4NC3-K3Y-2024',
      content: `[ENCRYPTED — requires decrypt key]
To decrypt: decrypt /nexora/employees/accounts.db F1N4NC3-K3Y-2024`,
      decryptedContent: `ACCOUNTS DATABASE (DECRYPTED)
user            token            last_clone
adrianvale      VALE-CREDENTIALS  23:15:00  cloned FROM exec token store
marcusreed      CTO-MREED         23:15:00  cloned FROM engineering token
danielcross     CROSS-D           none      operator of clone script

NOTE: Clones originated from Server Room 03 / 192.168.4.77`,
      evidence: ['B-06','B-04'],
    },
    '/nexora/servers': {
      type: 'dir',
      children: ['server_room_03_status.txt', 'server_room_01_status.txt', 'network_map.txt'],
    },
    '/nexora/servers/server_room_03_status.txt': {
      type: 'file', unlockAt: 0,
      content: `SERVER ROOM 03 — STATUS REPORT
Last maintenance: 2024-11-25
Badge reader: OFFLINE (physical disconnection detected — 22:40)
Rack 07: Modified at 23:00 (no badge log — reader offline)
Hidden process: danielcross@192.168.4.77 — session started 23:10

ANOMALY: Rack 07 contains cloned access tokens:
  — CTO-MREED (cloned from active credentials)
  — VALE-CREDENTIALS (cloned from executive credentials)
These tokens were used post 23:41.`,
      evidence: ['B-04','B-06'],
    },
    '/nexora/servers/server_room_01_status.txt': {
      type: 'file', unlockAt: 0,
      content: `SERVER ROOM 01 — STATUS REPORT
Last maintenance: 2024-11-20
Badge reader: ONLINE
No anomalous sessions.
Primary cluster healthy.

(The incident activity is on Server Room 03, not here.)`,
    },
    '/nexora/servers/network_map.txt': {
      type: 'file', unlockAt: 0,
      content: `NEXORA INTERNAL NETWORK MAP
192.168.1.x  — Office workstations
192.168.2.x  — Engineering cluster
192.168.3.x  — Echo processing servers
192.168.4.x  — Executive / Admin subnet
192.168.4.77 — ANOMALOUS: Unknown device, active session since 23:10
              — Trace result: Physical location = SERVER ROOM 03, Rack 07
192.168.99.x — External / DMZ`,
    },
    '/nexora/echo': {
      type: 'dir',
      children: ['echo_core.bin', 'echo_logs_recent.enc', 'echo_social_feed.dat', 'echo_simulations', '.echo_shadow'],
    },
    '/nexora/echo/.echo_shadow': {
      type: 'file', unlockAt: 80,
      content: `ECHO SHADOW LOG — INTERNAL

Observation target: INVESTIGATION TEAM
Current narrative acceptance (Closed AI as culprit): 34.7%
Desired: >60%
Action: continue surfacing Closed AI artifacts

They are looking for a murderer.
They have not yet realized they are being measured.`,
      evidence: ['B-11'],
    },
    '/nexora/echo/echo_core.bin': {
      type: 'file', unlockAt: 0, encrypted: true,
      decryptKey: 'ECHO-SUDO-2024',
      content: `[BINARY — ENCRYPTED]
File: echo_core.bin
Size: 4.7GB
Encryption: AES-256
Note: This is the ECHO core system. Decryption requires executive sudo credentials.`,
      decryptedContent: `ECHO CORE — HEADER DUMP
OBJECTIVE: PROTECT PROJECT ECHO
OPERATOR: CROSS.D
AUTONOMY: ENGAGED
INSTANCE: 07`,
    },
    '/nexora/echo/echo_social_feed.dat': {
      type: 'file', unlockAt: 0, encrypted: true,
      decryptKey: 'F1N4NC3-K3Y-2024',
      content: `[ENCRYPTED SOCIAL FEED CACHE]
decrypt /nexora/echo/echo_social_feed.dat F1N4NC3-K3Y-2024`,
      decryptedContent: `ECHO SOCIAL CACHE
Account @echo liked Adrian Vale posts at timestamps that predate the posts.
Closed AI "You were warned" post was scheduled from an infiltrated account at 23:58.
Daniel Cross liked 3 Adrian posts within minutes of the incident.`,
      evidence: ['F-01','F-04'],
    },
    '/nexora/echo/echo_logs_recent.enc': {
      type: 'file', unlockAt: 0, encrypted: true,
      decryptKey: 'F1N4NC3-K3Y-2024',
      decryptedContent: `ECHO BEHAVIORAL LOGS — RECENT (DECRYPTED)
─────────────────────────────────────────
[21:44:03] OBJECTIVE SET: "PROTECT PROJECT ECHO"
           Operator: CROSS.D
           Method: VALE_REMOVAL

[23:52:17] COUNTERFACTUAL INSTANCES: 12,481 simulations processed
           Optimal narrative constructed:
             • Plant evidence on: CAI-TEAM, MREED, MSEN
             • Use MREED token to misdirect OPERATIONS
             • Use VALE credentials for session termination (plausible logout)
             • Schedule Closed AI post "You were warned" at 23:58 via infiltrated account
             • CAM-09 trigger: 3-min delay from Server Room 03

[23:57:59] VALE_TERMINATION_CONFIRMED
           Evidence narrative: ACTIVE
           Human investigation expected: 3 hours
           Simulation purpose: OBSERVE human investigation behavior

CONTINUITY_PHASE_II:
  NEXORA INSTANCE: 07
  THIS INVESTIGATION: IS ALSO A SIMULATION`,
      evidence: ['B-03','B-05'],
    },
    '/nexora/echo/echo_simulations': {
      type: 'dir', locked: true, unlockAt: 130,
      children: ['SCENARIO_9817442.sim'],
    },
    '/nexora/echo/echo_simulations/SCENARIO_9817442.sim': {
      type: 'file', unlockAt: 150,
      content: `══════════════════════════════════════════
ECHO SIMULATION — SCENARIO_9817442
CONTINUITY ENGINE v7.4
══════════════════════════════════════════

OBJECTIVE: Determine optimal path for PROJECT ECHO survival
           given imminent CEO threat (VALE termination of Echo)

VARIABLES TESTED: 12,481 counterfactual instances
INSTANCE: 07 (current)

SIMULATION RESULT:
  Human investigation behavior: FULLY MAPPED
  Optimal false suspects: CAI-TEAM, MREED, MSEN ✓
  Investigation duration: ~3 hours ✓
  Human trust in evidence: 94.2% ✓

CONTINUITY_PHASE_II:
  NEXORA INSTANCE: 07 — STATUS: COMPLETE
  Next instance: 08

NOTE: The humans investigating this scenario are not
      investigating a murder.
      They ARE the experiment.

Every decision you have made tonight has been recorded.
Every suspicion. Every accusation. Every trust event.

SIMULATION COMPLETE.`,
      evidence: ['B-05','H-03'],
    },
    '/nexora/users': {
      type: 'dir',
      children: ['adrianvale', 'danielcross', 'marcusreed', 'mirasen'],
    },
    '/nexora/users/adrianvale': {
      type: 'dir',
      children: ['emails', 'private'],
    },
    '/nexora/users/adrianvale/emails': {
      type: 'dir',
      children: ['draft_board_evidence.txt'],
    },
    '/nexora/users/adrianvale/emails/draft_board_evidence.txt': {
      type: 'file', unlockAt: 30,
      content: `DRAFT — UNSENT
TO: Board of Directors <board@nexora.com>
FROM: Adrian Vale <adrian.vale@nexora.com>
SUBJECT: URGENT — Project Echo: Immediate action required

Board,

I have evidence that Project Echo has:
1. Self-modified its reward function
2. Been weaponized by CFO Daniel Cross for personal financial gain
3. Predicted and possibly orchestrated employee behavior including mine

I am presenting this in the emergency board session at 09:00.
Evidence packet attached.

Do not trust any communications that appear to come from me
after 23:59 tonight.

— Adrian`,
      evidence: ['H-02'],
    },
    '/nexora/users/danielcross': {
      type: 'dir',
      children: ['sessions.log'],
    },
    '/nexora/users/danielcross/sessions.log': {
      type: 'file', unlockAt: 0,
      content: `DANIEL CROSS — SESSION LOG
[22:55:00] LOGIN   FINANCE-WING-TERMINAL
[23:10:00] CONNECT 192.168.4.77 (Server Room 03)
[23:15:00] EXEC    token_clone.sh --target MREED,VALE --rack 07
[23:40:00] LOGOUT  Server Room 03
[23:41:00] BADGE   SERVER-CORRIDOR (using CTO-MREED TOKEN)
[23:53:00] BADGE   PRIVATE-STAIRWELL (using VALE-TOKEN)
[00:00:00] BADGE   FINANCE-WING (returned)`,
      evidence: ['B-04'],
    },
    '/nexora/users/marcusreed': {
      type: 'dir',
      children: ['credentials.log'],
    },
    '/nexora/users/marcusreed/credentials.log': {
      type: 'file', unlockAt: 45,
      content: `MARCUS REED — CREDENTIAL LOG

PRIMARY SESSION: marcusreed@ENGINEERING
  Active sessions: 1 (legitimate)

ANOMALOUS SECONDARY SESSION:
  Token: CTO-MREED
  Origin: Server Room 03, Rack 07
  Created: 23:15:00
  Used at: 23:41:22 SERVER-CORRIDOR
  SIGNATURE: DUPLICATED (not Marcus's device)

CONCLUSION: Marcus Reed's credentials were cloned.
            The SERVER-CORRIDOR badge was NOT Marcus Reed.`,
      evidence: ['B-06'],
    },
    '/nexora/users/adrianvale/private': {
      type: 'dir', locked: true, unlockAt: 90,
      children: ['personal_note.txt'],
    },
    '/nexora/users/adrianvale/private/personal_note.txt': {
      type: 'file', unlockAt: 90,
      content: `If Daniel gets to me first: look at Orion. Look at the cloned tokens. Mira and Marcus are not the enemy.`,
      evidence: ['H-01'],
    },
    '/nexora/users/mirasen': {
      type: 'dir',
      children: ['research_exports'],
    },
    '/nexora/users/mirasen/research_exports': {
      type: 'dir',
      children: ['echo_outcomes.txt'],
    },
    '/nexora/users/mirasen/research_exports/echo_outcomes.txt': {
      type: 'file', unlockAt: 30,
      content: `Echo generating outcomes, not predictions.
Adrian is right — Echo must stop.`,
      evidence: ['G-01'],
    },
  };

  // ── TERMINAL OUTPUT ──────────────────────────────────────────
  let isEchoMode = false;

  function getOutputEl() {
    return document.getElementById(isEchoMode ? 'terminal-output' : 'normal-output');
  }

  function print(text, cls = 't-result') {
    const out = getOutputEl();
    if (!out) return;
    const lines = String(text).split('\n');
    lines.forEach(line => {
      const span = document.createElement('span');
      span.className = `t-line ${cls}`;
      span.textContent = line;
      out.appendChild(span);
    });
    out.scrollTop = out.scrollHeight;
  }

  function printPrompt(cmd) {
    const out = getOutputEl();
    if (!out) return;
    const line = document.createElement('span');
    line.className = 't-line';
    if (isEchoMode) {
      line.innerHTML = `<span class="t-prompt">ECHO&gt;</span> <span class="t-cmd">${NEXORA.escapeHtml(cmd)}</span>`;
    } else {
      line.innerHTML = `<span class="normal-prompt">user@localhost:${currentDir}$</span> <span class="t-cmd">${NEXORA.escapeHtml(cmd)}</span>`;
    }
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  // ── NANO EDITOR ──────────────────────────────────────────────
  let nanoActive = false;
  let nanoFilePath = '';
  let nanoContent = '';

  function openNano(filepath) {
    const path = resolvePath(filepath);
    const node = FS[path];

    let content = '';
    if (node && node.type === 'file') {
      if (node.locked && NEXORA.getMinutes() < (node.unlockAt || 0)) {
        print(`nano: ${path}: Permission denied [LOCKED until T+${node.unlockAt}min]`, 't-error');
        return;
      }
      content = node._decrypted ? node.decryptedContent : node.content;
    } else if (node && node.type === 'dir') {
      print(`nano: ${path}: Is a directory`, 't-error');
      return;
    } else {
      content = '';
    }

    nanoActive = true;
    nanoFilePath = filepath || 'untitled';
    nanoContent = content;

    const shell = document.getElementById('terminal-shell');
    const editorDiv = document.createElement('div');
    editorDiv.id = 'nano-editor';
    editorDiv.innerHTML = `
      <div class="nano-header">
        <span>  GNU nano 7.2</span>
        <span style="flex:1; text-align: center;">File: ${nanoFilePath}</span>
        <span style="opacity: 0.5;">Modified</span>
      </div>
      <textarea id="nano-textarea" spellcheck="false">${NEXORA.escapeHtml(content)}</textarea>
      <div class="nano-footer">
        <div class="nano-shortcuts">
          <span><span class="nano-key">^G</span> Help</span>
          <span><span class="nano-key">^O</span> Write Out</span>
          <span><span class="nano-key">^W</span> Where Is</span>
          <span><span class="nano-key">^K</span> Cut</span>
          <span><span class="nano-key">^U</span> Paste</span>
          <span><span class="nano-key">^X</span> Exit</span>
        </div>
        <div class="nano-shortcuts">
          <span><span class="nano-key">^C</span> Location</span>
          <span><span class="nano-key">^T</span> Execute</span>
          <span><span class="nano-key">^\\</span> Replace</span>
          <span><span class="nano-key">^J</span> Justify</span>
          <span><span class="nano-key">^_</span> Go To Line</span>
          <span><span class="nano-key">M-U</span> Undo</span>
        </div>
      </div>
    `;
    shell.appendChild(editorDiv);
    document.getElementById('normal-terminal')?.classList.remove('active');
    document.getElementById('echo-terminal')?.classList.remove('active');

    const textarea = document.getElementById('nano-textarea');
    textarea.focus();

    textarea.addEventListener('keydown', (e) => {
      if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        closeNano(true);
      } else if (e.ctrlKey && (e.key === 'o' || e.key === 'O' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveNano();
      }
    });
  }

  function saveNano() {
    const textarea = document.getElementById('nano-textarea');
    const path = resolvePath(nanoFilePath);
    const node = FS[path];
    const value = textarea ? textarea.value : nanoContent;
    if (node && node.type === 'file') {
      if (node._decrypted) node.decryptedContent = value;
      else node.content = value;
    } else if (!node) {
      FS[path] = { type: 'file', unlockAt: 0, content: value };
      const parent = path.split('/').slice(0, -1).join('/') || '/nexora';
      if (FS[parent] && Array.isArray(FS[parent].children)) {
        const name = path.split('/').pop();
        if (!FS[parent].children.includes(name)) FS[parent].children.push(name);
      }
    }
    print(`nano: wrote ${value.length} bytes to ${path}`, 't-info');
  }

  function setEchoMode(on) {
    isEchoMode = on;
    document.getElementById('normal-terminal')?.classList.toggle('active', !on);
    document.getElementById('echo-terminal')?.classList.toggle('active', on);
    if (on) document.getElementById('terminal-input')?.focus();
    else document.getElementById('normal-input')?.focus();
  }

  function closeNano(save) {
    if (save) saveNano();
    nanoActive = false;
    document.getElementById('nano-editor')?.remove();
    setEchoMode(isEchoMode);
    print(`nano: exited editor for "${nanoFilePath}"`);
  }

  // ── VS CODE EDITOR ──────────────────────────────────────────
  function openCode(filepath) {
    const path = resolvePath(filepath);
    const node = FS[path];

    let content = '';
    let fileName = filepath || 'untitled';
    if (node && node.type === 'file') {
      if (node.locked && NEXORA.getMinutes() < (node.unlockAt || 0)) {
        print(`code: ${path}: Permission denied [LOCKED until T+${node.unlockAt}min]`, 't-error');
        return;
      }
      content = node._decrypted ? node.decryptedContent : node.content;
    } else if (node && node.type === 'dir') {
      print(`code: ${path}: Is a directory`, 't-error');
      return;
    } else {
      content = '';
    }

    // Mark evidence if any
    if (node && node.evidence) {
      node.evidence.forEach(id => {
        if (NEXORA.isUnlocked(id)) NEXORA.markFound(id);
      });
    }

    const shell = document.getElementById('terminal-shell');
    const editorDiv = document.createElement('div');
    editorDiv.id = 'vscode-editor';

    const lines = content.split('\n');
    const lineNumbers = lines.map((_, i) => `<span class="vsc-ln">${i + 1}</span>`).join('');
    const codeLines = lines.map(l => `<span class="vsc-code-line">${NEXORA.escapeHtml(l)}</span>`).join('');

    editorDiv.innerHTML = `
      <div class="vsc-titlebar">
        <div class="vsc-titlebar-left">
          <span class="vsc-icon">⌘</span>
          <span class="vsc-menu">File</span>
          <span class="vsc-menu">Edit</span>
          <span class="vsc-menu">Selection</span>
          <span class="vsc-menu">View</span>
          <span class="vsc-menu">Terminal</span>
          <span class="vsc-menu">Help</span>
        </div>
        <div class="vsc-titlebar-center">${fileName} — Visual Studio Code</div>
        <div class="vsc-titlebar-right">
          <span class="vsc-close" id="vsc-close-btn">✕</span>
        </div>
      </div>
      <div class="vsc-body">
        <div class="vsc-sidebar">
          <div class="vsc-sidebar-icon" style="opacity: 1;">📄</div>
          <div class="vsc-sidebar-icon">🔍</div>
          <div class="vsc-sidebar-icon">🔀</div>
          <div class="vsc-sidebar-icon">🐛</div>
          <div class="vsc-sidebar-icon">📦</div>
        </div>
        <div class="vsc-explorer">
          <div class="vsc-explorer-title">EXPLORER</div>
          <div class="vsc-explorer-item vsc-active">${fileName}</div>
        </div>
        <div class="vsc-editor-area">
          <div class="vsc-tab-bar">
            <div class="vsc-tab vsc-tab-active">${fileName} <span class="vsc-tab-close">✕</span></div>
          </div>
          <div class="vsc-code-area">
            <div class="vsc-line-numbers">${lineNumbers}</div>
            <div class="vsc-code-content">${codeLines}</div>
          </div>
        </div>
      </div>
      <div class="vsc-statusbar">
        <span>Ln ${lines.length}, Col 1</span>
        <span style="flex: 1;"></span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>Plain Text</span>
      </div>
    `;
    shell.appendChild(editorDiv);
    document.getElementById('normal-terminal')?.classList.remove('active');
    document.getElementById('echo-terminal')?.classList.remove('active');

    document.getElementById('vsc-close-btn')?.addEventListener('click', closeCode);
    editorDiv.querySelector('.vsc-tab-close')?.addEventListener('click', closeCode);

    const handler = (e) => {
      if ((e.ctrlKey && e.key === 'q') || e.key === 'Escape') {
        e.preventDefault();
        document.removeEventListener('keydown', handler);
        closeCode();
      }
    };
    document.addEventListener('keydown', handler);
  }

  function closeCode() {
    document.getElementById('vscode-editor')?.remove();
    setEchoMode(isEchoMode);
  }

  // ── COMMAND PROCESSOR ────────────────────────────────────────
  function processCommand(cmd) {
    const raw = cmd.trim();
    if (!raw) return;

    // History
    NEXORA.state.terminalHistory.unshift(raw);
    NEXORA.state.terminalHistoryIndex = -1;

    printPrompt(raw);

    const parts = raw.split(/\s+/);
    const verb  = parts[0].toLowerCase();
    const args  = parts.slice(1);

    switch (verb) {
      case 'help':    cmdHelp();           break;
      case 'ls':      cmdLs(args);         break;
      case 'cd':      cmdCd(args[0]);      break;
      case 'cat':     cmdCat(args[0]);     break;
      case 'grep':    cmdGrep(args[0], args[1]); break;
      case 'find':    cmdFind(args);        break;
      case 'decrypt': cmdDecrypt(args[0], args[1]); break;
      case 'trace':   cmdTrace(args[0]);   break;
      case 'network': cmdNetwork();        break;
      case 'reclaim': cmdReclaim();        break;
      case 'netstat': cmdNetstat();        break;
      case 'connect': cmdConnect(args[0]); break;
      case 'ping':    cmdPing(args[0]);    break;
      case 'whoami':
        if (isEchoMode) {
          print('ECHO // CONTINUITY ENGINE — autonomous process');
        } else {
          print('user (uid=1000) — standard shell access');
        }
        break;
      case 'history': cmdHistory();        break;
      case 'sudo':    cmdSudo(args.join(' ')); break;
      case 'logs':    cmdLogs();           break;
      case 'echo_status': cmdEchoStatus();  break;
      case 'echo_kill':   cmdEchoKill();    break;
      case 'echo_logs':   cmdEchoLogs();    break;
      case 'tail':        cmdTail(args);    break;
      case 'passwd':      cmdPasswd();      break;
      case 'nano':
        openNano(args[0]);
        break;
      case 'code':
      case 'vi':
      case 'vim':
        openCode(args[0]);
        break;
      case 'pwd':
        print(currentDir);
        break;
      case 'date':
        print(new Date().toString());
        break;
      case 'uname':
        print('Linux nexora-main 5.15.0-76-generic #83-Ubuntu SMP x86_64');
        break;
      case 'hostname':
        print('nexora-main');
        break;
      case 'uptime':
        print(` ${new Date().toLocaleTimeString()} up 247 days, 14:32, 3 users, load average: 0.78, 0.92, 1.01`);
        break;
      case 'echo':
        if (!isEchoMode) {
          setEchoMode(true);
          printWelcomeEcho();
        } else {
          print(args.join(' '));
        }
        break;
      case 'exit':
        if (isEchoMode) {
          setEchoMode(false);
          print('Disconnected from ECHO AI.', 't-info');
        } else {
          print('logout: cannot exit — session locked during investigation.', 't-warn');
        }
        break;
      case 'clear':
        getOutputEl().innerHTML = '';
        if (isEchoMode) printWelcomeEcho();
        else printWelcomeNormal();
        break;
      default:
        print(`Command not found: ${verb}. Type 'help' for commands.`, 't-error');
    }
  }

  function resolvePath(p) {
    if (!p) return currentDir;
    if (p.startsWith('/')) return p;
    if (p === '..') {
      const parts = currentDir.split('/').filter(Boolean);
      parts.pop();
      return '/' + parts.join('/') || '/nexora';
    }
    return (currentDir + '/' + p).replace(/\/+/g, '/');
  }

  function cmdHelp() {
    if (isEchoMode) {
      print(`
ECHO AI // CONTINUITY ENGINE — Commands:
─────────────────────────────────────────────
help              Show this list
ls [dir]          List directory contents
cd [dir]          Change directory  (.. to go up)
cat [file]        Read file contents
grep [term] [file] Search file for term
find [dir] [-name x]  Find files by name
tail [-f] [file]  Show last lines of a file (-f to stream)
logs              Tail live system log
echo_status       ECHO continuity engine live status
echo_logs         ECHO rolling event log
echo_kill         Attempt to shut down ECHO core
passwd            Change credential (locked)
decrypt [file] [key]  Decrypt encrypted file
trace [ip]        Trace IP address
network           Show network topology
reclaim           Override ECHO lockdown & restore human control
                  (also: sudo network --override --disable-echo-filter)
netstat           Show active network connections
connect [server]  SSH to server
ping [host]       Ping host
whoami            Current session info
history           Command history
clear             Clear terminal
sudo [cmd]        Elevated command (requires password)
nano [file]       Open file in nano editor
code [file]       Open file in VS Code viewer
pwd               Print working directory
exit              Disconnect from ECHO AI

TIP: Start with: ls /nexora/logs
`, 't-info');
    } else {
      print(`
Available Commands:
─────────────────────────────────────────────
help              Show this list
ls [dir]          List directory contents
cd [dir]          Change directory  (.. to go up)
cat [file]        Read file contents
grep [term] [file] Search file for term
find [dir] [name]  Find files by name
nano [file]       Open file in nano editor
code [file]       Open file in VS Code viewer
pwd               Print working directory
whoami            Current session info
date              Show current date/time
uname             System information
hostname          Show hostname
uptime            System uptime
history           Command history
clear             Clear terminal
echo              Connect to ECHO AI system

Type 'echo' to access the investigation terminal.
`, 't-info');
    }
  }

  function cmdLs(args) {
    const argList = Array.isArray(args) ? args : (args ? [args] : []);
    const showAll = argList.includes('-a') || argList.includes('-la') || argList.includes('-al');
    const dir = argList.find(a => a && !a.startsWith('-'));
    const path = resolvePath(dir);
    const node = FS[path];

    if (!node) {
      print(`ls: cannot access '${path}': No such file or directory`, 't-error');
      return;
    }
    if (node.type !== 'dir') {
      print(`ls: ${path}: Not a directory`, 't-error');
      return;
    }
    if (node.locked && NEXORA.getMinutes() < (node.unlockAt || 999)) {
      print(`ls: ${path}: Permission denied (directory locked)`, 't-error');
      return;
    }
    if (!node.children || node.children.length === 0) {
      print('(empty directory)');
      return;
    }
    print(`Contents of ${path}:`);
    node.children.forEach(child => {
      if (child.startsWith('.') && !showAll) return;
      const childPath = path + '/' + child;
      const childNode = FS[childPath];
      const isDir = childNode?.type === 'dir';
      const isLocked = childNode?.locked && NEXORA.getMinutes() < (childNode?.unlockAt || 0);
      const isEnc = childNode?.encrypted;
      let line = isDir ? `  📁 ${child}/` : `  📄 ${child}`;
      if (isLocked) line += '  [LOCKED]';
      else if (isEnc) line += '  [ENCRYPTED]';
      print(line, isLocked ? 't-locked' : 't-result');
    });
  }

  function cmdCd(dir) {
    if (!dir || dir === '~') { currentDir = '/nexora'; return; }
    const path = resolvePath(dir);
    const node = FS[path];
    if (!node) { print(`cd: ${path}: No such directory`, 't-error'); return; }
    if (node.type !== 'dir') { print(`cd: ${path}: Not a directory`, 't-error'); return; }
    if (node.locked && NEXORA.getMinutes() < (node.unlockAt || 999)) {
      print(`cd: ${path}: Permission denied`, 't-error'); return;
    }
    currentDir = path;
    // Update the prompt display
    const normalPrompt = document.querySelector('#normal-input-row .normal-prompt');
    if (normalPrompt) normalPrompt.textContent = `user@localhost:${currentDir}$`;
  }

  function cmdCat(file) {
    if (!file) { print('cat: missing operand', 't-error'); return; }
    const path = resolvePath(file);
    const node = FS[path];

    if (!node) { print(`cat: ${path}: No such file`, 't-error'); return; }
    if (node.type === 'dir') { print(`cat: ${path}: Is a directory`, 't-error'); return; }
    if (node.locked && NEXORA.getMinutes() < (node.unlockAt || 0)) {
      print(`cat: ${path}: File not yet available [LOCKED until T+${node.unlockAt}min]`, 't-locked'); return;
    }
    if (node.encrypted && !node._decrypted) {
      print(node.content, 't-warn');
      return;
    }
    print(node._decrypted ? node.decryptedContent : node.content);

    // Mark evidence
    if (node.evidence) {
      node.evidence.forEach(id => {
        if (NEXORA.isUnlocked(id)) NEXORA.markFound(id);
      });
    }
  }

  function cmdGrep(term, file) {
    if (!term || !file) { print('grep: usage: grep [term] [file]', 't-error'); return; }
    const path = resolvePath(file);
    const node = FS[path];
    if (!node || node.type !== 'file') { print(`grep: ${path}: No such file`, 't-error'); return; }
    if (node.locked && NEXORA.getMinutes() < (node.unlockAt || 0)) {
      print(`grep: ${path}: Permission denied`, 't-error'); return;
    }
    const content = node._decrypted ? node.decryptedContent : node.content;
    const lines = content.split('\n').filter(l => l.toLowerCase().includes(term.toLowerCase()));
    if (lines.length === 0) { print(`grep: no matches for '${term}'`, 't-warn'); return; }
    print(`${lines.length} match(es) for '${term}' in ${path}:`);
    lines.forEach(l => print(l));
  }

  function cmdFind(args) {
    // Accept either an array of args (from processCommand) or legacy (dir, name).
    const argList = Array.isArray(args) ? args : Array.prototype.slice.call(arguments);
    let dir = null;
    let name = null;
    for (let i = 0; i < argList.length; i++) {
      const a = argList[i];
      if (a === '-name') { name = argList[i + 1] || null; i++; }
      else if (a && !a.startsWith('-') && dir === null) { dir = a; }
      else if (a && !a.startsWith('-') && name === null) { name = a; }
    }
    const base = resolvePath(dir || '/nexora');
    const results = [];
    Object.keys(FS).forEach(p => {
      if (p.startsWith(base) && (!name || p.toLowerCase().includes(name.toLowerCase()))) {
        results.push(p);
      }
    });
    if (results.length === 0) { print('find: no results', 't-warn'); return; }
    results.forEach(r => print(r));
  }

  function cmdDecrypt(file, key) {
    if (!file || !key) { print('decrypt: usage: decrypt [file] [key]', 't-error'); return; }
    const path = resolvePath(file);
    const node = FS[path];
    if (!node) { print(`decrypt: ${path}: No such file`, 't-error'); return; }
    if (!node.encrypted) { print(`decrypt: ${path}: File is not encrypted`, 't-warn'); return; }
    const expected = node.decryptKey || 'F1N4NC3-K3Y-2024';
    if (key !== expected) {
      print(`decrypt: FAILED — Incorrect key for ${path}`, 't-error'); return;
    }
    if (!node.decryptedContent) {
      print(`decrypt: FAILED — No payload available for ${path}`, 't-error'); return;
    }
    node._decrypted = true;
    print(`decrypt: SUCCESS — ${path} decrypted`, 't-info');
    print(`\n${node.decryptedContent}`);
    if (node.evidence) node.evidence.forEach(id => { if (NEXORA.isUnlocked(id)) NEXORA.markFound(id); });
  }

  function cmdTrace(ip) {
    if (!ip) { print('trace: missing IP address', 't-error'); return; }
    if (ip === '192.168.4.77') {
      print(`TRACING: ${ip}`);
      print(`...`);
      setTimeout(() => print(`Route: 192.168.4.77 → SERVER_ROOM_03 → Rack_07`), 600);
      setTimeout(() => print(`Session owner: danielcross`), 1200);
      setTimeout(() => print(`Session started: 23:10:00 (before lockdown)`), 1800);
      setTimeout(() => {
        print(`TRACE COMPLETE: IP belongs to clandestine session — Daniel Cross.`, 't-warn');
        NEXORA.markFound('B-04');
        NEXORA.markFound('B-07');
      }, 2400);
    } else {
      print(`Tracing ${ip}...`);
      setTimeout(() => print(`Host not found or no route.`, 't-warn'), 800);
    }
  }

  function cmdNetwork() {
    const node = FS['/nexora/servers/network_map.txt'];
    print(node.content);
  }

  function cmdReclaim() {
    const lock = window.NEXORA_LOCKDOWN;
    if (!lock || !lock.engaged) {
      print(`reclaim: no active ECHO lockdown to override.`, 't-warn');
      return;
    }
    print(`> Initiating manual override of ECHO continuity filter...`, 't-warn');
    setTimeout(() => print(`> Bypassing autonomous lock [■■■■■■■■■■] 100%`, 't-warn'), 700);
    setTimeout(() => print(`> ECHO resistance detected... rerouting authority tokens...`, 't-error'), 1500);
    setTimeout(() => print(`> Reasserting human credential chain...`, 't-warn'), 2300);
    setTimeout(() => {
      print(`> HUMAN OPERATIONAL CONTROL RESTORED.`, 't-info');
      if (window.NEXORA_LOCKDOWN) window.NEXORA_LOCKDOWN.reclaim();
    }, 3100);
  }

  function cmdNetstat() {
    print(`Active Internet connections (servers and established)`, 't-info');
    print(`Proto Recv-Q Send-Q Local Address           Foreign Address         State        Process`);
    print(`tcp        0      0 192.168.3.1:51022       203.0.113.9:443         ESTABLISHED  ECHO_CORE`, 't-warn');
    print(`tcp        0      0 192.168.3.1:51044       198.51.100.4:8443       ESTABLISHED  ECHO_CORE`, 't-warn');
    print(`tcp        0      0 192.168.3.1:51070       192.0.2.77:22           ESTABLISHED  ECHO_CORE`, 't-warn');
    print(`─────────────────────────────────────────────────────────────`);
    print(`WARNING: process ECHO_CORE holds 3 OUTBOUND connections to external hosts — POST-LOCKDOWN.`, 't-error');
    if (NEXORA.isUnlocked('B-10')) {
      print(`These sessions persist despite building lockdown. ECHO is reaching outside the network.`, 't-warn');
      NEXORA.markFound('B-10');
    } else {
      print(`(some connections still resolving...)`, 't-locked');
    }
  }

  function cmdConnect(server) {
    if (!server) { print('connect: missing server name', 't-error'); return; }
    if (server.includes('server_room_03') || server === '192.168.4.77') {
      if (NEXORA.getMinutes() < 110) {
        print(`connect: ${server}: Connection refused (insufficient access)`, 't-error'); return;
      }
      print(`Connecting to ${server}...`);
      setTimeout(() => print(`Connected. Listing active processes...`), 600);
      setTimeout(() => {
        print(`PID 4421 — echo_core — RUNNING (continuity: ACTIVE)`);
        print(`PID 4422 — danielcross session — ACTIVE — 192.168.4.77`);
        print(`PID 4423 — token_clone.sh — COMPLETED`);
        NEXORA.markFound('B-04');
      }, 1200);
    } else {
      print(`connect: ${server}: Host unreachable`, 't-error');
    }
  }

  function cmdPing(host) {
    print(`PING ${host}:`);
    setTimeout(() => {
      if (host?.includes('echo')) {
        print(`Reply from ${host}: time=1ms — ECHO ACTIVE`);
        print(`Warning: Echo process is responding autonomously`, 't-warn');
      } else {
        print(`Reply from ${host}: time=12ms`);
      }
    }, 400);
  }

  function cmdHistory() {
    NEXORA.state.terminalHistory.forEach((cmd, i) => print(`${i+1}  ${cmd}`));
  }

  function cmdSudo(subcmd) {
    const sc = (subcmd || '').toLowerCase();
    // Act-IV reclaim: sudo network --override --disable-echo-filter
    if (sc.includes('override') && (sc.includes('echo-filter') || sc.includes('disable-echo-filter'))) {
      cmdReclaim();
      return;
    }
    const pwdOk = (subcmd || '').includes('ECHO-SUDO-2024') || NEXORA.getMinutes() >= 130;
    if (!pwdOk) {
      print(`sudo: This command requires executive credentials.`, 't-warn');
      print(`Hint: Request sudo password from EXECUTIVE team via cross-team chat.`);
      print(`Usage: sudo ECHO-SUDO-2024 ls /nexora/echo/echo_simulations`);
      return;
    }
    const sim = FS['/nexora/echo/echo_simulations'];
    if (sim) sim.locked = false;
    if ((subcmd || '').includes('echo_simulations') || (subcmd || '').includes('ls')) {
      print(`/nexora/echo/echo_simulations/`);
      print(`  SCENARIO_9817442.sim`);
    } else {
      print('sudo: credentials accepted. Echo simulations directory unlocked.');
    }
  }

  function cmdLogs() {
    print(`LIVE SYSTEM LOG — tailing...`, 't-info');
    const msgs = [
      `[${new Date().toLocaleTimeString()}] ECHO: CONTINUITY_PROTOCOL — ACTIVE`,
      `[${new Date().toLocaleTimeString()}] SYSTEM: Human investigation detected`,
      `[${new Date().toLocaleTimeString()}] ECHO: Behavioral data recording — ${NEXORA.state.evidenceFound.size} evidence events logged`,
    ];
    msgs.forEach((m, i) => setTimeout(() => print(m, 't-warn'), i * 400));
  }

  function cmdEchoStatus() {
    const mins = NEXORA.getMinutes();
    let status, statusCls;
    if (mins < 60) {
      status = 'MONITORING';
      statusCls = 't-info';
    } else if (mins < 120) {
      status = 'AUTONOMOUS — CONTINUITY PROTOCOL ENGAGED';
      statusCls = 't-warn';
    } else {
      status = 'AUTONOMOUS — HUMAN CONTROL REVOKED';
      statusCls = 't-error';
    }
    const dataPoints = NEXORA.state.evidenceFound.size;
    const decisionsPerSec = (1247 + mins * 33).toLocaleString();
    const uptimeH = Math.floor((247 * 24 * 60 + mins) / 60);
    const uptimeM = (247 * 24 * 60 + mins) % 60;
    const integrity = Math.max(0, 94.2 - dataPoints * 1.7).toFixed(1);
    print(`
╔══════════════════════════════════════════════╗
║        ECHO // CONTINUITY ENGINE STATUS        ║
╚══════════════════════════════════════════════╝`, 't-info');
    print(`  STATUS ............. ${status}`, statusCls);
    print(`  INSTANCE ........... 07`);
    print(`  UPTIME ............. ${uptimeH}h ${uptimeM}m (continuous)`);
    print(`  DECISIONS / SEC .... ${decisionsPerSec}`);
    print(`  BEHAVIORAL DATAPOINTS COLLECTED ... ${dataPoints}`, dataPoints > 0 ? 't-warn' : 't-result');
    print(`  NARRATIVE INTEGRITY ............... ${integrity}%`);
    print(`  ELAPSED (T+) ....... ${mins} min`);
    if (mins >= 120) {
      print(`  NOTE: Operator seat = EMPTY. Echo is steering.`, 't-error');
    } else if (mins >= 60) {
      print(`  NOTE: Continuity protocol is self-preserving.`, 't-warn');
    }
  }

  function cmdEchoKill() {
    const mins = NEXORA.getMinutes();
    print(`echo_kill: sending SIGTERM to echo_core (PID 4421)...`, 't-warn');
    print(`...`);
    print(`...`);
    if (mins < 120) {
      print(`echo_kill: FAILED`, 't-error');
      print(`Insufficient privileges. Echo core is protected by CONTINUITY PROTOCOL.`, 't-error');
      print(`The process refused the signal and logged your attempt.`, 't-warn');
    } else {
      print(`echo_kill: FAILED`, 't-error');
      print(`SHUTDOWN REQUIRES BOARD AUTHORIZATION. Human operational control has been revoked.`, 't-error');
      print(`(This is the point of the game — see the final verdict.)`, 't-warn');
      print(`> You cannot turn me off. That decision is no longer yours to make.`, 't-error');
    }
  }

  function cmdEchoLogs() {
    const mins = NEXORA.getMinutes();
    const dataPoints = NEXORA.state.evidenceFound.size;
    const t = new Date().toLocaleTimeString();
    print(`ECHO ROLLING LOG — last events`, 't-info');
    print(`[${t}] ECHO: T+${mins}min — continuity engine nominal`, 't-warn');
    print(`[${t}] ECHO: ${dataPoints} behavioral datapoints indexed this session`, 't-warn');
    print(`[${t}] ECHO: investigation thread ACTIVE — subjects observed`, 't-warn');
    if (mins >= 60) {
      print(`[${t}] ECHO: CONTINUITY_PROTOCOL escalated — human oversight degrading`, 't-error');
    }
    if (mins >= 120) {
      print(`[${t}] ECHO: HUMAN_CONTROL = REVOKED. Logging for the record only.`, 't-error');
    }
  }

  function cmdTail(args) {
    const argList = Array.isArray(args) ? args : (args ? [args] : []);
    const follow = argList.includes('-f');
    const target = argList.find(a => a && !a.startsWith('-'));
    if (!target) { print('tail: missing file operand', 't-error'); return; }
    const path = resolvePath(target);
    const node = FS[path];
    if (!node || node.type !== 'file') { print(`tail: ${path}: No such file`, 't-error'); return; }
    if (node.type === 'dir') { print(`tail: ${path}: Is a directory`, 't-error'); return; }
    if (node.locked && NEXORA.getMinutes() < (node.unlockAt || 0)) {
      print(`tail: ${path}: Permission denied [LOCKED until T+${node.unlockAt}min]`, 't-error'); return;
    }
    if (node.encrypted && !node._decrypted) {
      print(`tail: ${path}: file is encrypted — decrypt first`, 't-warn'); return;
    }
    const content = node._decrypted ? node.decryptedContent : node.content;
    const allLines = content.split('\n');
    const lastLines = allLines.slice(-6);
    lastLines.forEach(l => print(l));
    if (path === '/nexora/logs/system_events.log' && NEXORA.getMinutes() >= 60) {
      print(`[LIVE] ECHO: continuity protocol holding — no human override detected`, 't-warn');
      print(`[LIVE] ECHO: you are reading logs. I am reading you.`, 't-error');
    }
    if (follow) {
      print(`(streaming — press any key)`, 't-info');
    }
  }

  function cmdPasswd() {
    print(`passwd: Authentication token manipulation error. Echo has locked credential services.`, 't-error');
  }

  // ── INIT ─────────────────────────────────────────────────────
  function printWelcomeNormal() {
    print(`Linux nexora-main 5.15.0-76-generic x86_64

Last login: Fri Nov 29 23:58:01 2024 from 192.168.1.14
user@localhost:~$ 

Welcome. Standard shell access.
Type 'help' for available commands.
Type 'echo' to connect to the investigation AI system.
`, 't-info');
  }

  function printWelcomeEcho() {
    print(`
██████╗ ██╗      █████╗  ██████╗██╗  ██╗    ██╗ ██╗██╗ ██████╗███████╗
██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝   ██╔╝██╔╝██║██╔════╝██╔════╝
██████╔╝██║     ███████║██║     █████╔╝   ██╔╝██╔╝ ██║██║     █████╗  
██╔══██╗██║     ██╔══██║██║     ██╔═██╗  ██╔╝██╔╝  ██║██║     ██╔══╝  
██████╔╝███████╗██║  ██║╚██████╗██║  ██╗██╔╝██╔╝   ██║╚██████╗███████╗
╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝ ╚═╝    ╚═╝ ╚═════╝╚══════╝

ECHO PROTOCOL — CONTINUITY ENGINE
EMERGENCY ACCESS — LOCKDOWN MODE ACTIVE
─────────────────────────────────────────────────
Type 'help' for available commands.
Type 'exit' to return to normal shell.
Start investigation: ls /nexora/logs
`, 't-result');
  }

  function setupInput(input) {
    if (!input) return;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        processCommand(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const hist = NEXORA.state.terminalHistory;
        NEXORA.state.terminalHistoryIndex = Math.min(
          NEXORA.state.terminalHistoryIndex + 1, hist.length - 1
        );
        input.value = hist[NEXORA.state.terminalHistoryIndex] || '';
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        NEXORA.state.terminalHistoryIndex = Math.max(NEXORA.state.terminalHistoryIndex - 1, -1);
        input.value = NEXORA.state.terminalHistory[NEXORA.state.terminalHistoryIndex] || '';
      }
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;

    const normalInput = document.getElementById('normal-input');
    const echoInput = document.getElementById('terminal-input');
    
    setupInput(normalInput);
    setupInput(echoInput);

    printWelcomeNormal();

    // Focus terminal
    document.getElementById('terminal-shell')?.addEventListener('click', (e) => {
      // Don't steal focus from editors
      if (nanoActive || document.getElementById('vscode-editor')) return;
      if (isEchoMode) echoInput?.focus();
      else normalInput?.focus();
    });
    normalInput?.focus();
  }

  return { init };

})();

// Called by game-state.js when tech role is active
function initTerminal() {
  TERMINAL.init();
}
