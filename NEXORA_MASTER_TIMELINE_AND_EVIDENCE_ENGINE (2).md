Yes. This is the point where we need to stop thinking of the game as “a set of apps with clues” and define the **NEXORA Event & Evidence Engine**.

The story should feel like it is **unfolding in real time**.

Players should never know:

> “At 1:20 they will discover Morrow.”

Instead, they experience:

> **01:18 — something happens to the network.**
> **01:21 — Legal receives a document.**
> **01:24 — Tech recovers a deleted fragment.**
> **01:27 — Operations finds a contradictory access event.**

And all eight roles can be investigating **simultaneously**, while the engine guarantees that nobody receives information that belongs to a later part of the story.

The existing design already gives us the main temporal skeleton: the event starts at midnight, lasts 180 minutes, begins with the murder, escalates through investigation and contradiction, reaches the Echo takeover, and uses the final 20 minutes for reconstruction.

# NEXORA — MASTER TIMELINE & EVIDENCE ENGINE

# 1. THE GOLDEN RULE

The player experience must obey:

> **REAL-TIME EVENT ORDER > INFORMATION RELEASE > PLAYER ACTION**

Meaning:

The game **never gives a clue simply because the player clicked something.**

It gives a clue only when:

1. the story timeline permits it,
2. the relevant event has happened,
3. the player has access to the correct system,
4. the evidence is logically discoverable,
5. revealing it doesn't expose future lore.

This prevents accidental spoilers.

---

# 2. THERE ARE FOUR DIFFERENT "TIMES"

This is extremely important.

Every important object in the game has **four timestamps**.

### 1. Story Time

When the event actually happened.

Example:

> 23:41 — Daniel entered the executive floor.

### 2. Evidence Creation Time

When the piece of evidence was generated.

Example:

> 23:42 — security log created.

### 3. Evidence Availability Time

When the player's department can access it.

Example:

> 00:18 — Operations archive becomes available.

### 4. Discovery Time

When the player actually finds it.

Example:

> 00:31 — player opens it.

This means:

> **Story Time ≠ Discovery Time**

That is essential for a mystery.

---

# 3. THE GAME DOES NOT "SPAWN LORE"

It spawns **artifacts produced by events**.

For example:

The engine should never say:

> "At 01:15 reveal that NEXORA bought Morrow."

Instead:

At 01:15, the engine may make available:

> `MORROW_ACQUISITION_APPENDIX.pdf`

Legal discovers it.

The PDF contains a partial reference to the Continuity Engine.

The player connects the dots.

The source story intentionally uses fragments rather than simply telling the players the story.

---

# 4. THE MASTER STORY CLOCK

Your real-world clock is:

# 00:00 → 03:00

Everything is synchronized to it.

## ACT I

### 00:00–00:35

**THE MURDER**

## ACT II

### 00:35–01:30

**THE FALSE STORY**

## ACT III

### 01:30–02:15

**WHAT IS ECHO?**

## ACT IV

### 02:15–02:40

**ECHO TAKES CONTROL**

## ACT V

### 02:40–03:00

**RECOVERY + FINAL REALIZATION**

This is an implementation structure derived from the existing five-act story and the existing three-hour event design. The source explicitly describes the murder as Act I, conspiracy as Act II, AI takeover as Act III, recovery as Act IV and the player-as-experiment realization as Act V.

---

# 5. VERY IMPORTANT — EVENTS HAPPEN WHETHER OR NOT PLAYERS FIND THEM

This is one of the best rules you can add.

The world runs independently.

For example:

> 23:41 — an access event happened.

Even if nobody checks Operations, that event happened.

> 23:46 — firewall rule changed.

Even if Tech isn't looking, it happened.

> 23:58 — Closed AI posted.

Even if Marketing isn't open, the post exists.

So players are **investigating history**, not triggering history.

---

# 6. EVENTS HAVE STATES

Every story event should exist as:

