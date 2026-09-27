/**
 * NEXORA: THE ECHO PROTOCOL
 * investigation-board.js — The Investigation Board (deduction workspace)
 * ============================================================
 * A central board where the team reviews LOGGED evidence, marks
 * suspects on Motive / Means / Opportunity, and assembles an ordered
 * evidence chain. It is a workspace only — it never grades or reveals
 * the killer. That's the verdict's job.
 */

window.INVBOARD = (() => {

  const LS_KEY = 'nexora_board';

  // ── SUSPECTS ─────────────────────────────────────────────────
  const SUSPECTS = [
    { id: 'daniel', name: 'Daniel Cross',  title: 'CFO',      color: 'var(--warn)'  },
    { id: 'marcus', name: 'Marcus Reed',   title: 'CTO',      color: 'var(--pulse)' },
    { id: 'mira',   name: 'Dr. Mira Sen',  title: 'R&D',      color: 'var(--safe)'  },
    { id: 'closed', name: 'Closed AI',     title: 'External', color: 'var(--danger)'},
    { id: 'echo',   name: 'ECHO',          title: 'AI',       color: 'var(--echo)'  },
  ];

  const CHIPS = ['MOTIVE', 'MEANS', 'OPPORTUNITY'];

  // ── CATEGORY MAP ─────────────────────────────────────────────
  const CATEGORIES = {
    A: 'Physical / Location',
    B: 'Digital / System',
    C: 'Financial',
    D: 'Personnel',
    E: 'Legal',
    F: 'Social / PULSE',
    G: 'R&D / Echo',
    H: 'Executive',
  };
  const CAT_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const MAX_CHAIN = 8;

  // ── STATE (persisted) ────────────────────────────────────────
  // { suspects: { daniel: {MOTIVE:true,...}, ... }, chain: ['A-03', ...] }
  let board = { suspects: {}, chain: [] };

  function loadBoard() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          board.suspects = (data.suspects && typeof data.suspects === 'object') ? data.suspects : {};
          board.chain = Array.isArray(data.chain) ? data.chain.filter(id => NEXORA.EVIDENCE[id]) : [];
        }
      }
    } catch (e) {
      board = { suspects: {}, chain: [] };
    }
  }

  function saveBoard() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(board));
    } catch (e) { /* storage unavailable — keep working in-memory */ }
  }

  // ── BOARD BUTTON ─────────────────────────────────────────────
  function getBoardButton() {
    if (document.getElementById('invboard-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'invboard-btn';
    btn.style.cssText = `
      position: fixed; bottom: 16px; left: 16px;
      background: var(--panel); border: 2px solid var(--echo); border-radius: 4px;
      color: #d8c8ff; font-family: var(--font-display); font-size: 11px;
      letter-spacing: 2px; padding: 10px 22px; cursor: pointer; z-index: 8994;
      box-shadow: 0 0 20px rgba(123,47,255,0.4); text-transform: uppercase;
    `;
    btn.textContent = '⬡ BOARD';
    btn.onclick = () => openBoard();
    document.body.appendChild(btn);
  }

  // ── HELPERS ──────────────────────────────────────────────────
  function esc(s) { return NEXORA.escapeHtml(s); }

  function roleColor(role) {
    return (NEXORA.ROLES[role] && NEXORA.ROLES[role].color) || '#8aaabb';
  }

  function suspectComplete(sid) {
    const s = board.suspects[sid];
    return !!(s && s.MOTIVE && s.MEANS && s.OPPORTUNITY);
  }

  // ── RENDER: SUSPECTS ─────────────────────────────────────────
  function renderSuspects() {
    return SUSPECTS.map(sp => {
      const complete = suspectComplete(sp.id);
      const chips = CHIPS.map(chip => {
        const on = !!(board.suspects[sp.id] && board.suspects[sp.id][chip]);
        return `<span class="invb-chip${on ? ' on' : ''}" data-suspect="${sp.id}" data-chip="${chip}"
          style="display:inline-block;font-family:var(--font-mono);font-size:9px;letter-spacing:1px;
          padding:4px 8px;margin:2px;border-radius:3px;cursor:pointer;user-select:none;
          border:1px solid ${on ? sp.color : 'var(--border)'};
          background:${on ? sp.color : 'transparent'};
          color:${on ? '#0a0d1a' : '#7a90b0'};font-weight:${on ? '700' : '400'};">${chip}</span>`;
      }).join('');
      return `<div class="invb-suspect" style="flex:1 1 150px;min-width:140px;max-width:220px;
        background:var(--surface);border:1px solid ${complete ? sp.color : 'var(--border)'};
        border-radius:6px;padding:12px;box-shadow:${complete ? '0 0 18px ' + sp.color : 'none'};
        transition:all 0.2s;">
        <div style="font-family:var(--font-display);font-size:12px;color:${sp.color};letter-spacing:1px;">${esc(sp.name)}</div>
        <div style="font-family:var(--font-mono);font-size:9px;color:#5a7090;margin-bottom:8px;letter-spacing:1px;text-transform:uppercase;">${esc(sp.title)}</div>
        <div style="display:flex;flex-wrap:wrap;">${chips}</div>
        ${complete ? '<div style="font-family:var(--font-mono);font-size:8px;color:' + sp.color + ';margin-top:8px;letter-spacing:1px;">◆ ALL THREE MARKED</div>' : ''}
      </div>`;
    }).join('');
  }

  // ── RENDER: EVIDENCE LOGGED ──────────────────────────────────
  function renderEvidence() {
    const found = NEXORA.state.evidenceFound;
    const total = Object.keys(NEXORA.EVIDENCE).length;

    if (found.size === 0) {
      return `<div style="font-family:var(--font-mono);font-size:12px;color:#6a80a0;padding:24px;
        text-align:center;border:1px dashed var(--border);border-radius:6px;">
        No evidence logged yet — open your department's tools and start investigating.
      </div>`;
    }

    // Group logged ids by category letter
    const byCat = {};
    CAT_ORDER.forEach(c => { byCat[c] = []; });
    Object.values(NEXORA.EVIDENCE).forEach(ev => {
      if (!found.has(ev.id)) return;
      const cat = ev.id.charAt(0);
      if (byCat[cat]) byCat[cat].push(ev);
    });

    const sections = CAT_ORDER.filter(c => byCat[c].length).map(c => {
      const cards = byCat[c].sort((a, b) => a.id.localeCompare(b.id)).map(ev => {
        const col = roleColor(ev.role);
        return `<div style="background:var(--surface);border:1px solid var(--border);border-left:3px solid ${col};
          border-radius:4px;padding:8px 10px;flex:1 1 220px;min-width:180px;max-width:340px;">
          <div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${col};letter-spacing:1px;">${esc(ev.id)}</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:#a8b8d0;line-height:1.5;margin-top:3px;">${esc(ev.label)}</div>
        </div>`;
      }).join('');
      return `<div style="margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-size:10px;letter-spacing:2px;color:#6a80a0;
          margin-bottom:8px;text-transform:uppercase;border-bottom:1px solid var(--border);padding-bottom:4px;">
          ${esc(CATEGORIES[c])} <span style="color:#3a4a6a;">(${byCat[c].length})</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">${cards}</div>
      </div>`;
    }).join('');

    return `<div style="font-family:var(--font-mono);font-size:11px;color:#8aaabb;margin-bottom:12px;">
        <strong style="color:#fff;">${found.size}</strong> / ${total} logged</div>${sections}`;
  }

  // ── RENDER: CHAIN ────────────────────────────────────────────
  function renderChainDisplay() {
    if (!board.chain.length) {
      return `<span style="font-family:var(--font-mono);font-size:11px;color:#5a7090;">
        Click logged evidence below to add it to your chain (max ${MAX_CHAIN}).</span>`;
    }
    return board.chain.map((id, i) => {
      const ev = NEXORA.EVIDENCE[id];
      const col = ev ? roleColor(ev.role) : '#8aaabb';
      const arrow = i < board.chain.length - 1
        ? '<span style="color:var(--echo);margin:0 4px;font-size:13px;">→</span>' : '';
      return `<span style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:${col};">${esc(id)}</span>${arrow}`;
    }).join('');
  }

  function renderChainPicker() {
    const found = Array.from(NEXORA.state.evidenceFound)
      .filter(id => NEXORA.EVIDENCE[id])
      .sort((a, b) => a.localeCompare(b));

    if (!found.length) {
      return `<div style="font-family:var(--font-mono);font-size:10px;color:#5a7090;">No evidence available to chain yet.</div>`;
    }

    return found.map(id => {
      const ev = NEXORA.EVIDENCE[id];
      const pos = board.chain.indexOf(id);
      const on = pos >= 0;
      const col = roleColor(ev.role);
      return `<span class="invb-pick${on ? ' on' : ''}" data-id="${esc(id)}" title="${esc(ev.label)}"
        style="display:inline-flex;align-items:center;gap:4px;font-family:var(--font-mono);font-size:10px;
        padding:5px 9px;margin:3px;border-radius:3px;cursor:pointer;user-select:none;
        border:1px solid ${on ? col : 'var(--border)'};
        background:${on ? 'rgba(123,47,255,0.15)' : 'transparent'};
        color:${on ? col : '#8aaabb'};font-weight:${on ? '700' : '400'};">
        ${on ? '<span style="background:var(--echo);color:#0a0d1a;border-radius:2px;padding:0 4px;font-size:9px;">' + (pos + 1) + '</span>' : ''}${esc(id)}</span>`;
    }).join('');
  }

  // ── REFRESH DYNAMIC SECTIONS ─────────────────────────────────
  function refresh() {
    const ov = document.getElementById('invboard-overlay');
    if (!ov) return;
    const susEl = ov.querySelector('#invb-suspects');
    const evEl = ov.querySelector('#invb-evidence');
    const chainEl = ov.querySelector('#invb-chain-display');
    const pickEl = ov.querySelector('#invb-chain-picker');
    if (susEl) susEl.innerHTML = renderSuspects();
    if (evEl) evEl.innerHTML = renderEvidence();
    if (chainEl) chainEl.innerHTML = renderChainDisplay();
    if (pickEl) pickEl.innerHTML = renderChainPicker();
  }

  // ── EVENT HANDLERS ───────────────────────────────────────────
  function onOverlayClick(e) {
    const chip = e.target.closest('.invb-chip');
    if (chip) {
      const sid = chip.getAttribute('data-suspect');
      const which = chip.getAttribute('data-chip');
      if (!board.suspects[sid]) board.suspects[sid] = {};
      board.suspects[sid][which] = !board.suspects[sid][which];
      saveBoard();
      refresh();
      return;
    }
    const pick = e.target.closest('.invb-pick');
    if (pick) {
      const id = pick.getAttribute('data-id');
      const idx = board.chain.indexOf(id);
      if (idx >= 0) {
        board.chain.splice(idx, 1);
      } else {
        if (board.chain.length >= MAX_CHAIN) {
          NEXORA.showNotification('Chain full', `A chain holds at most ${MAX_CHAIN} links. Remove one first.`, 'warning');
          return;
        }
        board.chain.push(id);
      }
      saveBoard();
      refresh();
      return;
    }
  }

  function clearChain() {
    board.chain = [];
    saveBoard();
    refresh();
  }

  // ── OPEN BOARD ───────────────────────────────────────────────
  function openBoard() {
    loadBoard();
    document.getElementById('invboard-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'invboard-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(6,8,16,0.96); z-index: 9400;
      display: flex; align-items: flex-start; justify-content: center;
      font-family: var(--font-mono); overflow-y: auto; overflow-x: hidden; padding: 32px 0;
    `;

    overlay.innerHTML = `
      <div style="max-width:900px;width:92%;padding:28px;background:var(--panel);border:1px solid var(--border-glow);
        border-radius:8px;box-shadow:0 0 60px rgba(0,0,0,0.8);box-sizing:border-box;">

        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:6px;flex-wrap:wrap;">
          <div style="font-family:var(--font-display);font-size:13px;letter-spacing:3px;color:var(--echo);text-transform:uppercase;">⬡ Investigation Board</div>
          <button id="invb-close" style="background:transparent;border:1px solid var(--border);color:#6080aa;
            font-family:var(--font-mono);font-size:11px;padding:6px 16px;border-radius:4px;cursor:pointer;">✕ Close</button>
        </div>

        <div style="font-family:var(--font-mono);font-size:11px;color:#8aaabb;line-height:1.7;margin-bottom:24px;
          border-left:2px solid var(--echo);padding-left:12px;">
          Connect the evidence. Who benefits? Who could be in two places at once?
          The board won't tell you if you're right — that's the verdict's job.
        </div>

        <div style="font-family:var(--font-display);font-size:10px;letter-spacing:2px;color:#6a80a0;margin-bottom:12px;text-transform:uppercase;">Suspects</div>
        <div id="invb-suspects" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px;">${renderSuspects()}</div>

        <div style="font-family:var(--font-display);font-size:10px;letter-spacing:2px;color:#6a80a0;margin-bottom:12px;text-transform:uppercase;">Build Your Chain</div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:12px;min-height:20px;">
          <div id="invb-chain-display" style="display:flex;flex-wrap:wrap;align-items:center;">${renderChainDisplay()}</div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
          <button id="invb-clear-chain" style="background:transparent;border:1px solid var(--danger);color:var(--danger);
            font-family:var(--font-mono);font-size:10px;padding:5px 14px;border-radius:4px;cursor:pointer;letter-spacing:1px;">Clear chain</button>
        </div>
        <div id="invb-chain-picker" style="display:flex;flex-wrap:wrap;margin-bottom:28px;">${renderChainPicker()}</div>

        <div style="font-family:var(--font-display);font-size:10px;letter-spacing:2px;color:#6a80a0;margin-bottom:12px;text-transform:uppercase;">Evidence Logged</div>
        <div id="invb-evidence">${renderEvidence()}</div>
      </div>
    `;

    overlay.addEventListener('click', onOverlayClick);
    overlay.querySelector('#invb-close').onclick = () => overlay.remove();
    overlay.querySelector('#invb-clear-chain').onclick = clearChain;

    document.body.appendChild(overlay);
  }

  // Load persisted state at startup so it survives reloads.
  loadBoard();

  return { init: getBoardButton, openBoard };

})();

// Poll: show the BOARD button once the game has started (mirrors verdict.js).
setInterval(() => {
  if (NEXORA.state.started) INVBOARD.init();
}, 4000);
