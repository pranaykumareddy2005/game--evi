/**
 * NEXORA: THE ECHO PROTOCOL
 * app-excel.js — Realistic Microsoft Excel-style Finance ledger
 * ============================================================
 * Self-wiring add-on. Loads AFTER win7-roles.js (which defines the
 * global WIN7_ACTIONS object) and OVERRIDES WIN7_ACTIONS.openFinancePro
 * with a realistic Excel window: ribbon tabs, formula bar, a
 * sortable / filterable / searchable grid, sheet tabs and a status bar.
 *
 * It PRESERVES the exact transaction rows, amounts, time-gates and
 * evidence-marking of the original openFinancePro (C-01, C-02, C-03,
 * C-05), and mirrors the Path Reconstructor's fixed-id re-render
 * pattern (a container id `#xl-body` re-rendered via getElementById,
 * driven by module-level state and WIN7_ACTIONS._xl* methods).
 *
 * Classic script — no modules, no <script> injection (innerHTML does
 * not execute <script>), so interactivity is wired via onclick
 * attributes calling WIN7_ACTIONS methods.
 */

(function () {
  if (typeof WIN7_ACTIONS === 'undefined') return;

  // ── Module-level UI state (survives #xl-body re-renders) ─────
  // Not evidence state — purely presentational (search text + sort).
  const XL_STATE = { search: '', sortCol: null, sortDir: 1 };

  // Safe HTML escape (fall back to a local escaper if NEXORA's is absent).
  function esc(s) {
    try {
      if (typeof NEXORA !== 'undefined' && typeof NEXORA.escapeHtml === 'function') {
        return NEXORA.escapeHtml(String(s));
      }
    } catch (e) { /* fall through */ }
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── The transaction rows — PRESERVED EXACTLY from the original ──
  // Same ids, amounts, notes, time-gates (t) and anomaly class (cls).
  // A cosmetic `status` (derived from cls) fills the blueprint's 5th
  // column; it does not change the underlying data.
  WIN7_ACTIONS._xlBaseRows = function () {
    return [
      { id: 'C-01', t: 35,  label: 'Orion Consulting',   amount: '2480000.00',    note: 'No business purpose',        cls: 'flagged' },
      { id: 'C-02', t: 50,  label: 'Daniel Cross Expense', amount: '320000.00',    note: 'Server Infrastructure',      cls: 'suspicious' },
      { id: 'C-03', t: 65,  label: 'Morrow Systems Acq',  amount: '42000000.00',   note: 'Seller: ORION SYSTEMS',      cls: 'flagged' },
      { id: 'C-05', t: 120, label: 'Investor buyout',     amount: '1800000000.00', note: 'Beneficiary: D. Cross',      cls: 'flagged' },
    ];
  };

  // Status label derived from the anomaly class.
  function statusFor(cls) {
    if (cls === 'flagged') return 'FLAGGED';
    if (cls === 'suspicious') return 'REVIEW';
    return 'OK';
  }

  // Anomaly styling for a data row (guaranteed inline — independent of
  // any external .flagged / .suspicious CSS).
  function rowStyle(cls) {
    if (cls === 'flagged')    return 'background:#fde8e8;';           // red highlight
    if (cls === 'suspicious') return 'background:#fff6e0;';           // amber highlight
    return 'background:#fff;';
  }
  function statusStyle(cls) {
    if (cls === 'flagged')    return 'color:#c0392b;font-weight:bold;';
    if (cls === 'suspicious') return 'color:#b8860b;font-weight:bold;';
    return 'color:#107c41;';
  }

  // Sort arrow indicator for a column header.
  function arrow(col) {
    if (XL_STATE.sortCol !== col) return '';
    return XL_STATE.sortDir === 1 ? ' ▲' : ' ▼';
  }

  // ── Build the grid (thead + tbody) from current time + UI state ──
  // Also performs the evidence marking (once per render) so that
  // filtering/sorting never loses it.
  WIN7_ACTIONS._xlTable = function () {
    const min = (typeof NEXORA !== 'undefined' && typeof NEXORA.getMinutes === 'function')
      ? NEXORA.getMinutes() : 0;

    const base = this._xlBaseRows();

    // Only rows whose unlock time has arrived are visible — same gate as
    // the original openFinancePro.
    let rows = base.filter(function (r) { return min >= r.t; });

    // EVIDENCE MARKING — for every time-shown & unlocked row, exactly as
    // the original did. Done before filter/sort so search/sort can never
    // drop it.
    rows.forEach(function (r) {
      try {
        if (typeof NEXORA !== 'undefined' && NEXORA.isUnlocked && NEXORA.isUnlocked(r.id)) {
          NEXORA.markFound && NEXORA.markFound(r.id);
        }
      } catch (e) { /* ignore */ }
    });

    // Keep the full visible set for the status-bar count.
    const totalVisible = rows.length;

    // SEARCH / FILTER — case-insensitive across id, description, amount,
    // note and status.
    const q = (XL_STATE.search || '').trim().toLowerCase();
    let view = rows;
    if (q) {
      view = rows.filter(function (r) {
        const hay = [r.id, r.label, r.amount, r.note, statusFor(r.cls)].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }

    // SORT — clickable headers. Amount sorts numerically.
    if (XL_STATE.sortCol) {
      const col = XL_STATE.sortCol, dir = XL_STATE.sortDir;
      view = view.slice().sort(function (a, b) {
        let av, bv;
        if (col === 'amount') {
          av = parseFloat(a.amount); bv = parseFloat(b.amount);
        } else if (col === 'status') {
          av = statusFor(a.cls); bv = statusFor(b.cls);
        } else {
          av = String(a[col]); bv = String(b[col]);
        }
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }

    // Header (letter) row — A..E, clickable to sort.
    const cols = [
      { key: 'id',     letter: 'A', label: 'ID',                w: '70px'  },
      { key: 'label',  letter: 'B', label: 'Vendor/Description', w: '200px' },
      { key: 'amount', letter: 'C', label: 'Amount (INR)',      w: '130px' },
      { key: 'note',   letter: 'D', label: 'Note',              w: 'auto'  },
      { key: 'status', letter: 'E', label: 'Status',            w: '90px'  },
    ];

    const letterCells = cols.map(function (c) {
      return '<th class="xl-colh" style="width:' + c.w + '" onclick="WIN7_ACTIONS._xlSort(\'' + c.key + '\')" title="Click to sort by ' + c.label + '">' + c.letter + '</th>';
    }).join('');

    const labelCells = cols.map(function (c) {
      return '<td class="xl-hdr" onclick="WIN7_ACTIONS._xlSort(\'' + c.key + '\')" title="Click to sort">' + esc(c.label) + arrow(c.key) + '</td>';
    }).join('');

    // Data rows. Spreadsheet row numbers continue from 2 (row 1 = header
    // labels), matching the original numbering.
    let body = '';
    if (view.length === 0) {
      const msg = totalVisible === 0
        ? 'Rows locked — waiting for sync...'
        : 'No rows match “' + esc(XL_STATE.search) + '”';
      body = '<tr><td class="xl-gutter">2</td><td colspan="5" style="padding:10px;color:#888;text-align:center;">' + msg + '</td></tr>';
    } else {
      body = view.map(function (r, i) {
        return '<tr style="' + rowStyle(r.cls) + '">' +
          '<td class="xl-gutter">' + (i + 2) + '</td>' +
          '<td class="xl-cell">' + esc(r.id) + '</td>' +
          '<td class="xl-cell">' + esc(r.label) + '</td>' +
          '<td class="xl-cell xl-num">' + esc(r.amount) + '</td>' +
          '<td class="xl-cell">' + esc(r.note) + '</td>' +
          '<td class="xl-cell" style="' + statusStyle(r.cls) + '">' + esc(statusFor(r.cls)) + '</td>' +
        '</tr>';
      }).join('');
    }

    return '' +
      '<table class="xl-table">' +
        '<thead>' +
          '<tr class="xl-letterrow"><th class="xl-corner"></th>' + letterCells + '</tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr class="xl-headerrow"><td class="xl-gutter">1</td>' + labelCells + '</tr>' +
          body +
        '</tbody>' +
      '</table>' +
      '<div class="xl-note">' +
        'KEY: Search or sort to compare vendors. Rows in <b style="color:#c0392b;">red</b> are flagged anomalies; ' +
        '<b style="color:#b8860b;">amber</b> rows need review. Notice the same beneficiary recurring across flagged transfers.' +
      '</div>';
  };

  // ── Re-render the grid in place (window stays put) ───────────
  WIN7_ACTIONS._xlRefresh = function () {
    const bodyEl = document.getElementById('xl-body');
    if (bodyEl) bodyEl.innerHTML = this._xlTable();
    // Update the status-bar record count without touching the search box.
    const cntEl = document.getElementById('xl-count');
    if (cntEl) {
      const rows = document.querySelectorAll('#xl-body tbody tr');
      // subtract the header-label row (row "1")
      const dataRows = Math.max(0, rows.length - 1);
      cntEl.textContent = 'Count: ' + dataRows;
    }
  };

  // Search box handler — read the live input, store it, re-render grid.
  WIN7_ACTIONS._xlFilter = function () {
    const inp = document.getElementById('xl-search');
    XL_STATE.search = inp ? inp.value : '';
    this._xlRefresh();
  };

  // Column-header sort handler — toggle direction on repeat clicks.
  WIN7_ACTIONS._xlSort = function (col) {
    if (XL_STATE.sortCol === col) {
      XL_STATE.sortDir = -XL_STATE.sortDir;
    } else {
      XL_STATE.sortCol = col;
      XL_STATE.sortDir = 1;
    }
    this._xlRefresh();
  };

  // Clear search + sort.
  WIN7_ACTIONS._xlClear = function () {
    XL_STATE.search = '';
    XL_STATE.sortCol = null;
    XL_STATE.sortDir = 1;
    const inp = document.getElementById('xl-search');
    if (inp) inp.value = '';
    this._xlRefresh();
  };

  // ── THE OVERRIDE — realistic Excel window ────────────────────
  WIN7_ACTIONS.openFinancePro = function () {
    // Fresh view each open (evidence state is untouched — that lives in NEXORA).
    XL_STATE.search = '';
    XL_STATE.sortCol = null;
    XL_STATE.sortDir = 1;

    const style = '' +
      '<style>' +
      '.xl-app{font-family:"Segoe UI",Arial,sans-serif;font-size:12px;background:#f3f2f1;height:100%;display:flex;flex-direction:column;color:#1f1f1f;}' +
      '.xl-titlebar{background:#107c41;color:#fff;padding:6px 12px;font-weight:600;display:flex;align-items:center;gap:8px;font-size:12px;}' +
      '.xl-titlebar .xl-dot{margin-left:auto;display:flex;gap:6px;opacity:.9;}' +
      '.xl-titlebar .xl-dot span{width:11px;height:11px;border-radius:2px;background:rgba(255,255,255,.35);display:inline-block;}' +
      '.xl-tabs{background:#f3f2f1;padding:0 8px;border-bottom:1px solid #e1dfdd;display:flex;gap:2px;}' +
      '.xl-tab{padding:6px 12px;color:#444;cursor:default;font-size:12px;}' +
      '.xl-tab.active{color:#107c41;font-weight:600;border-bottom:2px solid #107c41;background:#fff;}' +
      '.xl-ribbon{background:#fff;border-bottom:1px solid #d9d9d9;padding:5px 8px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;}' +
      '.xl-rbtn{border:1px solid #e1dfdd;background:#faf9f8;border-radius:3px;padding:4px 8px;font-size:11px;color:#333;cursor:default;display:inline-flex;align-items:center;gap:4px;}' +
      '.xl-rbtn.on{background:#e6f2eb;border-color:#a9d3bd;color:#0b5c30;}' +
      '.xl-rsep{width:1px;height:22px;background:#e1dfdd;margin:0 3px;}' +
      '.xl-formula{display:flex;align-items:center;background:#fff;padding:3px 6px;border-bottom:1px solid #d9d9d9;gap:6px;}' +
      '.xl-namebox{border:1px solid #ccc;background:#fff;padding:2px 8px;min-width:54px;text-align:center;font-size:12px;}' +
      '.xl-fx{color:#107c41;font-style:italic;font-weight:bold;padding:0 2px;}' +
      '.xl-fbar{flex:1;border:1px solid #ccc;background:#fff;padding:2px 8px;font-family:"Consolas","Courier New",monospace;font-size:12px;color:#333;}' +
      '.xl-toolbar{display:flex;align-items:center;gap:8px;background:#fff;padding:5px 8px;border-bottom:1px solid #e1dfdd;}' +
      '.xl-search{flex:1;max-width:260px;border:1px solid #bbb;border-radius:3px;padding:3px 8px;font-size:12px;}' +
      '.xl-clr{border:1px solid #e1dfdd;background:#faf9f8;border-radius:3px;padding:3px 9px;font-size:11px;cursor:pointer;color:#333;}' +
      '.xl-clr:hover{background:#eee;}' +
      '.xl-hint{font-size:11px;color:#888;}' +
      '.xl-grid{flex:1;overflow:auto;background:#fff;}' +
      '.xl-table{width:100%;border-collapse:collapse;table-layout:fixed;}' +
      '.xl-letterrow th{background:#f4f4f4;border:1px solid #d9d9d9;padding:3px;font-weight:normal;color:#555;font-size:11px;}' +
      '.xl-colh{cursor:pointer;}' +
      '.xl-colh:hover{background:#e6f2eb;}' +
      '.xl-corner{width:34px;}' +
      '.xl-gutter{width:34px;background:#f4f4f4;border:1px solid #d9d9d9;text-align:center;color:#777;padding:4px;font-size:11px;}' +
      '.xl-headerrow .xl-hdr{font-weight:bold;background:#e6f2eb;border:1px solid #d9d9d9;padding:5px;cursor:pointer;color:#0b5c30;}' +
      '.xl-headerrow .xl-hdr:hover{background:#d7ecdf;}' +
      '.xl-cell{border:1px solid #e6e6e6;padding:4px 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.xl-num{font-family:"Consolas","Courier New",monospace;text-align:right;}' +
      '.xl-note{margin:10px;font-family:"Consolas","Courier New",monospace;font-size:10px;color:#5a7090;background:#f8f9fa;padding:9px;border:1px solid #ddd;line-height:1.5;}' +
      '.xl-sheets{background:#f3f2f1;border-top:1px solid #d9d9d9;display:flex;align-items:flex-end;gap:2px;padding:0 6px;font-size:11px;}' +
      '.xl-sheet{padding:4px 12px;border:1px solid transparent;border-bottom:none;color:#555;cursor:default;}' +
      '.xl-sheet.active{background:#fff;border-color:#d9d9d9;color:#107c41;font-weight:600;border-top:2px solid #107c41;}' +
      '.xl-status{background:#107c41;color:#fff;padding:3px 10px;font-size:11px;display:flex;justify-content:space-between;align-items:center;}' +
      '.xl-status .xl-zoom{display:flex;gap:14px;align-items:center;}' +
      '</style>';

    const body = '' +
      '<div class="xl-app">' +
        // Title bar
        '<div class="xl-titlebar">📗 NEXORA_ACCOUNTS_FY2024.xlsx - Excel' +
          '<span class="xl-dot"><span></span><span></span><span></span></span>' +
        '</div>' +
        // Ribbon tabs
        '<div class="xl-tabs">' +
          '<div class="xl-tab">File</div>' +
          '<div class="xl-tab active">Home</div>' +
          '<div class="xl-tab">Insert</div>' +
          '<div class="xl-tab">Data</div>' +
          '<div class="xl-tab">View</div>' +
        '</div>' +
        // Faux Home ribbon
        '<div class="xl-ribbon">' +
          '<span class="xl-rbtn"><b>B</b></span>' +
          '<span class="xl-rbtn"><i>I</i></span>' +
          '<span class="xl-rbtn" style="text-decoration:underline;">U</span>' +
          '<span class="xl-rsep"></span>' +
          '<span class="xl-rbtn">💰 Currency</span>' +
          '<span class="xl-rbtn">% </span>' +
          '<span class="xl-rsep"></span>' +
          '<span class="xl-rbtn on">🖍 Conditional Formatting</span>' +
          '<span class="xl-rbtn">🔍 Filter</span>' +
          '<span class="xl-rbtn">Σ AutoSum</span>' +
        '</div>' +
        // Name box + formula bar
        '<div class="xl-formula">' +
          '<div class="xl-namebox">C2</div>' +
          '<span class="xl-fx">fx</span>' +
          '<div class="xl-fbar">=SUM(C2:C5)</div>' +
        '</div>' +
        // Search / filter toolbar
        '<div class="xl-toolbar">' +
          '<input id="xl-search" class="xl-search" type="text" placeholder="🔍 Search transactions (vendor, note, amount)..." ' +
            'oninput="WIN7_ACTIONS._xlFilter()" onkeyup="WIN7_ACTIONS._xlFilter()">' +
          '<button class="xl-clr" onclick="WIN7_ACTIONS._xlClear()">Clear</button>' +
          '<span class="xl-hint">Click a column header to sort</span>' +
        '</div>' +
        // The grid — fixed-id container, re-rendered in place
        '<div class="xl-grid"><div id="xl-body">' + this._xlTable() + '</div></div>' +
        // Sheet tabs
        '<div class="xl-sheets">' +
          '<div class="xl-sheet active">Sheet1</div>' +
          '<div class="xl-sheet">Transfers</div>' +
          '<div class="xl-sheet">Vendors</div>' +
          '<div class="xl-sheet">+</div>' +
        '</div>' +
        // Status bar
        '<div class="xl-status">' +
          '<span>Ready</span>' +
          '<span id="xl-count">Count: 0</span>' +
          '<span class="xl-zoom"><span>⊕ 100%</span></span>' +
        '</div>' +
      '</div>';

    openWindow('NEXORA_ACCOUNTS_FY2024.xlsx', style + body, { width: 760, height: 480 });

    // Set the initial status-bar count after the window is in the DOM.
    setTimeout(function () {
      try { WIN7_ACTIONS._xlRefresh(); } catch (e) { /* ignore */ }
    }, 0);
  };
})();