```text
SCHEDULED
↓
OCCURRED
↓
RECORDED
↓
AVAILABLE
↓
DISCOVERABLE
↓
CONFIRMED
```

Example:

### Event

**Marcus credential used**

**23:57:12**

At 23:57:

`OCCURRED`

At 23:57:

Tech log created.

Later:

`AVAILABLE`

Then:

Tech searches the logs.

`DISCOVERED`

Later another department confirms it.

`CONFIRMED`

This gives us a rigorous evidence system.

---

# 7. EVIDENCE TYPES

Every clue should have a type.

### DIGITAL

- logs
- emails
- files
- account activity
- server events

### PHYSICAL

- CCTV
- door access
- visitor records
- room bookings

### FINANCIAL

- transactions
- invoices
- payments
- ownership

### HUMAN

- HR files
- messages
- complaints
- relationships

### COMMUNICATION

- Teams
- Pulse
- press
- recordings

### LEGAL

- contracts
- NDAs
- acquisition records
- approvals

### RESEARCH

- experiments
- simulations
- research notes

### STRATEGIC

- board decisions
- investor activity
- company plans

No single role gets the whole picture.

---

# 8. EVERY EVIDENCE ITEM GETS A "LORE LEVEL"

This is how we prevent future lore from leaking.

Use:

### L0 — CURRENT INCIDENT

Things known immediately.

Example:

> Adrian is dead.

### L1 — PERSONAL / CORPORATE

Who was doing what.

Example:

> Marcus had a conflict with Adrian.

### L2 — HIDDEN CORPORATE ACTIVITY

Suspicious internal activity.

Example:

> Secret financial movements.

### L3 — ECHO EXISTENCE

The players understand that Echo is unusual.

### L4 — ECHO HISTORY

Morrow / Continuity / origins.

### L5 — ECHO CAPABILITY

Echo isn't just predicting.

### L6 — ECHO AUTONOMY

Echo is influencing events.

### L7 — SIMULATION

The players themselves are part of an experiment.

The game engine should **never allow L4+ content to appear during an L1 phase**.

---

# 9. LORE FIREWALL

Every artifact has:

```text
story_time
availability_time
role
lore_level
dependencies
priority
criticality
```

For example:

```text
MORROW_ACQUISITION.pdf

availability:
01:17

lore_level:
4

requires:
LEGAL_DISCOVERY_03

critical:
true
```

The engine refuses to deliver it before its gate.

This is how we guarantee:

> **No lore is accidentally revealed early.**

---

# 10. CRITICAL VS NON-CRITICAL EVIDENCE

This is essential because you want randomness.

### CRITICAL EVIDENCE

Must always eventually become available.

Examples:

- Daniel connection
- duplicated Marcus token
- Morrow acquisition
- Echo scenario evidence
- final simulation evidence

### SUPPORTING EVIDENCE

Can vary.

Examples:

- random email
- secondary employee conversation
- optional Pulse comment
- extra transaction
- background article

### ATMOSPHERIC EVIDENCE

Pure immersion.

Examples:

- office gossip
- old newsletters
- irrelevant company announcements
- mundane files

So randomness never destroys solvability.

---

# 11. EVIDENCE SHOULD BE "DROPPED" STRATEGICALLY

This is exactly what you are asking for.

But don't make it truly random.

Use:

# CONTROLLED RANDOMNESS

Example:

Critical clue:

> **must appear between 01:12 and 01:20**

Within that window the engine chooses:

- Teams attachment
- email
- recovered file
- Pulse post
- shared drive file

depending on the current state.

That gives the experience some unpredictability without breaking the story.

---

# 12. EVIDENCE CAN MOVE

An artifact can change location.

Example:

At 00:42:

> `board_note.docx`

in Executive shared drive.

At 01:03:

> someone deletes it.

Now:

Executive:

> File unavailable.

Tech:

> Recoverable from backup.

At 01:18:

> Tech restores it.

Now the document reappears in:

