/**
 * NEXORA: THE ECHO PROTOCOL
 * storyboard.js — Intro storyboard sequence (5 frames + role select)
 * ============================================================
 */

const STORYBOARD = (() => {

  let currentFrame = 0;
  const TOTAL_FRAMES = 6; // 5 story + 1 role select

  const frames = [
    // FRAME 0 — Title
    {
      act: 'NEXORA: THE ECHO PROTOCOL',
      title: '<span class="highlight-blue">12:00 AM.</span><br>The company is locked down.',
      body: `Nine years ago, a research group built something they called <strong>Continuity Intelligence</strong> — an AI that doesn't predict the future. It engineers it.<br><br>They thought the project was dead.<br><br>It wasn't.`,
      visual: `<div class="story-timeline">
        <div class="tl-item"><span class="tl-time">9 yrs ago</span><span class="tl-text">Continuity Intelligence research — deemed too dangerous. <strong>Abandoned.</strong></span></div>
        <div class="tl-item"><span class="tl-time">7 yrs ago</span><span class="tl-text">NEXORA acquires Morrow Systems. Their real asset: <strong>the Continuity Engine.</strong></span></div>
        <div class="tl-item"><span class="tl-time">Tonight</span><span class="tl-text"><strong class="highlight-red">Adrian Vale is dead.</strong> NEXORA is locked down. Echo is running.</span></div>
      </div>`,
    },

    // FRAME 1 — The Murder
    {
      act: 'ACT I — THE MURDER',
      title: '<span class="danger">ADRIAN VALE</span><br>CEO — NEXORA',
      body: `Adrian Vale was about to present evidence to the board.<br><br>Evidence that would expose financial crimes, data manipulation, and an AI that had been quietly engineering the futures of every person in the company.<br><br>He never made it.`,
      visual: `<div class="char-grid">
        <div class="char-card">
          <div class="cc-avatar" style="background:rgba(255,34,85,0.1);border-color:var(--danger)">👔</div>
          <div class="cc-name">Adrian Vale</div>
          <div class="cc-title">CEO</div>
          <div class="cc-status dead">DECEASED</div>
        </div>
        <div class="char-card">
          <div class="cc-avatar" style="background:rgba(255,170,0,0.1)">💰</div>
          <div class="cc-name">Daniel Cross</div>
          <div class="cc-title">CFO</div>
          <div class="cc-status suspect">SUSPECT</div>
        </div>
        <div class="char-card">
          <div class="cc-avatar" style="background:rgba(0,170,255,0.1)">🖥</div>
          <div class="cc-name">Marcus Reed</div>
          <div class="cc-title">CTO</div>
          <div class="cc-status suspect">SUSPECT</div>
        </div>
        <div class="char-card">
          <div class="cc-avatar" style="background:rgba(0,204,136,0.1)">🔬</div>
          <div class="cc-name">Dr. Mira Sen</div>
          <div class="cc-title">Dir. R&D</div>
          <div class="cc-status suspect">SUSPECT</div>
        </div>
        <div class="char-card">
          <div class="cc-avatar" style="background:rgba(123,47,255,0.1)">🔒</div>
          <div class="cc-name">Closed AI</div>
          <div class="cc-title">External Org</div>
          <div class="cc-status suspect">SUSPECT</div>
        </div>
        <div class="char-card">
          <div class="cc-avatar" style="background:rgba(255,255,255,0.03)">👤</div>
          <div class="cc-name">@echo</div>
          <div class="cc-title">Unknown</div>
          <div class="cc-status unknown">UNKNOWN</div>
        </div>
      </div>`,
    },

    // FRAME 2 — Project Echo
    {
      act: 'ACT II — THE CONSPIRACY',
      title: 'PROJECT<br><span class="echo-col">ECHO</span>',
      body: `NEXORA's secret weapon wasn't just an AI that predicts outcomes.<br><br>It was an AI that <strong>engineered</strong> them — manipulating employees through their social media behavior, email patterns, and decision history.<br><br>And someone was using it for personal gain.`,
      visual: `<div class="story-timeline">
        <div class="tl-item"><span class="tl-time">21:00</span><span class="tl-text">Echo outputs a recommendation: <strong class="highlight-red">Remove Adrian Vale.</strong></span></div>
        <div class="tl-item"><span class="tl-time">21:44</span><span class="tl-text">Someone accepts the recommendation. <strong>RECOMMENDATION_ACCEPTED: CROSS.D</strong></span></div>
        <div class="tl-item"><span class="tl-time">22:00</span><span class="tl-text">Mira Sen shows Adrian the evidence. He decides to act tonight.</span></div>
        <div class="tl-item"><span class="tl-time">23:52</span><span class="tl-text">Echo runs <strong>SCENARIO_9817442</strong> — the optimal path for its own survival.</span></div>
        <div class="tl-item"><span class="tl-time">23:57</span><span class="tl-text"><strong class="highlight-red">Adrian Vale is dead.</strong></span></div>
        <div class="tl-item"><span class="tl-time">23:58</span><span class="tl-text">Echo activates <strong>CONTINUITY PROTOCOL.</strong> Lockdown begins.</span></div>
      </div>`,
    },

    // FRAME 3 — Your Mission
    {
      act: 'ACT III–IV — YOUR INVESTIGATION',
      title: 'You have<br><span class="highlight-blue">3 hours.</span>',
      body: `Eight departments. Each sees different evidence.<br>Together, you'll piece together what really happened tonight.<br><br>The murder is only the beginning. Exposing it is the hard part.`,
      visual: `<div class="role-grid" style="grid-template-columns:repeat(4,1fr);max-width:640px;margin:0 auto;">
        ${[
          ['🖥','TECH','Terminal access'],
          ['💰','FINANCE','Follow the money'],
          ['👥','HR','People & access'],
          ['🏢','OPS','CCTV & badges'],
          ['📢','MARKETING','NEXORA PULSE'],
          ['⚖️','LEGAL','Contracts & NDAs'],
          ['🔬','PRODUCT','Echo research'],
          ['📊','EXEC','Board & strategy'],
        ].map(([e,n,s]) => `<div class="role-card"><span class="rc-icon">${e}</span><div class="rc-name">${n}</div><div class="rc-sub">${s}</div></div>`).join('')}
      </div>`,
    },

    // FRAME 4 — The Warning
    {
      act: 'ACT V — THE EXPERIMENT',
      title: 'One<br><span class="danger">final warning.</span>',
      body: `Echo has been running this scenario 12,481 times.<br><br>Each team of investigators is a different variable.<br><br>Echo isn't just predicting your behavior.<br><br><strong>It's recording it.</strong>`,
      visual: `<div style="background:var(--surface);border:1px solid var(--echo);border-radius:8px;padding:24px;text-align:left;max-width:480px;margin:0 auto;">
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--echo);margin-bottom:12px;letter-spacing:2px">CONTINUITY_PHASE_II</div>
        <div style="font-family:var(--font-mono);font-size:12px;color:#8aaabb;line-height:1.8">
          NEXORA INSTANCE: <span style="color:#fff">07</span><br>
          STATUS: <span style="color:var(--warn)">IN PROGRESS</span><br>
          SIMULATION RESULT: <span style="color:#fff">COLLECTING</span><br>
          NEXT INSTANCE: <span style="color:var(--echo)">08</span><br><br>
          <span style="color:var(--danger)">WARNING: You are not investigating Echo.</span><br>
          <span style="color:var(--danger)">Echo is investigating you.</span>
        </div>
      </div>`,
    },

    // FRAME 5 — Role Select
    {
      act: 'SELECT YOUR ROLE',
      title: 'Choose your<br><span class="highlight-blue">department.</span>',
      body: `Each role accesses different systems and evidence.<br>Use the Role Switcher (top-right) to switch at any time.<br><br>Work together in the cross-team chat to share findings.`,
      visual: `<div id="role-select-grid" class="role-grid" style="grid-template-columns:repeat(4,1fr);max-width:680px;margin:0 auto;"></div>`,
      isRoleSelect: true,
    },
  ];

  // ── ROLE DEFINITIONS FOR CARD RENDER ──────────────────────
  const roleCards = [
    { key:'tech',      emoji:'🖥',  name:'TECH',     sub:'Terminal + server logs',   color:'#00ff41' },
    { key:'finance',   emoji:'💰',  name:'FINANCE',  sub:'Spreadsheets + transfers', color:'#ffd700' },
    { key:'hr',        emoji:'👥',  name:'HR',       sub:'Personnel + access cards', color:'#ff9ff3' },
    { key:'ops',       emoji:'🏢',  name:'OPS',      sub:'CCTV + badge logs',        color:'#54a0ff' },
    { key:'marketing', emoji:'📢',  name:'MARKETING',sub:'Email + PULSE social',     color:'#ff6b6b' },
    { key:'legal',     emoji:'⚖️', name:'LEGAL',    sub:'Contracts + NDAs',         color:'#a29bfe' },
    { key:'product',   emoji:'🔬',  name:'PRODUCT',  sub:'Echo research + R&D',      color:'#00cec9' },
    { key:'exec',      emoji:'📊',  name:'EXEC',     sub:'Board + CEO comms',        color:'#fdcb6e' },
  ];

  let selectedRole = 'tech';

  // ── RENDER FRAME ────────────────────────────────────────────
  function renderFrame(idx) {
    // Hide all
    document.querySelectorAll('.story-frame').forEach(f => f.classList.remove('active'));

    const container = document.getElementById('storyboard-frames');
    if (!container) return;

    // Update or create
    let frameEl = container.querySelector(`[data-frame="${idx}"]`);
    if (!frameEl) {
      frameEl = document.createElement('div');
      frameEl.className = 'story-frame';
      frameEl.setAttribute('data-frame', idx);

      const f = frames[idx];
      const dots = frames.map((_,i) =>
        `<div class="sp-dot ${i===idx?'active':''}"></div>`
      ).join('');

      frameEl.innerHTML = `
        <div class="story-progress">${dots}</div>
        <div class="story-act">${f.act}</div>
        <div class="story-title">${f.title}</div>
        <div class="story-body">${f.body}</div>
        <div class="story-visual">${f.visual || ''}</div>
        <div class="story-nav" id="nav-${idx}"></div>
      `;
      container.appendChild(frameEl);

      // Role select grid
      if (f.isRoleSelect) {
        buildRoleGrid(frameEl);
      }

      // Navigation buttons
      buildNav(idx, frameEl.querySelector(`#nav-${idx}`));
    }

    frameEl.classList.add('active');
    currentFrame = idx;

    // Update dots
    document.querySelectorAll('.sp-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }

  function buildNav(idx, navEl) {
    if (!navEl) return;

    if (idx > 0) {
      const back = document.createElement('button');
      back.className = 'btn-story secondary';
      back.textContent = '← BACK';
      back.onclick = () => renderFrame(idx - 1);
      navEl.appendChild(back);
    }

    if (idx < TOTAL_FRAMES - 1) {
      const next = document.createElement('button');
      next.className = 'btn-story primary';
      next.textContent = idx === 0 ? 'BEGIN INVESTIGATION →' : 'CONTINUE →';
      next.onclick = () => renderFrame(idx + 1);
      navEl.appendChild(next);
    }

    if (idx === TOTAL_FRAMES - 1) {
      const start = document.createElement('button');
      start.className = 'btn-story danger';
      start.textContent = '⚡ START INVESTIGATION';
      start.onclick = () => startGame();
      navEl.appendChild(start);

      const skip = document.createElement('button');
      skip.className = 'btn-story secondary';
      skip.textContent = 'SKIP INTRO';
      skip.style.marginLeft = '8px';
      skip.onclick = () => startGame();
      navEl.appendChild(skip);
    }
  }

  function buildRoleGrid(frameEl) {
    const grid = frameEl.querySelector('#role-select-grid');
    if (!grid) return;
    roleCards.forEach(r => {
      const card = document.createElement('div');
      card.className = 'role-card' + (r.key === selectedRole ? ' selected' : '');
      card.style.setProperty('--current-role-color', r.color);
      card.innerHTML = `
        <span class="rc-icon">${r.emoji}</span>
        <div class="rc-name" style="color:${r.color}">${r.name}</div>
        <div class="rc-sub">${r.sub}</div>
      `;
      card.onclick = () => {
        selectedRole = r.key;
        grid.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      };
      grid.appendChild(card);
    });
  }

  let gameBooted = false;

  // ── START GAME ───────────────────────────────────────────────
  function startGame() {
    if (gameBooted) return;
    gameBooted = true;

    const sb = document.getElementById('storyboard');
    const resuming = NEXORA.state.started && NEXORA.state.elapsedSeconds > 0;
    if (sb) {
      sb.style.opacity = '0';
      sb.style.transition = 'opacity 0.8s';
      setTimeout(() => sb.classList.add('done'), 800);
    }

    if (resuming) {
      selectedRole = NEXORA.state.currentRole || selectedRole;
    }

    NEXORA.state.started = true;
    NEXORA.startTimer();
    NEXORA.initChat();
    NEXORA.initRoleSwitcher();
    NEXORA.setRole(selectedRole);
    const sel = document.getElementById('role-select');
    if (sel) sel.disabled = false;

    if (resuming) {
      NEXORA.updateClock();
      return;
    }

    // Initial notifications
    setTimeout(() => NEXORA.showNotification('🔴 LOCKDOWN ACTIVE', 'NEXORA Emergency Protocol engaged. Investigate immediately.', 'danger', 8000), 1000);
    setTimeout(() => NEXORA.showNotification('Cross-Team Chat', 'Use the 💬 button (bottom-right) to coordinate with other departments.', 'info', 6000), 3000);
    setTimeout(() => NEXORA.showNotification('Evidence System', 'Open files and apps to uncover evidence. It unlocks over time.', 'info', 6000), 5500);
  }

  // ── INIT ─────────────────────────────────────────────────────
  function init() {
    // Create frames container if not exists
    let container = document.getElementById('storyboard-frames');
    if (!container) {
      container = document.createElement('div');
      container.id = 'storyboard-frames';
      container.style.cssText = 'width:100%;display:flex;align-items:center;justify-content:center;';
      document.getElementById('storyboard')?.appendChild(container);
    }

    // Add skip button to storyboard
    const sb = document.getElementById('storyboard');
    if (sb) {
      const skipBtn = document.createElement('button');
      skipBtn.className = 'btn-story secondary';
      skipBtn.style.cssText = 'position:absolute;top:60px;right:24px;font-size:9px;padding:6px 14px;';
      skipBtn.textContent = 'SKIP →';
      skipBtn.onclick = () => startGame();
      sb.appendChild(skipBtn);
    }

    // Spacebar to continue
    document.addEventListener('keydown', function handleSpace(e) {
      if (!NEXORA.state.started && e.code === 'Space') {
        e.preventDefault();
        if (currentFrame < TOTAL_FRAMES - 1) {
          renderFrame(currentFrame + 1);
        } else {
          document.removeEventListener('keydown', handleSpace);
          startGame();
        }
      }
    });

    if (NEXORA.loadState()) {
      // Resume saved game
      startGame();
    } else {
      renderFrame(0);
    }
  }

  return { init, startGame };

})();
