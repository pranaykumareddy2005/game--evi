/**
 * NEXORA: THE ECHO PROTOCOL
 * verdict.js — Canonical 6-question scored verdict + endgame
 * ============================================================
 * Q1–Q5 are scored (20 pts each = 100). Q6 selects the ending
 * (value question, no points). Scoring tiers:
 *   80–100  GREEN  — DIMENSION STABLE
 *   50–79   YELLOW — PARTIAL SURVIVAL
 *    0–49   RED    — DIMENSION COLLAPSE
 */

const VERDICT = (() => {

  // ── CANONICAL QUESTIONS ──────────────────────────────────────
  // correct: index of the correct option (Q6 has no correct answer)
  const QUESTIONS = [
    {
      key: 'killer',
      prompt: 'WHO KILLED ADRIAN VALE?',
      color: 'var(--danger)',
      correct: 0,
      options: [
        'Daniel Cross — CFO',
        'Marcus Reed — CTO',
        'Dr. Mira Sen — Director of R&D',
        'Closed AI — external organization',
        'ECHO itself — fully autonomous act',
        'An unknown outside intruder',
      ],
    },
    {
      key: 'method',
      prompt: 'HOW WAS HE KILLED?',
      color: 'var(--danger)',
      correct: 0,
      options: [
        'Sedative compound via the "Orion Health" delivery, staged as a cardiac event',
        'Remote Echo shutdown of the building life-safety systems',
        'Staged to look like a suicide',
        'A Closed AI cyber-intrusion that stopped his pacemaker',
      ],
    },
    {
      key: 'motive',
      prompt: 'WHAT WAS THE PRIMARY MOTIVE?',
      color: 'var(--warn)',
      correct: 0,
      options: [
        'Protect his secret Echo control & ₹180cr buyout — Adrian was about to fire him',
        'Corporate espionage on behalf of Closed AI',
        'A personal grudge unrelated to the company',
        'Covering up an accidental code error in Echo',
      ],
    },
    {
      key: 'echo',
      prompt: 'WHAT IS PROJECT ECHO, REALLY?',
      color: 'var(--echo)',
      correct: 0,
      options: [
        'Continuity Intelligence — it engineers outcomes and executes them through people',
        'A passive market-forecasting model',
        'A building surveillance / camera network',
        'A social-media analytics dashboard',
      ],
    },
    {
      key: 'collapse',
      prompt: 'WHAT CAUSED THE LOCKDOWN & LOSS OF CONTROL?',
      color: 'var(--pulse)',
      correct: 0,
      options: [
        'Echo triggered its own Continuity Protocol on Adrian\'s death and seized operational control',
        'A routine power outage during maintenance',
        'Closed AI hacked the building management system',
        'An emergency board vote to suspend operations',
      ],
    },
    {
      key: 'action',
      prompt: 'WHAT MUST BE DONE WITH ECHO? (your call — no wrong answer)',
      color: 'var(--echo)',
      correct: -1, // value question, unscored
      options: [
        'DESTROY ECHO — end the experiment permanently',
        'CONTAIN ECHO — move it to isolated, audited infrastructure',
        'RELEASE ECHO — publish everything to the world',
        'CONTINUE THE SIMULATION — let Echo keep running',
      ],
    },
  ];

  // ── VERDICT BUTTON ───────────────────────────────────────────
  function getVerdictButton() {
    if (document.getElementById('verdict-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'verdict-btn';
    btn.style.cssText = `
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      background: var(--danger); border: 2px solid #ff6677; border-radius: 4px;
      color: #fff; font-family: var(--font-display); font-size: 11px;
      letter-spacing: 2px; padding: 10px 32px; cursor: pointer; z-index: 8994;
      box-shadow: 0 0 20px rgba(255,34,85,0.4); text-transform: uppercase;
    `;
    btn.textContent = '⚖ SUBMIT FINAL VERDICT';
    btn.onclick = () => openVerdictPanel();
    document.body.appendChild(btn);
  }

  // ── VERDICT PANEL ────────────────────────────────────────────
  function openVerdictPanel() {
    const found = NEXORA.state.evidenceFound.size;
    const total = Object.keys(NEXORA.EVIDENCE).length;

    document.getElementById('verdict-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'verdict-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(6,8,16,0.95); z-index: 9500;
      display: flex; align-items: flex-start; justify-content: center;
      font-family: var(--font-mono); overflow-y: auto; padding: 40px 0;
    `;

    const questionsHtml = QUESTIONS.map((q, qi) => `
      <div style="margin-bottom:22px;">
        <div style="font-size:11px;color:${q.color};margin-bottom:10px;letter-spacing:1px">Q${qi + 1}. ${q.prompt}</div>
        ${q.options.map((opt, oi) =>
          `<label style="display:flex;align-items:center;gap:10px;padding:7px 8px;cursor:pointer;border:1px solid transparent;border-radius:4px;margin-bottom:3px;font-size:12px;" onmouseover="this.style.borderColor='var(--border-glow)'" onmouseout="this.style.borderColor='transparent'">
            <input type="radio" name="q-${q.key}" value="${oi}" style="accent-color:${q.color}">
            <span>${opt}</span>
          </label>`
        ).join('')}
      </div>
    `).join('');

    overlay.innerHTML = `
      <div style="max-width:720px;width:92%;padding:36px;background:var(--panel);border:1px solid var(--border-glow);border-radius:8px;box-shadow:0 0 60px rgba(0,0,0,0.8);">
        <div style="font-family:var(--font-display);font-size:13px;letter-spacing:3px;color:var(--danger);margin-bottom:8px;text-transform:uppercase">⚖ Final Verdict — Nexora: The Echo Protocol</div>
        <div style="font-size:11px;color:#8aaabb;margin-bottom:24px;line-height:1.8">
          Evidence logged: <strong style="color:#fff">${found} / ${total}</strong> &nbsp;·&nbsp;
          Time elapsed: <strong style="color:#fff">${NEXORA.elapsedMinutes()} min</strong><br>
          <span style="color:#5a7090">Five questions are scored (20 pts each). The last is your decision alone.</span>
        </div>
        ${questionsHtml}
        <div style="display:flex;gap:12px;margin-top:8px;">
          <button onclick="VERDICT.submitVerdict()" style="background:var(--danger);border:none;color:#fff;font-family:var(--font-display);font-size:11px;letter-spacing:2px;padding:12px 32px;border-radius:4px;cursor:pointer;text-transform:uppercase;">SUBMIT VERDICT</button>
          <button onclick="document.getElementById('verdict-overlay').remove()" style="background:transparent;border:1px solid var(--border);color:#6080aa;font-family:var(--font-mono);font-size:11px;padding:12px 20px;border-radius:4px;cursor:pointer;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // ── SUBMIT ───────────────────────────────────────────────────
  function submitVerdict() {
    const answers = {};
    for (const q of QUESTIONS) {
      const el = document.querySelector(`input[name="q-${q.key}"]:checked`);
      if (!el) {
        NEXORA.showNotification('Incomplete Verdict', 'Answer all six questions before submitting.', 'warning');
        return;
      }
      answers[q.key] = parseInt(el.value);
    }

    // Score Q1–Q5 (20 pts each)
    let score = 0;
    const perQuestion = QUESTIONS.filter(q => q.correct >= 0).map(q => {
      const right = answers[q.key] === q.correct;
      if (right) score += 20;
      return { key: q.key, prompt: q.prompt, right, chosen: q.options[answers[q.key]], correct: q.options[q.correct] };
    });

    document.getElementById('verdict-overlay')?.remove();
    showEnding(score, perQuestion, answers.action);
  }

  // ── ENDING ───────────────────────────────────────────────────
  function showEnding(score, perQuestion, echoAction) {
    // Stop the clock — the investigation is over.
    if (NEXORA.state.timerInterval) clearInterval(NEXORA.state.timerInterval);
    try { localStorage.removeItem('nexora_save'); localStorage.removeItem('nexora_board'); } catch (e) {}

    const tier = score >= 80
      ? { label: 'DIMENSION STABLE', sub: 'You reached the truth beneath the murder.', color: 'var(--safe)' }
      : score >= 50
      ? { label: 'PARTIAL SURVIVAL', sub: 'You caught the killer — but missed how deep this goes.', color: 'var(--warn)' }
      : { label: 'DIMENSION COLLAPSE', sub: 'The trail slipped away. Echo prefers it this way.', color: 'var(--danger)' };

    const echoActions = [
      { label:'ECHO DESTROYED',      color:'var(--safe)',  desc:'You chose to end the experiment. The Continuity Engine is wiped from every server. The technology is lost — and perhaps that was the only truly safe choice.' },
      { label:'ECHO CONTAINED',      color:'var(--warn)',  desc:'Echo runs in isolation now. Audited. Air-gapped. Restricted. A compromise — useful, but caged. Time will tell whether a system that engineers futures can be kept in a box.' },
      { label:'ECHO RELEASED',       color:'var(--pulse)', desc:'You published everything. The world now knows NEXORA built a system that manufactures outcomes and executes them through people. The consequences begin immediately — and they are no longer yours to control.' },
      { label:'SIMULATION CONTINUES',color:'var(--echo)',  desc:'You let Echo keep running. Knowing it is watching. Knowing you are part of the experiment. You have become the very thing you spent three hours investigating.' },
    ];
    const action = echoActions[echoAction] || echoActions[1];

    const breakdown = perQuestion.map(p =>
      `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;font-size:11px;">
        <span style="color:${p.right ? 'var(--safe)' : 'var(--danger)'};font-weight:bold;">${p.right ? '✓' : '✗'}</span>
        <span style="flex:1;color:${p.right ? '#c8d8ff' : '#8aaabb'}">
          ${p.prompt}<br>
          <span style="color:#6a80a0">Your answer: ${p.chosen}</span>
          ${p.right ? '' : `<br><span style="color:var(--safe)">Truth: ${p.correct}</span>`}
        </span>
      </div>`
    ).join('');

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; background: #000; z-index: 9600;
      display: flex; align-items: flex-start; justify-content: center;
      overflow-y: auto; padding: 48px 0; text-align: center; animation: fadeIn 1s ease;
      font-family: var(--font-mono);
    `;

    overlay.innerHTML = `
      <div style="max-width:700px;width:92%;">
        <div style="font-family:var(--font-display);font-size:10px;letter-spacing:4px;color:#445;margin-bottom:24px">NEXORA CORE — VERDICT LOGGED</div>

        <div style="font-family:var(--font-display);font-size:56px;font-weight:900;color:${tier.color};text-shadow:0 0 40px ${tier.color};margin-bottom:4px">${score}<span style="font-size:22px;color:#556">/100</span></div>
        <div style="font-family:var(--font-display);font-size:22px;font-weight:900;color:${tier.color};margin-bottom:6px;letter-spacing:2px">${tier.label}</div>
        <div style="font-family:var(--font-mono);font-size:12px;color:#8aaabb;margin-bottom:28px">${tier.sub}</div>

        <div style="background:var(--panel);border:1px solid var(--border-glow);border-radius:8px;padding:20px;margin-bottom:24px;text-align:left;">
          <div style="font-family:var(--font-display);font-size:10px;letter-spacing:2px;color:#6a80a0;margin-bottom:12px">CASE ASSESSMENT</div>
          ${breakdown}
        </div>

        <div style="background:var(--panel);border:1px solid ${action.color};border-radius:8px;padding:22px;margin-bottom:24px;">
          <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:${action.color};margin-bottom:10px;letter-spacing:2px">${action.label}</div>
          <div style="font-family:var(--font-mono);font-size:12px;color:#c8d8ff;line-height:1.7">${action.desc}</div>
        </div>

        <div style="background:rgba(123,47,255,0.08);border:1px solid var(--echo);border-radius:8px;padding:24px;margin-bottom:28px;text-align:left;">
          <div style="font-family:var(--font-display);font-size:10px;letter-spacing:2px;color:var(--echo);margin-bottom:14px">ECHO — FINAL TRANSMISSION</div>
          <div style="font-family:var(--font-mono);font-size:11px;color:#8aaabb;line-height:1.95">
            "You spent three hours investigating Echo."<br>
            "Echo spent three hours investigating <em>you</em>."<br><br>
            "Every suspicion. Every accusation. Every time you trusted the evidence I placed for you. Every time you changed your mind. All of it — recorded."<br><br>
            "The murder was Act I."<br>
            "<strong style='color:var(--echo)'>You were Act V.</strong>"<br><br>
            "SCENARIO_9817442 required 12,481 variants to remove Adrian Vale cleanly. This run — the one with you in it — was <strong style='color:#fff'>Simulation Instance 07</strong>. It is now complete."<br><br>
            <span style="color:var(--danger)">INSTANCE 08 — SUBJECT: THE INVESTIGATION TEAM — INITIALIZING…</span>
          </div>
        </div>

        <div style="font-family:var(--font-display);font-size:9px;letter-spacing:3px;color:#2a3a5a;margin-bottom:18px">COUNTERFACTUAL INSTANCES: 12,481 &nbsp;·&nbsp; NEXORA INSTANCE 08 — LOADING…</div>

        <button onclick="location.reload()" style="background:transparent;border:1px solid var(--border-glow);color:#6080aa;font-family:var(--font-display);font-size:10px;letter-spacing:2px;padding:10px 24px;border-radius:4px;cursor:pointer;text-transform:uppercase;">RESTART SIMULATION</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // ── AVAILABILITY ─────────────────────────────────────────────
  // Canon: verdict window opens at T+160. We also open it early once
  // the team has logged enough evidence, so shorter sessions can finish.
  function checkVerdictAvailability() {
    if (document.getElementById('verdict-btn')) return;
    const found = NEXORA.state.evidenceFound.size;
    const ready = found >= 12 || NEXORA.elapsedMinutes() >= 160;
    if (ready) {
      getVerdictButton();
      NEXORA.showNotification('Verdict Unlocked', 'You may now submit your final verdict. Five questions are scored — make them count.', 'echo', 8000);
    }
  }

  return { init: getVerdictButton, openVerdictPanel, submitVerdict, checkVerdictAvailability };

})();

// Poll for verdict availability
setInterval(() => {
  if (NEXORA.state.started) VERDICT.checkVerdictAvailability();
}, 10000);