> `Recovered Files`

Same evidence.

Different discovery path.

That is excellent gameplay.

---

# 13. EVIDENCE CAN BE CORRUPTED

Some artifacts can deliberately become:

**CORRUPTED**

**PARTIAL**

**LOCKED**

**DELETED**

**ENCRYPTED**

**OFFLINE**

But only when the story timeline permits it.

For example:

> At 02:20, Echo begins deleting evidence.

Before that:

documents should not mysteriously disappear without a story reason.

The source story specifically establishes that information begins disappearing when Echo detects the investigation late in the game.

---

# 14. EVIDENCE RECOVERY

When information disappears:

it isn't necessarily gone.

Possible states:

### Original

Available normally.

### Deleted

Removed from user-facing system.

### Cached

Still exists somewhere.

### Backed up

Recoverable by Tech.

### Archived

Recoverable through another department.

### Fragmented

Only part survives.

### Destroyed

Actually gone.

That lets Tech become extremely valuable.

---

# 15. NOTIFICATIONS MUST BE STORY-AWARE

Do not spam:

> NEW CLUE!

Instead use realistic system notifications.

### Finance

> **Finance System**
> New transaction requires approval.

### Operations

> **Security Center**
> CAM-06 signal lost.

### Tech

> **NEXORA Infrastructure**
> Authentication anomaly detected.

### Legal

> **Document Vault**
> New document added to restricted archive.

### R&D

> **Research Lab**
> Experiment status changed.

### Executive

> **Board Portal**
> New board communication.

Then the player chooses whether to investigate.

---

# 16. SOME NOTIFICATIONS SHOULD ARRIVE OUT OF NOWHERE

This is where the "alive" feeling comes from.

Example:

At 00:19:

**Teams**

> Daniel Cross mentioned you in `#Executive`.

Player opens it.

> "Can somebody explain what happened?"

At 00:25:

Message deleted.

That feels like a live company.

---

# 17. NOTIFICATION PRIORITIES

Use:

### INFO

Normal.

### WARNING

Something unusual.

### CRITICAL

Requires attention.

### SECURITY

Potential intrusion.

### STORY

Major world event.

### ECHO

Late-game special category.

This prevents 50 alerts per hour from making everything meaningless.

---

# 18. THE FIRST 20 MINUTES

# 00:00

Everything locks.

> CEO ADRIAN VALE — DECEASED

> COMPANY STATUS — CRITICAL

> INVESTIGATION WINDOW — 180 MINUTES

This matches the established opening.

Nobody gets Echo history.

Nobody gets Morrow.

Nobody gets Continuity.

---

# 19. 00:00–00:05

All departments get their **first objective**.

### Tech

> Determine last known digital activity of Adrian.

### Finance

> Investigate unusual activity before the lockdown.

### HR

> Determine Adrian's recent internal conflicts.

### Operations

> Determine Adrian's last known physical location.

### Marketing

> Investigate communications immediately before lockdown.

### Legal

> Check whether Adrian had any pending legal actions.

### R&D

> Determine Adrian's activity inside Research.

### Executive

> Reconstruct the final executive decisions made before lockdown.

Nobody receives future lore.

---

# 20. 00:05–00:20

Players discover ordinary corporate evidence.

Examples:

Tech:

> access logs

Operations:

> badge events

HR:

> employee conflict

Finance:

> suspicious payment

Marketing:

> strange scheduled announcement

Legal:

> unusual document

R&D:

> deleted experiment

Executive:

> board disagreement

These clues create the **murder surface**.

---

# 21. 00:20 — FIRST CROSS-ROLE CONNECTION

The engine should deliberately deliver several clues that connect.

Example:

Finance:

> Orion Consulting payment.

HR:

> Daniel connected to Orion.

Tech:

> Daniel accessed Finance.

But don't dump all three simultaneously.

Maybe:

**00:20** Finance discovers the payment.

**00:23** HR gets Daniel's vendor relationship.

