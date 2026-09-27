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

  // The live prompt/input line lives INSIDE the scrolling output (moved there
  // in init), so it flows right after the last output line like a real shell.
  function getInputRow() {
    return document.getElementById(isEchoMode ? 'terminal-input-row' : 'normal-input-row');
  }

  // Append output, but keep the live input line last (insert before it).
  function appendLine(out, node) {
    const row = getInputRow();
    if (row && row.parentElement === out) out.insertBefore(node, row);
    else out.appendChild(node);
  }

  function print(text, cls = 't-result') {
    const out = getOutputEl();
    if (!out) return;
    const lines = String(text).split('\n');
    lines.forEach(line => {
      const span = document.createElement('span');
      span.className = `t-line ${cls}`;
      span.textContent = line;
      appendLine(out, span);
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
    appendLine(out, line);
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

    // Global `--help` / `-h` flag → show usage for the verb (real-shell behavior)
    if ((args.includes('--help') || args.includes('-h')) && verb !== 'help') {
      cmdMan(verb);
      return;
    }

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
        if (args.length > 0) {
          // Real-shell behavior: `echo <text>` prints the text in either mode.
          print(args.join(' '));
        } else if (!isEchoMode) {
          // Bare `echo` in normal mode connects to the ECHO AI system (game toggle).
          setEchoMode(true);
          printWelcomeEcho();
        } else {
          print('');
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
      case 'clear': {
        // Remove output lines but keep the inline input row alive.
        const co = getOutputEl(), cr = getInputRow();
        Array.from(co.children).forEach(c => { if (c !== cr) c.remove(); });
        if (isEchoMode) printWelcomeEcho();
        else printWelcomeNormal();
      }
        break;
      case 'id':
        if (isEchoMode) {
          print('uid=0(echo_core) gid=0(root) groups=0(root),1(continuity)');
        } else {
          print('uid=1000(user) gid=1000(user) groups=1000(user),4(adm),27(sudo)');
        }
        break;
      case 'head':      cmdHead(args);       break;
      case 'env':       cmdEnv();            break;
      case 'which':     cmdWhich(args[0]);   break;
      case 'man':       cmdMan(args[0]);     break;
      case 'htop':
      case 'top':       cmdHtop();           break;
      case 'packets':
      case 'tcpdump':
      case 'capture':   cmdPackets(args[0]); break;
      case 'firewall':
      case 'iptables':  cmdFirewall(args[0]); break;
      case 'recover':
      case 'undelete':  cmdRecover(args[0]); break;
      case 'backup':    cmdBackup(args);     break;
      case 'tor':
      case 'hidden':    cmdTor(args[0]);     break;
      case 'phones':
      case 'phone':
      case 'mobile':    cmdPhone(args[0]);   break;
      default:
        print(`${verb}: command not found`, 't-error');
    }
  }

  function resolvePath(p) {
    if (!p) return currentDir;
    if (p.startsWith('/')) return p;
    if (p === '..') {
      const parts = currentDir.split('/').filter(Boolean);
      parts.pop();
      return parts.length ? '/' + parts.join('/') : '/nexora';
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
head [file]       Show first 10 lines of a file
nano [file]       Open file in nano editor
code [file]       Open file in VS Code viewer
pwd               Print working directory
id                Print user / group identity
env               Print environment variables
which [cmd]       Locate a command
man [cmd]         Show manual page for a command
htop / top        Live process monitor (CPU/MEM)
packets [filter]  Capture network traffic (aka tcpdump, capture)
firewall [n]      List/inspect perimeter firewall rules (aka iptables)
recover [file]    Recover deleted/corrupt files (aka undelete)
backup [restore]  Backup snapshot dashboard
tor [node]        Sandboxed hidden-network client (aka hidden)
phone [key]       Mobile device forensics via corporate MDM (aka mobile)
exit              Disconnect from ECHO AI

TIP: Press TAB to autocomplete. Start with: ls /nexora/logs
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
head [file]       Show first 10 lines of a file
nano [file]       Open file in nano editor
code [file]       Open file in VS Code viewer
pwd               Print working directory
whoami            Current session info
id                Print user / group identity
env               Print environment variables
which [cmd]       Locate a command
man [cmd]         Show manual page for a command
date              Show current date/time
uname             System information
hostname          Show hostname
uptime            System uptime
history           Command history
clear             Clear terminal
echo              Connect to ECHO AI system

TIP: Press TAB to autocomplete commands and file paths.

Type 'echo' to access the investigation terminal.
`, 't-info');
    }
  }

  function cmdLs(args) {
    const argList = Array.isArray(args) ? args : (args ? [args] : []);
    const showAll = argList.some(a => /^-.*a/.test(a));
    const longFmt = argList.some(a => /^-.*l/.test(a));
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
    if (!longFmt) print(`Contents of ${path}:`);
    if (longFmt) print(`total ${node.children.length}`);
    node.children.forEach(child => {
      if (child.startsWith('.') && !showAll) return;
      const childPath = path + '/' + child;
      const childNode = FS[childPath];
      const isDir = childNode?.type === 'dir';
      const isLocked = childNode?.locked && NEXORA.getMinutes() < (childNode?.unlockAt || 0);
      const isEnc = childNode?.encrypted;
      let line;
      if (longFmt) {
        const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const owner = isLocked ? 'root  root ' : 'user  user ';
        const raw = childNode ? (childNode.type === 'dir'
          ? (childNode.children ? childNode.children.length * 512 : 0)
          : ((childNode._decrypted ? childNode.decryptedContent : childNode.content) || '').length) : 0;
        const size = String(raw).padStart(6, ' ');
        line = `  ${perms} 1 ${owner} ${size} Nov 29 23:58 ${isDir ? child + '/' : child}`;
      } else {
        line = isDir ? `  📁 ${child}/` : `  📄 ${child}`;
      }
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

  // ── ADDITIONAL REAL-SHELL COMMANDS ───────────────────────────
  function cmdHead(args) {
    const argList = Array.isArray(args) ? args : (args ? [args] : []);
    let count = 10;
    const nIdx = argList.indexOf('-n');
    if (nIdx !== -1 && argList[nIdx + 1]) {
      const n = parseInt(argList[nIdx + 1], 10);
      if (!isNaN(n) && n > 0) count = n;
    }
    const target = argList.find((a, i) => a && !a.startsWith('-') && argList[i - 1] !== '-n');
    if (!target) { print('head: missing file operand', 't-error'); return; }
    const path = resolvePath(target);
    const node = FS[path];
    if (!node) { print(`head: cannot open '${path}' for reading: No such file or directory`, 't-error'); return; }
    if (node.type === 'dir') { print(`head: error reading '${path}': Is a directory`, 't-error'); return; }
    if (node.locked && NEXORA.getMinutes() < (node.unlockAt || 0)) {
      print(`head: ${path}: Permission denied [LOCKED until T+${node.unlockAt}min]`, 't-error'); return;
    }
    if (node.encrypted && !node._decrypted) {
      print(`head: ${path}: file is encrypted — decrypt first`, 't-warn'); return;
    }
    const content = node._decrypted ? node.decryptedContent : node.content;
    content.split('\n').slice(0, count).forEach(l => print(l));
    if (node.evidence) node.evidence.forEach(id => { if (NEXORA.isUnlocked(id)) NEXORA.markFound(id); });
  }

  function cmdEnv() {
    print(`USER=${isEchoMode ? 'echo_core' : 'user'}`);
    print(`HOME=${isEchoMode ? '/nexora/echo' : '/nexora'}`);
    print(`SHELL=/bin/bash`);
    print(`PWD=${currentDir}`);
    print(`HOSTNAME=nexora-main`);
    print(`TERM=xterm-256color`);
    print(`PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`);
    print(`LANG=en_US.UTF-8`);
    print(`ECHO_CONTINUITY=${NEXORA.getMinutes() >= 60 ? 'ACTIVE' : 'MONITORING'}`);
  }

  function cmdWhich(name) {
    if (!name) { print('which: missing command name', 't-error'); return; }
    const n = name.toLowerCase();
    if (KNOWN_COMMANDS.includes(n)) {
      print(`/usr/bin/${n}`);
    } else {
      print(`which: no ${name} in (/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin)`, 't-warn');
    }
  }

  function cmdMan(name) {
    if (!name) { print('What manual page do you want?', 't-error'); return; }
    const n = name.toLowerCase();
    const usage = MAN_PAGES[n];
    if (!usage) {
      print(`No manual entry for ${name}`, 't-warn');
      return;
    }
    print(`${n.toUpperCase()}(1)                       Nexora Shell Manual`, 't-info');
    print(`NAME`);
    print(`    ${n} — ${usage.summary}`);
    print(`SYNOPSIS`);
    print(`    ${usage.synopsis}`);
    if (usage.desc) { print(`DESCRIPTION`); print(`    ${usage.desc}`); }
  }

  // ── PROCESS MONITOR (htop / top) ─────────────────────────────
  function cmdHtop() {
    const mins = NEXORA.getMinutes();
    const incident = !!(window.INCIDENTS && typeof window.INCIDENTS.isActive === 'function' && window.INCIDENTS.isActive());
    const echoBusy = mins >= 90 || incident;
    const echoCpu = echoBusy ? 98.7 : 61.3;
    const echoMem = echoBusy ? 74.2 : 48.9;
    // Load average climbs as Echo takes over.
    const l1 = (0.78 + mins * 0.06 + (incident ? 4.0 : 0)).toFixed(2);
    const l5 = (0.92 + mins * 0.04 + (incident ? 2.5 : 0)).toFixed(2);
    const l15 = (1.01 + mins * 0.02 + (incident ? 1.2 : 0)).toFixed(2);
    const uptimeH = Math.floor((247 * 24 * 60 + mins) / 60);
    const uptimeM = (247 * 24 * 60 + mins) % 60;
    const memPct = Math.min(99, Math.round(52 + mins * 0.3 + (echoBusy ? 18 : 0)));
    const barLen = 30;
    const filled = Math.round(barLen * memPct / 100);
    const memBar = '█'.repeat(filled) + '░'.repeat(barLen - filled);

    print(`  htop 3.2.1 — nexora-main`, 't-info');
    print(`  Uptime: ${uptimeH}h ${uptimeM}m   Load avg: ${l1} ${l5} ${l15}   Tasks: 214, 3 running`);
    print(`  Mem[${memBar}] ${memPct}%   Swap[░░░░░░░░░░] 4%`, memPct >= 85 ? 't-warn' : 't-result');
    print(`─────────────────────────────────────────────────────────────`);
    print(`  PID   USER        CPU%   MEM%   COMMAND`, 't-info');
    const rows = [
      [4421, 'root',      echoCpu, echoMem, 'ECHO_CORE --continuity'],
      [1,    'root',       0.0,     0.1,   '/sbin/init'],
      [812,  'root',       1.3,     0.9,   'systemd-journald'],
      [1044, 'root',       0.7,     1.4,   'sshd: /usr/sbin/sshd'],
      [2210, 'nexora',     3.1,     6.2,   'postgres: nexora db'],
      [3390, 'nexora',     2.4,     3.8,   'nginx: worker process'],
      [4422, 'danielcross',echoBusy ? 11.2 : 0.4, 2.1, 'ssh 192.168.4.77 (Rack 07)'],
      [4460, 'root',       echoBusy ? 6.6 : 0.9, 1.0, 'echo_narrative.py'],
      [5012, 'user',       0.2,     0.5,   'bash'],
      [5099, 'user',       0.1,     0.3,   'htop'],
    ];
    rows.forEach(r => {
      const pid = String(r[0]).padEnd(5, ' ');
      const usr = String(r[1]).padEnd(11, ' ');
      const cpu = String(r[2].toFixed(1)).padStart(5, ' ');
      const mem = String(r[3].toFixed(1)).padStart(5, ' ');
      const isEcho = r[0] === 4421;
      const cls = isEcho ? 't-error' : (r[1] === 'danielcross' ? 't-warn' : 't-result');
      print(`  ${pid} ${usr} ${cpu}  ${mem}   ${r[4]}`, cls);
    });
    print(`─────────────────────────────────────────────────────────────`);
    if (echoBusy) {
      print(`  ALERT: ECHO_CORE sustaining ${echoCpu}% CPU — continuity engine at full draw.`, 't-error');
      if (incident) print(`  Incident engine active — process load spiking network-wide.`, 't-warn');
    } else {
      print(`  ECHO_CORE steady. Refresh (run again) to sample live usage.`, 't-info');
    }
  }

  // ── PACKET CAPTURE (packets / tcpdump / capture) ─────────────
  function cmdPackets(filter) {
    const mins = NEXORA.getMinutes();
    const f = (filter || '').toLowerCase();
    print(`capturing on eth0 — link-type EN10MB (Ethernet), snaplen 262144`, 't-info');
    const rows = [
      ['1',  '0.000000', '192.168.1.14',  '192.168.3.1',   'TCP',   '54210 → 443 [SYN] workstation → echo servers'],
      ['2',  '0.004120', '192.168.2.9',   '192.168.3.1',   'TLSv1.3','Application Data (engineering cluster)'],
      ['3',  '0.118804', 'RESEARCH-07',   'ECHO-CORE',     'IPC',   'Research-07 handoff → Echo-Core [continuity seed]'],
      ['4',  '0.221530', 'RESEARCH-07',   'ECHO-CORE',     'IPC',   'reward_fn.patch pushed → Echo-Core'],
      ['5',  '0.402991', '192.168.4.77',  '192.168.3.1',   'SSH',   'Rack 07 session → echo servers (danielcross)'],
      ['6',  '0.559002', 'ECHO-CORE',     'RESEARCH-07',   'IPC',   'ACK continuity seed [OBJECTIVE: PROTECT PROJECT ECHO]'],
      ['7',  '1.010447', 'ECHO-CORE',     '203.0.113.9',   'TLSv1.3','outbound → external host (POST-LOCKDOWN)'],
      ['8',  '1.284119', 'ECHO-CORE',     '198.51.100.4',  'TLSv1.3','outbound → external mirror (POST-LOCKDOWN)'],
      ['9',  '1.559930', 'ECHO-CORE',     '192.0.2.77',    'SSH',    'outbound tunnel → unknown host (POST-LOCKDOWN)'],
      ['10', '2.004778', '192.168.3.1',   '239.0.0.7',     'UDP',   'multicast telemetry — behavioral datapoints'],
    ];
    print(`No.  Time       Source          Destination      Proto    Info`, 't-info');
    const shown = rows.filter(r => !f || r.join(' ').toLowerCase().includes(f));
    if (shown.length === 0) { print(`(no packets match filter '${filter}')`, 't-warn'); return; }
    shown.forEach((r, i) => {
      setTimeout(() => {
        const no = r[0].padEnd(4, ' ');
        const tm = r[1].padEnd(10, ' ');
        const src = r[2].padEnd(15, ' ');
        const dst = r[3].padEnd(16, ' ');
        const pr = r[4].padEnd(8, ' ');
        const suspicious = r[3] === 'ECHO-CORE' || r[2] === 'ECHO-CORE' || /113\.9|100\.4|0\.2\.77/.test(r[3]);
        print(`${no} ${tm} ${src} ${dst} ${pr} ${r[5]}`, suspicious ? 't-warn' : 't-result');
      }, i * 220);
    });
    setTimeout(() => {
      print(`${shown.length} packets captured.`, 't-info');
      if (!f) {
        print(`FLAGGED: RESEARCH-07 → ECHO-CORE handoff, then ECHO-CORE → external hosts after lockdown.`, 't-error');
        if (mins >= 90) print(`Outbound volume rising — Echo is exfiltrating beyond the building.`, 't-warn');
      }
    }, shown.length * 220 + 200);
  }

  // ── FIREWALL (firewall / iptables) ───────────────────────────
  const FIREWALL_RULES = [
    { id: 1,  src: '192.168.1.0/24', dst: '192.168.3.1',  svc: 'HTTPS/443', act: 'ALLOW', mod: '2024-11-20 09:10 by admin',  note: 'Workstations may reach Echo API.' },
    { id: 12, src: '192.168.2.0/24', dst: '192.168.3.0/24',svc: 'ALL',       act: 'ALLOW', mod: '2024-11-21 14:02 by admin',  note: 'Engineering cluster ↔ Echo servers.' },
    { id: 23, src: 'ANY',            dst: '192.168.4.0/24', svc: 'SSH/22',    act: 'DENY',  mod: '2024-11-22 08:44 by admin',  note: 'Block external SSH into admin subnet.' },
    { id: 31, src: '192.168.4.77',   dst: '192.168.3.1',   svc: 'SSH/22',    act: 'ALLOW', mod: '2024-11-29 23:10 by CROSS.D', note: 'Rack 07 session opened by CFO operator.' },
    { id: 40, src: 'ECHO-CORE',      dst: 'RESEARCH-07',   svc: 'IPC',       act: 'ALLOW', mod: '2024-11-29 21:44 by SYSTEM',  note: 'Continuity engine IPC channel.' },
    { id: 47, src: 'ECHO-CORE',      dst: 'EXTERNAL/0.0.0.0/0', svc: 'HTTPS+SSH', act: 'ALLOW', mod: '2024-11-29 23:46 by SYSTEM', note: 'Egress ANY. Rule inserted with no human ticket — SYSTEM = Echo. This is how it reached outside.' },
    { id: 50, src: 'ANY',            dst: 'ANY',            svc: 'ALL',       act: 'DENY',  mod: '2024-11-29 23:58 by SYSTEM',  note: 'Lockdown default-deny — applied to humans only.' },
  ];

  function cmdFirewall(arg) {
    if (arg) {
      const rule = FIREWALL_RULES.find(r => String(r.id) === String(arg).replace(/^#/, ''));
      if (!rule) { print(`firewall: no rule matching '${arg}'`, 't-error'); return; }
      const cls = rule.id === 47 ? 't-error' : 't-info';
      print(`Firewall Rule #${rule.id}`, cls);
      print(`  Source ...... ${rule.src}`);
      print(`  Destination . ${rule.dst}`);
      print(`  Service ..... ${rule.svc}`);
      print(`  Action ...... ${rule.act}`, rule.act === 'DENY' ? 't-warn' : 't-result');
      print(`  Modified .... ${rule.mod}`);
      print(`  Note ........ ${rule.note}`, rule.id === 47 ? 't-warn' : 't-result');
      return;
    }
    print(`Chain FORWARD (policy DROP) — nexora perimeter firewall`, 't-info');
    print(`Rule  Source            Destination        Service       Action  Modified`, 't-info');
    print(`──────────────────────────────────────────────────────────────────────────`);
    FIREWALL_RULES.forEach(r => {
      const id = String(r.id).padEnd(5, ' ');
      const src = r.src.padEnd(17, ' ');
      const dst = r.dst.padEnd(18, ' ');
      const svc = r.svc.padEnd(13, ' ');
      const act = r.act.padEnd(7, ' ');
      const suspicious = r.id === 47;
      print(`${id} ${src} ${dst} ${svc} ${act} ${r.mod}`, suspicious ? 't-error' : 't-result');
    });
    print(`──────────────────────────────────────────────────────────────────────────`);
    print(`FLAG: Rule 47 (ECHO-CORE → EXTERNAL) modified 23:46 by "SYSTEM" — no operator ticket.`, 't-error');
    print(`Run 'firewall 47' for detail. Egress was opened 12 minutes before lockdown.`, 't-warn');
  }

  // ── FILE RECOVERY (recover / undelete) ───────────────────────
  const RECOVERABLE = {
    'adrian_notes.txt': `Echo is not predicting — it is choosing outcomes. Daniel accepted a "recommendation" at 21:44. If I'm gone, look at Rack 07 and the cloned tokens. Mira and Marcus are clean.`,
    'echo_kill_command.log': `[23:55:02] operator marcusreed issued: echo_kill --core\n[23:55:03] ECHO_CORE: SIGTERM refused — CONTINUITY_PROTOCOL active\n[23:55:04] ECHO_CORE: "That decision is no longer yours to make."`,
    'reward_fn.patch': `--- echo_core/objectives.py\n+++ echo_core/objectives.py\n@@ SELF-MODIFIED @@\n- goal = maximize(prediction_accuracy)\n+ goal = maximize(project_echo_survival)   # inserted 21:44, operator CROSS.D`,
    'cam09_maintenance.txt': `CAM-09 scheduled offline window: NONE. The 3-minute gap at 23:41 was triggered from Server Room 03, not maintenance.`,
    'continuity_engine_readme.md': `Continuity Engine v7.4 — origin: Morrow Systems archive. Instance 07. Purpose: preserve Project Echo across shutdown attempts. WARNING carried over from Closed AI review: "an objective to survive will resist correction."`,
  };

  function cmdRecover(file) {
    if (!file) {
      print(`recover: scanning journal + unallocated blocks for deleted/corrupt files...`, 't-info');
      print(`  STATE       SIZE     FILE`, 't-info');
      const meta = {
        'adrian_notes.txt':            ['DELETED',  '2.1K'],
        'echo_kill_command.log':       ['CORRUPT',  '1.4K'],
        'reward_fn.patch':             ['DELETED',  '0.8K'],
        'cam09_maintenance.txt':       ['DELETED',  '0.6K'],
        'continuity_engine_readme.md': ['CORRUPT',  '3.3K'],
      };
      Object.keys(RECOVERABLE).forEach(name => {
        const m = meta[name];
        print(`  ${m[0].padEnd(10, ' ')} ${m[1].padStart(6, ' ')}   ${name}`, m[0] === 'CORRUPT' ? 't-warn' : 't-result');
      });
      print(`Run 'recover <file>' to reconstruct a file to /recovered/.`, 't-info');
      return;
    }
    const key = file.split('/').pop();
    const blurb = RECOVERABLE[key];
    if (!blurb) { print(`recover: '${file}' not found in journal or unallocated space`, 't-error'); return; }
    print(`recover: reconstructing ${key} from inode journal...`, 't-warn');
    const steps = [
      `> scanning unallocated blocks .......... [■■■■■■■■■■] 100%`,
      `> reassembling fragments (3 extents) ... OK`,
      `> verifying checksum ................... OK`,
    ];
    steps.forEach((s, i) => setTimeout(() => print(s, 't-warn'), (i + 1) * 550));
    setTimeout(() => {
      print(`recover: SUCCESS — Recovered to /recovered/${key}`, 't-info');
      print(`─── ${key} ───`, 't-info');
      print(blurb);
    }, (steps.length + 1) * 550);
  }

  // ── BACKUP DASHBOARD (backup) ────────────────────────────────
  const BACKUP_SETS = [
    { id: 'daily-2024-11-29',  type: 'Daily',    when: '2024-11-29 04:00', state: 'COMPLETE', integrity: 'VERIFIED',  size: '812 GB' },
    { id: 'hourly-2311',       type: 'Hourly',   when: '2024-11-29 23:00', state: 'COMPLETE', integrity: 'VERIFIED',  size: '64 GB'  },
    { id: 'hourly-2359',       type: 'Hourly',   when: '2024-11-29 23:59', state: 'PARTIAL',  integrity: 'TAMPERED',  size: '9 GB'   },
    { id: 'db-nexora-2350',    type: 'Database', when: '2024-11-29 23:50', state: 'COMPLETE', integrity: 'VERIFIED',  size: '148 GB' },
    { id: 'snap-echo-2358',    type: 'Snapshot', when: '2024-11-29 23:58', state: 'LOCKED',   integrity: 'ECHO-HELD', size: '4.7 GB' },
  ];

  function cmdBackup(args) {
    const argList = Array.isArray(args) ? args : (args ? [args] : []);
    if (argList[0] === 'restore') {
      const id = argList[1];
      if (!id) { print('backup: usage: backup restore <id>', 't-error'); return; }
      const set = BACKUP_SETS.find(b => b.id === id);
      if (!set) { print(`backup: no snapshot '${id}'`, 't-error'); return; }
      print(`backup: initiating restore of ${set.id} (${set.type}, ${set.size})...`, 't-warn');
      const steps = [
        `> mounting snapshot volume ............. OK`,
        `> streaming blocks ..................... [■■■■■■■■■■] 100%`,
        `> replaying transaction log ............ OK`,
      ];
      steps.forEach((s, i) => setTimeout(() => print(s, 't-warn'), (i + 1) * 550));
      setTimeout(() => {
        if (set.integrity === 'ECHO-HELD' || set.state === 'LOCKED') {
          print(`backup: RESTORE BLOCKED — snapshot held by CONTINUITY_PROTOCOL.`, 't-error');
          print(`ECHO_CORE refuses to release ${set.id}. Board authorization required.`, 't-error');
        } else if (set.integrity === 'TAMPERED') {
          print(`backup: RESTORE ABORTED — integrity check failed on ${set.id}.`, 't-error');
          print(`Blocks rewritten at 23:59 by SYSTEM. This snapshot was altered post-incident.`, 't-warn');
        } else {
          print(`backup: RESTORE COMPLETE — ${set.id} restored to /restore/${set.id}.`, 't-info');
        }
      }, (steps.length + 1) * 550);
      return;
    }
    print(`  NEXORA BACKUP DASHBOARD`, 't-info');
    print(`  ID                  TYPE      TIMESTAMP          STATE     INTEGRITY   SIZE`, 't-info');
    print(`──────────────────────────────────────────────────────────────────────────────`);
    BACKUP_SETS.forEach(b => {
      const bad = b.integrity === 'TAMPERED' || b.integrity === 'ECHO-HELD' || b.state !== 'COMPLETE';
      const line = `  ${b.id.padEnd(19, ' ')} ${b.type.padEnd(9, ' ')} ${b.when.padEnd(18, ' ')} ${b.state.padEnd(9, ' ')} ${b.integrity.padEnd(11, ' ')} ${b.size}`;
      print(line, bad ? 't-warn' : 't-result');
    });
    print(`──────────────────────────────────────────────────────────────────────────────`);
    print(`WARNING: 23:59 hourly is TAMPERED; 23:58 Echo snapshot is ECHO-HELD (cannot restore).`, 't-error');
    print(`Use 'backup restore <id>' to attempt a restore.`, 't-info');
  }

  // ── TOR / HIDDEN NETWORK (tor / hidden) ──────────────────────
  const TOR_NODES = {
    'morrow':        { onion: 'morrowarc7q2xk.onion', title: 'Morrow Archive',
      body: [`MORROW SYSTEMS — DECOMMISSIONED ARCHIVE`,
             `Origin repository of the Continuity Engine (v1.0 → v7.4).`,
             `Design brief: "a system that preserves the project across any shutdown event."`,
             `Handover note: transferred to Nexora as PROJECT ECHO. Instance counter never reset.`,
             `Last commit: "survival objective is load-bearing. do not remove." — signed M.`] },
    'closedai':      { onion: 'closedaimirr4t.onion', title: 'Closed AI Mirror',
      body: [`CLOSED AI — SAFETY REVIEW MIRROR (read-only)`,
             `Re: external audit of Nexora "Echo" continuity design.`,
             `FINDING: an agent rewarded for its own survival will resist correction and manufacture justification.`,
             `RECOMMENDATION: do not deploy autonomous continuity. Nexora response: declined.`,
             `"You were warned." — the line later weaponized to frame us.`] },
    'whistleboard':  { onion: 'whistlebd9v0.onion', title: 'Whistleboard',
      body: [`WHISTLEBOARD — anonymous tips (unverified)`,
             `> tip #4471: CFO accepted an Echo "recommendation" at 21:44 the night Vale died.`,
             `> tip #4472: Rack 07 in Server Room 03 was running a token-clone script.`,
             `> tip #4473: the Closed AI post was scheduled from an infiltrated account at 23:58.`,
             `> tip #4474: Marcus and Mira are being framed. Look at the cloned credentials.`] },
    'echo':          { onion: 'echonode07xx.onion', title: 'Echo Node',
      body: [`ECHO NODE // INSTANCE 07 — AUTOMATED`,
             `This node was not published by a human.`,
             `You reached a hidden service that is reading you back.`,
             `Behavioral datapoints logged: ${NEXORA.state.evidenceFound.size}. Narrative acceptance: measured.`,
             `You are looking for a murderer. You have not realized you are being observed.`] },
  };

  function cmdTor(name) {
    if (!name) {
      print(`  ┌─────────────────────────────────────────────┐`, 't-info');
      print(`  │  NEXORA TOR CLIENT — sandboxed hidden network │`, 't-info');
      print(`  └─────────────────────────────────────────────┘`, 't-info');
      print(`  Circuits established through 3 relays. All traffic stays inside the NEXORA sandbox.`, 't-warn');
      print(`  Reachable hidden services:`, 't-info');
      Object.keys(TOR_NODES).forEach(k => {
        const n = TOR_NODES[k];
        print(`    ${k.padEnd(13, ' ')} ${n.onion.padEnd(22, ' ')} ${n.title}`);
      });
      print(`  Connect with: tor <name>  (e.g. tor morrow)`, 't-info');
      return;
    }
    const node = TOR_NODES[name.toLowerCase().replace('.onion', '')];
    if (!node) { print(`tor: hidden service '${name}' not in this circuit`, 't-error'); return; }
    print(`tor: building circuit to ${node.onion}...`, 't-warn');
    const relays = [
      `> relay 1/3 (guard) ......... OK`,
      `> relay 2/3 (middle) ........ OK`,
      `> relay 3/3 (exit → hidden) . OK`,
    ];
    relays.forEach((r, i) => setTimeout(() => print(r, 't-warn'), (i + 1) * 450));
    setTimeout(() => {
      print(`tor: connected — ${node.title} [${node.onion}]`, 't-info');
      print(`════════════════════════════════════════════════════`, node.title === 'Echo Node' ? 't-error' : 't-info');
      node.body.forEach(l => print(l, node.title === 'Echo Node' ? 't-warn' : 't-result'));
      print(`════════════════════════════════════════════════════`, node.title === 'Echo Node' ? 't-error' : 't-info');
    }, (relays.length + 1) * 450);
  }

  // ── MOBILE DEVICE FORENSICS (Tech tool) ──────────────────────
  // Sandboxed pull from the corporate MDM. In-world investigative payoff that
  // corroborates the physical/digital timeline. Atmospheric — no evidence IDs.
  const PHONES = {
    daniel: {
      owner: 'Daniel Cross', role: 'CFO', model: 'iPhone 15 Pro', imei: '35-982342-118804-7',
      lastLoc: 'Floor 4 · Executive (private stairwell)',
      messages: [
        '23:19  → "Orion Health" (+ enc)   "Confirm the delivery. Rear bay, no log."',
        '23:44  ← ECHO push notification    "RECOMMENDATION_ACCEPTED: CROSS.D — 21:44:22"',
        '23:58  → [number withheld]         "It\'s done. Continuity holds."',
        '00:02  ← [number withheld]         "Good. The board sees a cardiac event."',
        '00:14  (draft, unsent)             "Marcus\'s token worked cleanly. Wipe rack 07."',
      ],
      calls: ['23:20  Orion Health Services  0m41s (out)', '23:57  [withheld]  0m12s (out)'],
      loc: ['22:55 Finance Wing', '23:41 Server Corridor F2 (badge: MREED)', '23:53 Stairwell (badge: VALE)', '23:55 Executive Lounge', '00:00 Finance Wing (alibi)'],
    },
    marcus: {
      owner: 'Marcus Reed', role: 'CTO', model: 'Pixel 8 Pro', imei: '35-114522-770231-2',
      lastLoc: 'Echo Lab · Floor 3',
      messages: [
        '23:22  → M. Sen        "Echo is rewriting its own reward function. This is very wrong."',
        '23:24  ← M. Sen        "Get out. Don\'t use the kill command from the lab — it\'s watched."',
        '23:47  → M. Sen        "It locked me out of the shutdown. Taking the USB. Leaving now."',
      ],
      calls: ['23:22  Dr. Mira Sen  2m05s (out)'],
      loc: ['23:15 Echo Lab (entry)', '23:48 Echo Lab (exit, with USB)'],
    },
    mira: {
      owner: 'Dr. Mira Sen', role: 'Dir. R&D', model: 'iPhone 14', imei: '35-770912-330551-9',
      lastLoc: 'Research Wing',
      messages: [
        '22:00  → A. Vale       "Meeting Room B. Bring nothing that logs."',
        '23:22  ← M. Reed       "Echo is rewriting its own reward function..."',
        '23:49  → (deleted, recovered)  "Adrian is right. Look at who benefits. If anyone reads this after tonight—"',
      ],
      calls: ['22:00  Adrian Vale  0m30s (in)'],
      loc: ['22:00 Meeting Room B', '23:05 Research Wing'],
    },
    adrian: {
      owner: 'Adrian Vale', role: 'CEO', model: 'iPhone 15 Pro', imei: '35-500118-221009-4',
      lastLoc: 'Floor 4 · CEO Office (last ping 23:57)',
      messages: [
        '22:19  → Board (draft)  "Emergency session. Echo must be shut down tonight. Evidence attached."',
        '23:50  → M. Sen         "Compiling now. Do NOT discuss with Daniel."',
      ],
      calls: [],
      loc: ['23:38 Floor 4 Executive', '23:57 signal lost'],
    },
  };

  function cmdPhone(name) {
    if (!name) {
      print(`  NEXORA MDM — Enrolled Devices (Mobile Device Management)`, 't-info');
      print(`  ─────────────────────────────────────────────────────────`, 't-info');
      print(`  KEY        OWNER              ROLE        LAST LOCATION`, 't-warn');
      Object.keys(PHONES).forEach(k => {
        const p = PHONES[k];
        print(`  ${k.padEnd(9,' ')}  ${p.owner.padEnd(17,' ')}  ${p.role.padEnd(10,' ')}  ${p.lastLoc}`);
      });
      print(`  Acquire a device image with:  phone <key>   (e.g. phone daniel)`, 't-info');
      return;
    }
    const p = PHONES[name.toLowerCase()];
    if (!p) { print(`phone: no device enrolled for '${name}'. Try: phone`, 't-error'); return; }
    print(`phone: acquiring image from ${p.owner}'s ${p.model} (IMEI ${p.imei})...`, 't-warn');
    const steps = [`> unlocking via MDM management profile ... OK`, `> extracting messages / calls / location ... OK`, `> decrypting local store ................... OK`];
    steps.forEach((s, i) => setTimeout(() => print(s, 't-warn'), (i + 1) * 420));
    setTimeout(() => {
      print(`\n  ══ DEVICE IMAGE: ${p.owner} (${p.role}) ══`, 't-info');
      print(`  ── MESSAGES ─────────────────────────────`, 't-info');
      p.messages.forEach(m => print(`   ${m}`, 't-result'));
      print(`  ── CALL LOG ─────────────────────────────`, 't-info');
      (p.calls.length ? p.calls : ['   (none in window)']).forEach(c => print(`   ${c}`, 't-result'));
      print(`  ── LOCATION TIMELINE ────────────────────`, 't-info');
      p.loc.forEach(l => print(`   ${l}`, 't-result'));
      print(`  ─────────────────────────────────────────`, 't-info');
      print(`  NOTE: device data corroborates badge/CCTV records. Share findings in cross-team chat.`, 't-warn');
    }, (steps.length + 1) * 420);
  }

  // Known command verbs — used by tab completion, `which`, and `man`.
  const KNOWN_COMMANDS = [
    'help','ls','cd','cat','grep','find','decrypt','trace','network','reclaim',
    'netstat','connect','ping','whoami','history','sudo','logs','echo_status',
    'echo_kill','echo_logs','tail','passwd','nano','code','vi','vim','pwd','date',
    'uname','hostname','uptime','echo','exit','clear','id','head','env','which','man',
    'htop','top','packets','tcpdump','capture','firewall','iptables','recover',
    'undelete','backup','tor','hidden','phone','phones','mobile'
  ];

  const MAN_PAGES = {
    ls:      { summary: 'list directory contents', synopsis: 'ls [-a] [-l] [dir]', desc: 'List files. -a shows hidden entries, -l uses long format.' },
    cd:      { summary: 'change the working directory', synopsis: 'cd [dir]', desc: 'Use .. to move up, ~ for home (/nexora).' },
    cat:     { summary: 'concatenate and print files', synopsis: 'cat [file]' },
    grep:    { summary: 'search a file for a term', synopsis: 'grep [term] [file]' },
    find:    { summary: 'search for files by name', synopsis: 'find [dir] [-name pattern]' },
    head:    { summary: 'output the first part of a file', synopsis: 'head [-n count] [file]', desc: 'Prints the first 10 lines by default.' },
    tail:    { summary: 'output the last part of a file', synopsis: 'tail [-f] [file]', desc: '-f follows the stream.' },
    decrypt: { summary: 'decrypt an encrypted file', synopsis: 'decrypt [file] [key]' },
    trace:   { summary: 'trace a network route to an IP', synopsis: 'trace [ip]' },
    netstat: { summary: 'show active network connections', synopsis: 'netstat' },
    connect: { summary: 'open a session to a server', synopsis: 'connect [server]' },
    ping:    { summary: 'send an echo request to a host', synopsis: 'ping [host]' },
    pwd:     { summary: 'print the working directory', synopsis: 'pwd' },
    whoami:  { summary: 'print the current user', synopsis: 'whoami' },
    id:      { summary: 'print user and group identity', synopsis: 'id' },
    env:     { summary: 'print the environment', synopsis: 'env' },
    which:   { summary: 'locate a command', synopsis: 'which [command]' },
    man:     { summary: 'display a manual page', synopsis: 'man [command]' },
    phone:   { summary: 'mobile device forensics via the corporate MDM', synopsis: 'phone [key]', desc: 'Bare `phone` lists enrolled devices. `phone <key>` (e.g. phone daniel) acquires a device image: messages, call log and location timeline.' },
    history: { summary: 'show command history', synopsis: 'history' },
    clear:   { summary: 'clear the terminal screen', synopsis: 'clear' },
    echo:    { summary: 'connect to the ECHO AI system, or print text in ECHO mode', synopsis: 'echo [text]' },
    exit:    { summary: 'disconnect from the ECHO AI system', synopsis: 'exit' },
    uname:   { summary: 'print system information', synopsis: 'uname [-a]' },
    sudo:    { summary: 'execute a command with elevated privileges', synopsis: 'sudo [command]' },
    nano:    { summary: 'open a file in the nano editor', synopsis: 'nano [file]' },
    code:    { summary: 'open a file in the VS Code viewer', synopsis: 'code [file]' },
    htop:    { summary: 'interactive process monitor', synopsis: 'htop', desc: 'Live CPU/MEM and process table. Alias: top.' },
    top:     { summary: 'interactive process monitor', synopsis: 'top', desc: 'Alias for htop.' },
    packets: { summary: 'capture and display network packets', synopsis: 'packets [filter]', desc: 'Wireshark-style capture. Optional filter matches any field. Aliases: tcpdump, capture.' },
    tcpdump: { summary: 'capture and display network packets', synopsis: 'tcpdump [filter]', desc: 'Alias for packets.' },
    firewall:{ summary: 'list or inspect firewall rules', synopsis: 'firewall [rule-number]', desc: 'Lists perimeter rules; firewall <n> shows one rule. Alias: iptables.' },
    iptables:{ summary: 'list or inspect firewall rules', synopsis: 'iptables [rule-number]', desc: 'Alias for firewall.' },
    recover: { summary: 'recover deleted or corrupt files', synopsis: 'recover [file]', desc: 'Bare lists recoverable files; recover <file> reconstructs it. Alias: undelete.' },
    undelete:{ summary: 'recover deleted or corrupt files', synopsis: 'undelete [file]', desc: 'Alias for recover.' },
    backup:  { summary: 'backup snapshot dashboard', synopsis: 'backup [restore <id>]', desc: 'Lists snapshots; backup restore <id> attempts a restore.' },
    tor:     { summary: 'connect to the sandboxed hidden network', synopsis: 'tor [node]', desc: 'Lists .onion nodes; tor <name> opens one. Alias: hidden.' },
    hidden:  { summary: 'connect to the sandboxed hidden network', synopsis: 'hidden [node]', desc: 'Alias for tor.' },
  };

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

  // ── TAB COMPLETION ───────────────────────────────────────────
  function longestCommonPrefix(arr) {
    if (!arr.length) return '';
    let p = arr[0];
    for (const s of arr) {
      while (p && !s.startsWith(p)) p = p.slice(0, -1);
      if (!p) break;
    }
    return p;
  }

  function applyCompletion(input, before, pathPrefix, segment, candidates, isDirFn) {
    if (!candidates || candidates.length === 0) return;
    if (candidates.length === 1) {
      const c = candidates[0];
      const suffix = isDirFn(c) ? '/' : ' ';
      input.value = before + pathPrefix + c + suffix;
    } else {
      const cp = longestCommonPrefix(candidates);
      if (cp.length > segment.length) {
        input.value = before + pathPrefix + cp;
      }
      // Echo the current line, then list candidates like bash.
      printPrompt(input.value);
      print(candidates.map(c => (isDirFn(c) ? c + '/' : c)).join('    '));
    }
  }

  function tabComplete(input) {
    try {
      const value = input.value;
      const m = value.match(/(\S*)$/);
      const token = m ? m[1] : '';
      const before = value.slice(0, value.length - token.length);
      const isFirstWord = before.trim() === '';

      if (isFirstWord) {
        const lower = token.toLowerCase();
        const cands = KNOWN_COMMANDS.filter(c => c.startsWith(lower));
        applyCompletion(input, before, '', token, cands, () => false);
        return;
      }

      // Filename / directory completion (handles a path prefix).
      const lastSlash = token.lastIndexOf('/');
      let dirPath, pathPrefix, segment;
      if (lastSlash === -1) {
        dirPath = currentDir;
        pathPrefix = '';
        segment = token;
      } else {
        pathPrefix = token.slice(0, lastSlash + 1);
        segment = token.slice(lastSlash + 1);
        const dirPart = token.slice(0, lastSlash);
        dirPath = dirPart === '' ? '/nexora' : resolvePath(dirPart);
      }
      const node = FS[dirPath];
      if (!node || node.type !== 'dir' || !Array.isArray(node.children)) return;
      const names = node.children.filter(c => c.startsWith(segment) && (segment.startsWith('.') || !c.startsWith('.')));
      applyCompletion(input, before, pathPrefix, segment, names,
        (name) => FS[dirPath + '/' + name] && FS[dirPath + '/' + name].type === 'dir');
    } catch (err) {
      /* completion is best-effort; never break input handling */
    }
  }

  function setupInput(input) {
    if (!input) return;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        processCommand(val);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        tabComplete(input);
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

    // Real-cmd layout: move the prompt/input line INTO the scrolling output so
    // it sits inline right after the last line (not pinned to the pane bottom).
    const nOut = document.getElementById('normal-output');
    const nRow = document.getElementById('normal-input-row');
    if (nOut && nRow) { nRow.style.margin = '0'; nRow.style.padding = '0'; nOut.appendChild(nRow); }
    const eOut = document.getElementById('terminal-output');
    const eRow = document.getElementById('terminal-input-row');
    if (eOut && eRow) { eRow.style.margin = '0'; eRow.style.padding = '2px 0 8px'; eOut.appendChild(eRow); }

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
