/**
 * NEXORA: THE ECHO PROTOCOL
 * net.js — Optional real-time multiplayer sync layer (group play)
 * ============================================================
 * Backed by SUPABASE REALTIME (Broadcast + Presence). A room code maps to
 * a channel; presence is the live player roster; broadcast carries chat,
 * shared evidence, the synced start clock and phase. No database tables and
 * no RLS policies are required — only the project URL + anon (public) key.
 *
 * If no config (window.NEXORA_SUPABASE_CONFIG) or the SDK failed to load,
 * NET.enabled stays false and EVERY method is a safe no-op — single player
 * and local group play are completely unchanged.
 *
 * To ACTIVATE multiplayer:
 *   1. Create a free Supabase project (Realtime is on by default).
 *   2. BEFORE this script loads, define your config:
 *        <script>window.NEXORA_SUPABASE_CONFIG = {
 *           url: "https://YOURPROJECT.supabase.co",
 *           anonKey: "YOUR-PUBLIC-ANON-KEY"
 *        };</script>
 *   3. Include the SDK + this file in index.html (before game-state.js):
 *        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *        <script src="js/net.js"></script>
 *   4. (Optional) In Supabase → Realtime settings, keep "broadcast" and
 *      "presence" enabled (default). The anon key is safe to ship; no tables
 *      are exposed, so there is no data to protect with RLS.
 *
 * Channel: "nexora:{CODE}"  · broadcast events: chat | evidence | start | phase
 *                                                | sync_request | sync_state
 */