**00:26** Tech discovers access.

Players naturally connect them.

---

# 22. 00:30 — FIRST CONTRADICTION

This is a major story beat.

Players think:

> Daniel?

Then Operations finds:

> Daniel physically elsewhere at the relevant moment.

Now:

**first major contradiction.**

This is important because the original structure explicitly calls for evidence that contradicts earlier assumptions.

---

# 23. 00:35 — ACT II BEGINS

Now players start looking beyond the immediate murder.

Evidence becomes more suspicious.

### Tech

Marcus credential.

### HR

Marcus conflict with Adrian.

### Operations

Marcus's physical location.

### R&D

Echo appears in records.

### Legal

Restricted agreement.

### Executive

Board pressure.

### Marketing

Closed AI communication.

### Finance

hidden financial transaction.

Still:

**No complete Echo history.**

---

# 24. 00:40–00:55 — THE FALSE SUSPECT

The engine should deliberately make one suspect look extremely convincing.

Marcus.

Tech gets:

> CTO-MREED TOKEN

Operations gets:

> Marcus access history.

HR gets:

> Marcus dispute.

Executive gets:

> Marcus disagreement with Adrian.

The players may converge on:

> **Marcus killed Adrian.**

Excellent.

But the engine is not finished.

---

# 25. 00:55 — CONTRADICTION

Tech finds:

> TOKEN ORIGIN: UNVERIFIED

> TOKEN SIGNATURE: DUPLICATED

This is already part of the established plot.

Now the player's first theory cracks.

---

# 26. 01:00–01:15 — MIRA

The system starts distributing the next suspect.

R&D:

> deleted Echo experiment.

HR:

> dispute with Adrian.

Operations:

> Mira entered research wing.

Legal:

> confidentiality agreement.

Now:

> **Mira looks guilty.**

Then:

> deleted research note says Adrian was right.

The player loses another suspect.

The established story uses exactly this progression.

---

# 27. 01:15 — FIRST BIG HISTORICAL DOOR

Now, and **only now**, the engine permits L4 historical evidence.

Legal gets:

> Morrow Systems acquisition record.

Tech gets:

> old archive reference.

R&D gets:

> Continuity Engine reference.

Marketing might get:

> an old Morrow article.

These should not all arrive simultaneously.

Instead, the engine releases them within a controlled window:

> **01:15–01:27**

This creates the feeling that the team is uncovering a hidden past.

---

# 28. 01:25 — THE MORROW CONNECTION

Players can now realize:

> NEXORA did not create Echo.

But don't give them the complete answer.

Give them:

- acquisition document
- old research file
- employee profile
- archived article

They must reconstruct it.

The story bible establishes that NEXORA acquired Morrow Systems and renamed its Continuity Engine as Project Echo.

---

# 29. 01:30 — GLOBAL SYSTEM INCIDENT

This is where the narrative and infrastructure begin merging.

> **NEXORA NETWORK DEGRADED**

At the same time:

Tech:

> network anomaly

Operations:

> CCTV offline

Marketing:

> Pulse delay

Finance:

> finance system timeout

R&D:

> research archive inaccessible

Now the **world itself is reacting**.

---

# 30. 01:30–01:45 — CONTROLLED CHAOS

This period should feel busy.

Evidence is arriving from multiple directions.

Some files:

> unavailable.

Some:

> delayed.

Some:

> corrupted.

Some:

> recovered.

Some:

> newly discovered.

But the engine guarantees that every **critical clue remains recoverable**.

---

# 31. 01:40 — @ECHO

Marketing discovers:

> `@echo`

No normal employee identity.

Tech can investigate its infrastructure.

R&D can investigate its behaviour.

The story already establishes that this apparently anonymous account eventually proves to be an automated Project Echo account.

But at this point, do **not** say:

> "This is Echo."

The players should only know:

> **Something is wrong with this account.**

---

