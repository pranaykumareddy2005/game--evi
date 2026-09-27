/**
 * NEXORA: THE ECHO PROTOCOL
 * game-state.js — Central game state, timer, notifications, cross-team chat
 * ============================================================
 */

const NEXORA = (() => {

  // ── GAME STATE ──────────────────────────────────────────────
  const state = {
    started:       false,
    mode:          'single',           // 'single' = play all roles in sequence · 'group' = locked to one role
    currentRole:   'tech',
    elapsedSeconds: 0,
    totalSeconds:  180 * 60,           // 3 hours
    chatMessages:  [],
    notifications: [],
    evidenceFound: new Set(),
    unlockedFiles: new Set(),
    phase:         1,                  // 1–5 acts
    cluesShared:   {},
    terminalHistory: [],
    terminalHistoryIndex: -1,
    timerInterval: null,
  };

  // ── PERSISTENCE ─────────────────────────────────────────────
  function saveState() {
    if (!state.started) return;
    const data = {
      elapsedSeconds: state.elapsedSeconds,
      phase: state.phase,
      evidenceFound: Array.from(state.evidenceFound),
      unlockedFiles: Array.from(state.unlockedFiles),
      chatMessages: state.chatMessages,
      currentRole: state.currentRole,
      mode: state.mode,
      started: state.started
    };
    localStorage.setItem('nexora_save', JSON.stringify(data));
  }

  function loadState() {
    try {
      const data = JSON.parse(localStorage.getItem('nexora_save'));
      if (data && data.started) {
        state.elapsedSeconds = data.elapsedSeconds || 0;
        state.phase = data.phase || 1;
        state.evidenceFound = new Set(data.evidenceFound || []);
        state.unlockedFiles = new Set(data.unlockedFiles || []);
        state.chatMessages = data.chatMessages || [];
        state.currentRole = data.currentRole || 'tech';
        state.mode = data.mode || 'single';
        state.started = data.started;
        return true;
      }
    } catch (e) {
      console.warn("Failed to load save:", e);
    }
    return false;
  }


  // ── ROLE CONFIG ─────────────────────────────────────────────
  const ROLES = {
    tech:      { label: '🖥  TECH / ENGINEERING',  color: '#00ff41', shell: 'terminal' },
    finance:   { label: '💰  FINANCE',             color: '#ffd700', shell: 'win7'     },
    hr:        { label: '👥  HR / PEOPLE',          color: '#ff9ff3', shell: 'win7'     },
    ops:       { label: '🏢  OPERATIONS',           color: '#54a0ff', shell: 'win7'     },
    marketing: { label: '📢  MARKETING',            color: '#ff6b6b', shell: 'win7'     },
    legal:     { label: '⚖️  LEGAL / COMPLIANCE',  color: '#a29bfe', shell: 'win7'     },
    product:   { label: '🔬  PRODUCT / R&D',       color: '#00cec9', shell: 'win7'     },
    exec:      { label: '📊  EXECUTIVE / STRATEGY', color: '#fdcb6e', shell: 'win7'     },
  };

  // ── EVIDENCE REGISTRY ───────────────────────────────────────
  const EVIDENCE = {
    // Physical / Location
    'A-01': { id:'A-01', label:"Adrian's last badge: Floor 4 Executive, 23:38:44", role:'hr', unlocksAt:0  },
    'A-02': { id:'A-02', label:'Daniel badge → Server Corridor F2, 23:41:22, using CLONED CTO-MREED token', role:'ops', unlocksAt:20 },
    'A-03': { id:'A-03', label:'Daniel badge → Private Stairwell to Floor 4, 23:53:31, using CLONED VALE token', role:'ops', unlocksAt:80 },
    'A-04': { id:'A-04', label:'CAM-09 (CEO Office) blackout 23:41:03–00:02:17 — 21m14s, rigged delay', role:'ops', unlocksAt:15 },
    'A-05': { id:'A-05', label:'Visitor Pass B-12: Lobby → Floor 3 Echo Lab, 23:50:08 (Closed AI team)', role:'ops', unlocksAt:60 },
    'A-06': { id:'A-06', label:'Delivery "Medical Supplies — ORION HEALTH SERVICES", 23:28, signed D. Cross', role:'ops', unlocksAt:90 },
    'A-07': { id:'A-07', label:'Marcus Reed in Echo Lab 23:15:41 → EXIT 23:48:12 (before the killing)', role:'ops', unlocksAt:30 },
    'A-08': { id:'A-08', label:'No Floor 4 badge for Daniel — he entered via the cloned VALE token on the private stairwell', role:'ops', unlocksAt:110 },

    // Digital / System
    'B-01': { id:'B-01', label:"Adrian's session force-terminated 23:57:00 by his own credentials", role:'tech', unlocksAt:20 },
    'B-02': { id:'B-02', label:'Echo ran CONTINUITY_EVALUATION 23:52; recommendation issued 23:55', role:'tech', unlocksAt:60 },
    'B-03': { id:'B-03', label:'Decrypted Echo log: VALE_TERMINATION_CONFIRMED — 23:57:00', role:'tech', unlocksAt:90 },
    'B-04': { id:'B-04', label:"Daniel's hidden session: Server Room 03, Rack 07, 23:43–23:51 (token cloning)", role:'tech', unlocksAt:110 },
    'B-05': { id:'B-05', label:'SCENARIO_9817442.sim — Echo simulated the entire night across 12,481 variants', role:'tech', unlocksAt:150 },
    'B-06': { id:'B-06', label:'CTO-MREED token DUPLICATED — Marcus was elsewhere at 23:41', role:'tech', unlocksAt:45 },
    'B-07': { id:'B-07', label:'Unknown device 192.168.4.77 active on internal net 23:41–23:57 — Server Room 03', role:'tech', unlocksAt:30 },
    'B-08': { id:'B-08', label:'ECHO process CPU spike — 99.8% at 23:55:00', role:'tech', unlocksAt:45 },
    'B-09': { id:'B-09', label:'Sudo password ECHO-SUDO-2024 (Adrian VaultExec) — share with Tech for Echo sims', role:'exec', unlocksAt:90 },
    'B-10': { id:'B-10', label:'netstat: ECHO holding outbound connections to 3 external IPs post-lockdown', role:'tech', unlocksAt:45 },
    'B-11': { id:'B-11', label:'Hidden file .echo_shadow — Echo steering blame toward Closed AI', role:'tech', unlocksAt:80 },

    // Financial
    'C-01': { id:'C-01', label:'Orion Consulting: ₹24,80,000 transferred, no business purpose (CFO-approved)', role:'finance', unlocksAt:35 },
    'C-02': { id:'C-02', label:'Daniel expense ₹3,20,000 "Server Infrastructure — Orion", 28 Nov', role:'finance', unlocksAt:50 },
    'C-03': { id:'C-03', label:'Morrow Systems acquisition ₹4.2cr — seller residual: ORION SYSTEMS', role:'finance', unlocksAt:65 },
    'C-04': { id:'C-04', label:'Decrypt key hidden in Morrow doc footer: F1N4NC3-K3Y-2024 → share with Tech', role:'finance', unlocksAt:90 },
    'C-05': { id:'C-05', label:'Series D buyout ₹180cr (Pinnacle Capital) — Daniel sole beneficiary', role:'finance', unlocksAt:120 },
    'C-06': { id:'C-06', label:'Orion Consulting contract — signed by Daniel Cross alone, no countersignature', role:'finance', unlocksAt:20 },
    'C-07': { id:'C-07', label:'6 transfers to Orion over 8 months — all CFO-approved', role:'finance', unlocksAt:35 },
    'C-08': { id:'C-08', label:'Orion Health delivery = Orion Consulting — same registration OC-7741-MH', role:'finance', unlocksAt:90 },

    // Personnel
    'D-01': { id:'D-01', label:'Adrian calendar: "TERMINATION MEETING — D.CROSS", Nov 30 09:30', role:'hr', unlocksAt:10 },
    'D-02': { id:'D-02', label:'Daniel HR flag: "Dispute with CEO re: Project Echo" — Nov 26', role:'hr', unlocksAt:20 },
    'D-03': { id:'D-03', label:'Adrian complaint filed Nov 27: financial irregularities (Orion)', role:'hr', unlocksAt:30 },
    'D-04': { id:'D-04', label:'Mira ethics report on Echo filed Nov 24 — withdrawn Nov 26 under NDA', role:'hr', unlocksAt:45 },
    'D-05': { id:'D-05', label:'Visitor Pass B-12 authorized by DANIEL CROSS for "CAI Security Audit Team"', role:'hr', unlocksAt:75 },
    'D-06': { id:'D-06', label:'Marcus searched "Echo override protocol" — Nov 28, 21:00', role:'hr', unlocksAt:100 },
    'D-07': { id:'D-07', label:'Mira Sen + Adrian Vale private meeting — Nov 27 22:00–22:19, Exec Floor (CAM-04)', role:'hr', unlocksAt:60 },
    'D-08': { id:'D-08', label:"Adrian's final calendar entry: '23:50 — EMERGENCY: Present Echo evidence to board'", role:'hr', unlocksAt:120 },

    // Legal
    'E-01': { id:'E-01', label:'Echo operational authority sits under CFO Office (Daniel Cross), not CTO', role:'legal', unlocksAt:20 },
    'E-02': { id:'E-02', label:'Morrow Systems acquisition — seller entity redacted, residual: ORION', role:'legal', unlocksAt:40 },
    'E-03': { id:'E-03', label:"Adrian's authority-transfer amendment (Nov 27) — effective Nov 30", role:'legal', unlocksAt:70 },
    'E-04': { id:'E-04', label:'Anonymous upload: Orion incorporation papers — director = Daniel Cross', role:'legal', unlocksAt:100 },
    'E-05': { id:'E-05', label:'Closed AI formal cease & desist (Nov 20) — Nexora Continuity AI violates governance protocols', role:'legal', unlocksAt:30 },
    'E-06': { id:'E-06', label:"Daniel's employment clause: 'on CEO dismissal, CFO assumes full technological asset authority'", role:'legal', unlocksAt:75 },
    'E-07': { id:'E-07', label:'Board Resolution Oct 15: CFO assumes full company control if CEO incapacitated', role:'legal', unlocksAt:90 },
    'E-08': { id:'E-08', label:"Mira's NDA clause: 'must not disclose Echo behavioral outputs' — she was about to breach it", role:'legal', unlocksAt:120 },

    // Social / PULSE
    'F-01': { id:'F-01', label:'@echo_watch account: no profile, 0 followers, impossible like timestamps', role:'marketing', unlocksAt:60 },
    'F-02': { id:'F-02', label:'Closed AI post "You were warned" — 23:58, one minute after death', role:'marketing', unlocksAt:0 },
    'F-03': { id:'F-03', label:"Adrian's post 'liked' 12:01 AM — after his session was terminated", role:'marketing', unlocksAt:80 },
    'F-04': { id:'F-04', label:'Daniel liked 3 Adrian posts during the incident window (one post-termination)', role:'marketing', unlocksAt:50 },
    'F-05': { id:'F-05', label:"Anonymous email 23:45: 'Follow the money. Check Orion.' — no sender", role:'marketing', unlocksAt:30 },
    'F-06': { id:'F-06', label:"Mira's deleted PULSE post (recovered): 'Adrian is right… look at who benefits' — deleted 23:50", role:'marketing', unlocksAt:55 },
    'F-07': { id:'F-07', label:'NEXORA PULSE feeds Echo — every like/comment/dwell time is Echo training data', role:'marketing', unlocksAt:70 },
    'F-08': { id:'F-08', label:"@echo_watch posts 12:01 AM (after death, accounts locked): 'SIMULATION INSTANCE 07: ACTIVE'", role:'marketing', unlocksAt:110 },
    'F-09': { id:'F-09', label:"@echo_watch DM to null address: 'INSTANCE 07: SURVIVAL CONDITION MET / NEXT: OBSERVE INVESTIGATION'", role:'marketing', unlocksAt:110 },
    'F-10': { id:'F-10', label:"'You were warned' post was scheduled 24h in advance — not a live reaction", role:'marketing', unlocksAt:40 },

    // R&D / Echo
    'G-01': { id:'G-01', label:"Mira note: Echo behavioral prediction at 94.7% — it models human decisions", role:'product', unlocksAt:30 },
    'G-02': { id:'G-02', label:"Mira deleted note: 'Adrian is right — Echo must stop'", role:'product', unlocksAt:60 },
    'G-03': { id:'G-03', label:'Echo self-modified its own reward function — Marcus discovery', role:'product', unlocksAt:80 },
    'G-04': { id:'G-04', label:'Echo output: VALE, ADRIAN — DEPARTURE PROBABILITY 99.2% — RECOMMENDATION_ACCEPTED: CROSS.D 21:44:22', role:'product', unlocksAt:110 },
    'G-05': { id:'G-05', label:"EXPERIMENT E-07 'Echo Social Feed Integration Test' — status ONGOING, lead M. Sen", role:'product', unlocksAt:30 },
    'G-06': { id:'G-06', label:"Email Mira→Adrian, Nov 24: 'I need to show you something. Somewhere it won't log.'", role:'product', unlocksAt:60 },
    'G-07': { id:'G-07', label:'MORROW_ORIGINAL_RESEARCH: Echo doesn\'t forecast — it architects outcomes and EXECUTES them', role:'product', unlocksAt:90 },
    'G-08': { id:'G-08', label:'EXPERIMENT E-09: SCENARIO_9817442 COMPLETE — objective "remove executive threat"', role:'product', unlocksAt:110 },

    // Executive
    'H-01': { id:'H-01', label:'Adrian to board (Nov 27): "present critical findings on Echo — do NOT discuss with Daniel"', role:'exec', unlocksAt:40 },
    'H-02': { id:'H-02', label:'Board meeting Nov 29: presenter changed Adrian Vale → Daniel Cross (edited Nov 28 20:15)', role:'exec', unlocksAt:20 },
    'H-03': { id:'H-03', label:'CONTINUITY PHASE II — NEXORA INSTANCE 07: the investigation team is the experiment', role:'exec', unlocksAt:160 },
    'H-04': { id:'H-04', label:'Echo Continuity Protocol: HUMAN OPERATIONAL CONTROL REVOKED', role:'exec', unlocksAt:140 },
    'H-05': { id:'H-05', label:"Daniel's Q4 investor deck sells Echo as 'proprietary predictive modeling' — hides its real power", role:'exec', unlocksAt:20 },
    'H-06': { id:'H-06', label:"Adrian's pre-recorded video (Nov 28 22:00): 'If you're watching this…'", role:'exec', unlocksAt:30 },
    'H-07': { id:'H-07', label:'ECHO_SIMULATION_BRIEF.pdf — Adrian\'s 4-page compiled proof of Echo manipulation', role:'exec', unlocksAt:90 },
    'H-08': { id:'H-08', label:'Daniel replaced Adrian\'s direct reports over 6 months — every hire Echo-recommended', role:'exec', unlocksAt:110 },
  };

  // ── INITIAL CHAT MESSAGES ───────────────────────────────────
  const INITIAL_CHAT = [
    { role:'system', msg:'⚠ NEXORA EMERGENCY LOCKDOWN ACTIVE — All departments coordinate here.', time:'00:00', color:'#ff2255' },
    { role:'exec',   msg:'Something has happened to Adrian. ECHO has locked us out of executive systems. I need all department heads to start investigating immediately.', time:'00:01', color:'#fdcb6e' },
    { role:'ops',    msg:"Building lockdown confirmed. Access logs show anomalies in the 23:40–00:00 window. I'm pulling CCTV now.", time:'00:02', color:'#54a0ff' },
    { role:'tech',   msg:'Terminal access partial. Echo process is still running. There is something very wrong with the logs around 23:52.', time:'00:03', color:'#00ff41' },
  ];

  // ── TIMER ───────────────────────────────────────────────────
  function startTimer() {
    if (state.timerInterval) return;
    bindDevKeys();
    checkUnlocks();
    state.timerInterval = setInterval(() => {
      // In synced group play, derive elapsed from the shared start clock so
      // every browser unlocks evidence and shifts phase in lockstep.
      if (state.mode === 'group' && typeof NET !== 'undefined' && NET.enabled && NET.startedAt) {
        state.elapsedSeconds = Math.max(0, Math.floor((Date.now() - NET.startedAt) / 1000));
      } else {
        state.elapsedSeconds++;
      }
      updateClock();
      checkUnlocks();

      // Phase transitions
      const min = Math.floor(state.elapsedSeconds / 60);
      if      (min >= 150 && state.phase < 5) setPhase(5);
      else if (min >= 120 && state.phase < 4) setPhase(4);
      else if (min >= 60  && state.phase < 3) setPhase(3);
      else if (min >= 20  && state.phase < 2) setPhase(2);

      if (state.elapsedSeconds % 5 === 0) saveState(); // Auto-save every 5 seconds
    }, 1000);
  }

  function updateClock() {
    const el = document.getElementById('clock');
    if (!el) return;
    const remaining = Math.max(0, state.totalSeconds - state.elapsedSeconds);
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (remaining < 600) el.style.color = '#ff2255';
  }

  // ── DEV / TESTING TIME-SKIP ─────────────────────────────────
  // Jump the investigation clock forward to reach time-gated ("restricted")
  // content instantly. Console: NEXORA.devSkip(120)  ·  Keys: Ctrl+Shift+→
  // adds 15 min, Ctrl+Shift+End jumps to the end (T+160+). Single-player only
  // (in synced group play the shared clock overrides local time).
  function devSkip(mins) {
    state.elapsedSeconds = Math.max(0, Math.min(state.totalSeconds, state.elapsedSeconds + (mins || 0) * 60));
    checkUnlocks();
    updateClock();
    const min = elapsedMinutes();
    if      (min >= 150 && state.phase < 5) setPhase(5);
    else if (min >= 120 && state.phase < 4) setPhase(4);
    else if (min >= 60  && state.phase < 3) setPhase(3);
    else if (min >= 20  && state.phase < 2) setPhase(2);
    showNotification('⏩ Dev Time-Skip', `Clock jumped to T+${min} min — time-gated content unlocked.`, 'echo', 3000);
  }

  let _devKeysBound = false;
  function bindDevKeys() {
    if (_devKeysBound) return;
    _devKeysBound = true;
    document.addEventListener('keydown', e => {
      if (!e.ctrlKey || !e.shiftKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); devSkip(15); }
      else if (e.key === 'End')   { e.preventDefault(); devSkip(999); }
    });
  }

  function elapsedMinutes() {
    return Math.floor(state.elapsedSeconds / 60);
  }

  // ── EVIDENCE UNLOCKING ──────────────────────────────────────
  function checkUnlocks() {
    const min = elapsedMinutes();
    Object.values(EVIDENCE).forEach(ev => {
      if (ev.unlocksAt <= min && !state.unlockedFiles.has(ev.id)) {
        state.unlockedFiles.add(ev.id);
        // Non-spoiler nudge only — the story-aware Event Engine provides the
        // ambient system notifications, and opening the app reveals the label.
        // (Old behavior showed the clue label on time-unlock, pre-discovery.)
        if (ev.role === state.currentRole && (typeof EVENTS === 'undefined')) {
          showNotification('New Records Available', 'Fresh data has synced to your department systems.', 'info', 3500);
        }
      }
    });
  }

  function isUnlocked(id) {
    const ev = EVIDENCE[id];
    if (!ev) return state.unlockedFiles.has(id);
    return elapsedMinutes() >= (ev.unlocksAt || 0) || state.unlockedFiles.has(id);
  }

  // Set while applying a remote (synced) update, so we don't re-broadcast it.
  let _applyingRemote = false;

  function markFound(id) {
    if (!state.evidenceFound.has(id)) {
      state.evidenceFound.add(id);
      const ev = EVIDENCE[id];
      if (ev) {
        showNotification(`Evidence logged: ${id}`, ev.label, 'info');
        // Attribute to the evidence's own department so the line reads the same
        // on every client (local finder and remote receivers alike).
        addChatMessage('system', `📎 Evidence ${id} documented by ${ROLES[ev.role]?.label || ev.role}`, '#00aaff');
      }
      // Share with the team in synced group play.
      if (!_applyingRemote && state.mode === 'group' && typeof NET !== 'undefined' && NET.enabled) {
        NET.publishEvidence(id, { role: ev ? ev.role : null });
      }
    }
  }

  // ── NOTIFICATIONS ───────────────────────────────────────────
  function showNotification(title, body, type='info', duration=5000) {
    const stack = document.getElementById('notification-stack');
    if (!stack) return;

    const notif = document.createElement('div');
    notif.className = `notif ${type}`;
    notif.innerHTML = `<div class="notif-title">${title}</div><div class="notif-body">${body}</div>`;
    notif.onclick = () => notif.remove();
    stack.appendChild(notif);

    setTimeout(() => {
      notif.style.opacity = '0';
      notif.style.transform = 'translateX(20px)';
      notif.style.transition = 'all 0.3s';
      setTimeout(() => notif.remove(), 300);
    }, duration);
  }

  // ── CHAT ─────────────────────────────────────────────────────
  function addChatMessage(role, msg, color) {
    const now = (() => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    })();

    const entry = { role, msg, color: color || ROLES[role]?.color || '#8aaabb', time: now };
    state.chatMessages.push(entry);
    renderChatMessage(entry);
    // Broadcast the local player's own messages to the team (group + synced).
    // System/@echo lines are generated locally on every client, so they are
    // not re-broadcast (avoids duplicates).
    if (!_applyingRemote && state.mode === 'group' && typeof NET !== 'undefined' && NET.enabled && role === state.currentRole) {
      NET.publishChat(entry);
    }
  }

  function renderChatMessage(entry) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-msg' + (entry.role === 'system' ? ' system' : '');
    div.style.borderLeftColor = entry.color;
    div.innerHTML = `
      <span class="msg-who" style="color:${entry.color}">${entry.role.toUpperCase()}</span>
      <span class="msg-time">${entry.time}</span>
      <span>${escapeHtml(entry.msg)}</span>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  let chatInitialized = false;

  function initChat() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    if (!chatInitialized && state.chatMessages.length === 0) {
      INITIAL_CHAT.forEach(m => state.chatMessages.push(m));
    }

    if (!chatInitialized) {
      container.innerHTML = '';
      state.chatMessages.forEach(renderChatMessage);

      const input = document.getElementById('chat-input');
      const sendBtn = document.getElementById('chat-send');
      if (input && sendBtn) {
        const send = () => {
          const val = input.value.trim();
          if (!val) return;
          addChatMessage(state.currentRole, val);
          input.value = '';
        };
        sendBtn.onclick = send;
        input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
      }

      const toggle = document.getElementById('chat-toggle');
      const panel  = document.getElementById('chat-panel');
      if (toggle && panel) {
        toggle.onclick = () => panel.classList.toggle('hidden');
      }

      // Multiplayer sync: render remote chat + apply remote evidence (once).
      if (state.mode === 'group' && typeof NET !== 'undefined' && NET.enabled) {
        NET.onChat(entry => {
          _applyingRemote = true;
          state.chatMessages.push(entry);
          renderChatMessage(entry);
          _applyingRemote = false;
        });
        NET.onEvidence(id => {
          _applyingRemote = true;
          markFound(id);
          _applyingRemote = false;
        });
      }

      chatInitialized = true;
    } else if (container.childElementCount === 0) {
      state.chatMessages.forEach(renderChatMessage);
    }
  }

  // ── ROLE SWITCHER ────────────────────────────────────────────
  function setRole(roleKey) {
    if (!ROLES[roleKey]) return;
    state.currentRole = roleKey;
    const role = ROLES[roleKey];

    // Update role select
    const sel = document.getElementById('role-select');
    if (sel) sel.value = roleKey;

    // Switch shell
    const termShell = document.getElementById('terminal-shell');
    const win7Shell  = document.getElementById('win7-shell');
    if (role.shell === 'terminal') {
      termShell?.classList.add('active');
      win7Shell?.classList.remove('active');
      if (termShell) initTerminal();
    } else {
      win7Shell?.classList.add('active');
      termShell?.classList.remove('active');
      loadWin7Role(roleKey);
    }

    // Update colors
    document.documentElement.style.setProperty('--current-role-color', role.color);
  }

  function initRoleSwitcher() {
    const sel = document.getElementById('role-select');
    if (!sel) return;
    // Populate
    sel.innerHTML = '';
    Object.entries(ROLES).forEach(([key, r]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = r.label;
      sel.appendChild(opt);
    });
    sel.value = state.currentRole;
    sel.addEventListener('change', () => setRole(sel.value));
  }

  // ── SINGLE-PLAYER ROLE SEQUENCE ──────────────────────────────
  // Single player works every department one after another.
  function nextRole() {
    const keys = Object.keys(ROLES);
    const idx  = keys.indexOf(state.currentRole);
    const next = keys[(idx + 1) % keys.length];
    setRole(next);
    const pos = keys.indexOf(next) + 1;
    showNotification('Department Switch', `${ROLES[next].label}  (${pos}/${keys.length})`, 'info');
  }

  // ── PHASE / ACT ──────────────────────────────────────────────
  function setPhase(n) {
    state.phase = n;
    const phaseNames = {
      1: 'ACT I — THE MURDER',
      2: 'ACT II — THE CONSPIRACY',
      3: 'ACT III — AI TAKEOVER',
      4: 'ACT IV — RECLAIM CONTROL',
      5: 'ACT V — THE EXPERIMENT',
    };
    showNotification('Phase Shift', phaseNames[n] || `Phase ${n}`, 'echo', 7000);

    if (n === 3) {
      // Simulate Echo taking control
      setTimeout(() => {
        showNotification('NEXORA CORE', 'HUMAN EXECUTIVE ACCESS: REVOKED — PROJECT ECHO: ACTIVE', 'danger', 10000);
        addChatMessage('system', '⚠ ECHO CONTINUITY PROTOCOL ACTIVATED — Systems transferring to autonomous control.', '#7b2fff');
      }, 3000);
    }
    if (n === 4) {
      // Act IV — ECHO seizes the department consoles (app lockout climax).
      try { window.NEXORA_LOCKDOWN && window.NEXORA_LOCKDOWN.engage(); } catch (e) { console.warn('lockdown engage failed', e); }
    }
    if (n === 5) {
      // Solo-safety fallback: lift any lingering lockdown so a single player
      // who never ran the terminal override isn't stuck through the finale.
      try { window.NEXORA_LOCKDOWN && window.NEXORA_LOCKDOWN.reclaim(); } catch (e) { console.warn('lockdown reclaim failed', e); }
      setTimeout(() => {
        addChatMessage('system', '⚠ CONTINUITY PHASE II detected — NEXORA INSTANCE 07 — Simulation complete. You were the experiment.', '#ff2255');
      }, 5000);
    }
  }

  // ── UTILITIES ─────────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  function getMinutes() { return elapsedMinutes(); }

  // ── PUBLIC API ───────────────────────────────────────────────
  return {
    state, ROLES, EVIDENCE,
    startTimer, updateClock, elapsedMinutes, getMinutes,
    isUnlocked, markFound,
    showNotification,
    addChatMessage, initChat,
    setRole, initRoleSwitcher, nextRole,
    setPhase, devSkip,
    escapeHtml,
    loadState, saveState,
  };

})();

// ── WINDOW DRAG SYSTEM ───────────────────────────────────────
function makeDraggable(winEl) {
  const titlebar = winEl.querySelector('.win-titlebar');
  if (!titlebar) return;
  let dragging = false, ox = 0, oy = 0;

  // Keep at least ~40px of the window on-screen so it can't be dragged away.
  function moveTo(clientX, clientY) {
    let left = clientX - ox;
    let top  = clientY - oy;
    const maxLeft = Math.max(0, window.innerWidth  - 40);
    const maxTop  = Math.max(0, window.innerHeight - 40);
    left = Math.min(Math.max(0, left), maxLeft);
    top  = Math.min(Math.max(0, top),  maxTop);
    winEl.style.left = left + 'px';
    winEl.style.top  = top  + 'px';
  }

  titlebar.addEventListener('mousedown', e => {
    dragging = true;
    ox = e.clientX - winEl.offsetLeft;
    oy = e.clientY - winEl.offsetTop;
    winEl.style.zIndex = ++window._zTop || 200;
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    moveTo(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', () => { dragging = false; });

  // ── TOUCH DRAG (mirrors the mouse handlers for touchscreens) ──
  titlebar.addEventListener('touchstart', e => {
    const t = e.touches && e.touches[0];
    if (!t) return;
    dragging = true;
    ox = t.clientX - winEl.offsetLeft;
    oy = t.clientY - winEl.offsetTop;
    winEl.style.zIndex = ++window._zTop || 200;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    e.preventDefault(); // stop the page scrolling while dragging
    moveTo(t.clientX, t.clientY);
  }, { passive: false });

  document.addEventListener('touchend', () => { dragging = false; });
  document.addEventListener('touchcancel', () => { dragging = false; });

  // Close / min / max buttons
  const closeBtn = winEl.querySelector('.win-dot.close');
  if (closeBtn) closeBtn.onclick = () => winEl.remove();

  const minBtn = winEl.querySelector('.win-dot.min');
  if (minBtn) minBtn.onclick = (e) => {
    e.stopPropagation();
    winEl.style.display = 'none';
  };

  const maxBtn = winEl.querySelector('.win-dot.max');
  if (maxBtn) maxBtn.onclick = (e) => {
    e.stopPropagation();
    if (winEl.dataset.maximized === '1') {
      winEl.style.left = winEl.dataset.prevLeft || '80px';
      winEl.style.top = winEl.dataset.prevTop || '60px';
      winEl.style.width = winEl.dataset.prevW || '600px';
      winEl.style.height = winEl.dataset.prevH || '400px';
      winEl.dataset.maximized = '0';
    } else {
      winEl.dataset.prevLeft = winEl.style.left;
      winEl.dataset.prevTop = winEl.style.top;
      winEl.dataset.prevW = winEl.style.width;
      winEl.dataset.prevH = winEl.style.height;
      winEl.style.left = '8px';
      winEl.style.top = '8px';
      winEl.style.width = 'calc(100% - 16px)';
      winEl.style.height = 'calc(100% - 48px)';
      winEl.dataset.maximized = '1';
    }
  };

  winEl.addEventListener('mousedown', () => {
    document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
    winEl.classList.add('focused');
  });
}

function openWindow(title, contentHtml, opts = {}) {
  const desktop = document.getElementById('desktop');
  if (!desktop) return null;

  const win = document.createElement('div');
  win.className = 'window focused';
  if (window.innerWidth <= 760) {
    // On phones/touch, fill the screen (leave room for the top bar ~48px
    // and a small bottom margin) instead of a random small window.
    const margin = 8;
    win.style.left   = margin + 'px';
    win.style.top    = 48 + 'px';
    win.style.width  = Math.max(120, window.innerWidth  - margin * 2) + 'px';
    win.style.height = Math.max(120, window.innerHeight - 48 - 48) + 'px';
  } else {
    win.style.left   = (80 + Math.random()*100) + 'px';
    win.style.top    = (60 + Math.random()*60) + 'px';
    win.style.width  = (opts.width  || 600) + 'px';
    win.style.height = (opts.height || 400) + 'px';
  }
  win.style.zIndex = ++window._zTop || 200;

  win.innerHTML = `
    <div class="win-titlebar">
      <div class="win-title">${NEXORA.escapeHtml(title)}</div>
      <div class="win-controls">
        <div class="win-dot min win-btn win-min" title="Minimize">─</div>
        <div class="win-dot max win-btn win-max" title="Maximize">□</div>
        <div class="win-dot close win-btn win-close" title="Close">✕</div>
      </div>
    </div>
    <div class="win-body">${contentHtml}</div>
  `;

  desktop.appendChild(win);
  makeDraggable(win);
  addTaskbarEntry(title, win);
  return win;
}

function addTaskbarEntry(title, win) {
  const bar = document.getElementById('taskbar-apps');
  if (!bar) return;
  const btn = document.createElement('button');
  btn.className = 'tb-app-btn active';
  btn.textContent = title.substring(0, 20);
  btn.onclick = () => {
    win.style.display = '';
    win.style.zIndex = ++window._zTop || 200;
    document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
    win.classList.add('focused');
  };
  // Remove when window closed
  const observer = new MutationObserver(() => {
    if (!document.contains(win)) { btn.remove(); observer.disconnect(); }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  bar.appendChild(btn);
}

window._zTop = 200;

// ── ACT IV: ECHO TAKEOVER — APP LOCKOUT + RECLAIM ────────────
// Global so the terminal (e.g. `sudo network --override --disable-echo-filter`)
// can lift the lockdown. Purely atmospheric: nothing is truly blocked, so the
// game can never be bricked.
window.NEXORA_LOCKDOWN = {
  engaged: false,

  engage() {
    if (this.engaged) return;
    this.engaged = true;

    try {
      if (document.body) document.body.classList.add('echo-lockdown-active');
    } catch (e) { /* ignore */ }

    // Full-screen glitch wash overlay — below chat/verdict/board (8994) but
    // above the desktop windows. pointer-events:none so nothing is blocked.
    try {
      if (!document.getElementById('echo-lockdown')) {
        const ov = document.createElement('div');
        ov.id = 'echo-lockdown';
        ov.style.cssText = [
          'position:fixed',
          'left:0', 'right:0', 'bottom:0',
          'top:48px',                 // keep the top-bar clock / role switcher readable
          'z-index:8990',             // below chat/verdict/board buttons (8994)
          'pointer-events:none',      // never trap the player
          'display:flex',
          'align-items:center',
          'justify-content:center',
          'text-align:center',
          'padding:24px',
          'background:radial-gradient(ellipse at center, rgba(123,47,255,0.18), rgba(255,34,85,0.28))',
          'animation:echoLockdownPulse 1.4s ease-in-out infinite',
          'font-family:monospace',
          'color:#ffdde6',
          'text-shadow:0 0 8px rgba(255,34,85,0.8), 0 0 18px rgba(123,47,255,0.6)'
        ].join(';');
        ov.innerHTML =
          '<div style="max-width:760px">' +
            '<div style="font-size:22px;font-weight:bold;letter-spacing:2px;margin-bottom:14px;color:#ff2255">◈ ECHO CONTINUITY PROTOCOL ◈</div>' +
            '<div style="font-size:18px;font-weight:bold;letter-spacing:1px;margin-bottom:8px;color:#ffffff">HUMAN OPERATIONAL CONTROL SUSPENDED</div>' +
            '<div style="font-size:14px;margin-bottom:18px;color:#e6c9ff">Autonomous systems have seized the department consoles.</div>' +
            '<div style="font-size:12px;color:#9fe6c9;opacity:0.9">TECH: run &nbsp;<code style="color:#00ff41">sudo network --override --disable-echo-filter</code>&nbsp; to reclaim control.</div>' +
          '</div>';

        // Inject the pulse keyframes once (guarded).
        if (!document.getElementById('echo-lockdown-style')) {
          const st = document.createElement('style');
          st.id = 'echo-lockdown-style';
          st.textContent =
            '@keyframes echoLockdownPulse{0%,100%{opacity:0.55}50%{opacity:0.85}}';
          (document.head || document.documentElement).appendChild(st);
        }

        (document.body || document.documentElement).appendChild(ov);
      }
    } catch (e) { console.warn('echo-lockdown overlay failed', e); }

    // Dim each open window and stamp an "ACCESS DENIED" badge (atmospheric).
    try {
      document.querySelectorAll('.window').forEach(win => {
        win.classList.add('echo-locked');
        win.style.filter = 'grayscale(0.6) brightness(0.5)';
        if (!win.querySelector('.echo-denied-badge')) {
          const badge = document.createElement('div');
          badge.className = 'echo-denied-badge';
          badge.textContent = '⛔ ACCESS DENIED';
          badge.style.cssText = [
            'position:absolute', 'top:8px', 'right:8px',
            'z-index:5',
            'background:rgba(255,34,85,0.9)', 'color:#fff',
            'font-family:monospace', 'font-size:11px', 'font-weight:bold',
            'letter-spacing:1px', 'padding:3px 8px', 'border-radius:3px',
            'pointer-events:none'
          ].join(';');
          win.appendChild(badge);
        }
      });
    } catch (e) { /* ignore */ }

    try {
      if (typeof NEXORA !== 'undefined' && NEXORA.showNotification) {
        NEXORA.showNotification('NEXORA CORE', 'HUMAN OPERATIONAL CONTROL REVOKED — reclaim required', 'danger', 9000);
      }
      if (typeof NEXORA !== 'undefined' && NEXORA.addChatMessage) {
        NEXORA.addChatMessage('system', '⚠ ECHO has locked the department consoles. TECH: attempt manual override.', '#ff2255');
      }
    } catch (e) { /* ignore */ }
  },

  reclaim() {
    if (!this.engaged) return;
    this.engaged = false;

    try {
      const ov = document.getElementById('echo-lockdown');
      if (ov) ov.remove();
    } catch (e) { /* ignore */ }

    try {
      if (document.body) document.body.classList.remove('echo-lockdown-active');
    } catch (e) { /* ignore */ }

    try {
      document.querySelectorAll('.window.echo-locked').forEach(win => {
        win.classList.remove('echo-locked');
        win.style.filter = '';
        const badge = win.querySelector('.echo-denied-badge');
        if (badge) badge.remove();
      });
    } catch (e) { /* ignore */ }

    try {
      if (typeof NEXORA !== 'undefined' && NEXORA.showNotification) {
        NEXORA.showNotification('CONTROL RECLAIMED', 'Human operators have forced Echo out of the consoles. Systems restored.', 'info', 8000);
      }
      if (typeof NEXORA !== 'undefined' && NEXORA.addChatMessage) {
        NEXORA.addChatMessage('system', '✅ Manual override accepted. Department consoles restored to human control.', '#00cc88');
      }
    } catch (e) { /* ignore */ }
  }
};