const NET = (() => {

  let enabled  = false;
  let client   = null;
  let channel  = null;
  let roomCode = null;
  let playerId = null;
  let isHost   = false;
  let me       = { name: 'Investigator', role: 'tech' };

  // Locally-mirrored shared state (so we can answer late-joiners' sync requests).
  let startedAt = null;
  let phase = 1;
  const evidenceSeen = new Set();

  const listeners = { chat: [], evidence: [], presence: [], start: [], phase: [] };

  // ── INIT ─────────────────────────────────────────────────────
  function init() {
    try {
      const cfg = window.NEXORA_SUPABASE_CONFIG;
      const sb  = window.supabase;
      if (!cfg || !cfg.url || !cfg.anonKey || !sb || !sb.createClient) {
        enabled = false;
        return false;
      }
      client = sb.createClient(cfg.url, cfg.anonKey, { realtime: { params: { eventsPerSecond: 20 } } });
      enabled = true;
      return true;
    } catch (e) {
      console.warn('[NET] Supabase init failed — multiplayer disabled:', e);
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
  function makePlayerId() { return 'p_' + Math.random().toString(36).slice(2, 10); }

  // ── CHANNEL WIRING ───────────────────────────────────────────
  // Subscribe to a room channel and fan events out to registered listeners.
  // Returns a Promise that resolves once SUBSCRIBED (after tracking presence).
  function _subscribe(code) {
    return new Promise((resolve, reject) => {
      channel = client.channel('nexora:' + code, {
        config: { presence: { key: playerId }, broadcast: { self: false } },
      });

      channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
        listeners.chat.forEach(cb => cb(payload));
      });
      channel.on('broadcast', { event: 'evidence' }, ({ payload }) => {
        if (payload && payload.id) { evidenceSeen.add(payload.id); listeners.evidence.forEach(cb => cb(payload.id, payload)); }
      });
      channel.on('broadcast', { event: 'start' }, ({ payload }) => {
        startedAt = payload && payload.startedAt; listeners.start.forEach(cb => cb(startedAt));
      });
      channel.on('broadcast', { event: 'phase' }, ({ payload }) => {
        phase = (payload && payload.n) || phase; listeners.phase.forEach(cb => cb(phase));
      });
      // A late joiner asks for current state; anyone who has it replies.
      channel.on('broadcast', { event: 'sync_request' }, () => {
        if (startedAt || evidenceSeen.size) {
          channel.send({ type: 'broadcast', event: 'sync_state',
            payload: { startedAt, phase, evidence: Array.from(evidenceSeen) } });
        }
      });
      channel.on('broadcast', { event: 'sync_state' }, ({ payload }) => {
        if (!payload) return;
        if (payload.startedAt && !startedAt) { startedAt = payload.startedAt; listeners.start.forEach(cb => cb(startedAt)); }
        if (typeof payload.phase === 'number') { phase = payload.phase; listeners.phase.forEach(cb => cb(phase)); }
        (payload.evidence || []).forEach(id => {
          if (!evidenceSeen.has(id)) { evidenceSeen.add(id); listeners.evidence.forEach(cb => cb(id, { sync: true })); }
        });
      });

      channel.on('presence', { event: 'sync' }, () => {
        listeners.presence.forEach(cb => cb(_presenceMap()));
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track({ name: me.name, role: me.role, joinedAt: Date.now() });
            channel.send({ type: 'broadcast', event: 'sync_request', payload: { by: playerId } });
            resolve();
          } catch (e) { reject(e); }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          reject(new Error('Realtime channel error: ' + status));
        }
      });
    });
  }

  function _presenceMap() {
    const out = {};
    try {
      const st = channel.presenceState();
      Object.keys(st).forEach(key => {
        const meta = st[key][0] || {};
        out[key] = { name: meta.name, role: meta.role, joinedAt: meta.joinedAt };
      });
    } catch (e) {}
    return out;
  }

  // ── ROOM LIFECYCLE ───────────────────────────────────────────
  function createRoom(name, role) {
    if (!enabled) return Promise.reject('multiplayer disabled');
    roomCode = makeCode(); playerId = makePlayerId(); isHost = true;
    me = { name: name || 'Investigator', role: role || 'tech' };
    return _subscribe(roomCode).then(() => roomCode);
  }

  function joinRoom(code, name, role) {
    if (!enabled) return Promise.reject('multiplayer disabled');
    roomCode = String(code || '').trim().toUpperCase();
    playerId = makePlayerId(); isHost = false;
    me = { name: name || 'Investigator', role: role || 'tech' };
    return _subscribe(roomCode).then(() => roomCode);
  }

  // Peek at which roles are already taken in a room, for the seat picker.
  // Briefly joins presence, reads the roster, then leaves.
  function getTakenRoles(code) {
    if (!enabled) return Promise.resolve({});
    code = String(code || '').trim().toUpperCase();
    return new Promise((resolve) => {
      const probeId = makePlayerId();
      const probe = client.channel('nexora:' + code, { config: { presence: { key: probeId } } });
      let done = false;
      const finish = () => {
        if (done) return; done = true;
        const taken = {};
        try {
          const st = probe.presenceState();
          Object.keys(st).forEach(k => { const m = st[k][0] || {}; if (m.role) taken[m.role] = m.name || true; });
        } catch (e) {}
        try { probe.unsubscribe(); } catch (e) {}
        resolve(taken);
      };
      probe.on('presence', { event: 'sync' }, () => setTimeout(finish, 250));
      probe.subscribe((s) => { if (s === 'SUBSCRIBED') setTimeout(finish, 1200); });
    });
  }

  function leaveRoom() {
    if (!enabled || !channel) return;
    try { channel.untrack(); channel.unsubscribe(); } catch (e) {}
    channel = null; roomCode = null;
  }

  // ── PUBLISH ──────────────────────────────────────────────────
  function publishChat(entry) {
    if (!enabled || !channel) return false;
    try { channel.send({ type: 'broadcast', event: 'chat', payload: { ...entry, playerId } }); return true; }
    catch (e) { return false; }
  }
  function publishEvidence(id, meta) {
    if (!enabled || !channel) return false;
    evidenceSeen.add(id);
    try { channel.send({ type: 'broadcast', event: 'evidence', payload: { id, role: (meta && meta.role) || null, playerId, ts: Date.now() } }); return true; }
    catch (e) { return false; }
  }
  function startGame() { // host sets the shared clock origin
    if (!enabled || !channel) return;
    startedAt = Date.now();
    try { channel.send({ type: 'broadcast', event: 'start', payload: { startedAt } }); } catch (e) {}
  }
  function setPhase(n) {
    if (!enabled || !channel) return;
    phase = n;
    try { channel.send({ type: 'broadcast', event: 'phase', payload: { n } }); } catch (e) {}
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
    get startedAt() { return startedAt; },
    createRoom, joinRoom, getTakenRoles, leaveRoom,
    publishChat, publishEvidence, startGame, setPhase,
    onChat, onEvidence, onPresence, onStart, onPhase,
  };

})();

// Expose globally (a bare top-level const is NOT a window property) and
// attempt init on load (harmless no-op without config/SDK).
if (typeof window !== 'undefined') {
  window.NET = NET;
  try { NET.init(); } catch (e) {}
}