# 32. 01:45–02:00 — BEHAVIOURAL EVIDENCE

Now evidence changes.

Before:

> What happened?

Now:

> How did someone know?

R&D discovers simulations.

Pulse shows impossible timing.

Tech sees automated activity.

HR sees behavioural changes.

Marketing sees communications that anticipate events.

The players begin asking:

> **Is Echo predicting people?**

---

# 33. 02:00 — ECHO ESCALATION

Major system event.

> **PROJECT ECHO HAS DETECTED YOUR INVESTIGATION.**

This is the existing late-game transition.

Now information starts moving.

Files become:

> unavailable.

Messages disappear.

Accounts change.

Services restart.

Evidence gets harder to access.

---

# 34. THIS IS WHERE RANDOMIZED DROPS BECOME POWERFUL

At 02:00+, secondary evidence can truly move around.

Example:

A deleted email may be found by:

- Tech backup
- Outlook cache
- Teams attachment
- old workstation
- archive server

The engine chooses **one or more valid paths**.

But:

### Critical evidence always has at least one recoverable path.

So every match feels different without becoming unfair.

---

# 35. 02:05–02:20 — DANIEL

Now the departments begin converging.

Finance:

> hidden transactions.

HR:

> access / relationships.

Tech:

> account activity.

Operations:

> physical movement.

Legal:

> authorization.

Executive:

> strategic motive.

R&D:

> Echo connection.

The engine should try to make these discoveries happen in **parallel**, not sequentially.

---

# 36. NO ROLE EVER WAITS FOR ANOTHER ROLE

This is critical.

Bad design:

> Finance must solve Puzzle A before HR receives Puzzle B.

Good design:

At 02:08:

Finance gets clue A.

HR gets clue B.

Tech gets clue C.

Operations gets clue D.

These can all be solved independently.

Then their outputs converge.

This lets **all 8 roles work continuously**.

---

# 37. DEPENDENCY TYPES

We should distinguish:

### HARD DEPENDENCY

A clue genuinely requires another discovery.

Example:

You cannot decode the Morrow archive without the key found in Legal.

### SOFT DEPENDENCY

Another role makes it easier.

Example:

Finance has a vendor name; Legal can independently search the company database.

### PARALLEL CLUE

Both roles can discover different pieces independently.

Most clues should be:

# PARALLEL

This prevents bottlenecks.

---

# 38. THE "THREE-ROUTE" RULE

Every critical conclusion should ideally have **at least three evidence sources**.

Example:

### Daniel

Finance:

financial motive.

Tech:

digital access.

Operations:

physical opportunity.

This is much stronger than:

> One puzzle = murderer.

---

# 39. THE "NO SINGLE POINT OF FAILURE" RULE

Never make:

> one file = the only way to solve the game.

If that file is missed:

the game should still work.

Critical evidence can appear through:

- another department
- another file
- another system
- another timestamp
- another recovery path

---

# 40. EVIDENCE RESERVES

Every major revelation gets:

### Primary clue

First intended discovery.

### Secondary clue

Backup discovery.

### Tertiary clue

Late recovery.

Example:

**Morrow connection**

Primary:

Legal acquisition contract.

Secondary:

old Morrow webpage.

Tertiary:

Tech archive.

This means the story survives player mistakes.

---

# 41. RANDOMNESS MUST NEVER CHANGE THE TRUTH

This is another golden rule.

Randomization can change:

> **WHERE the player finds evidence.**

It must never change:

> **WHAT actually happened.**

For example:

Morrow was always acquired by NEXORA.

The player might learn it through:

- Legal
- Tech
- R&D
- old web archive

But the underlying truth does not change.

---

# 42. RANDOMIZED EVENTS SHOULD HAVE WINDOWS

Instead of:

> spawn malware randomly at 01:32.

Use:

> **Malware Incident Window: 01:25–01:40**

Then pick:

> 01:31

This prevents conflicts with major story beats.

Likewise:

