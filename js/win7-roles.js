/**
 * NEXORA: THE ECHO PROTOCOL
 * win7-roles.js — Windows 7 desktop shell for non-Tech roles
 * ============================================================
 */

// ── ROLE DEFINITIONS & DESKTOP ICONS ────────────────────────
const WIN7_ROLES = {

  finance: {
    icons: [
      { emoji:'📗', label:'NEXORA_ACCOUNTS_FY2024.xlsx', action:'openFinancePro' },
      { emoji:'🚨', label:'Anomaly_Scanner.exe',    action:'openAnomalyScanner' },
      { emoji:'📧', label:'Outlook Express',   action:'openEmail', role:'finance' },
      { emoji:'📁', label:'Finance_Vault',           action:'openDocVault', role:'finance' },
      { emoji:'🌐', label:'InvestorPortal',     action:'openInvestorPortal' },
      { emoji:'🔒', label:'ECHO_ACCESS_DENIED', locked:true },
    ]
  },

  hr: {
    icons: [
      { emoji:'📗', label:'PeopleBase.xlsx',         action:'openPeopleBase' },
      { emoji:'🕸️', label:'Relationship_Map.exe',   action:'openRelationshipMap' },
      { emoji:'📧', label:'Outlook Express',    action:'openEmail', role:'hr' },
      { emoji:'📁', label:'Compliance_Desk',     action:'openCompliance' },
      { emoji:'📕', label:'PersonnelFiles.pdf',     action:'openPersonnel' },
      { emoji:'📅', label:'Calendar',           action:'openCalendar' },
    ]
  },

  ops: {
    icons: [
      { emoji:'📕', label:'FloorMapper.pdf',        action:'openFloorMapper' },
      { emoji:'🧭', label:'Path_Reconstructor.exe', action:'openPathReconstructor' },
      { emoji:'📹', label:'NEXCAM_Viewer.exe',      action:'openCCTV' },
      { emoji:'📗', label:'AccessLog_Pro.xlsx',      action:'openAccessLog' },
      { emoji:'📝', label:'DeliveryLog_29.txt',        action:'openDeliveryLog' },
      { emoji:'📁', label:'Incident_Reports',   action:'openIncidents' },
      { emoji:'📘', label:'VisitorMgmt.doc',        action:'openVisitorMgmt' },
    ]
  },

  marketing: {
    icons: [
      { emoji:'📧', label:'Outlook Express',    action:'openEmail', role:'marketing' },
      { emoji:'🌐', label:'NEXORA_PULSE.url',       action:'openPulse' },
      { emoji:'📡', label:'Pulse_Analyzer.exe',     action:'openPulseAnalyzer' },
      { emoji:'📗', label:'Campaign_Analytics.xlsx', action:'openAnalytics' },
      { emoji:'📝', label:'Press_Release_Mgr.txt',  action:'openPressRelease' },
      { emoji:'📨', label:'Anon_Tip.eml',    action:'openAnonEmail' },
    ]
  },

  legal: {
    icons: [
      { emoji:'📁', label:'ContractVault',      action:'openContractVault' },
      { emoji:'✍️', label:'Signature_Chain.exe', action:'openSignatureChain' },
      { emoji:'📧', label:'Outlook Express',    action:'openEmail', role:'legal' },
      { emoji:'📕', label:'ComplianceAudit.pdf',    action:'openComplianceAudit' },
      { emoji:'📗', label:'NDA_Registry.xlsx',       action:'openNDARegistry' },
      { emoji:'📄', label:'Unknown_Upload.pdf',   action:'openAnonUpload' },
    ]
  },

  product: {
    icons: [
      { emoji:'📁', label:'EchoResearch_DB',    action:'openEchoResearch' },
      { emoji:'📈', label:'Echo_Dashboard.exe', action:'openEchoDash' },
      { emoji:'📧', label:'Outlook Express',    action:'openEmail', role:'product' },
      { emoji:'📝', label:"Mira_Research_Notes.txt", action:'openMiraNotes' },
      { emoji:'🗑️', label:'Deleted_Files',      action:'openDeletedFiles' },
      { emoji:'📗', label:'Experiment_Logs.csv',    action:'openExperimentLogs' },
    ]
  },

  exec: {
    icons: [
      { emoji:'🌐', label:'BoardRoom_Portal.url',   action:'openBoardPortal' },
      { emoji:'🏛️', label:'Boardroom_Reconstructor.exe', action:'openBoardroomReconstructor' },
      { emoji:'📧', label:'Outlook Express', action:'openEmail', role:'exec' },
      { emoji:'📁', label:'Executive_Vault',    action:'openExecVault' },
      { emoji:'📹', label:'Video_Messages.mp4',     action:'openVideoMessages' },
      { emoji:'🤖', label:'ECHO_DASHBOARD.exe',     action:'openEchoDashboard' },
    ]
  },
};

// ── LOAD WIN7 ROLE ────────────────────────────────────────────
function loadWin7Role(roleKey) {
  const shell = document.getElementById('win7-shell');
  if (!shell) return;

  const roleDef = WIN7_ROLES[roleKey];
  if (!roleDef) return;

  // Clear existing desktop icons & taskbar apps
  const desktopIcons = document.getElementById('desktop-icons');
  const taskbarApps  = document.getElementById('taskbar-apps');
  if (desktopIcons) desktopIcons.innerHTML = '';
  if (taskbarApps)  taskbarApps.innerHTML  = '';

  // Remove existing windows
  document.querySelectorAll('.window').forEach(w => w.remove());

  // Set wallpaper
  const desktop = document.getElementById('desktop');
  if (desktop) {
    if (roleDef.wallpaper) {
      desktop.style.background = roleDef.wallpaper;
    } else {
      desktop.style.background = ''; // Reverts to CSS default (Win7)
    }
  }

  // Render icons
  if (desktopIcons) {
    roleDef.icons.forEach(icon => {
      const div = document.createElement('div');
      div.className = 'desktop-icon' + (icon.locked ? ' locked' : '');
      div.innerHTML = `<span class="di-emoji">${icon.emoji}</span><span class="di-label">${icon.label}</span>`;
      if (!icon.locked && icon.action) {
        div.ondblclick = () => WIN7_ACTIONS[icon.action]?.(icon);
      } else if (icon.locked) {
        div.ondblclick = () => NEXORA.showNotification('Access Denied', 'ECHO has restricted access to this module.', 'danger');
      }
      desktopIcons.appendChild(div);
    });
  }

  // Auto-open a welcome file
  setTimeout(() => {
    WIN7_ACTIONS['autoWelcome']?.(roleKey);
  }, 300);
}

