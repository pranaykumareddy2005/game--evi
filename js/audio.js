/* ============================================================================
 * NEXORA: The Echo Protocol — Web Audio SFX + Ambience System
 * ----------------------------------------------------------------------------
 * Fully self-contained. Synthesizes all sound via the Web Audio API (no files,
 * no dependencies). Hooks into the game READ-ONLY via DOM observation and
 * polling of the global `NEXORA` object. Never edits or mutates game state.
 *
 * Exposes: window.AUDIO
 * ==========================================================================*/
(function () {
  'use strict';

  // ── Configuration ─────────────────────────────────────────────────────────
  var STORAGE_KEY = 'nexora.audio.muted';
  var PHASE_POLL_MS = 1000;
  var AMBIENCE_POLL_MS = 1000;

  // Keep gains LOW and pleasant. Master gain scales everything.
  var MASTER_GAIN = 0.35;
  var AMBIENCE_GAIN = 0.018;

  // ── Internal state ──────────────────────────────────────────────────────────
  var ctx = null;            // AudioContext (lazily created)
  var masterGainNode = null; // master gain -> destination
  var muted = true;          // start MUTED by default (autoplay policy)
  var resumed = false;       // has a user gesture resumed the context?
  var lastPhase = null;      // last observed NEXORA.state.phase
  var ambience = null;       // { osc, subOsc, gain } while running, else null
  var toggleBtn = null;

  // ── Small utilities ───────────────────────────────────────────────────────
  function log() { /* silent by design; kept for future debugging */ }

  function readStoredMuted() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === 'false') return false;
      if (v === 'true') return true;
    } catch (e) { /* ignore */ }
    return true; // default muted
  }

  function writeStoredMuted(val) {
    try { localStorage.setItem(STORAGE_KEY, val ? 'true' : 'false'); }
    catch (e) { /* ignore */ }
  }

  function audioSupported() {
    return typeof (window.AudioContext || window.webkitAudioContext) === 'function';
  }

  function ensureCtx() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterGainNode = ctx.createGain();
      masterGainNode.gain.value = MASTER_GAIN;
      masterGainNode.connect(ctx.destination);
    } catch (e) {
      ctx = null;
      masterGainNode = null;
    }
    return ctx;
  }

  // Only produce sound when we have a running, unmuted, resumed context.
  function canPlay() {
    return !muted && resumed && ctx && masterGainNode &&
           ctx.state === 'running';
  }

  function now() { return ctx ? ctx.currentTime : 0; }

  // ── Synthesis helpers ───────────────────────────────────────────────────────
  // tone(freq, dur, type, gain): a single enveloped oscillator note.
  function tone(freq, dur, type, gain) {
    try {
      if (!canPlay()) return;
      dur = dur || 0.12;
      gain = (gain == null) ? 0.15 : gain;
      var t0 = now();
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      // Gentle attack / decay envelope to avoid clicks and harshness.
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(masterGainNode);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
      osc.onended = function () {
        try { osc.disconnect(); g.disconnect(); } catch (e) {}
      };
    } catch (e) { /* never throw */ }
  }

  // noiseBurst(dur, gain): a short filtered white-noise burst.
  function noiseBurst(dur, gain) {
    try {
      if (!canPlay()) return;
      dur = dur || 0.08;
      gain = (gain == null) ? 0.08 : gain;
      var t0 = now();
      var frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
      var buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < frames; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      var src = ctx.createBufferSource();
      src.buffer = buffer;
      // Band-limit so it reads as a soft "tick" rather than a hiss.
      var filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 0.7;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filter);
      filter.connect(g);
      g.connect(masterGainNode);
      src.start(t0);
      src.stop(t0 + dur + 0.02);
      src.onended = function () {
        try { src.disconnect(); filter.disconnect(); g.disconnect(); } catch (e) {}
      };
    } catch (e) { /* never throw */ }
  }

  // ── Named sounds ────────────────────────────────────────────────────────────
  // blip(): short UI notification blip.
  function blip() {
    try {
      if (!canPlay()) return;
      tone(880, 0.09, 'sine', 0.12);
      tone(1320, 0.07, 'sine', 0.06);
    } catch (e) {}
  }

  // phaseSting(): ominous low descending sweep for phase shifts.
  function phaseSting() {
    try {
      if (!canPlay()) return;
      var t0 = now();
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t0);
      osc.frequency.exponentialRampToValueAtTime(55, t0 + 1.1);
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t0);
      filter.frequency.exponentialRampToValueAtTime(200, t0 + 1.1);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.3);
      osc.connect(filter);
      filter.connect(g);
      g.connect(masterGainNode);
      osc.start(t0);
      osc.stop(t0 + 1.35);
      osc.onended = function () {
        try { osc.disconnect(); filter.disconnect(); g.disconnect(); } catch (e) {}
      };
    } catch (e) {}
  }

  // keyClick(): very short tick for terminal typing.
  function keyClick() {
    try {
      if (!canPlay()) return;
      noiseBurst(0.02, 0.05);
      tone(2200, 0.015, 'square', 0.02);
    } catch (e) {}
  }

  // ── Ambience: low server-room hum ─────────────────────────────────────────
  function ambientStart() {
    try {
      if (!canPlay()) return;
      if (ambience) return; // already running
      var t0 = now();
      // Two detuned low oscillators for a warm hum + a faint sub.
      var osc = ctx.createOscillator();
      var subOsc = ctx.createOscillator();
      var g = ctx.createGain();
      var filter = ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.value = 60;
      subOsc.type = 'sine';
      subOsc.frequency.value = 40;
      filter.type = 'lowpass';
      filter.frequency.value = 220;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(AMBIENCE_GAIN, t0 + 1.5);
      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(g);
      g.connect(masterGainNode);
      osc.start(t0);
      subOsc.start(t0);
      ambience = { osc: osc, subOsc: subOsc, gain: g, filter: filter };
    } catch (e) {}
  }

  function ambientStop() {
    try {
      if (!ambience) return;
      var a = ambience;
      ambience = null;
      if (ctx) {
        var t0 = now();
        try {
          a.gain.gain.cancelScheduledValues(t0);
          a.gain.gain.setValueAtTime(a.gain.gain.value, t0);
          a.gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
        } catch (e) {}
        try { a.osc.stop(t0 + 0.7); } catch (e) {}
        try { a.subOsc.stop(t0 + 0.7); } catch (e) {}
        var toClean = a;
        setTimeout(function () {
          try { toClean.osc.disconnect(); } catch (e) {}
          try { toClean.subOsc.disconnect(); } catch (e) {}
          try { toClean.filter.disconnect(); } catch (e) {}
          try { toClean.gain.disconnect(); } catch (e) {}
        }, 900);
      }
    } catch (e) {}
  }

  // ── Game-state accessors (read-only, defensive) ────────────────────────────
  function gameStarted() {
    try { return !!(window.NEXORA && NEXORA.state && NEXORA.state.started); }
    catch (e) { return false; }
  }

  function currentPhase() {
    try {
      if (window.NEXORA && NEXORA.state && typeof NEXORA.state.phase === 'number') {
        return NEXORA.state.phase;
      }
    } catch (e) {}
    return null;
  }

  // ── Mute toggle button ─────────────────────────────────────────────────────
  function updateToggleUI() {
    if (!toggleBtn) return;
    toggleBtn.textContent = muted ? '🔇' : '🔊';
    toggleBtn.title = muted ? 'Audio muted — click to enable' : 'Audio on — click to mute';
    toggleBtn.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
    toggleBtn.style.opacity = muted ? '0.55' : '1';
  }

  function createToggle() {
    try {
      if (toggleBtn) return;
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'nexora-audio-toggle';
      toggleBtn.type = 'button';

      var s = toggleBtn.style;
      s.position = 'fixed';
      s.top = '6px';
      s.right = '10px';
      s.zIndex = '99999';
      s.width = '30px';
      s.height = '30px';
      s.lineHeight = '28px';
      s.padding = '0';
      s.fontSize = '15px';
      s.textAlign = 'center';
      s.cursor = 'pointer';
      s.borderRadius = '5px';
      s.border = '1px solid var(--accent, #2de1c2)';
      s.background = 'var(--panel, rgba(10,16,24,0.85))';
      s.color = 'var(--accent, #2de1c2)';
      s.boxShadow = '0 0 6px rgba(0,0,0,0.5)';
      s.userSelect = 'none';

      toggleBtn.addEventListener('click', function (ev) {
        try { ev.preventDefault(); } catch (e) {}
        onToggleClick();
      });

      // Prefer placing it inside the top bar if present, else on <body>.
      var topBar = document.getElementById('top-bar');
      if (topBar) {
        // Inside the bar: switch to absolute within the (positioned) bar.
        s.position = 'absolute';
        toggleBtn.style.top = '50%';
        toggleBtn.style.transform = 'translateY(-50%)';
        topBar.appendChild(toggleBtn);
      } else {
        (document.body || document.documentElement).appendChild(toggleBtn);
      }
      updateToggleUI();
    } catch (e) { /* toggle is optional; never throw */ }
  }

  function onToggleClick() {
    try {
      var c = ensureCtx();
      // First interaction (or any while suspended): resume per autoplay policy.
      if (c && c.state === 'suspended') {
        var p = c.resume();
        if (p && typeof p.then === 'function') {
          p.then(function () { resumed = true; applyMuteState(); },
                 function () { /* ignore */ });
        }
      }
      if (c && c.state === 'running') resumed = true;

      muted = !muted;
      writeStoredMuted(muted);
      updateToggleUI();
      applyMuteState();
    } catch (e) {}
  }

  // Apply current mute state: start/stop ambience appropriately.
  function applyMuteState() {
    try {
      if (canPlay() && gameStarted()) {
        ambientStart();
      } else {
        ambientStop();
      }
    } catch (e) {}
  }

  // ── Hooks ───────────────────────────────────────────────────────────────────
  function hookNotifications() {
    try {
      var stack = document.getElementById('notification-stack');
      if (!stack || typeof MutationObserver !== 'function') return;
      var mo = new MutationObserver(function (mutations) {
        try {
          if (!canPlay() || !gameStarted()) return;
          for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
              blip();
              break; // one blip per batch is plenty
            }
          }
        } catch (e) {}
      });
      mo.observe(stack, { childList: true });
    } catch (e) {}
  }

  function hookPhasePolling() {
    try {
      setInterval(function () {
        try {
          var p = currentPhase();
          if (p == null) return;
          if (lastPhase == null) { lastPhase = p; return; }
          if (p > lastPhase) {
            lastPhase = p;
            if (canPlay() && gameStarted()) phaseSting();
          } else if (p < lastPhase) {
            lastPhase = p; // reset (e.g. new game) without stinging
          }
        } catch (e) {}
      }, PHASE_POLL_MS);
    } catch (e) {}
  }

  function isPrintableKey(ev) {
    if (!ev) return false;
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return false;
    var k = ev.key;
    if (typeof k !== 'string') return false;
    // Single visible character (letters, digits, punctuation, space).
    return k.length === 1;
  }

  function hookTyping() {
    try {
      document.addEventListener('keydown', function (ev) {
        try {
          if (!canPlay() || !gameStarted()) return;
          var el = ev.target || document.activeElement;
          if (!el || !el.id) return;
          if (el.id === 'terminal-input' || el.id === 'normal-input') {
            if (isPrintableKey(ev)) keyClick();
          }
        } catch (e) {}
      }, true); // capture
    } catch (e) {}
  }

  function hookAmbiencePolling() {
    try {
      setInterval(function () {
        try {
          if (canPlay() && gameStarted()) {
            if (!ambience) ambientStart();
          } else {
            if (ambience) ambientStop();
          }
        } catch (e) {}
      }, AMBIENCE_POLL_MS);
    } catch (e) {}
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    try {
      muted = readStoredMuted(); // may be false, but context still needs a gesture

      if (audioSupported()) {
        // Create context up-front (starts suspended); do NOT resume yet.
        ensureCtx();
        createToggle();
        hookNotifications();
        hookPhasePolling();
        hookTyping();
        hookAmbiencePolling();
      } else {
        // Still show a (disabled-looking) toggle so layout is consistent,
        // but everything no-ops.
        createToggle();
      }
      updateToggleUI();
    } catch (e) { /* never throw during boot */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API ───────────────────────────────────────────────────────────
  window.AUDIO = {
    tone: tone,
    noiseBurst: noiseBurst,
    blip: blip,
    phaseSting: phaseSting,
    keyClick: keyClick,
    ambientStart: ambientStart,
    ambientStop: ambientStop,
    isMuted: function () { return muted; },
    mute: function () { if (!muted) onToggleClick(); },
    unmute: function () { if (muted) onToggleClick(); },
    toggle: onToggleClick,
    _ctx: function () { return ctx; }
  };
})();