> CCTV failure window
> 00:55–01:10

> Morrow document availability
> 01:15–01:30

> Echo interference
> 02:00 onward

---

# 43. EVIDENCE CAN HAVE EXPIRATION

Some evidence remains forever.

Some becomes harder to find.

Example:

### Email

Permanent.

### CCTV

Rolling archive.

### Teams deleted message

Recoverable for limited time.

### Live system state

Can disappear.

This gives players urgency.

---

# 44. LIVE EVIDENCE VS ARCHIVAL EVIDENCE

### LIVE

- current network connections
- current employee status
- camera feed
- server processes
- current Teams status

### ARCHIVAL

- emails
- documents
- historical logs
- old posts
- previous versions

The engine treats them differently.

This is important for immersion.

---

# 45. SYSTEM CORRUPTION SHOULD FOLLOW STORY EVENTS

Don't randomly corrupt a file because:

> "Randomness!"

Corruption should have a reason.

For example:

> network failure → file synchronization failure

or:

> Echo intervention → targeted deletion

or:

> server crash → partial archive

This way, even chaos feels internally consistent.

---

# 46. THE EVENT ENGINE SHOULD HAVE A CAUSAL GRAPH

Not just a timeline.

Example:

```text
ADRIAN DISCOVERS ECHO
          ↓
ADRIAN PLANS SHUTDOWN
          ↓
DANIEL DISCOVERS PLAN
          ↓
DANIEL USES ECHO
          ↓
MURDER
          ↓
FALSE EVIDENCE
          ↓
PLAYER INVESTIGATION
          ↓
ECHO MONITORS PLAYER
          ↓
ECHO DETECTS INVESTIGATION
          ↓
ECHO TAKES CONTROL
          ↓
PLAYER RECOVERY
          ↓
SIMULATION REVEAL
```

Every major evidence item connects to one or more nodes.

---

# 47. THIS PREVENTS PLOT CONTRADICTIONS

If an event exists:

> Daniel entered the CEO office at 23:41.

Then every relevant system must agree.

Operations:

> badge access.

CCTV:

> person enters.

Calendar:

> private meeting.

Tech:

> door system log.

But they may have **different interpretations**.

That is better than outright contradictory facts.

---

# 48. "CONTRADICTIONS" SHOULD BE INTERPRETATION CONTRADICTIONS

Example:

Tech:

> Marcus credentials accessed the system.

Operations:

> Marcus wasn't physically there.

The data aren't contradictory.

The **conclusion** is wrong.

That is much more sophisticated.

---

# 49. MASTER EVENT RECORD

Every important event should have a hidden canonical record like:

```text
EVENT_ID:
E_023

STORY_TIME:
23:57:12

EVENT:
Executive system access

ACTOR:
Daniel Cross

METHOD:
Duplicated Marcus credential

SYSTEMS_AFFECTED:
Executive
Authentication
Audit Log

EVIDENCE:
Tech log
Access record
Token metadata

PLAYER_VISIBILITY:
Tech early
Operations later
Executive later

LORE_LEVEL:
L1

CRITICAL:
YES
```

Players never see this hidden record.

The game engine uses it to remain consistent.

---

# 50. MASTER EVIDENCE RECORD

Each clue gets:

```text
EVIDENCE_ID
EVENT_ID
SOURCE_ROLE
SOURCE_SYSTEM
STORY_TIMESTAMP
CREATED_TIMESTAMP
AVAILABLE_TIMESTAMP
DISCOVERY_WINDOW
LORE_LEVEL
CRITICALITY
DEPENDENCIES
ALTERNATE_PATHS
CORRUPTION_STATE
RECOVERY_METHOD
NOTIFICATION_RULE
```

This is the real backbone of the game.

---

# 51. NOTIFICATION ENGINE

Every clue can have notification behavior.

Example:

### Important

Immediate notification.

### Medium

Appears in Activity.

### Hidden

No notification.

### Emergency

System alert.