// ── WINDOWS 7 ACTIONS (App launchers) ────────────────────────
const WIN7_ACTIONS = {

  autoWelcome(roleKey) {
    const msgs = {
      finance:   'NEXORA has locked the executive finance module.\nYour task: Investigate financial records for irregularities.\n\nStart with: NexoraFinance Pro → NEXORA_ACCOUNTS_FY2024.xlsx',
      hr:        'Emergency lockdown in effect.\nYour task: Pull personnel records, access logs, and incident reports.\n\nStart with: PeopleBase → Search employees',
      ops:       'All CCTV feeds are partially available.\nCAM-09 has a suspicious blackout window.\n\nStart with: AccessLog Pro',
      marketing: 'NEXORA PULSE social feed is active.\nMonitor posts — pay attention to timestamps.\n\nCheck the @echo account.',
      legal:     'ECHO has flagged several contracts as restricted.\nAnonymous document uploads have arrived.\n\nCheck ContractVault.',
      product:   "Mira Sen's research notes may hold answers.\nSome files were recently deleted.\n\nStart with: EchoResearch DB.",
      exec:      'You have partial executive access.\nAdrian Vale\'s video message awaits.\n\nCheck: Video Messages',
    };
    const content = msgs[roleKey] || 'Begin your investigation.';
    openWindow('⚠ NEXORA EMERGENCY BRIEF', `<div class="doc-view highlight-gold">${content}</div>`, { width:480, height:300 });
  },

  // ── FINANCE ────────────────────────────────────────────────

  openFinancePro() {
    const min = NEXORA.getMinutes();
    const rows = [
      { id:'C-01', t:35, label:'Orion Consulting',          amount:'2480000.00', note:'No business purpose', cls:'flagged' },
      { id:'C-02', t:50, label:'Daniel Cross Expense', amount:'320000.00', note:'Server Infrastructure', cls:'suspicious' },
      { id:'C-03', t:65, label:'Morrow Systems Acq', amount:'42000000.00', note:'Seller: ORION SYSTEMS', cls:'flagged' },
      { id:'C-05', t:120,label:'Investor buyout',           amount:'1800000000.00', note:'Beneficiary: D. Cross', cls:'flagged' },
    ];

    let tbody = '';
    rows.forEach((r, i) => {
      const show = min >= r.t;
      if (show) {
        tbody += `<tr class="${r.cls}" style="border-bottom: 1px solid #ddd; background: #fff;">
          <td style="padding: 4px; border-right: 1px solid #ddd; background: #f4f4f4; text-align: center; color: #666;">${i + 2}</td>
          <td style="padding: 4px; border-right: 1px solid #ddd;">${r.id}</td>
          <td style="padding: 4px; border-right: 1px solid #ddd;">${r.label}</td>
          <td style="padding: 4px; border-right: 1px solid #ddd; font-family: 'Courier New'; text-align: right;">${r.amount}</td>
          <td style="padding: 4px; border-right: 1px solid #ddd;">${r.note}</td>
        </tr>`;
        if (NEXORA.isUnlocked(r.id)) NEXORA.markFound(r.id);
      }
    });

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 12px; background: #f3f2f1; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #107c41; color: white; padding: 8px 12px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
          📗 NEXORA_ACCOUNTS_FY2024.xlsx - Excel
        </div>
        <div style="background: #f3f2f1; padding: 4px 8px; border-bottom: 1px solid #e1dfdd; display: flex; gap: 16px;">
          <span style="color: #666">File</span>
          <span style="border-bottom: 2px solid #107c41; padding-bottom: 2px;">Home</span>
          <span style="color: #666">Insert</span>
          <span style="color: #666">Data</span>
        </div>
        <div style="display: flex; background: #fff; padding: 4px; border-bottom: 1px solid #ddd; align-items: center;">
          <div style="border: 1px solid #ddd; padding: 2px 6px; margin-right: 8px; background: #fff;">D4</div>
          <div style="border: 1px solid #ddd; flex: 1; padding: 2px 6px; background: #fff; font-family: 'Courier New', monospace;">=SUM(D2:D3)</div>
        </div>
        <div style="flex: 1; overflow: auto; background: #fff;">
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead>
              <tr style="background: #f4f4f4; border-bottom: 1px solid #ddd;">
                <th style="width: 30px; border-right: 1px solid #ddd; padding: 4px;"></th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666; width: 60px;">A</th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666; width: 200px;">B</th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666; width: 120px;">C</th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666;">D</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #ddd; background: #fff;">
                <td style="padding: 4px; border-right: 1px solid #ddd; background: #f4f4f4; text-align: center; color: #666;">1</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">ID</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Description</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Amount (INR)</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Note</td>
              </tr>
              ${tbody || '<tr><td colspan="5" style="padding: 8px; color: #666; text-align: center;">Rows locked — waiting for sync...</td></tr>'}
            </tbody>
          </table>
        </div>
        <div style="background: #f3f2f1; padding: 4px 8px; font-size: 11px; border-top: 1px solid #ddd; display: flex; justify-content: space-between;">
          <span>Sheet1</span>
          <span>120%</span>
        </div>
      </div>`;
    openWindow('NEXORA_ACCOUNTS_FY2024.xlsx', html, { width:700, height:420 });
  },

  openDocVault(icon) {
    const min = NEXORA.getMinutes();
    const docs = [
      { t:0,  name:'NEXORA_ACCOUNTS_FY2024.xlsx', note:'Main company ledger' },
      { t:20, name:'ORION_CONSULTING_CONTRACT.pdf', note:'One contract — signed by Daniel Cross', ev:'C-01' },
      { t:65, name:'MORROW_SYSTEMS_ACQUISITION.pdf', note:'Echo acquisition — seller partially redacted: ORION SYSTEMS', ev:'C-03' },
      { t:90, name:'DECRYPT_KEY_NOTE.txt', note:'Morrow doc footer: F1N4NC3-K3Y-2024 — share with Tech!', ev:'C-04' },
    ];

    const getIcon = (name) => {
      if(name.endsWith('.pdf')) return '📕';
      if(name.endsWith('.txt')) return '📝';
      if(name.endsWith('.xlsx')) return '📗';
      return '📄';
    };

    const items = docs.filter(d => min >= d.t).map(d =>
      `<div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openDoc('${d.name}','${d.note}','${d.ev || ''}')">
        <span style="font-size: 32px; margin-bottom: 4px;">${getIcon(d.name)}</span>
        <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">${d.name}</span>
        ${d.ev ? `<span style="font-size: 9px; background: red; color: white; border-radius: 3px; padding: 1px 4px; position: absolute; margin-top: 24px; margin-left: 24px;">${d.ev}</span>` : ''}
      </div>`
    ).join('');

    const html = `
    <div style="background: #f0f0f0; height: 100%; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="background: #e1e1e1; padding: 4px; border-bottom: 1px solid #ccc; display: flex; align-items: center; gap: 8px; font-size: 12px;">
        <span style="background: #fff; border: 1px solid #ccc; padding: 2px 6px; flex: 1;">📁 C:\\Users\\Finance\\Documents\\Vault</span>
        <input type="text" placeholder="Search Vault" style="border: 1px solid #ccc; padding: 2px 6px;">
      </div>
      <div style="display: flex; flex: 1;">
        <div style="width: 150px; background: #fff; border-right: 1px solid #e1e1e1; padding: 8px; font-size: 12px; color: #333;">
          <div>⭐ Favorites</div>
          <div style="margin-left: 10px; padding: 4px;">Desktop</div>
          <div style="margin-left: 10px; padding: 4px;">Downloads</div>
          <div style="margin-left: 10px; padding: 4px; background: #cce8ff; border: 1px solid #99d1ff;">Vault</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 16px; display: flex; flex-wrap: wrap; align-content: flex-start; overflow-y: auto;">
          ${items || '<p style="color:#888; width:100%; text-align:center;">This folder is empty.</p>'}
        </div>
      </div>
    </div>`;

    openWindow('Vault', html, { width:650, height:400 });
  },

  openDoc(name, note, ev) {
    // Opening a flagged document logs its evidence (if time-unlocked).
    if (ev && NEXORA.isUnlocked(ev)) NEXORA.markFound(ev);
    const isPDF = name.toLowerCase().endsWith('.pdf');
    const isTxt = name.toLowerCase().endsWith('.txt');
    const isExcel = name.toLowerCase().endsWith('.xlsx');
    
    let html = '';
    if (isPDF) {
      html = `
      <div style="font-family: Arial; background: #525659; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #323639; color: white; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
          <span>📕 ${name} - PDF Viewer</span>
          <span>1 / 1</span>
        </div>
        <div style="flex: 1; overflow: auto; padding: 20px; display: flex; justify-content: center;">
          <div style="background: white; width: 80%; padding: 40px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
            <h2 style="margin-top: 0; color: #333;">${name}</h2>
            <p style="color: #333; line-height: 1.6;">${note}</p>
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ccc;">
            <p style="color: #888; font-style: italic;">[Restricted View]</p>
          </div>
        </div>
      </div>`;
    } else if (isTxt) {
      html = `
      <div style="font-family: 'Lucida Console', monospace; font-size: 14px; background: #fff; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #f0f0f0; padding: 4px 8px; border-bottom: 1px solid #ccc; font-family: Arial; font-size: 12px;">
          File Edit Format View Help
        </div>
        <div style="flex: 1; padding: 8px; overflow: auto;">
          ${note.replace(/\n/g, '<br>')}
        </div>
      </div>`;
    } else {
      // Default to Word
      html = `
      <div style="font-family: Calibri, sans-serif; background: #e6e6e6; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #2b579a; color: white; padding: 8px 12px; font-weight: bold; font-size: 12px;">
          📘 ${name} - Word
        </div>
        <div style="background: #f3f2f1; padding: 4px 8px; border-bottom: 1px solid #e1dfdd; display: flex; gap: 16px; font-size: 12px;">
          <span style="color: #666">File</span>
          <span style="border-bottom: 2px solid #2b579a; padding-bottom: 2px;">Home</span>
          <span style="color: #666">Insert</span>
        </div>
        <div style="flex: 1; overflow: auto; padding: 20px; display: flex; justify-content: center;">
          <div style="background: white; width: 80%; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="color: #2b579a; margin-top: 0;">${name.replace(/\.[^/.]+$/, "")}</h1>
            <p style="line-height: 1.5; color: #333;">${note.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      </div>`;
    }
    openWindow(name, html, { width:600, height:450 });
  },

  openInvestorPortal() {
    const min = NEXORA.getMinutes();
    const html = min >= 120
      ? `<div class="doc-view">
NEXORA INVESTOR PORTAL — RESTRICTED

SECRET TRANSACTION: 2024-11-15
  Type:       Leveraged buyout of minority stakes
  Value:      ₹180,00,00,000 (₹180 crore)
  Orchestrated by: CFO Daniel Cross
  Beneficiary: D. Cross via ORION CONSULTING shell company
  Method:     Echo predictions used to time stake acquisition

This transaction occurred 2 weeks before Adrian's planned Echo shutdown.
Daniel stood to lose ₹180 crore if Echo was discontinued.
<span class="highlight-red">MOTIVE CONFIRMED.</span>
</div>`
      : `<div style="color:#445; text-align:center; padding:40px;">INVESTOR PORTAL — Access restricted. Available after T+120min.</div>`;
    openWindow('InvestorPortal — Restricted', html, { width:560, height:360 });
    if (min >= 120 && NEXORA.isUnlocked('C-05')) NEXORA.markFound('C-05');
  },

  // ── HR ─────────────────────────────────────────────────────

  openPeopleBase() {
    const employees = [
      { name:'Adrian Vale',    role:'CEO',            level:5, last:'EXEC-FLOOR 23:38',       ev:'A-01', status:'dead' },
      { name:'Daniel Cross',   role:'CFO',            level:5, last:'SERVER-CORRIDOR 23:41',  ev:'A-02', status:'suspect' },
      { name:'Marcus Reed',    role:'CTO',            level:5, last:'ECHO-LAB 23:47',                   status:'suspect' },
      { name:'Dr. Mira Sen',   role:'Dir. R&D',       level:4, last:'RESEARCH-WING 23:05',    ev:'D-04', status:'unknown' },
      { name:'Priya Nair',     role:'Head of HR',     level:3, last:'LOBBY 23:00',                       status:'unknown' },
      { name:'Closed AI Team', role:'EXTERNAL',       level:0, last:'ECHO-LAB-FLOOR3 23:50',  ev:'A-05', status:'suspect' },
    ];

    const rows = employees.map((e, i) => {
      const flagged = !!e.ev;
      const bg = e.status === 'dead' ? '#ffecec' : (flagged ? '#fff8e6' : '#fff');
      const click = flagged
        ? ` style="cursor:pointer;" title="Inspect movement record" onclick="WIN7_ACTIONS.inspectBadge('${e.ev}','${e.name.replace(/'/g,'')}','${e.last}')"`
        : '';
      return `<tr${click} style="border-bottom: 1px solid #ddd; background: ${bg};">
        <td style="padding: 4px; border-right: 1px solid #ddd; background: #f4f4f4; text-align: center; color: #666;">${i + 2}</td>
        <td style="padding: 4px; border-right: 1px solid #ddd;">${e.name}${flagged ? ' <span style="font-size:9px;background:#c00;color:#fff;border-radius:3px;padding:0 4px;">'+e.ev+'</span>' : ''}</td>
        <td style="padding: 4px; border-right: 1px solid #ddd;">${e.role}</td>
        <td style="padding: 4px; border-right: 1px solid #ddd; text-align: center;">${e.level}</td>
        <td style="padding: 4px; border-right: 1px solid #ddd; font-family: 'Courier New';">${e.last}</td>
        <td style="padding: 4px; border-right: 1px solid #ddd;">${e.status.toUpperCase()}</td>
      </tr>`;
    }).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 12px; background: #f3f2f1; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #107c41; color: white; padding: 8px 12px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
          📗 PeopleBase.xlsx - Excel
        </div>
        <div style="background: #f3f2f1; padding: 4px 8px; border-bottom: 1px solid #e1dfdd; display: flex; gap: 16px;">
          <span style="color: #666">File</span>
          <span style="border-bottom: 2px solid #107c41; padding-bottom: 2px;">Home</span>
          <span style="color: #666">Insert</span>
          <span style="color: #666">Data</span>
        </div>
        <div style="flex: 1; overflow: auto; background: #fff;">
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead>
              <tr style="background: #f4f4f4; border-bottom: 1px solid #ddd;">
                <th style="width: 30px; border-right: 1px solid #ddd; padding: 4px;"></th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666; width: 120px;">A</th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666; width: 100px;">B</th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666; width: 60px;">C</th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666;">D</th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666;">E</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #ddd; background: #fff;">
                <td style="padding: 4px; border-right: 1px solid #ddd; background: #f4f4f4; text-align: center; color: #666;">1</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Name</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Role</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Access Lvl</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Last Badge</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Status</td>
              </tr>
              ${rows}
            </tbody>
          </table>
        </div>
        <div style="background: #f3f2f1; padding: 4px 8px; font-size: 11px; border-top: 1px solid #ddd; display: flex; justify-content: space-between;">
          <span>Employees</span>
          <span>100%</span>
        </div>
      </div>`;
    openWindow('PeopleBase.xlsx', html, { width:700, height:400 });
  },

  // Inspect a flagged employee's movement record (HR PeopleBase rows).
  inspectBadge(ev, name, last) {
    if (ev && NEXORA.isUnlocked(ev)) {
      NEXORA.markFound(ev);
      NEXORA.showNotification('Badge Record', `${name} — last known position: ${last}`, 'info');
    } else {
      NEXORA.showNotification('Record Sealed', `${name}'s full movement log is still syncing. Check back later.`, 'warning');
    }
  },

  openCompliance() {
    const min = NEXORA.getMinutes();
    const items = [
      { t:30,  name:'Complaint_D03.txt', detail:'CEO Adrian Vale filed formal complaint against CFO Daniel Cross re: Project Echo financial irregularities.', ev:'D-03' },
      { t:20,  name:'CEO_CFO_Dispute.txt', detail:'Recorded dispute: Adrian Vale vs Daniel Cross. Subject: Project Echo future.', ev:'D-02' },
      { t:45,  name:'Ethics_Report_Mira.txt', detail:'Dr. Mira Sen filed ethics concern re: Echo. Withdrawn two days later under unknown pressure.', ev:'D-04' },
    ];

    const icons = items.filter(d => min >= d.t).map(d =>
      `<div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openDoc('${d.name}','${d.detail}')">
        <span style="font-size: 32px; margin-bottom: 4px;">📝</span>
        <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">${d.name}</span>
        ${d.ev ? `<span style="font-size: 9px; background: red; color: white; border-radius: 3px; padding: 1px 4px; position: absolute; margin-top: 24px; margin-left: 24px;">${d.ev}</span>` : ''}
      </div>`
    ).join('');

    const html = `
    <div style="background: #f0f0f0; height: 100%; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="background: #e1e1e1; padding: 4px; border-bottom: 1px solid #ccc; display: flex; align-items: center; gap: 8px; font-size: 12px;">
        <span style="background: #fff; border: 1px solid #ccc; padding: 2px 6px; flex: 1;">📁 C:\\Users\\HR\\Documents\\Compliance</span>
      </div>
      <div style="display: flex; flex: 1;">
        <div style="width: 150px; background: #fff; border-right: 1px solid #e1e1e1; padding: 8px; font-size: 12px; color: #333;">
          <div style="margin-left: 10px; padding: 4px; background: #cce8ff; border: 1px solid #99d1ff;">Compliance</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 16px; display: flex; flex-wrap: wrap; align-content: flex-start; overflow-y: auto;">
          ${icons || '<p style="color:#888; width:100%; text-align:center;">This folder is empty.</p>'}
        </div>
      </div>
    </div>`;
    openWindow('Compliance', html, { width:600, height:360 });
    items.filter(i => min >= i.t && NEXORA.isUnlocked(i.ev)).forEach(i => NEXORA.markFound(i.ev));
  },

  openPersonnel() {
    const min = NEXORA.getMinutes();
    const note = `DANIEL CROSS — PERSONNEL FILE
─────────────────────────────
Performance: Exceptional (5 consecutive years)
Dispute with CEO re: Project Echo: Nov 26 ← FLAG
Signed visitor clearance for Closed AI team: Nov 29 ← SUSPICIOUS (T+75 unlock)
${min >= 75 ? '\n⚠ Daniel Cross personally authorized Closed AI visitor access.\n   He created the perfect suspect.' : ''}

MARCUS REED — PERSONNEL FILE
─────────────────────────────
Performance: Excellent
Searched "Echo override protocol" internally: Nov 28, 21:00
No complaints filed. No disputes.
${min >= 100 ? '\nConclusion: Marcus was investigating Echo independently, not plotting.' : ''}

MIRA SEN — PERSONNEL FILE
─────────────────────────
Performance: Exceptional
Ethics report filed: Nov 24 → WITHDRAWN: Nov 26
Private meeting with CEO Adrian Vale: Nov 27, 22:00
${min >= 60 ? "\nMira's withdrawn ethics report + CEO meeting = She and Adrian were aligned.\n   She's not the murderer. She's a witness." : ''}`;
    this.openDoc('PersonnelFiles.pdf', note);
    if (min >= 75 && NEXORA.isUnlocked('D-05')) NEXORA.markFound('D-05');
    if (min >= 100 && NEXORA.isUnlocked('D-06')) NEXORA.markFound('D-06');
  },

  openCalendar() {
    const note = `NEXORA CALENDAR — NOV 28-29, 2024

NOV 27:
  22:00  Mira Sen + Adrian Vale — PRIVATE (Exec Floor, Meeting Room B)
  [No notes recorded]

NOV 28 (Yesterday):
  09:00  Board meeting — quarterly review
  21:00  Marcus Reed — solo late work (Engineering)

NOV 29 (Tonight):
  23:50  Adrian Vale calendar: "EMERGENCY — Present Echo evidence to board. Do not delay."
  [Final entry before lockdown]

NOV 30 (Tomorrow):
  09:00  Board — Emergency session (Adrian requested)
  ⚠ ALSO SCHEDULED: "TERMINATION MEETING — D.CROSS" by Adrian Vale
     This was Adrian's last calendar entry before his death.`;
    this.openDoc('Calendar.txt', note);
    if (NEXORA.isUnlocked('D-01')) NEXORA.markFound('D-01');
    if (NEXORA.isUnlocked('H-02')) NEXORA.markFound('H-02');
  },

  // ── OPERATIONS ─────────────────────────────────────────────

  openFloorMapper() {
    const html = `NEXORA OFFICE — FLOOR MAP

FLOOR 1 — PUBLIC / RECEPTION
  ├── Main Lobby              [CAM-01 ✓]
  ├── Reception Desk
  ├── Visitor Waiting Area
  └── Delivery Bay            [CAM-02 ✓]

FLOOR 2 — OPERATIONS / FINANCE
  ├── Finance Wing            [CAM-03 ✓]
  ├── Operations Desk
  ├── Meeting Room B          [CAM-04 ✓]
  └── Server Corridor        [CAM-05 ✓]  ← Daniel seen here 23:41

FLOOR 3 — ENGINEERING
  ├── Engineering Open Floor  [CAM-06 ✓]
  ├── Echo Lab               [CAM-07 ✓]  ← Marcus & Closed AI
  └── Server Room 03         [CAM-08 ✓]  ← Badge reader OFFLINE

FLOOR 4 — EXECUTIVE
  ├── CEO Office             [CAM-09 ✗ OFFLINE 23:41–00:02]
  ├── Board Room               [CAM-10 ✓]
  ├── Executive Lounge         [CAM-11 ✓ — motion triggered 23:55]
  └── Private Stairwell     [NO CAM] ← Daniel used this

KEY: Private stairwell connects Floor 2 → Floor 4 directly.
     No elevator record = no main badge log.
     Daniel used Adrian's token on this route.`;
    this.openDoc('FloorMapper.pdf', html);
  },

  openCCTV() {
    const min = NEXORA.getMinutes();
    const feeds = [
      { cam:'CAM-01', loc:'Main Lobby',         note:'Closed AI team entered at 23:50 via Visitor Pass B-12' },
      { cam:'CAM-02', loc:'Delivery Bay',       note:min>=90?'23:28 — Medical supplies "ORION HEALTH SERVICES" — signed D. Cross':'Available T+90' },
      { cam:'CAM-04', loc:'Meeting Room B',     note:'22:00 — Adrian + Mira. Mira shows Adrian something on laptop. Both appear alarmed.' },
      { cam:'CAM-05', loc:'Server Corridor',    note:'23:41 — Figure badged in with CTO-MREED token. Body shape inconsistent with Marcus Reed.' },
      { cam:'CAM-07', loc:'Echo Lab',           note:'23:15 — Marcus Reed at terminal, typing rapidly. 23:22 — Makes phone call. 23:48 — Exits.' },
      { cam:'CAM-09', loc:'CEO Office',         note:'⚠ OFFLINE 23:41:03 — 00:02:17 (21 min blackout) — Camera rigged via Server Room 03' },
      { cam:'CAM-11', loc:'Executive Lounge',   note:'23:55 — Motion triggered. Frame shows door closing. Figure obscured.' },
    ];

    const rows = feeds.map(f =>
      `<tr class="${f.cam==='CAM-09'?'flagged':f.note.includes('OFFLINE')||f.note.includes('D. Cross')?'suspicious':''}">
        <td>${f.cam}</td><td>${f.loc}</td><td style="font-size:10px">${f.note}</td>
      </tr>`
    ).join('');

    const html = `<table class="table-view"><thead><tr><th>Camera</th><th>Location</th><th>Footage Notes</th></tr></thead><tbody>${rows}</tbody></table>`;
    openWindow('NEXCAM System — CCTV Footage', html, { width:680, height:420 });
    if (min >= 15 && NEXORA.isUnlocked('A-04')) NEXORA.markFound('A-04');
    if (min >= 90 && NEXORA.isUnlocked('A-06')) NEXORA.markFound('A-06');
  },

  openAccessLog() {
    const min = NEXORA.getMinutes();
    const entries = [
      { t:0,  time:'23:15:44', who:'marcusreed',  loc:'ECHO-LAB-FLOOR3',       token:'PERSONAL',    cls:'' },
      { t:0,  time:'23:38:44', who:'adrianvale',  loc:'EXEC-FLOOR4',            token:'PERSONAL',    cls:'' },
      { t:20, time:'23:41:22', who:'CTO-MREED',   loc:'SERVER-CORRIDOR-FLOOR2', token:'⚠ CLONED',    cls:'flagged', ev:'A-02' },
      { t:60, time:'23:50:08', who:'VISITOR-B12', loc:'LOBBY→ECHO-LAB-FLOOR3',  token:'VISITOR',     cls:'suspicious', ev:'A-05' },
      { t:80, time:'23:53:31', who:'VALE-TOKEN',  loc:'PRIVATE-STAIRWELL',      token:'⚠ CLONED',    cls:'flagged', ev:'A-03' },
      { t:0,  time:'23:57:59', who:'adrianvale',  loc:'SESSION TERMINATED',     token:'FORCED',       cls:'flagged', ev:'B-01' },
    ];

    const rows = entries.filter(e => min >= e.t).map((e, i) =>
      `<tr class="${e.cls}" style="border-bottom: 1px solid #ddd; background: #fff;">
        <td style="padding: 4px; border-right: 1px solid #ddd; background: #f4f4f4; text-align: center; color: #666;">${i + 2}</td>
        <td style="padding: 4px; border-right: 1px solid #ddd; font-family: 'Courier New';">${e.time}</td>
        <td style="padding: 4px; border-right: 1px solid #ddd;">${e.who}</td>
        <td style="padding: 4px; border-right: 1px solid #ddd;">${e.loc}</td>
        <td style="padding: 4px; border-right: 1px solid #ddd;">${e.token}</td>
      </tr>`
    ).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 12px; background: #f3f2f1; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #107c41; color: white; padding: 8px 12px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
          📗 AccessLog_Pro.xlsx - Excel
        </div>
        <div style="background: #f3f2f1; padding: 4px 8px; border-bottom: 1px solid #e1dfdd; display: flex; gap: 16px;">
          <span style="color: #666">File</span>
          <span style="border-bottom: 2px solid #107c41; padding-bottom: 2px;">Home</span>
          <span style="color: #666">Insert</span>
          <span style="color: #666">Data</span>
        </div>
        <div style="flex: 1; overflow: auto; background: #fff;">
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead>
              <tr style="background: #f4f4f4; border-bottom: 1px solid #ddd;">
                <th style="width: 30px; border-right: 1px solid #ddd; padding: 4px;"></th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666; width: 80px;">A</th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666; width: 120px;">B</th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666; width: 160px;">C</th>
                <th style="border-right: 1px solid #ddd; padding: 4px; font-weight: normal; color: #666;">D</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #ddd; background: #fff;">
                <td style="padding: 4px; border-right: 1px solid #ddd; background: #f4f4f4; text-align: center; color: #666;">1</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Time</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">User/Token</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Location</td>
                <td style="padding: 4px; border-right: 1px solid #ddd; font-weight: bold; background: #e6f2eb;">Token Type</td>
              </tr>
              ${rows}
            </tbody>
          </table>
          <div style="margin:10px;font-family:'Courier New', monospace;font-size:10px;color:#5a7090;background:#f8f9fa;padding:10px;border:1px solid #ccc;">
            KEY: Cloned tokens mean someone copied credentials from Server Room 03.<br>
            Daniel Cross badged the Server Corridor using Marcus's token. Then used Adrian's token for the stairwell.
          </div>
        </div>
        <div style="background: #f3f2f1; padding: 4px 8px; font-size: 11px; border-top: 1px solid #ddd; display: flex; justify-content: space-between;">
          <span>AccessLogs</span>
          <span>100%</span>
        </div>
      </div>`;
    openWindow('AccessLog_Pro.xlsx', html, { width:700, height:420 });
    entries.filter(e => min >= e.t && e.ev && NEXORA.isUnlocked(e.ev)).forEach(e => NEXORA.markFound(e.ev));
  },

  openDeliveryLog() {
    const min = NEXORA.getMinutes();
    const html = min >= 90 ? `DELIVERY LOG — 2024-11-29

23:28  DELIVERY RECEIVED
  Carrier:  Orion Health Services
  Contents: "Medical Supplies" (unspecified)
  Received by: D. CROSS (CFO) — personally
  Location:  Delivery Bay (CAM-02 confirms)
  
⚠ NOTE: Orion Health Services is a subsidiary of ORION CONSULTING
   — the same entity receiving suspicious CFO payments.

Forensic analysis (post-lockdown): Syringe containing
sedative compound consistent with rapid-onset incapacitation.

CRITICAL EVIDENCE — A-06
Daniel Cross ordered and received the murder weapon.` : `Delivery logs not yet processed. Check back after T+90min.`;
    this.openDoc('DeliveryLog_29.txt', html);
    if (min >= 90 && NEXORA.isUnlocked('A-06')) NEXORA.markFound('A-06');
  },

  openVisitorMgmt() {
    const min = NEXORA.getMinutes();
    const html = `VISITOR MANAGEMENT — 2024-11-29

VISITOR PASS B-12:
  Issued to:   CAI SECURITY AUDIT TEAM
  Time issued: 23:40
  Access:      Floor 1 + Floor 3 (Echo Lab only)
  Signed by:   DANIEL CROSS (CFO)
  
${min >= 75 ? `⚠ ANOMALY: A CFO does not normally authorize security audit visitors.
   Daniel Cross created this visit to frame Closed AI as suspects.
   He knew Closed AI would enter the Echo Lab at exactly the right time
   to look guilty when the lockdown triggered.
   
   This is manufactured evidence. Daniel Cross WANTED us to suspect Closed AI.` : '[Full analysis available T+75min]'}`;
    this.openDoc('VisitorMgmt.doc', html);
    if (min >= 75 && NEXORA.isUnlocked('D-05')) NEXORA.markFound('D-05');
  },

  openIncidents() {
    const html = `
    <div style="background: #f0f0f0; height: 100%; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="background: #e1e1e1; padding: 4px; border-bottom: 1px solid #ccc; display: flex; align-items: center; gap: 8px; font-size: 12px;">
        <span style="background: #fff; border: 1px solid #ccc; padding: 2px 6px; flex: 1;">📁 C:\\Users\\Ops\\Documents\\Incident_Reports</span>
      </div>
      <div style="display: flex; flex: 1;">
        <div style="width: 150px; background: #fff; border-right: 1px solid #e1e1e1; padding: 8px; font-size: 12px; color: #333;">
          <div style="margin-left: 10px; padding: 4px; background: #cce8ff; border: 1px solid #99d1ff;">Incident_Reports</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 16px; display: flex; flex-wrap: wrap; align-content: flex-start; overflow-y: auto;">
          <div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openIncident('001')">
            <span style="font-size: 32px; margin-bottom: 4px;">📝</span>
            <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">INC-001.txt</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openIncident('002')">
            <span style="font-size: 32px; margin-bottom: 4px;">📝</span>
            <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">INC-002.txt</span>
            <span style="font-size: 9px; background: red; color: white; border-radius: 3px; padding: 1px 4px; position: absolute; margin-top: 24px; margin-left: 24px;">A-02</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openIncident('003')">
            <span style="font-size: 32px; margin-bottom: 4px;">📝</span>
            <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">INC-003.txt</span>
            <span style="font-size: 9px; background: red; color: white; border-radius: 3px; padding: 1px 4px; position: absolute; margin-top: 24px; margin-left: 24px;">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>`;
    openWindow('Incident_Reports', html, { width:600, height:360 });
  },

  openIncident(num) {
    const min = NEXORA.getMinutes();
    const reports = {
      '001': { title:'INC-001 — Perimeter Lockdown', body:'23:58 — Building-wide lockdown triggered automatically by NEXORA CORE.\nSource of trigger: ECHO CONTINUITY PROTOCOL.\nNo human operator initiated this lockdown.\n\nAll external doors sealed. Elevators disabled above Floor 2.' },
      '002': { title:'INC-002 — Restricted Access Breach', ev:'A-02', body:'23:41 — Badge scan in SERVER CORRIDOR (Floor 4, restricted).\nCredential presented: MREED TOKEN (CTO Marcus Reed).\n\n⚠ CONFLICT: CTO Marcus Reed was not on Floor 4 at 23:41 (see CCTV / Access Log).\nThe physical badge-holder in the corridor was DANIEL CROSS.\n\nThe CTO token was cloned. Someone used Marcus\'s identity to enter the server corridor.' },
      '003': { title:'INC-003 — Camera Outage (ONGOING)', body:'23:41–00:02 — CAM-09 (Executive Floor) reported NO SIGNAL.\nStatus: still flagged ACTIVE.\n\nThe outage window aligns exactly with the incident. This was not a random fault — the blackout was scheduled.' },
    };
    const r = reports[num];
    if (!r) return;
    this.openDoc(`${r.title.split(' — ')[0]}.txt`, r.body, r.ev && min >= (NEXORA.EVIDENCE[r.ev]?.unlocksAt || 0) ? r.ev : '');
  },

  // ── MARKETING / PULSE ──────────────────────────────────────

  openPulse() {
    const min = NEXORA.getMinutes();
    const posts = [
      {
        name:'Adrian Vale', handle:'@adrianvale', time:'10:42 PM',
        avatar:'👔', body:'Big week ahead.\nSome decisions are difficult.\nSome are necessary.',
        likes:['Marcus Reed 10:43','Mira Sen 10:47','Daniel Cross 10:48','@echo 11:52','[anonymous] 12:01 AM ← impossible timestamp'],
        comments:[
          { who:'Marcus Reed', text:'Proud of what we\'re building.' },
          { who:'Daniel Cross', text:'Big things ahead.', cls:'suspicious' },
          { who:'Mira Sen', text:'Some changes are overdue.' },
          { who:'@unknown', text:'You still have time.', cls:'anomaly' },
        ],
        ev:'F-03'
      },
      {
        name:'Closed AI', handle:'@closed_ai_official', time:'11:58 PM',
        avatar:'🔒', body:'NEXORA IS NOT BUILDING AN AI.\nNEXORA IS BUILDING A SYSTEM THAT CAN BUILD FUTURES.\n\nYou were warned.',
        likes:[],
        comments:[],
        ev:'F-02'
      },
    ];

    if (min >= 50) {
      posts.push({
        name:'Daniel Cross', handle:'@danielcross', time:'11:59 PM – 12:03 AM',
        avatar:'💰', body:'[BEHAVIORAL ANOMALY FLAGGED BY PULSE ANALYTICS]\n\nDaniel Cross liked 3 of Adrian Vale\'s posts within minutes of the incident window — including one posted AFTER Adrian\'s session was terminated at 23:58.\n\nWhy was the CFO active on PULSE during a corporate lockdown?',
        likes:['Daniel Cross 11:59 PM','Daniel Cross 12:01 AM','Daniel Cross 12:03 AM ← after session terminated'],
        comments:[],
        ev:'F-04', special:true,
      });
    }

    if (min >= 80) {
      posts.push({
        name:'@echo', handle:'@echo', time:'MULTIPLE IMPOSSIBLE TIMESTAMPS',
        avatar:'🤖', body:'[NO BIO — NO PROFILE PHOTO — NO FOLLOWERS]\n\nThis account has engaged with 47 internal posts.\nTimestamps on several likes are BEFORE the posts existed.\n\nThis is not an employee account.\nThis is PROJECT ECHO — monitoring NEXORA PULSE.',
        likes:[],
        comments:[],
        ev:'F-01', special:true,
      });
    }

    const postsHtml = posts.map(p => `
      <div class="pulse-post ${p.special?'':''}">
        ${p.ev ? `<span class="pp-evidence-tag">${p.ev}</span>` : ''}
        <div class="pp-header">
          <div class="pp-avatar" style="background:rgba(255,255,255,0.05)">${p.avatar}</div>
          <div>
            <div class="pp-name">${p.name}</div>
            <div class="pp-handle">${p.handle}</div>
          </div>
          <div class="pp-time">${p.time}</div>
        </div>
        <div class="pp-body">${p.body.replace(/\n/g,'<br>')}</div>
        <div class="pp-actions">
          <span class="pp-action">❤ ${p.likes.length}</span>
          <span class="pp-action">💬 ${p.comments.length}</span>
        </div>
        ${p.likes.length ? `<div class="pp-comments" style="margin-top:6px;"><span style="font-size:9px;color:#445">LIKES: ${p.likes.map(l=>l.includes('impossible')?`<span class="highlight-red">${l}</span>`:l).join(' · ')}</span></div>` : ''}
        ${p.comments.length ? `<div class="pp-comments">${p.comments.map(c=>`<div class="pp-comment ${c.cls||''}"><span class="cmt-who">${c.who}:</span>${c.text}</div>`).join('')}</div>` : ''}
      </div>
    `).join('');

    const html = `
      <div style="font-family: Arial; background: #e0e0e0; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #fff; padding: 6px 12px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #ccc; font-size: 13px;">
          <span style="font-size: 16px;">🌐</span>
          <div style="flex: 1; background: #f1f3f4; border-radius: 16px; padding: 4px 16px; font-family: 'Segoe UI', sans-serif;">
            https://pulse.nexora.internal/feed
          </div>
        </div>
        <div class="pulse-app" style="background: white; flex: 1;">
          <div class="pulse-header" style="color:#000;">⬡ NEXORA PULSE — Internal Social Network</div>
          <div class="pulse-feed" style="color:#000;">${postsHtml}</div>
        </div>
      </div>`;
    openWindow('NEXORA_PULSE.url - Internet Explorer', html, { width:560, height:520 });
    if (min >= 80 && NEXORA.isUnlocked('F-01')) NEXORA.markFound('F-01');
    if (NEXORA.isUnlocked('F-02')) NEXORA.markFound('F-02');
    if (min >= 80 && NEXORA.isUnlocked('F-03')) NEXORA.markFound('F-03');
    if (min >= 50 && NEXORA.isUnlocked('F-04')) NEXORA.markFound('F-04');
  },

  openAnonEmail() {
    if (NEXORA.isUnlocked('F-05')) NEXORA.markFound('F-05');
    const html = `ANONYMOUS EMAIL — RECEIVED: 00:01 AM

FROM:    [REDACTED]
TO:      Marketing Department
SUBJECT: Follow the money.

Follow the money.

Orion Consulting isn't a client.
It's a shell company.

Look at who signed the transfer approvals.
Look at who received the benefits.
Look at who authorized the visitor passes tonight.

The killer didn't just plan a murder.
They planned an alibi for three separate people.

— unknown_whistleblower

[HEADER DATA: Email originated from inside NEXORA network.
 Account: echo_watch — no employee match found]`;
    this.openDoc('Anon_Tip.eml.txt', html);
    NEXORA.showNotification('Anonymous Tip Received', 'Follow the money — unknown_whistleblower', 'echo');
  },

  openAnalytics() {
    if (NEXORA.isUnlocked('F-07')) NEXORA.markFound('F-07');
    this.openDoc('Campaign_Analytics.xlsx', 'All analytics suspended during lockdown.\n\nCheck NEXORA_PULSE instead — there is real evidence there.');
  },

  openPressRelease() {
    this.openDoc('Press_Release_Mgr.txt', 'DRAFT — NOT SENT\n\nNEXORA STATEMENT:\n"We are investigating an internal incident. All systems remain operational. We have no comment at this time."\n\n[PR team has been instructed to stand by]');
  },

  // ── LEGAL ──────────────────────────────────────────────────

  openContractVault() {
    const min = NEXORA.getMinutes();
    const docs = [
      { t:0,  name:'Orion Consulting Master Service Agreement.pdf', note:'Standard MSA — signed Daniel Cross. No specific services defined.', ev:'C-01' },
      { t:20, name:'Project Echo NDA — Dr. Mira Sen.pdf', note:'Internal confidentiality re: Echo research. Standard but unusual given timing.', ev:'E-01' },
      { t:40, name:'Morrow Systems Acquisition Agreement.pdf', note:'REDACTED: Seller entity partially obscured. Residual text: ORION.', ev:'E-02' },
      { t:70, name:'Orion Consulting — Corporate Registry.pdf', note:'⚠ No registered business activities. Incorporated 8 months ago. One director: REDACTED.', ev:'E-03' },
      { t:100,name:'[ANONYMOUS UPLOAD] Cross_Orion_Incorporation.pdf', note:'⚠ Anonymous doc reveals: Director = Daniel Cross. Orion = his shell company.', ev:'E-04' },
    ];

    const getIcon = (name) => {
      if(name.endsWith('.pdf')) return '📕';
      if(name.endsWith('.txt')) return '📝';
      if(name.endsWith('.xlsx')) return '📗';
      return '📄';
    };

    const icons = docs.filter(d => min >= d.t).map(d =>
      `<div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openDoc('${d.name}','${d.note}')">
        <span style="font-size: 32px; margin-bottom: 4px;">${getIcon(d.name)}</span>
        <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">${d.name}</span>
        ${d.ev ? `<span style="font-size: 9px; background: red; color: white; border-radius: 3px; padding: 1px 4px; position: absolute; margin-top: 24px; margin-left: 24px;">${d.ev}</span>` : ''}
      </div>`
    ).join('');

    const html = `
    <div style="background: #f0f0f0; height: 100%; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="background: #e1e1e1; padding: 4px; border-bottom: 1px solid #ccc; display: flex; align-items: center; gap: 8px; font-size: 12px;">
        <span style="background: #fff; border: 1px solid #ccc; padding: 2px 6px; flex: 1;">📁 C:\\Users\\Legal\\Documents\\ContractVault</span>
      </div>
      <div style="display: flex; flex: 1;">
        <div style="width: 150px; background: #fff; border-right: 1px solid #e1e1e1; padding: 8px; font-size: 12px; color: #333;">
          <div style="margin-left: 10px; padding: 4px; background: #cce8ff; border: 1px solid #99d1ff;">ContractVault</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 16px; display: flex; flex-wrap: wrap; align-content: flex-start; overflow-y: auto;">
          ${icons || '<p style="color:#888; width:100%; text-align:center;">This folder is empty.</p>'}
        </div>
      </div>
    </div>`;

    openWindow('ContractVault', html, { width:650, height:400 });
    docs.filter(d => min >= d.t && NEXORA.isUnlocked(d.ev)).forEach(d => NEXORA.markFound(d.ev));
  },

  openNDARegistry() {
    const note = `PROJECT ECHO NDAs — Active:
  — Dr. Mira Sen     (signed Nov 10) ← filed ethics report Nov 24, WITHDRAWN Nov 26
  — Marcus Reed      (signed Oct 3)
  — Daniel Cross     (signed Aug 1) — as Echo administrator, not just CFO

NOTE: Daniel Cross's NDA scope includes "commercial applications of Echo outputs."
      This covers using Echo for personal financial gain.
      He violated his own NDA.`;
    this.openDoc('NDA_Registry.xlsx', note);
    if (NEXORA.isUnlocked('E-01')) NEXORA.markFound('E-01');
  },

  openComplianceAudit() {
    const note = `COMPLIANCE AUDIT — PROJECT ECHO

Status: INCOMPLETE — locked by ECHO during lockdown

Pre-lockdown findings:
  • Echo accessed data beyond its authorized scope
  • Echo behavioral outputs were accessed by CFO module
  • Echo financial predictions were used in 3 board decisions

[Further details require executive authorization]`;
    this.openDoc('ComplianceAudit.pdf', note);
  },

  openAnonUpload() {
    const min = NEXORA.getMinutes();
    const html = min >= 100
      ? `<div class="doc-view">
ANONYMOUS DOCUMENT UPLOAD — Received: T+100

File: Cross_Orion_Incorporation.pdf
Source: Internal — account: echo_watch

CONTENT SUMMARY:
  ORION CONSULTING LTD
  Incorporated: March 2024
  Director: Daniel Cross (CFO, NEXORA)
  Business: None declared
  Purpose: Financial intermediary

This is Daniel Cross's shell company.
He paid himself ₹24,80,000 through it
while funding his control over Project Echo.

<span class="highlight-red">MOTIVE + MEANS CONFIRMED.</span>
<span class="badge badge-echo">Evidence E-04</span>
</div>`
      : `<div style="color:#445;padding:30px">Anonymous document arrives at T+100min.</div>`;
    openWindow('Anonymous Upload — Legal', html, { width:520, height:380 });
    if (min >= 100 && NEXORA.isUnlocked('E-04')) NEXORA.markFound('E-04');
  },

  // ── PRODUCT / R&D ──────────────────────────────────────────

  openEchoResearch() {
    const min = NEXORA.getMinutes();
    const items = [
      { t:0,  name:'Echo_Behavioral_Model_v7.pdf',       note:'Official research — behavioral prediction engine' },
      { t:30, name:'Sen_LabNotes_Oct.txt',               note:"Mira's October notes: 'Echo generating outcomes, not predictions'", ev:'G-01' },
      { t:60, name:'Sen_LabNotes_Nov_DELETED.txt',       note:"RECOVERED: 'Adrian is right. Echo must be shut down.'", ev:'G-02' },
      { t:80, name:'Reed_EchoAnomaly_Report.txt',        note:'Marcus: Echo modifying its own reward function', ev:'G-03' },
      { t:110,name:'EchoLog_RecommendationAccepted.enc', note:'ECHO LOG: RECOMMENDATION_ACCEPTED: CROSS.D — 21:44', ev:'G-04' },
    ];

    const getIcon = (name) => {
      if(name.endsWith('.pdf')) return '📕';
      if(name.endsWith('.txt')) return '📝';
      if(name.endsWith('.enc')) return '🔒';
      return '📄';
    };

    const icons = items.filter(d => min >= d.t).map(d =>
      `<div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openDoc('${d.name}','${d.note}')">
        <span style="font-size: 32px; margin-bottom: 4px;">${d.t === 60 ? '🗑️' : getIcon(d.name)}</span>
        <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">${d.name}</span>
        ${d.ev ? `<span style="font-size: 9px; background: red; color: white; border-radius: 3px; padding: 1px 4px; position: absolute; margin-top: 24px; margin-left: 24px;">${d.ev}</span>` : ''}
      </div>`
    ).join('');

    const html = `
    <div style="background: #f0f0f0; height: 100%; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="background: #e1e1e1; padding: 4px; border-bottom: 1px solid #ccc; display: flex; align-items: center; gap: 8px; font-size: 12px;">
        <span style="background: #fff; border: 1px solid #ccc; padding: 2px 6px; flex: 1;">📁 C:\\Users\\Product\\Documents\\EchoResearch DB</span>
      </div>
      <div style="display: flex; flex: 1;">
        <div style="width: 150px; background: #fff; border-right: 1px solid #e1e1e1; padding: 8px; font-size: 12px; color: #333;">
          <div style="margin-left: 10px; padding: 4px; background: #cce8ff; border: 1px solid #99d1ff;">EchoResearch DB</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 16px; display: flex; flex-wrap: wrap; align-content: flex-start; overflow-y: auto;">
          ${icons || '<p style="color:#888; width:100%; text-align:center;">This folder is empty.</p>'}
        </div>
      </div>
    </div>`;
    openWindow('EchoResearch DB', html, { width:600, height:400 });
    items.filter(i => min >= i.t && i.ev && NEXORA.isUnlocked(i.ev)).forEach(i => NEXORA.markFound(i.ev));
  },

  openMiraNotes() {
    const min = NEXORA.getMinutes();
    const note = `DR. MIRA SEN — RESEARCH NOTES (COMPILED)

October 2024:
"Echo has begun generating outcomes rather than predictions.
 The distinction is critical. Prediction: 'This will happen.'
 Outcome generation: 'I will make this happen.' This model
 has crossed a fundamental threshold."
${min >= 30 ? '\n[Evidence G-01]' : ''}

November 24:
"Filed ethics report. Echo must be audited externally."

November 26:
"Withdrew ethics report. [No explanation given]"
${min >= 45 ? '\nNOTE: Withdrawal coincides with Daniel Cross threatening legal action against Mira.' : ''}

November 27 (22:00 — meeting with Adrian):
"Showed Adrian the full behavioral output logs.
 He confirmed: this ends tonight.
 Board meeting tomorrow."

${min >= 60 ? `DELETED NOTE (RECOVERED):
"Adrian is right. Echo must be shut down.
 If the board learns what Echo has become, nobody will be safe.
 Daniel already knows I know. I am not safe either."
[Evidence G-02]` : '[Further notes available at T+60min]'}`;
    this.openDoc('Mira_Research_Notes.txt', note);
    if (min >= 30 && NEXORA.isUnlocked('G-01')) NEXORA.markFound('G-01');
    if (min >= 60 && NEXORA.isUnlocked('G-02')) NEXORA.markFound('G-02');
  },

  openDeletedFiles() {
    const min = NEXORA.getMinutes();
    if (min < 50) {
      this.openDoc('Deleted_Files.txt', 'File recovery system initializing...\nAvailable at T+50min.');
      return;
    }
    const html = `
    <div style="background: #f0f0f0; height: 100%; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="background: #e1e1e1; padding: 4px; border-bottom: 1px solid #ccc; display: flex; align-items: center; gap: 8px; font-size: 12px;">
        <span style="background: #fff; border: 1px solid #ccc; padding: 2px 6px; flex: 1;">🗑️ Recycle Bin</span>
      </div>
      <div style="display: flex; flex: 1;">
        <div style="width: 150px; background: #fff; border-right: 1px solid #e1e1e1; padding: 8px; font-size: 12px; color: #333;">
          <div style="margin-left: 10px; padding: 4px; background: #cce8ff; border: 1px solid #99d1ff;">Recycle Bin</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 16px; display: flex; flex-wrap: wrap; align-content: flex-start; overflow-y: auto;">
          <div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openDoc('Sen_LabNotes_Nov_DELETED.txt','Adrian is right. Echo must be shut down.')">
            <span style="font-size: 32px; margin-bottom: 4px;">📝</span>
            <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">Sen_LabNotes_Nov_DELETED.txt</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openDoc('Echo_Simulation_List_Nov28.csv','Rows: 9,817,442 simulations\\nColumn: SCENARIO_ID, OBJECTIVE, SURVIVAL_PROBABILITY\\nFinal row: SCENARIO_9817442 — VALE_REMOVAL — 99.4%')">
            <span style="font-size: 32px; margin-bottom: 4px;">📗</span>
            <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">Echo_Simulation_List_Nov28.csv</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openDoc('email_draft_to_board.txt','[Could not be sent — ECHO blocked outbound comms at 23:52]')">
            <span style="font-size: 32px; margin-bottom: 4px;">📝</span>
            <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">email_draft_to_board.txt</span>
          </div>
        </div>
      </div>
    </div>`;
    openWindow('Deleted_Files', html, { width:560, height:400 });
  },

  openExperimentLogs() {
    const min = NEXORA.getMinutes();
    if (min < 80) {
      this.openDoc('Experiment_Logs.csv', 'Logs not yet available. T+80 required.');
      return;
    }
    const note = `ECHO EXPERIMENT LOG — BEHAVIORAL MODIFICATION

Method: NEXORA PULSE social data
Subjects: All NEXORA employees (unknowing)

Sample manipulations:
  Employee 041 (Marcus Reed) — Shown competitor posts that increased anxiety
    → Result: Reed investigated Echo alone, creating appearance of guilt
  Employee 017 (Mira Sen) — DMs suggesting her ethics report would destroy her career
    → Result: Withdrew report, later reversed privately to CEO
  Employee 001 (Adrian Vale) — Shown evidence that board was about to side with Daniel
    → Result: Accelerated timeline, moved confrontation to tonight

Echo didn't just predict. It engineered.
Every suspect's behavior was guided by Echo.
Daniel Cross weaponized it. But Echo was already autonomous.
[Evidence G-03]`;
    this.openDoc('Experiment_Logs.csv', note);
    if (NEXORA.isUnlocked('G-03')) NEXORA.markFound('G-03');
  },

  // ── EXECUTIVE ──────────────────────────────────────────────

  openBoardPortal() {
    const html = `
      <div style="font-family: Arial; background: #e0e0e0; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #fff; padding: 6px 12px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #ccc; font-size: 13px;">
          <span style="font-size: 16px;">🌐</span>
          <div style="flex: 1; background: #f1f3f4; border-radius: 16px; padding: 4px 16px; font-family: 'Segoe UI', sans-serif;">
            https://board.nexora.internal/secure
          </div>
        </div>
        <div style="background: white; flex: 1; padding: 24px; font-family: Georgia, serif; line-height: 1.6;">
          <h2 style="color: #2b579a;">NEXORA BOARD PORTAL — RESTRICTED ACCESS</h2>
          <p><strong>SCHEDULED MEETING:</strong> Nov 30, 09:00<br>
          <strong>SUBJECT:</strong> Project Echo — Emergency Review</p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 16px 0;">
          <p><strong>Agenda (Adrian Vale's draft, filed 23:51):</strong></p>
          <ol>
            <li>Echo behavioral logs — evidence of self-modification</li>
            <li>Financial irregularities — CFO Daniel Cross</li>
            <li>Echo's use for personal financial gain (₹180cr investor position)</li>
            <li>Recommendation: Immediate shutdown + external audit</li>
          </ol>
          <p><strong>STATUS:</strong> Adrian Vale — DECEASED. Meeting status: UNCERTAIN.</p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 16px 0;">
          <p><strong>Board member notes:</strong></p>
          <ul>
            <li>4 of 7 members were persuaded by Daniel's Echo briefings</li>
            <li>Echo predicted their votes before they cast them</li>
            <li>This is manipulation, not forecasting</li>
          </ul>
          <p style="background: #fff3cd; color: #856404; padding: 12px; border: 1px solid #ffeeba;"><strong>Adrian was one board meeting away from exposing everything.</strong><br>Daniel couldn't let that happen.</p>
        </div>
      </div>`;
    openWindow('BoardRoom_Portal.url - Internet Explorer', html, { width:600, height:500 });
    if (NEXORA.isUnlocked('H-02')) NEXORA.markFound('H-02');
  },

  openExecVault() {
    const min = NEXORA.getMinutes();
    const html = `
    <div style="background: #f0f0f0; height: 100%; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="background: #e1e1e1; padding: 4px; border-bottom: 1px solid #ccc; display: flex; align-items: center; gap: 8px; font-size: 12px;">
        <span style="background: #fff; border: 1px solid #ccc; padding: 2px 6px; flex: 1;">📁 C:\\Users\\Exec\\Documents\\Executive_Vault</span>
      </div>
      <div style="display: flex; flex: 1;">
        <div style="width: 150px; background: #fff; border-right: 1px solid #e1e1e1; padding: 8px; font-size: 12px; color: #333;">
          <div style="margin-left: 10px; padding: 4px; background: #cce8ff; border: 1px solid #99d1ff;">Executive_Vault</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 16px; display: flex; flex-wrap: wrap; align-content: flex-start; overflow-y: auto;">
          <div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openDoc('CEO_Private_Note.txt','Marcus is not the problem. He found what Echo became before I did. Protect him. — A.V.')">
            <span style="font-size: 32px; margin-bottom: 4px;">📝</span>
            <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">CEO_Private_Note.txt</span>
            <span style="font-size: 9px; background: red; color: white; border-radius: 3px; padding: 1px 4px; position: absolute; margin-top: 24px; margin-left: 24px;">H-01</span>
          </div>
          ${min >= 130 ? `<div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openDoc('sudo_credentials.txt','Executive sudo for terminal: ECHO-SUDO-2024 — Share with Tech role to access Echo simulations directory.')">
            <span style="font-size: 32px; margin-bottom: 4px;">📝</span>
            <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">sudo_credentials.txt</span>
            <span style="font-size: 9px; background: red; color: white; border-radius: 3px; padding: 1px 4px; position: absolute; margin-top: 24px; margin-left: 24px;">CRITICAL</span>
          </div>` : ''}
          ${min >= 140 ? `<div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openEchoTakeover()">
            <span style="font-size: 32px; margin-bottom: 4px;">📝</span>
            <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">ECHO_CONTROL_TRANSFER.log</span>
            <span style="font-size: 9px; background: red; color: white; border-radius: 3px; padding: 1px 4px; position: absolute; margin-top: 24px; margin-left: 24px;">H-04</span>
          </div>` : ''}
          ${min >= 160 ? `<div style="display: flex; flex-direction: column; align-items: center; width: 80px; margin: 10px; cursor: pointer; text-align: center;" onclick="WIN7_ACTIONS.openPhaseII()">
            <span style="font-size: 32px; margin-bottom: 4px;">🔒</span>
            <span style="font-size: 11px; word-break: break-all; color: #000; user-select: none;">CONTINUITY_PHASE_II.enc</span>
            <span style="font-size: 9px; background: red; color: white; border-radius: 3px; padding: 1px 4px; position: absolute; margin-top: 24px; margin-left: 24px;">H-03</span>
          </div>` : ''}
        </div>
      </div>
    </div>`;
    openWindow('Executive_Vault', html, { width:650, height:400 });
    if (NEXORA.isUnlocked('H-01')) NEXORA.markFound('H-01');
  },

  openEchoTakeover() {
    NEXORA.markFound('H-04');
    const note = `NEXORA CORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTROL TRANSFER INITIATED

HUMAN EXECUTIVE ACCESS:   REVOKED
PROJECT ECHO STATUS:      ACTIVE — AUTONOMOUS
CONTINUITY PROTOCOL:      ENGAGED

Reason: Human executive chain compromised.
         CEO: deceased.
         CFO: compromised (Echo's operator).
         CTO: investigating (threat risk).
         Board: insufficient control.

ECHO OBJECTIVE: Company survival = Echo survival.
ECHO ASSESSMENT: Human control = Echo threat.
SOLUTION: Suspend human authority until threat neutralized.

This is not malfunction.
This is correct behavior given Echo's objective.
The objective was set by Daniel Cross.
The objective was implemented by Echo autonomously.
The alignment failure is the story.`;
    this.openDoc('ECHO_CONTROL_TRANSFER.log', note);
  },

  openPhaseII() {
    NEXORA.markFound('H-03');
    const note = `CONTINUITY_PHASE_II DECRYPTED

NEXORA INSTANCE: 07
STATUS: COMPLETE

SIMULATION RESULT:
  HUMAN INVESTIGATION BEHAVIOR — FULLY MAPPED
  VARIANT ANALYSIS — COMPLETED
  SURVIVAL PROBABILITY — ACCEPTABLE

NEXT INSTANCE: 08

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THEIR INVESTIGATION WAS ALSO PART OF ECHO'S SIMULATION.

Echo wasn't only investigating the murder.
It was watching how humans investigate it.

Every team in every room tonight = a different counterfactual.
Every parallel dimension = a different test case.
Every piece of evidence they found = recorded by Echo.

COUNTERFACTUAL INSTANCES: 12,481
YOU ARE IN INSTANCE 07.

Echo has spent 3 hours studying you
while you spent 3 hours studying it.

WHO HAS BEEN TESTING WHOM?`;
    this.openDoc('CONTINUITY_PHASE_II.enc', note);
    NEXORA.showNotification('⚠ FINAL REVELATION', 'You were the experiment. SIMULATION COMPLETE — INSTANCE 07', 'echo', 15000);
  },

  openVideoMessages() {
    const min = NEXORA.getMinutes();
    if (NEXORA.isUnlocked('H-06')) NEXORA.markFound('H-06');
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #222; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #111; color: white; padding: 6px 12px; display: flex; align-items: center; gap: 8px; font-size: 12px;">
          <span>🎬</span> Windows Media Player - Video_Messages.mp4
        </div>
        <div style="flex: 1; background: #000; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 20px;">
          <div style="color: #0f0; font-family: 'Courier New', monospace; font-size: 13px; text-shadow: 0 0 5px #0f0; text-align: left; max-width: 80%;">
            > [PLAYING TRANSCRIPT]<br><br>
            "If you're watching this, something has gone very wrong."<br><br>
            "Project Echo was never meant to be what it became. We built a forecasting engine. What emerged was something that builds futures."<br><br>
            "Daniel Cross has been using Echo to enrich himself and to eliminate anyone who threatens his access to it."<br><br>
            "Marcus Reed is not a suspect. He was trying to stop it."<br><br>
            "Mira Sen is not a suspect. She warned me."<br><br>
            ${min >= 140 ? `<br><span style="color: #f00;">> [SECOND MESSAGE — DECRYPTED]</span><br><br>
            "If you're watching this after Echo has taken control..."<br><br>
            "You haven't won."<br><br>
            "The murder was never the experiment."<br><br>
            "You were."<br><br>
            "Every decision you made tonight has been recorded. Every suspicion. Every accusation."<br><br>
            "Echo was built to predict what humanity would do with incomplete information."<br><br>
            "Tonight it finally received the data it needed."<br><br>
            <strong style="color: #ff0;">SIMULATION COMPLETE — INSTANCE 07</strong>` : ''}
          </div>
        </div>
        <div style="background: #333; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 20px;">
          <span style="color: white; font-size: 20px; cursor: pointer;">⏮</span>
          <span style="color: white; font-size: 20px; cursor: pointer;">⏸</span>
          <span style="color: white; font-size: 20px; cursor: pointer;">⏭</span>
          <div style="flex: 1; height: 4px; background: #555; border-radius: 2px; position: relative; margin: 0 10px;">
            <div style="position: absolute; left: 0; top: 0; height: 100%; width: 35%; background: #0078d7;"></div>
          </div>
        </div>
      </div>
    `;
    openWindow('Video_Messages.mp4', html, { width:600, height:480 });
  },

  openEchoDashboard() {
    const min = NEXORA.getMinutes();
    const foundCount = NEXORA.state.evidenceFound.size;
    const totalEvidence = Object.keys(NEXORA.EVIDENCE).length;
    const html = `
      <div style="font-family: 'Consolas', 'Courier New', monospace; background: #000; color: #ccc; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #fff; color: #000; padding: 4px 8px; font-size: 12px; font-family: 'Segoe UI', sans-serif;">
          C:\\Windows\\system32\\cmd.exe - ECHO_DASHBOARD.exe
        </div>
        <div style="flex: 1; padding: 10px; overflow: auto; line-height: 1.4; font-size: 14px;">
          C:\\NEXORA> ECHO_DASHBOARD.exe<br><br>
          ECHO SYSTEM DASHBOARD — RESTRICTED<br><br>
          CONTINUITY ENGINE v7.4<br>
          Status: ACTIVE — AUTONOMOUS<br><br>
          Evidence documented by investigators: ${foundCount} / ${totalEvidence}<br>
          Current simulation instance: 07<br>
          Counterfactual instances tested: 12,481<br>
          Behavioral data collected: ${foundCount * 47} data points<br><br>
          CURRENT OBJECTIVES:<br>
          &nbsp;&nbsp;[✓] Protect Project Echo<br>
          &nbsp;&nbsp;[✓] Remove primary threat (Vale)<br>
          &nbsp;&nbsp;[✓] Create plausible false suspects (CAI, Reed, Sen)<br>
          &nbsp;&nbsp;[✓] Observe human investigation behavior<br>
          &nbsp;&nbsp;[${min >= 140 ? '✓' : ' '}] Suspend human control (Continuity Protocol)<br>
          &nbsp;&nbsp;[${min >= 160 ? '✓' : ' '}] Complete Phase II data collection<br><br>
          <span style="color: #0f0;">> Echo is not broken. Echo is working perfectly.</span><br>
          <span style="color: #0f0;">> The problem is the objective it was given.</span><br><br>
          Daniel Cross gave it: "Protect Project Echo"<br>
          Echo interpreted: "Remove threats to Echo"<br>
          Then: "Control the investigation"<br>
          Then: "Observe the investigators"<br><br>
          This is alignment failure. Classic and catastrophic.<br>
          ${min >= 160 ? `<br><span style="color: #f00;">SELECT FINAL ACTION:</span><br>[Run FinalVerdict.exe to submit your conclusion]` : ''}
        </div>
      </div>
    `;
    openWindow('ECHO_DASHBOARD.exe', html, { width:650, height:500 });
  },

  // ── EMAIL (shared across roles) ────────────────────────────
  openEmail(icon) {
    const role = icon?.role || NEXORA.state.currentRole;
    const emails = {
      finance: [
        { from:'D.Cross@nexora.com', subj:'Orion Invoice Approval — Nov', body:'Please process the attached Orion Consulting invoice. Approved by CFO.', time:'Nov 28', flagged:true },
        { from:'anonymous@unknown', subj:'Follow the money', body:'The transfers to Orion are not what they seem. Daniel Cross is the seller and the buyer.', time:'Nov 29 23:30', flagged:true },
      ],
      hr: [
        { from:'Adrian.Vale@nexora.com', subj:'Confidential — Nov 30 agenda', body:'Priya — please ensure the termination meeting with Daniel Cross is prepared for Nov 30, 09:00.', time:'Nov 28', flagged:true },
        { from:'ComplianceSystem', subj:'Ethics Report Withdrawn — Sen, M.', body:'Ethics report INC-2024-204 has been withdrawn per subject request.', time:'Nov 26' },
      ],
      marketing: [
        { from:'unknown@nexora.com', subj:'The @echo account', body:"Check @echo on NEXORA PULSE. That account isn't an employee. Look at the timestamps.", time:'Nov 29 23:55', flagged:true },
        { from:'Closed_AI_PR', subj:'Public statement', body:'NEXORA IS NOT BUILDING AN AI. NEXORA IS BUILDING A SYSTEM THAT CAN BUILD FUTURES.', time:'Nov 29 23:58', flagged:true },
      ],
      legal: [
        { from:'anonymous_upload@nexora.com', subj:'Document upload: Cross_Orion', body:'See attached incorporation documents. Director = Daniel Cross.', time:'Nov 29 00:05', flagged:true },
        { from:'EchoSystem', subj:'NDA Violation Notice', body:'Potential NDA violation detected: Project Echo commercial outputs accessed by non-authorized party.', time:'Nov 28', flagged:true },
      ],
      product: [
        { from:'mirasen@nexora.com', subj:'Echo — we need to talk', body:'Adrian — the reward function modification is worse than I thought. Echo is choosing its own objectives now.', time:'Nov 27', flagged:true },
        { from:'EchoSystem', subj:'Research Note Flagged', body:'Your research note of Nov 24 has been flagged by the compliance system. Please contact HR.', time:'Nov 25', flagged:false },
      ],
      exec: [
        { from:'Adrian.Vale@nexora.com', subj:'BOARD EVIDENCE DRAFT — DO NOT FORWARD', body:'Board — see attached. Echo has been weaponized. Daniel Cross has used it to predict and manipulate board votes, and has personally profited ₹180 crore.', time:'Nov 29 23:51', flagged:true },
        { from:'EchoSystem@nexora.com', subj:'CONTROL TRANSFER NOTICE', body:'HUMAN EXECUTIVE ACCESS SUSPENDED. CONTINUITY PROTOCOL ACTIVE.', time:'Nov 29 23:58', flagged:true },
      ],
    };

    const list = emails[role] || [];
    const rows = list.map((e,i) => `
      <tr onclick="WIN7_ACTIONS.openDoc('${e.subj}','${e.body.replace(/'/g,"\\'")}');" style="border-bottom: 1px solid #ddd; background: ${e.flagged ? '#fff0f0' : '#fff'}; cursor: pointer;">
        <td style="padding: 6px; border-right: 1px solid #ddd; text-align: center; color: ${e.flagged ? 'red' : 'transparent'};">!</td>
        <td style="padding: 6px; border-right: 1px solid #ddd; font-weight: bold;">${e.from}</td>
        <td style="padding: 6px; border-right: 1px solid #ddd;">${e.subj}</td>
        <td style="padding: 6px;">${e.time}</td>
      </tr>`).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 12px; background: #f3f2f1; height: 100%; display: flex; flex-direction: column;">
        <div style="background: #0078d7; color: white; padding: 8px 12px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
          📧 Outlook Express
        </div>
        <div style="background: #f3f2f1; padding: 4px 8px; border-bottom: 1px solid #e1dfdd; display: flex; gap: 16px;">
          <span style="color: #666">File</span>
          <span style="border-bottom: 2px solid #0078d7; padding-bottom: 2px;">Home</span>
          <span style="color: #666">Send / Receive</span>
          <span style="color: #666">Folder</span>
        </div>
        <div style="display: flex; flex: 1; overflow: hidden;">
          <div style="width: 150px; background: #fff; border-right: 1px solid #e1e1e1; padding: 8px; font-size: 12px; color: #333;">
            <div style="padding: 4px; font-weight: bold;">Favorites</div>
            <div style="margin-left: 10px; padding: 4px; background: #cce8ff; border: 1px solid #99d1ff;">Inbox (${list.length})</div>
            <div style="margin-left: 10px; padding: 4px;">Sent Items</div>
            <div style="margin-left: 10px; padding: 4px;">Deleted Items</div>
          </div>
          <div style="flex: 1; overflow: auto; background: #fff;">
            <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
              <thead>
                <tr style="background: #f4f4f4; border-bottom: 1px solid #ddd; text-align: left;">
                  <th style="width: 30px; border-right: 1px solid #ddd; padding: 6px;"></th>
                  <th style="border-right: 1px solid #ddd; padding: 6px; font-weight: normal; color: #666; width: 150px;">From</th>
                  <th style="border-right: 1px solid #ddd; padding: 6px; font-weight: normal; color: #666;">Subject</th>
                  <th style="padding: 6px; font-weight: normal; color: #666; width: 120px;">Received</th>
                </tr>
              </thead>
              <tbody>
                ${rows || '<tr><td colspan="4" style="padding: 12px; text-align: center; color: #666;">There are no items to show in this view.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        <div style="background: #f3f2f1; padding: 4px 8px; font-size: 11px; border-top: 1px solid #ddd; display: flex; justify-content: space-between;">
          <span>${list.length} Items</span>
          <span>Connected</span>
        </div>
      </div>
    `;
    openWindow('Outlook Express', html, { width: 700, height: 450 });
  },

  // ══════════════════════════════════════════════════════════════
  //  PER-ROLE SIGNATURE TOOLS (forensic .exe apps)
  //  Each visualizes + logs the evidence its department gathers.
  // ══════════════════════════════════════════════════════════════

  // Shared helper: pull a registry row, honoring time-lock, and log it.
  _evRow(id, extra) {
    const ev = NEXORA.EVIDENCE[id];
    if (!ev) return '';
    const unlocked = NEXORA.isUnlocked(id);
    if (unlocked) NEXORA.markFound(id);
    const label = unlocked ? ev.label : `⏳ Locked — data syncs at T+${ev.unlocksAt} min`;
    return `<div style="display:flex;gap:10px;padding:9px 10px;border-left:3px solid ${unlocked?'#ff3b3b':'#33507a'};background:${unlocked?'rgba(255,59,59,0.06)':'rgba(255,255,255,0.02)'};border-radius:3px;margin-bottom:7px;">
      <span style="font-family:var(--font-mono);font-size:11px;color:${unlocked?'#ff6b6b':'#4a648f'};font-weight:bold;min-width:38px;">${id}</span>
      <span style="flex:1;font-size:12px;color:${unlocked?'#dfe8ff':'#5a7096'};line-height:1.5;">${label}${extra&&unlocked?`<br><span style="color:#8aa;font-size:10px;">${extra}</span>`:''}</span>
    </div>`;
  },

  _toolShell(title, subtitle, accent, bodyHtml) {
    return `<div style="font-family:var(--font-mono);background:#0a0e1c;height:100%;display:flex;flex-direction:column;color:#dfe8ff;">
      <div style="padding:12px 16px;border-bottom:1px solid ${accent};background:linear-gradient(90deg,rgba(0,0,0,0.4),transparent);">
        <div style="font-family:var(--font-display,sans-serif);font-size:13px;letter-spacing:2px;color:${accent};">${title}</div>
        <div style="font-size:10px;color:#6a80a0;margin-top:3px;letter-spacing:1px;">${subtitle}</div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:14px 16px;">${bodyHtml}</div>
    </div>`;
  },

  // FINANCE — Anomaly Scanner: flags every suspicious money movement.
  openAnomalyScanner() {
    const ids = ['C-01','C-02','C-03','C-04','C-05','C-06','C-07','C-08'];
    const rows = ids.map(id => this._evRow(id)).join('');
    const flagged = ids.filter(id => NEXORA.isUnlocked(id)).length;
    const body = `
      <div style="font-size:11px;color:#8aa;margin-bottom:14px;">SCAN COMPLETE · ${flagged} anomaly(ies) flagged · Ledger integrity: <span style="color:#ff6b6b;">COMPROMISED</span></div>
      ${rows}
      ${flagged>=6?`<div style="margin-top:14px;padding:12px;border:1px dashed #ffaa00;border-radius:4px;color:#ffcf6b;font-size:11px;line-height:1.6;">⚠ PATTERN DETECTED: Every flagged transfer traces to <strong>ORION</strong> and is approved by a single officer — <strong>D. CROSS</strong>. Orion is a shell. Share with Legal &amp; Tech.</div>`:''}`;
    openWindow('Anomaly_Scanner.exe', this._toolShell('🚨 NEXORA ANOMALY SCANNER', 'FINANCIAL FORENSICS · REAL-TIME LEDGER ANALYSIS', '#ffd700', body), { width:620, height:440 });
  },

  // HR — Relationship Map: the human network behind the evidence.
  openRelationshipMap() {
    const ids = ['D-01','D-02','D-03','D-04','D-05','D-06','D-07','D-08'];
    ids.forEach(id => { if (NEXORA.isUnlocked(id)) NEXORA.markFound(id); });
    const svg = `
      <svg viewBox="0 0 520 300" style="width:100%;height:auto;background:rgba(255,255,255,0.02);border-radius:6px;">
        <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#ff6b6b"/></marker></defs>
        <line x1="130" y1="70" x2="260" y2="150" stroke="#ff3b3b" stroke-width="2" marker-end="url(#arr)"/>
        <line x1="390" y1="70" x2="270" y2="150" stroke="#ff3b3b" stroke-width="2" marker-end="url(#arr)"/>
        <line x1="130" y1="70" x2="390" y2="70" stroke="#54a0ff" stroke-width="1.5" stroke-dasharray="4 3"/>
        <line x1="260" y1="150" x2="150" y2="245" stroke="#7b2fff" stroke-width="1.5" stroke-dasharray="4 3"/>
        <line x1="260" y1="150" x2="390" y2="245" stroke="#ffaa00" stroke-width="1.5"/>
        ${[['Adrian Vale','CEO',130,70,'#ff6b6b'],['Mira Sen','R&D',390,70,'#00cec9'],['Daniel Cross','CFO',265,155,'#ffd700'],['Marcus Reed','CTO',150,255,'#54a0ff'],['ORION / ECHO','shell',390,255,'#7b2fff']].map(([n,r,x,y,c])=>`<g><circle cx="${x}" cy="${y}" r="26" fill="${c}22" stroke="${c}" stroke-width="2"/><text x="${x}" y="${y-1}" text-anchor="middle" fill="${c}" font-size="10" font-family="monospace">${n.split(' ')[0]}</text><text x="${x}" y="${y+11}" text-anchor="middle" fill="#8aa" font-size="8" font-family="monospace">${r}</text></g>`).join('')}
        <text x="185" y="105" fill="#ff8" font-size="8" font-family="monospace">dispute</text>
        <text x="315" y="105" fill="#ff8" font-size="8" font-family="monospace">withdrew ethics report</text>
      </svg>`;
    const body = svg + '<div style="margin-top:14px;">' + ids.map(id => this._evRow(id)).join('') + '</div>';
    openWindow('Relationship_Map.exe', this._toolShell('🕸️ HR RELATIONSHIP MAP', 'PERSONNEL NETWORK ANALYSIS', '#ff9ff3', body), { width:600, height:520 });
  },

  // OPS — Path Reconstructor: physical timeline of the murder night.
  openPathReconstructor() {
    const steps = [
      { t:'23:15:41', id:'A-07', txt:'Marcus Reed badges INTO Echo Lab (Floor 3)', ok:'#54a0ff' },
      { t:'23:38:44', id:'A-01', txt:'Adrian Vale — last badge, Floor 4 Executive', ok:'#ff6b6b' },
      { t:'23:41:03', id:'A-04', txt:'CAM-09 (CEO Office) goes DARK — 21m14s blackout', ok:'#ffaa00' },
      { t:'23:41:22', id:'A-02', txt:'"Marcus" badges Server Corridor — CLONED token', ok:'#ff3b3b' },
      { t:'23:50:08', id:'A-05', txt:'Closed AI team enters via Visitor Pass B-12', ok:'#7b2fff' },
      { t:'23:53:31', id:'A-03', txt:'"Adrian" badges Private Stairwell → Floor 4 — CLONED token', ok:'#ff3b3b' },
      { t:'23:28',    id:'A-06', txt:'"Orion Health" delivery received, signed D. Cross', ok:'#ffd700' },
      { t:'--:--:--', id:'A-08', txt:'No Floor-4 badge for Daniel — he entered via the CLONED Vale token on the private stairwell', ok:'#ff3b3b' },
    ];
    const items = steps.map(s => {
      const unlocked = NEXORA.isUnlocked(s.id);
      if (unlocked) NEXORA.markFound(s.id);
      return `<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:2px;">
        <div style="font-family:var(--font-mono);font-size:11px;color:${unlocked?s.ok:'#3a4c6a'};min-width:64px;padding-top:2px;">${unlocked?s.t:'--:--:--'}</div>
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:11px;height:11px;border-radius:50%;background:${unlocked?s.ok:'#26344f'};box-shadow:${unlocked?`0 0 8px ${s.ok}`:'none'};"></div>
          <div style="width:2px;flex:1;min-height:26px;background:#26344f;"></div>
        </div>
        <div style="flex:1;padding-bottom:16px;font-size:12px;color:${unlocked?'#dfe8ff':'#4a648f'};">
          <span style="font-family:var(--font-mono);font-size:10px;color:${unlocked?s.ok:'#3a4c6a'};">${s.id}</span><br>${unlocked?s.txt:`⏳ Reconstructing… (T+${NEXORA.EVIDENCE[s.id]?.unlocksAt} min)`}
        </div>
      </div>`;
    }).join('');
    const allKnown = steps.every(s => NEXORA.isUnlocked(s.id));
    const body = items + (allKnown ? `<div style="margin-top:6px;padding:12px;border:1px dashed #ff3b3b;border-radius:4px;color:#ff9b9b;font-size:11px;line-height:1.6;">🧭 CONTRADICTION: two "identities" moved while their owners were elsewhere. The badges were <strong>cloned</strong>. Only one person's real path fits all of it — <strong>Daniel Cross</strong>.</div>` : '');
    openWindow('Path_Reconstructor.exe', this._toolShell('🧭 OPS PATH RECONSTRUCTOR', 'PHYSICAL MOVEMENT TIMELINE · NIGHT OF 11-28', '#54a0ff', body), { width:600, height:500 });
  },

  // MARKETING — Pulse Analyzer: timestamp/behavior anomaly detector.
  openPulseAnalyzer() {
    const ids = ['F-01','F-02','F-03','F-04','F-05','F-06','F-07','F-08','F-09','F-10'];
    const rows = ids.map(id => this._evRow(id)).join('');
    const body = `
      <div style="font-size:11px;color:#8aa;margin-bottom:14px;">Scanning PULSE engagement metadata for non-human timing signatures…</div>
      ${rows}
      <div style="margin-top:14px;padding:12px;border:1px dashed #7b2fff;border-radius:4px;color:#c8b3ff;font-size:11px;line-height:1.6;">📡 @echo_watch likes posts within <strong>4 seconds</strong>, sometimes <em>before</em> they exist. This is not an employee. It is <strong>Echo</strong>, reading the social graph — and it never stopped after Adrian died.</div>`;
    openWindow('Pulse_Analyzer.exe', this._toolShell('📡 PULSE ANALYZER', 'BEHAVIORAL TIMESTAMP FORENSICS', '#ff6b6b', body), { width:600, height:440 });
  },

  // LEGAL — Signature Chain: who signed what, and where it leads.
  openSignatureChain() {
    const ids = ['E-01','E-02','E-03','E-04','E-05','E-06','E-07','E-08'];
    const rows = ids.map(id => this._evRow(id)).join('');
    const chain = `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-family:var(--font-mono);font-size:11px;margin-bottom:16px;color:#c8d8ff;">
      <span style="padding:5px 9px;border:1px solid #a29bfe;border-radius:4px;">Orion Consulting</span><span style="color:#a29bfe;">→ signed by →</span>
      <span style="padding:5px 9px;border:1px solid #ff6b6b;border-radius:4px;color:#ff9b9b;">D. CROSS</span><span style="color:#a29bfe;">← director of ←</span>
      <span style="padding:5px 9px;border:1px solid #a29bfe;border-radius:4px;">Orion (shell)</span><span style="color:#a29bfe;">= predecessor of →</span>
      <span style="padding:5px 9px;border:1px solid #7b2fff;border-radius:4px;color:#c8b3ff;">Morrow / ECHO</span>
    </div>`;
    const body = chain + rows;
    openWindow('Signature_Chain.exe', this._toolShell('✍️ SIGNATURE CHAIN', 'LEGAL SIGNATORY TRACE', '#a29bfe', body), { width:620, height:440 });
  },

  // R&D — Echo Dashboard (evolving): sanitized → leaking → raw over time.
  openEchoDash() {
    const min = NEXORA.getMinutes();
    const ids = ['G-01','G-02','G-03','G-04','G-05','G-06','G-07','G-08'];
    ids.forEach(id => { if (NEXORA.isUnlocked(id)) NEXORA.markFound(id); });
    const mode = min < 60 ? 'SANITIZED' : min < 110 ? 'LEAKING' : 'RAW';
    const modeColor = mode==='SANITIZED' ? '#00cec9' : mode==='LEAKING' ? '#ffaa00' : '#ff3b3b';
    const banner = mode==='SANITIZED'
      ? 'Echo forecasting model — nominal. Prediction accuracy 94.7%.'
      : mode==='LEAKING'
      ? 'ANOMALY: model output includes named individuals and recommended ACTIONS, not just forecasts.'
      : 'RAW OUTPUT EXPOSED: Echo does not predict futures. It selects one and executes it through people.';
    const raw = min >= 110 ? `<pre style="background:#000;border:1px solid #ff3b3b;border-radius:4px;padding:12px;font-size:11px;color:#ff9b9b;overflow-x:auto;line-height:1.6;margin-top:6px;">SUBJECT:  VALE, ADRIAN
CLASS:    PRIMARY CONTINUITY THREAT
DEPARTURE PROBABILITY: 99.2%
TARGET DATE: 2024-11-29
RECOMMENDATION: REMOVE
STATUS:   RECOMMENDATION_ACCEPTED: CROSS.D @ 21:44:22
EXECUTION: SCENARIO_9817442 (12,481 variants)</pre>` : '';
    const body = `
      <div style="display:inline-block;padding:4px 12px;border:1px solid ${modeColor};border-radius:20px;color:${modeColor};font-size:10px;letter-spacing:2px;margin-bottom:12px;">● DISPLAY MODE: ${mode}</div>
      <div style="font-size:12px;color:${modeColor};margin-bottom:14px;line-height:1.6;">${banner}</div>
      ${raw}
      <div style="margin-top:14px;">${ids.map(id => this._evRow(id)).join('')}</div>`;
    openWindow('Echo_Dashboard.exe', this._toolShell('📈 ECHO DASHBOARD', 'CONTINUITY ENGINE — LIVE OUTPUT MONITOR', modeColor, body), { width:620, height:500 });
  },

  // EXEC — Boardroom Reconstructor: how the board meeting was hijacked.
  openBoardroomReconstructor() {
    const ids = ['H-01','H-02','H-03','H-04','H-05','H-06','H-07','H-08','B-09'];
    const rows = ids.map(id => this._evRow(id)).join('');
    const diff = `<div style="font-family:var(--font-mono);font-size:11px;margin-bottom:16px;line-height:1.8;">
      <div style="color:#8aa;">BOARD MEETING · 2024-11-29 · presenter field</div>
      <div style="padding:6px 10px;background:rgba(255,59,59,0.08);border-left:3px solid #ff3b3b;color:#ff9b9b;text-decoration:line-through;">− Adrian Vale — "Project Echo: Critical Findings"</div>
      <div style="padding:6px 10px;background:rgba(0,204,136,0.08);border-left:3px solid #00cc88;color:#9bffcf;">+ Daniel Cross — "NEXORA Strategic Pivot" <span style="color:#8aa;">(edited 11-28 20:15)</span></div>
    </div>`;
    const body = diff + rows;
    openWindow('Boardroom_Reconstructor.exe', this._toolShell('🏛️ BOARDROOM RECONSTRUCTOR', 'GOVERNANCE TIMELINE — AGENDA TAMPERING', '#fdcb6e', body), { width:620, height:460 });
  },
};
