# NEXORA: THE ECHO PROTOCOL
## Developer Reference

---

## File Structure

```
nexora/
├── index.html              ← Main game shell (entry point)
├── css/
│   └── nexora.css          ← ALL styles, CSS variables, design tokens
├── js/
│   ├── game-state.js       ← Core state, timer, evidence system, chat, role switcher
│   ├── terminal.js         ← Tech role: full terminal + file system simulation
│   ├── win7-roles.js       ← All 8 Win7 roles: desktop icons + app windows
│   ├── storyboard.js       ← Intro storyboard (5 frames + role select)
│   └── verdict.js          ← Final verdict panel + ending screens
└── README.md               ← This file
```

---

## Architecture

### Global Object: `NEXORA`
Defined in `game-state.js`. Contains:
- `NEXORA.state` — all game state (current role, elapsed time, evidence found, chat)
- `NEXORA.ROLES` — role definitions with label, color, shell type
- `NEXORA.EVIDENCE` — full evidence registry (39 clues, each with role, unlock time)
- `NEXORA.showNotification(title, body, type)` — push a notification
- `NEXORA.addChatMessage(role, msg, color)` — add to cross-team chat
- `NEXORA.setRole(key)` — switch to a role (triggers shell switch)
- `NEXORA.markFound(id)` — mark an evidence piece as discovered
- `NEXORA.isUnlocked(id)` — check if evidence is time-unlocked

### Role Keys
```
tech | finance | hr | ops | marketing | legal | product | exec
```

### Evidence IDs
```
A-01 to A-06  Physical/Location
B-01 to B-06  Digital/System
C-01 to C-05  Financial
D-01 to D-06  Personnel
E-01 to E-04  Legal
F-01 to F-04  Social/PULSE
G-01 to G-04  R&D/Echo
H-01 to H-04  Executive
```

---

## Adding New Evidence

In `game-state.js`, add to the `EVIDENCE` object:
```js
'X-07': { id:'X-07', label:'Your clue description', role:'finance', unlocksAt: 45 }
```

Then in the relevant role's app in `win7-roles.js`, add the evidence ID to trigger `NEXORA.markFound('X-07')`.

---

## Adding New Terminal Commands

In `terminal.js`, find the `switch(verb)` block in `processCommand()` and add:
```js
case 'yourcommand': cmdYourCommand(args); break;
```
Then define `function cmdYourCommand(args) { ... }`.

Add new files to the `FS` object at the top of `terminal.js`.

---

## Adding New Win7 Apps

In `win7-roles.js`:
1. Add an icon to the role's `icons` array: `{ emoji:'🗂️', label:'App Name', action:'openMyApp' }`
2. Add a method to `WIN7_ACTIONS`: `openMyApp() { openWindow('Title', htmlContent, {width:580, height:400}); }`

---

## Notification Types
```
info | warning | danger | echo
```

---

## Game Phases (Acts)
```
Phase 1 (0–20min)   ACT I   — The Murder (investigation begins)
Phase 2 (20–60min)  ACT II  — The Conspiracy (false suspects emerge)
Phase 3 (60–120min) ACT III — AI Takeover (Echo takes control)
Phase 4 (120–150min) ACT IV — Reclaim Control (recovery mission)
Phase 5 (150–180min) ACT V  — The Experiment (meta-revelation)
```

Phase transitions are automatic (time-based) in `game-state.js → startTimer()`.

---

## Design Tokens (CSS Variables)

```css
--void        #060810   Background
--pulse       #00aaff   Primary blue accent
--echo        #7b2fff   Echo/AI purple
--danger      #ff2255   Red / alerts
--warn        #ffaa00   Warning gold
--safe        #00cc88   Success green

--font-mono   'Share Tech Mono'  — Terminal, data, clues
--font-ui     'Rajdhani'         — Interface labels
--font-display 'Orbitron'        — Headers, titles
```

---

## The True Killer
**Daniel Cross (CFO)** — Evidence path:
- C-01 → C-03 → E-04: Orion shell company = Daniel's money trail
- A-02 + B-06: Cloned Marcus token = false trail
- A-03 + B-04: Stole Adrian's credentials for stairwell
- A-06: Orion Health delivery = murder weapon
- G-04: RECOMMENDATION_ACCEPTED: CROSS.D = accepted Echo's kill order
- A-04 + B-01: Camera blackout + session termination = executed the plan
- H-03: CONTINUITY_PHASE_II = players were Echo's experiment all along

---

## Known Design Decisions

- **No backend needed** — all evidence is static JS, time-unlocked
- **No multiplayer** — designed for single player (role-switching simulates team)
- **Verdict button** appears after 8 evidence pieces found
- **Echo chat messages** appear automatically at timed intervals
- **Terminal history** supports arrow-key navigation (↑↓)
- **Windows are draggable** — using `makeDraggable()` in `game-state.js`