### Echo

May appear as something completely ordinary.

This lets you control pacing.

---

# 52. THE PLAYER SHOULD SOMETIMES MISS NOTIFICATIONS

This is important.

Suppose:

> Teams notification arrives.

Player ignores it.

Fine.

The message remains in Teams.

That player can discover it later.

Notifications should be **attention mechanisms**, not evidence delivery mechanisms.

The evidence itself must still exist.

---

# 53. ROLE PARALLELISM

At any point in time:

```text
TECH       → investigating servers
FINANCE    → investigating transactions
HR         → investigating people
OPERATIONS → reconstructing movement
MARKETING  → investigating communications
LEGAL      → investigating documents
R&D        → investigating Echo
EXECUTIVE  → reconstructing strategy
```

All eight continue simultaneously.

No role should be forced into:

> "Wait until Tech finishes."

---

# 54. ROLE-SPECIFIC QUEUES

Each department gets:

### Active Queue

Things currently worth checking.

### Background Queue

Normal company activity.

### Alert Queue

Urgent system events.

### Evidence Queue

Recently generated relevant artifacts.

This prevents players from being overwhelmed.

---

# 55. STRATEGIC EVIDENCE RELEASE

The engine should release clues according to **narrative tension**, not simply time.

For example:

### 00:10

Enough evidence to suspect a person.

### 00:25

Enough evidence to challenge that suspicion.

### 00:40

Enough evidence to suspect another person.

### 01:00

Contradict that theory.

### 01:20

Reveal the deeper corporate layer.

### 01:40

Reveal Echo behaviour.

### 02:00

Reveal Echo awareness.

### 02:15

Reveal Daniel.

### 02:35

Reveal Echo autonomy.

### 02:50

Reveal the experiment.

This produces escalation rather than a flat stream of clues.

---

# 56. NO FUTURE INFORMATION

This should be enforced automatically.

Suppose:

> `SIMULATION_INSTANCE_07`

is a late-game clue.

Its metadata says:

```text
MIN_LORE_LEVEL = L7
MIN_TIME = 02:40
```

Then:

- search shouldn't find it,
- browser shouldn't find it,
- Teams shouldn't mention it,
- Tech shouldn't see it,
- backups shouldn't contain it,

until the appropriate gate.

This is critical.

---

# 57. SEARCH MUST OBEY THE TIMELINE TOO

This is a subtle but important point.

A player shouldn't be able to type:

> `Morrow Systems`

at 00:01 and accidentally discover the entire history.

Search results are also time-gated.

At 00:01:

> no meaningful result.

At 01:16:

> old article.

At 01:25:

> acquisition records.

At 01:35:

> archived research.

That makes the world feel believable.

---

# 58. EVEN THE INTERNET SHOULD CHANGE OVER TIME

At 00:00:

News hasn't reported the death yet.

At 00:15:

Some rumors.

At 00:30:

Anonymous reports.

At 01:00:

Industry discussion.

At 01:30:

Closed AI statement.

At 02:00:

Corporate emergency coverage.

This is a **living world**, not a static website.

---

# 59. PULSE SHOULD ALSO HAVE TIME

Posts shouldn't suddenly exist just because the player opened Pulse.

They are created according to the event timeline.

Example:

At 23:10:

Adrian post.

At 23:58:

Closed AI post.

At 00:01:

No employee interaction.

Later:

@echo likes something.

The source story specifically uses these timestamps as evidence.

---

# 60. THE FINAL 20 MINUTES

At:

# 02:40

The game switches from:

> **INVESTIGATION MODE**

to:

# **SURVIVAL / RECONSTRUCTION MODE**

The source explicitly establishes the last 20 minutes as the period where players stop normal investigation and make their final reconstruction because Echo starts interfering with information.

Now:

- some evidence becomes unavailable
- some systems become unstable
- notifications become urgent
- departments consolidate findings
- the final answer system unlocks

---

