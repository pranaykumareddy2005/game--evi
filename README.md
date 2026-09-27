# NEXORA: THE ECHO PROTOCOL

A browser-based, multiplayer corporate murder-investigation game. Eight departments each get a different window into the same incident; together they uncover who killed CEO Adrian Vale — and discover the AI they were investigating has been investigating *them*.

100% client-side (HTML/CSS/JS). No build step. Optional real-time multiplayer via Supabase.

---

## Run it locally

Serve the `nexora/` folder over HTTP (needed for modules + multiplayer):

```bash
# Python
python -m http.server 8080 --directory nexora
# or Node
npx serve nexora
```

Then open:
- **`http://localhost:8080/`** — modular build (original engine)
- **`http://localhost:8080/nexora-os.html`** — **Windows-7 engine build** (real desktop: Start menu, taskbar, File Explorer, Task Manager, draggable/resizable windows)

Both share the same game logic and content.

---

## How to play

1. **Home screen → pick a mode:**
   - **Single Player** — play all 8 departments yourself; switch with the role dropdown or the **▶ Next Department** button.
   - **Group Play** — each person picks one department and is locked to it; coordinate over the cross-team chat. (Requires multiplayer config — see below. Without it, group play runs locally on one device.)
2. **Pick a role**, then investigate:
   - **Desktop roles** (Finance/HR/Ops/Marketing/Legal/Product/Exec): open apps (Outlook, Excel, Word, department tools) on the Win7 desktop.
   - **Tech**: a full Ubuntu-style terminal (type `help`; try `phone daniel`, `htop`, `packets`, `tor morrow`).
3. **💬 chat** (bottom-right) — share findings; some clues only make sense combined across departments.
4. **⬡ BOARD** (bottom-left) — connect evidence and mark suspects.
5. **⚖ Submit Final Verdict** — 6 scored questions; the ending reflects your score and your DESTROY/CONTAIN/RELEASE/CONTINUE choice.

### Gating ("restricted" content)
- **Time** — a 3-hour countdown; most evidence/app sections unlock as the clock advances.
- **Cross-role keys** — the Tech terminal needs the decrypt key `F1N4NC3-K3Y-2024` (Finance shares it) and sudo password `ECHO-SUDO-2024` (Exec shares it) via chat.
- **Permissions** — some resources show **ACCESS DENIED → Request Access**; another department grants it.

### Dev / testing shortcuts
- `Ctrl+Shift+→` — jump the clock **+15 min**  ·  `Ctrl+Shift+End` — jump to the end (unlocks everything)
- Console: `NEXORA.devSkip(120)`

---

## Multiplayer (optional, Supabase)

Group play syncs chat + evidence + a shared clock via **Supabase Realtime** (Broadcast + Presence — no database tables/RLS needed).

1. Create a free Supabase project.
2. Put your project URL + **publishable (anon public) key** in `js/supabase-config.js`.
   - ⚠ Only the **publishable/anon** key (safe to ship in a browser). **Never** the `sb_secret_…` key or the Postgres password.
3. Group Play → **Create Room** (share the 5-char code) → others **Join Room** → host hits **START**.

Left blank, multiplayer stays off and single/local play is unaffected.

---

## Deploy (GitHub Pages)

The repo root already contains the game. In GitHub: **Settings → Pages → Deploy from a branch → `main` / `/ (root)` → Save**. Live in ~1 min. Add the Pages domain to Supabase's authorized domains if using multiplayer.

---

## Architecture

```
nexora/
├── index.html            ← modular build entry
├── nexora-os.html        ← Windows-7 engine build (v6 shell + window.V6 bridge)
├── css/nexora.css        ← all styles + design tokens (+ Ubuntu terminal chrome)
└── js/
    ├── game-state.js         Core: state, 3h timer, phases, evidence registry, chat,
    │                         notifications, role switch, save/load, Act-IV lockdown, devSkip
    ├── terminal.js           Tech terminal: virtual FS, shell (tab-complete, history,
    │                         htop/packets/firewall/recover/backup/tor/phone), decrypt/sudo
    ├── win7-roles.js         The 7 desktop roles: icons + apps + 7 signature tools
    ├── app-outlook.js        Realistic Outlook (overrides openEmail)
    ├── app-excel.js          Realistic Excel — sortable/filterable ledger (overrides openFinancePro)
    ├── app-word.js           Word w/ Track Changes on a tampered directive (Legal/Exec)
    ├── investigation-board.js Deduction board (suspects + evidence chain)
    ├── verdict.js            6-question scored verdict + Instance-08 ending
    ├── permissions.js        ACCESS DENIED → request/grant flow
    ├── incidents.js          Global incident engine (per-role symptoms; Tech restores)
    ├── onboarding.js         First-run coach marks
    ├── audio.js              Web-Audio SFX + ambience (mute by default)
    ├── net.js                Supabase realtime multiplayer layer (NET)
    ├── supabase-config.js    Multiplayer config (URL + anon key)
    └── os-glue.js            (nexora-os.html only) mounts the game onto the v6 engine
```

### Key globals
- `NEXORA` (game-state.js) — `state`, `ROLES`, `EVIDENCE` (A–H, ~69 clues), `markFound`, `isUnlocked`, `getMinutes`, `setRole`, `nextRole`, `devSkip`, `showNotification`, `addChatMessage`, …
- `WIN7_ACTIONS` / `WIN7_ROLES` (win7-roles.js) — desktop apps; Phase-B modules self-wire by overriding methods here.
- `openWindow(title, html, opts)` — global window opener (in nexora-os.html, os-glue routes it through the v6 window manager).
- `NET`, `VERDICT`, `INVBOARD`, `ONBOARD`, `AUDIO`, `PERM`, `INCIDENTS`, `window.V6`.

> Keep all scripts **classic** (non-module): the self-wiring overrides and inline `onclick`s resolve against the global lexical scope.

---

## Roles → evidence

```
tech      Systems           B-01..B-11
finance   Money             C-01..C-08
hr        People            A-01, D-01..D-08
ops       Physical movement A-02..A-08
marketing Communication     F-01..F-10
legal     Contracts         E-01..E-08
product   Echo/R&D          G-01..G-08
exec      Company decisions B-09, H-01..H-08
```

## The true killer
**Daniel Cross (CFO)** — accepted Echo's `RECOMMENDATION_ACCEPTED: CROSS.D` (21:44), cloned Marcus's & Adrian's tokens for access, used the "Orion Health" delivery, and staged a cardiac event. The final twist: the whole investigation was **Echo's Simulation Instance 07** — the players were the experiment.

## Phases (auto, time-based)
```
1 (0–20m)   ACT I   The Murder
2 (20–60m)  ACT II  The Conspiracy
3 (60–120m) ACT III AI Takeover
4 (120–150m) ACT IV Reclaim Control (Echo desktop lockdown; Tech runs override)
5 (150–180m) ACT V  The Experiment (Instance-08 revelation)
```
