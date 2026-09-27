/**
 * NEXORA: THE ECHO PROTOCOL
 * net.js — Optional real-time multiplayer sync layer (group play)
 * ============================================================
 * Wraps Firebase Realtime Database behind a small NET API. If no
 * Firebase config is present (window.NEXORA_FIREBASE_CONFIG) or the
 * Firebase SDK failed to load, NET.enabled stays false and EVERY method
 * is a safe no-op — single player and local group play are unchanged.
 *
 * To ACTIVATE multiplayer:
 *   1. Create a free Firebase project → add a Realtime Database.
 *   2. Copy your web app config and, BEFORE this script loads, define:
 *        <script>window.NEXORA_FIREBASE_CONFIG = { apiKey:"…", authDomain:"…",
 *          databaseURL:"https://…firebasedatabase.app", projectId:"…", appId:"…" };</script>
 *   3. Include the Firebase compat SDK + this file in index.html:
 *        <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
 *        <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>
 *        <script src="js/net.js"></script>
 *   4. In the Firebase console, add your GitHub Pages domain to authorized domains
 *      and set Realtime DB rules to allow room read/write (see README).
 *
 * Data shape:  /rooms/{CODE}/{ meta, players, chat, evidence }
 */

const NET = (() => {

  let enabled = false;
  let db = null;
  let roomCode = null;
  let playerId = null;
  let isHost = false;
  const listeners = { chat: [], evidence: [], presence: [], start: [], phase: [] };

  // ── INIT ─────────────────────────────────────────────────────
  function init() {
    try {
      const cfg = window.NEXORA_FIREBASE_CONFIG;
      if (!cfg || typeof firebase === 'undefined' || !firebase.initializeApp) {
        enabled = false;
        return false;
      }
      if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(cfg);
      db = firebase.database();
      enabled = true;
      return true;
    } catch (e) {
      console.warn('[NET] Firebase init failed — multiplayer disabled:', e);
      enabled = false;
      return false;
    }
  }

  function makeCode() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no ambiguous chars
    let c = '';
    for (let i = 0; i < 5; i++) c += chars[Math.floor(Math.random() * chars.length)];
    return c;
  }
  function makePlayerId() {
    return 'p_' + Math.random().toString(36).slice(2, 10);
  }

  // ── ROOM LIFECYCLE ───────────────────────────────────────────
  // createRoom(name, role) -> Promise<code>
  function createRoom(name, role) {
    if (!enabled) return Promise.reject('multiplayer disabled');
    roomCode = makeCode();
    playerId = makePlayerId();
    isHost = true;
    const now = firebase.database.ServerValue.TIMESTAMP;
    const roomRef = db.ref('rooms/' + roomCode);
    return roomRef.child('meta').set({ createdAt: now, hostId: playerId, startedAt: null, phase: 1 })
      .then(() => _joinSeat(name, role))
      .then(() => { _bindRoom(); return roomCode; });
  }

  // joinRoom(code, name, role) -> Promise<{code, takenRoles}>
  function joinRoom(code, name, role) {
    if (!enabled) return Promise.reject('multiplayer disabled');
    code = String(code || '').trim().toUpperCase();
    playerId = makePlayerId();
    isHost = false;
    const roomRef = db.ref('rooms/' + code);
    return roomRef.child('meta').get().then(snap => {
      if (!snap.exists()) throw new Error('Room not found: ' + code);
      roomCode = code;
      return _joinSeat(name, role).then(() => { _bindRoom(); return code; });
    });
  }

  function _joinSeat(name, role) {
    const pRef = db.ref('rooms/' + roomCode + '/players/' + playerId);
    pRef.onDisconnect().remove();
    return pRef.set({
      name: name || 'Investigator',
      role: role || 'tech',
      joinedAt: firebase.database.ServerValue.TIMESTAMP,
      lastSeen: firebase.database.ServerValue.TIMESTAMP,
    });
  }

  // Returns a Promise of the roles currently taken in a room (for the seat picker).
  function getTakenRoles(code) {
    if (!enabled) return Promise.resolve({});
    code = String(code || '').trim().toUpperCase();
    return db.ref('rooms/' + code + '/players').get().then(snap => {
      const taken = {};
      snap.forEach(ch => { const v = ch.val(); if (v && v.role) taken[v.role] = v.name || true; });
      return taken;
    }).catch(() => ({}));
  }

  function leaveRoom() {
    if (!enabled || !roomCode || !playerId) return;
    try { db.ref('rooms/' + roomCode + '/players/' + playerId).remove(); } catch (e) {}
  }

  // ── BINDINGS (fan incoming DB events out to registered listeners) ─
  function _bindRoom() {
    if (!enabled || !roomCode) return;
    const r = db.ref('rooms/' + roomCode);

    r.child('chat').on('child_added', s => {
      const v = s.val(); if (v) listeners.chat.forEach(cb => cb(v));
    });
    r.child('evidence').on('child_added', s => {
      const id = s.key; const v = s.val() || {};
      listeners.evidence.forEach(cb => cb(id, v));
    });
    r.child('players').on('value', s => {
      const players = s.val() || {};
      listeners.presence.forEach(cb => cb(players));
    });
    r.child('meta/startedAt').on('value', s => {
      const v = s.val(); if (v) listeners.start.forEach(cb => cb(v));
    });
    r.child('meta/phase').on('value', s => {
      const v = s.val(); if (v) listeners.phase.forEach(cb => cb(v));
    });

    // Heartbeat so lastSeen stays fresh.
    setInterval(() => {
      if (enabled && roomCode && playerId)
        db.ref('rooms/' + roomCode + '/players/' + playerId + '/lastSeen')
          .set(firebase.database.ServerValue.TIMESTAMP).catch(() => {});
    }, 20000);
  }

  // ── PUBLISH ──────────────────────────────────────────────────
  function publishChat(entry) {
    if (!enabled || !roomCode) return false;
    try { db.ref('rooms/' + roomCode + '/chat').push({ ...entry, playerId }); return true; }
    catch (e) { return false; }
  }
  function publishEvidence(id, meta) {
    if (!enabled || !roomCode) return false;
    try {
      db.ref('rooms/' + roomCode + '/evidence/' + id)
        .set({ role: (meta && meta.role) || null, playerId, ts: firebase.database.ServerValue.TIMESTAMP });
      return true;
    } catch (e) { return false; }
  }
  function startGame() {   // host only — sets the shared clock origin
    if (!enabled || !roomCode) return;
    db.ref('rooms/' + roomCode + '/meta/startedAt').set(firebase.database.ServerValue.TIMESTAMP);
  }
  function setPhase(n) {
    if (!enabled || !roomCode) return;
    db.ref('rooms/' + roomCode + '/meta/phase').set(n);
  }

  // ── LISTENER REGISTRATION ────────────────────────────────────
  function onChat(cb)     { listeners.chat.push(cb); }
  function onEvidence(cb) { listeners.evidence.push(cb); }
  function onPresence(cb) { listeners.presence.push(cb); }
  function onStart(cb)    { listeners.start.push(cb); }
  function onPhase(cb)    { listeners.phase.push(cb); }

  // ── PUBLIC API ───────────────────────────────────────────────
  return {
    init,
    get enabled() { return enabled; },
    get roomCode() { return roomCode; },
    get playerId() { return playerId; },
    get isHost() { return isHost; },
    createRoom, joinRoom, getTakenRoles, leaveRoom,
    publishChat, publishEvidence, startGame, setPhase,
    onChat, onEvidence, onPresence, onStart, onPhase,
  };

})();

// Attempt init on load (harmless no-op without config/SDK).
if (typeof window !== 'undefined') {
  try { NET.init(); } catch (e) {}
}