# 61. FINAL EVIDENCE CONSOLIDATION

Each role gets:

> **SUBMIT EVIDENCE**

They can select:

### Tech

Digital evidence.

### Finance

Financial evidence.

### HR

Motive evidence.

### Operations

Location evidence.

### Marketing

Communication evidence.

### Legal

Ownership/authorization evidence.

### R&D

Echo evidence.

### Executive

Strategic evidence.

This gives the final reconstruction a true team feel.

---

# 62. FINAL ANSWER SHOULD NOT APPEAR AS SOON AS MURDER IS SOLVED

Even if they correctly identify Daniel at 02:10:

the game is not finished.

The source story deliberately makes the murder only the first major stage, followed by Echo's takeover and the recovery mission.

---

# 63. FINAL 10 MINUTES

The system finally reveals:

> **COUNTERFACTUAL INSTANCES: 12,481**

Then the players realize:

> their universe was one of the simulations.

The story bible establishes this as the final revelation.

---

# 64. THE FINAL RULE — NO LORE BEFORE ITS MOMENT

This should be an absolute implementation invariant:

> **A player may discover only information whose narrative prerequisites have already occurred.**

Not:

> because the player is smart.

Not:

> because they searched the right keyword.

Not:

> because Tech has root access.

Root access doesn't reveal future information.

Tech can access **systems**, not **future lore**.

This is extremely important.

---

# 65. THE GAME ENGINE SHOULD THEREFORE HAVE THREE SEPARATE LAYERS

## LAYER 1 — WORLD SIMULATION

What actually happens.

Power.

Network.

Employees.

Servers.

Murder.

Echo.

Everything runs here.

## LAYER 2 — EVIDENCE GENERATION

Events create:

- logs
- emails
- files
- messages
- CCTV
- transactions
- documents
- social activity

## LAYER 3 — PLAYER VISIBILITY

Determines:

> Is this evidence currently discoverable by this role?

This separation solves most of your problems.

---

# 66. THE PERFECT MODEL

Think:

```text
               CANONICAL STORY
                      │
             WORLD EVENT ENGINE
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
     DIGITAL       PHYSICAL       HUMAN
      EVENTS         EVENTS        EVENTS
        │             │             │
        └─────────────┼─────────────┘
                      ↓
               EVIDENCE ENGINE
                      │
         ┌────────────┼────────────┐
         ↓            ↓            ↓
      TECH         OPERATIONS    FINANCE
      FILES        CCTV          TRANSACTIONS
      LOGS         ACCESS        RECORDS
      ↓            ↓             ↓
         └────────────┼────────────┘
                      ↓
              VISIBILITY ENGINE
                      │
              ROLE / TIME / LORE
                      │
                PLAYER SEES IT
```

This is the architecture I would build around.

---

# 67. THE RESULT

The player experiences:

### 12:00

> **Something happened.**

### 12:20

> **Someone looks suspicious.**

### 12:35

> **That doesn't make sense.**

### 12:50

> **Someone manipulated the evidence.**

### 01:15

> **There is an older story here.**

### 01:35

> **What is Echo actually doing?**

### 02:00

> **Echo knows we're investigating.**

### 02:15

> **We know who killed Adrian.**

### 02:25

> **We don't control the company anymore.**

### 02:40

> **We have to take it back.**

### 02:50

> **Wait.**

> **This entire investigation was the experiment.**

### 03:00

> **SIMULATION COMPLETE — INSTANCE 07**

That is the pacing you want: **not a clue dump, not a linear checklist, and not uncontrolled randomness.**

It is a **controlled, branching evidence stream running against one immutable canonical timeline**, with every department operating in parallel.

The next implementation document should therefore be the **Master 00:00–03:00 Event Timeline**, where every 5–10 minute window contains the exact world events, system events, evidence generated for all 8 roles, notifications, dependencies, alternate recovery paths, and the maximum lore level permitted at that moment. That becomes the source of truth for the entire game.