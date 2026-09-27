# NEXORA --- Roles & Tools Overview

## 1. Core Design

NEXORA is an investigation game where eight roles operate different
windows into the same corporate incident.

Every non-Tech player uses a **Windows 7-style corporate workstation**
connected to the **NEXORA corporate network**.

The Tech player uses an **Ubuntu workstation** with a sandboxed
cybersecurity/infrastructure toolkit.

### Target difficulty

> **Easy to understand → medium to solve → difficult to connect**

Players should understand the software quickly, but solving the incident
requires connecting evidence discovered by different departments.

------------------------------------------------------------------------

# 2. Common Environment

## Windows 7-Style Desktop

All non-Tech roles share:

-   My Computer
-   Network
-   Recycle Bin
-   Documents
-   Shared Drive
-   Microsoft Teams
-   Outlook
-   Internet Explorer-style Browser
-   Word
-   Excel
-   PowerPoint
-   Notepad
-   Calculator
-   Windows Media Player
-   PDF Reader
-   NEXORA Portal
-   NEXORA Pulse
-   Calendar
-   Company Wiki
-   Help Desk
-   Security Center

The visual style is Windows 7, while NEXORA's fictional internal
applications can have a more modern interface.

------------------------------------------------------------------------

# 3. NEXORA Corporate Network

Everything exists on one shared fictional corporate network.

``` text
                         INTERNET
                             │
                       NEXORA GATEWAY
                             │
                      FIREWALL / ROUTER
                             │
                        CORE NETWORK
                  ┌──────────┼──────────┐
                  │          │          │
                USERS      SERVERS    SECURITY
                  │          │          │
             Windows PCs  Databases    CCTV
                          Files        Access
                          Mail
                          Pulse
                          Echo
```

### Network Zones

-   Corporate
-   Finance
-   HR
-   Operations
-   Engineering
-   Executive
-   Research
-   Security
-   Echo

Players do not need networking theory. They primarily see system states
such as:

-   **CONNECTED**
-   **DEGRADED**
-   **NETWORK UNAVAILABLE**

### Network as a Gameplay System

The network is infrastructure underneath every application.

A network failure can cause:

-   Teams to stop working
-   Shared files to disappear
-   CCTV to freeze
-   Finance databases to become unavailable
-   HR records to become inaccessible
-   R&D research servers to disconnect

Tech investigates and restores infrastructure, but other roles are still
needed to understand what the incident means.

------------------------------------------------------------------------

# 4. Common Corporate Applications

## Microsoft Teams

Central communication system.

### Channels

-   General
-   Executive
-   Engineering
-   Finance
-   HR
-   Operations
-   Marketing
-   Legal
-   Research
-   Security
-   IT Support
-   Emergency
-   Incident-00
-   Echo Taskforce
-   Board

### Features

-   Chat
-   Group chat
-   File sharing
-   Meetings
-   Calendar
-   Notifications
-   Presence
-   Attachments
-   Reactions
-   Message editing
-   Deleted messages
-   Search

Teams is a major source of cross-department evidence.

------------------------------------------------------------------------

## NEXORA Pulse

Internal corporate social network.

### Features

-   Feed
-   Profiles
-   Posts
-   Comments
-   Likes
-   Reactions
-   Followers
-   Following
-   DMs
-   Reposts
-   Deleted posts
-   Edit history
-   Search
-   Notifications

Pulse functions as a behavioral evidence database.

------------------------------------------------------------------------

## Outlook

Every employee has a corporate mailbox.

### Folders

-   Inbox
-   Sent
-   Drafts
-   Deleted
-   Archive
-   Junk
-   Attachments

Emails may contain:

-   Documents
-   Screenshots
-   Meeting invites
-   Spreadsheets
-   Links
-   Recordings
-   Forwarded chains

------------------------------------------------------------------------

## Browser

Internet Explorer-style interface containing:

### Public Web

-   Company websites
-   Startup news
-   AI blogs
-   Investor news
-   Competitor sites
-   Research archives
-   Legal databases
-   Video sites

### Internal Web

-   NEXORA Portal
-   Wiki
-   Help Desk
-   Directory
-   Dashboards

### Historical Web

-   Old Morrow Systems website
-   Archived NEXORA pages
-   Old research publications
-   Old news articles

------------------------------------------------------------------------

## Office Tools

### Word

Used for:

-   Reports
-   Memos
-   Contracts
-   Meeting notes
-   Letters

Evidence can include:

-   Author
-   Date
-   Comments
-   Revisions
-   Tracked changes

### Excel

Used for:

-   Finance
-   Employee lists
-   Timelines
-   Access logs
-   Analytics

Primary interactions:

> **Sort → Filter → Search → Compare**

Advanced spreadsheet knowledge is not required.

### PowerPoint

Used for:

-   Board presentations
-   Investor decks
-   Strategy
-   Research presentations

### Calculator

Used for:

-   Money
-   Times
-   Percentages
-   Ownership

### Notepad

Players can build:

-   Timelines
-   Suspect lists
-   Evidence lists
-   Theories

### Media Player

Used for:

-   Recordings
-   Interviews
-   Voice notes
-   Security footage
-   CEO videos

------------------------------------------------------------------------

# 5. Role Overview

  Role           Real-World Feeling                         Primary Evidence
  -------------- ------------------------------------------ -------------------
  Tech / Cyber   Cybersecurity, DevOps, IT infrastructure   Systems
  Finance        Corporate finance                          Money
  HR             HR / People Operations                     People
  Operations     Security / Facilities                      Physical movement
  Marketing      Communications / Social                    Communication
  Legal          Legal Operations / Compliance              Contracts
  R&D            AI / Research                              Echo
  Executive      Management / Strategy                      Company decisions

Each role should feel different while operating inside the same company.

------------------------------------------------------------------------

# 6. ROLE 1 --- TECH / CYBERSECURITY / INFRASTRUCTURE

## Role Identity

Tech is the **hacking and infrastructure role**.

The player is the person who can see the machine behind the company.

They investigate:

-   Servers
-   Network activity
-   Logs
-   Authentication
-   Firewall changes
-   Malware
-   Backups
-   Deleted files
-   Access traces
-   Privileges
-   Simulated attacks

## Operating System

**Ubuntu**

## Main Applications

-   Terminal
-   Files
-   VS Code
-   Nano
-   Firefox
-   Tor Browser
-   System Monitor
-   htop
-   Log Viewer
-   Network Monitor
-   Firewall
-   Backup Manager
-   Service Manager
-   Database Console
-   NEXORA Admin

## Sandboxed Hacking Toolkit

The hacking mechanics are fictional and contained inside the game.

### Network Scanning

Determine:

> Which NEXORA machines are online?

### Service Discovery

Determine:

> Which fictional services are exposed?

### Credential Investigation

Determine:

> Which account was used?

### Log Analysis

Determine:

> What actually happened?

### Access Tracing

Determine:

> Where did a login originate?

### Firewall Investigation

Determine:

> Which firewall rule changed?

### Packet Tracing

Determine:

> Which system communicated with which?

### File Recovery

Recover:

> Deleted or corrupted evidence.

### Backup Recovery

Determine:

> Which backup contains the missing information?

### Malware Investigation

Determine:

> Where did the simulated malware enter and what did it affect?

### Privilege Investigation

Determine:

> How did a user obtain access they should not have?

These are game mechanics rather than real-world intrusion tutorials.

## Tech Terminal

Avoid requiring complicated Linux commands.

Example simplified commands:

``` text
help
servers
network
logs
users
trace
firewall
backup
recover
scan
services
```

The interface explains what each command does.

## Server Panel

Servers:

-   NEX-AUTH
-   NEX-FILE
-   NEX-MAIL
-   NEX-PULSE
-   NEX-DB
-   NEX-CCTV
-   NEX-BACKUP
-   NEX-ECHO

Each server can show:

-   Online/offline
-   Health
-   Recent activity
-   Services
-   Connections
-   Alerts
-   Last backup

## Tech-Specific Incidents

Tech can investigate:

-   Network outages
-   Power failures
-   Server failures
-   Malware
-   Firewall anomalies
-   Authentication failures
-   File corruption
-   Backup failures
-   Suspicious access
-   Echo infrastructure activity

### Example

``` text
MARCUS-REED
logged into the executive server.

TOKEN ORIGIN: UNKNOWN
TOKEN SIGNATURE: DUPLICATED
```

The apparent culprit may not be the actual person who performed the
action.

## Tech Difficulty

Target:

-   **40% investigation**
-   **30% logic**
-   **20% technical interaction**
-   **10% actual typing**

The player should not need prior Linux knowledge.

------------------------------------------------------------------------

# 7. ROLE 2 --- FINANCE

## Role Identity

Finance follows the **money trail**.

## Main Tools

-   Excel
-   Outlook
-   Teams
-   PDF Reader
-   Word
-   Calculator
-   NEXORA Finance
-   Bank Portal
-   Investor Portal

## NEXORA Finance

Sections:

-   Transactions
-   Accounts
-   Vendors
-   Payroll
-   Expenses
-   Investors
-   Transfers
-   Approvals

## Evidence

-   Bank transactions
-   Invoices
-   Payroll
-   Expenses
-   Vendor records
-   Investor documents
-   Acquisition records

## Main Gameplay

> **Search → Filter → Compare → Notice anomaly**

Example:

``` text
₹24,80,000 → ORION CONSULTING
```

Finance may discover the payment.

HR can identify the people connected to Orion.

Legal can identify the related contract.

------------------------------------------------------------------------

# 8. ROLE 3 --- HR / PEOPLE

## Role Identity

HR investigates **people, relationships, motives and access**.

## Main Tools

-   Teams
-   Outlook
-   Excel
-   Word
-   Employee Directory
-   HR Portal
-   Attendance
-   Leave
-   Performance
-   Complaints
-   Pulse

## Employee Profile

-   Name
-   Role
-   Manager
-   Hire date
-   Promotion history
-   Access level
-   Complaints
-   Disciplinary record
-   Status

## Investigation Areas

-   Motives
-   Relationships
-   Conflicts
-   Promotions
-   Terminations
-   Access
-   Whereabouts

HR provides the human context behind evidence found by other
departments.

------------------------------------------------------------------------

# 9. ROLE 4 --- OPERATIONS / SECURITY

## Role Identity

Operations reconstructs **physical movement**.

## Main Tools

-   Teams
-   Outlook
-   CCTV
-   Access Control
-   Floor Map
-   Visitor Management
-   Meeting Rooms
-   Facilities
-   Delivery Tracker

## Main Question

> **Where was everyone?**

## Evidence

-   Timestamps
-   Access cards
-   CCTV
-   Room reservations
-   Visitor records
-   Deliveries

Operations complements Tech's digital evidence with physical evidence.

## Difficulty

Primarily:

> **Timeline reconstruction**

No technical expertise required.

------------------------------------------------------------------------

# 10. ROLE 5 --- MARKETING / COMMUNICATIONS

## Role Identity

Marketing investigates **communication, public activity and information
leaks**.

## Main Tools

-   Teams
-   Outlook
-   NEXORA Pulse
-   Campaign Manager
-   Social Analytics
-   Press Center
-   Media Library
-   Customer Analytics
-   Competitor Monitor
-   Browser

## Investigation Areas

-   Leaks
-   Customer reactions
-   Competitor activity
-   Announcements
-   Public communication
-   Internal communications

## Example Clue

A scheduled announcement appears at:

``` text
00:05 AM
```

Only five minutes after Adrian's death.

The timing itself becomes evidence.

------------------------------------------------------------------------

# 11. ROLE 6 --- LEGAL / COMPLIANCE

## Role Identity

Legal investigates **contracts, ownership, acquisitions and corporate
obligations**.

## Main Tools

-   Teams
-   Outlook
-   Word
-   PDF Reader
-   Contract Vault
-   Compliance Portal
-   NDA Manager
-   Patent Registry
-   Case Management
-   Document Management

## Investigation Areas

-   Contracts
-   NDAs
-   Acquisitions
-   Ownership
-   Patents
-   Board resolutions
-   Compliance cases

The old **Morrow Systems** acquisition gradually becomes important.

## Difficulty

Primarily:

> **Reading + finding contradictions**

Legal knowledge should not be required.

------------------------------------------------------------------------

# 12. ROLE 7 --- PRODUCT / R&D

## Role Identity

R&D investigates **Echo and the company's research**.

## Main Tools

-   Teams
-   Outlook
-   Word
-   Excel
-   PDF Reader
-   Research Lab
-   Experiment Console
-   Technical Archive
-   Prototype Viewer
-   Pulse

## Research Folders

-   Echo V1
-   Echo V2
-   Echo V3
-   Continuity
-   Scenarios
-   Behaviour Model
-   Prediction Engine
-   Restricted

## Progressive Discovery

The player's understanding evolves:

``` text
Echo = business-risk system

        ↓

Echo = behaviour system

        ↓

Echo = future simulation system
```

R&D gradually reveals what Echo actually is.

------------------------------------------------------------------------

# 13. ROLE 8 --- EXECUTIVE / STRATEGY

## Role Identity

Executive investigates **management decisions, board conflict and
company strategy**.

## Main Tools

-   Teams
-   Outlook
-   CEO Dashboard
-   Board Portal
-   Investor Dashboard
-   Strategy Portal
-   Acquisition Center
-   Financial Overview
-   Board Archive
-   Pulse
-   Calendar

## Information

-   Investor pressure
-   Board conflict
-   Acquisitions
-   Company valuation
-   Strategic plans
-   Founder decisions

Executive information helps connect departmental evidence to major
company decisions.

------------------------------------------------------------------------

# 14. Cross-Role Evidence

The most important gameplay principle is that no role should have the
complete answer.

Example:

### Finance

> "I found a suspicious payment."

### HR

> "That company is linked to Daniel."

### Legal

> "I found the contract."

### Tech

> "I found the server access."

### Operations

> "The person wasn't physically there."

### R&D

> "The transaction matches an Echo scenario."

### Executive

> "That explains the board decision."

Together, the team sees the same event from multiple angles.

------------------------------------------------------------------------

# 15. Global Incident System

Events affect the shared network and therefore multiple roles.

Possible incidents:

-   Network outage
-   Power outage
-   Server failure
-   Database failure
-   Malware
-   Firewall anomaly
-   Authentication failure
-   CCTV outage
-   File corruption
-   Backup failure
-   Communication outage
-   Echo intervention

## Example Global Event

### 01:17

``` text
NEXORA SYSTEM ALERT

NETWORK ANOMALY DETECTED
```

### Finance

Bank portal offline.

### HR

Employee database unavailable.

### Operations

CCTV 05 and 06 offline.

### Marketing

Pulse unavailable.

### Legal

Contract archive unavailable.

### R&D

Research server disconnected.

### Executive

CEO Dashboard unavailable.

### Tech

``` text
CRITICAL INFRASTRUCTURE INCIDENT
```

Tech handles infrastructure recovery, but every other role remains
necessary for investigation.

------------------------------------------------------------------------

# 16. Division of Responsibility

Tech should not solve everything.

  Question                                Primary Role
  --------------------------------------- --------------
  Which system failed?                    Tech
  Where did the login originate?          Tech
  Was there malware?                      Tech
  Who was connected to whom?              HR
  Where did the money go?                 Finance
  Who was physically present?             Operations
  What was communicated publicly?         Marketing
  What did the contract say?              Legal
  What is Echo?                           R&D
  Why did management make the decision?   Executive

This keeps every role meaningful.

------------------------------------------------------------------------

# 17. Difficulty Model

## Level 1 --- Discovery

The player immediately understands the application.

## Level 2 --- Investigation

The player finds suspicious information.

## Level 3 --- Correlation

The player realizes another department has the missing piece.

## Level 4 --- Reconstruction

The team determines what actually happened.

## Level 5 --- Twist

New information contradicts their theory.

Target feeling:

> **"WAIT... THAT DOESN'T MAKE SENSE."**

------------------------------------------------------------------------

# 18. Puzzle Structure

Every major puzzle should contain three parts.

## 1. Obvious Question

> Who accessed the system?

## 2. Evidence

Three departments discover different pieces.

## 3. Contradiction

The obvious answer does not work.

### Example

**Tech**

> Marcus's credentials accessed Adrian's system.

**Operations**

> Marcus was on Floor 3.

**HR**

> Marcus's badge never entered Floor 4.

The team concludes:

> Someone copied Marcus's credentials.

The puzzle is solved through correlation rather than a password
minigame.

------------------------------------------------------------------------

# 19. Real-World Software, Simplified

The game should use recognizable real-world software concepts without
recreating full enterprise applications.

Each application should generally have:

-   **3--5 important screens**
-   **1--3 important interactions**

### Examples

**Excel**

> Open → Search → Filter → Compare

**Teams**

> Channels → Messages → Files → Search

**Outlook**

> Inbox → Search → Open attachment → Inspect date

**CCTV**

> Camera → Timeline → Playback → Timestamp

**Finance**

> Transactions → Filter → Open record

**Legal**

> Search contract → Open → Inspect revision

**R&D**

> Research archive → Search → Open experiment

------------------------------------------------------------------------

# 20. Escalating Shared World

The network and company should feel alive.

Example timeline:

``` text
12:10  Everything is normal.

12:45  Small network instability.

01:10  A service fails.

01:25  Suspicious login.

01:40  Malware incident.

02:00  Echo begins manipulating systems.

02:20  Files start disappearing.

02:40  NEXORA enters full crisis.
```

As the investigation progresses, Echo becomes increasingly aware of the
players.

------------------------------------------------------------------------

# 21. Late-Game Role Dependency

When Echo takes control of NEXORA, the team needs every department.

``` text
Tech       → Infrastructure authority
Finance    → Financial authority
HR         → Identity authority
Operations → Physical security
Marketing  → Communications
Legal      → Legal authority
R&D        → Echo knowledge
Executive  → Final corporate authority
```

This creates the second-half gameplay loop.

Tech becomes critical, but Tech still cannot finish the game alone.

------------------------------------------------------------------------

# 22. Final Role Architecture

``` text
NEXORA
│
├── COMMON WINDOWS 7
│   ├── Teams
│   ├── Outlook
│   ├── Pulse
│   ├── Browser
│   ├── Word
│   ├── Excel
│   ├── PowerPoint
│   ├── File Explorer
│   ├── PDF Reader
│   ├── Media Player
│   ├── Calendar
│   └── NEXORA Portal
│
├── TECH / CYBER
│   ├── Ubuntu
│   ├── Terminal
│   ├── VS Code
│   ├── nano
│   ├── htop
│   ├── Network Monitor
│   ├── Firewall
│   ├── Logs
│   ├── Servers
│   ├── Backups
│   ├── Malware Investigation
│   ├── Access Tracing
│   └── Fictional Tor Network
│
├── FINANCE
│   ├── Excel
│   ├── Finance Portal
│   ├── Bank
│   ├── Investor Portal
│   └── Accounting
│
├── HR
│   ├── Employee Directory
│   ├── HR Portal
│   ├── Attendance
│   ├── Leave
│   ├── Performance
│   └── Complaints
│
├── OPERATIONS
│   ├── CCTV
│   ├── Access Control
│   ├── Floor Map
│   ├── Visitors
│   └── Facilities
│
├── MARKETING
│   ├── Pulse
│   ├── Campaigns
│   ├── Press Center
│   ├── Social Analytics
│   └── Customer Analytics
│
├── LEGAL
│   ├── Contract Vault
│   ├── NDA Manager
│   ├── Compliance
│   ├── Patent Registry
│   └── Case Management
│
├── R&D
│   ├── Research Lab
│   ├── Echo Archive
│   ├── Experiment Console
│   ├── Technical Archive
│   └── Prototype Viewer
│
└── EXECUTIVE
    ├── CEO Dashboard
    ├── Board Portal
    ├── Investor Dashboard
    ├── Strategy
    ├── Acquisition Center
    └── Board Archive
```

------------------------------------------------------------------------

# 23. Target Player Experience

### Within 10 minutes

> **"Okay, I know how to use this computer."**

### Within 45 minutes

> **"I think I know what happened."**

### At 90 minutes

> **"Wait. That evidence contradicts everything."**

### At 150 minutes

> **"Oh shit. Echo isn't just part of the murder."**

### Endgame

> **"We spent three hours investigating Echo... while Echo was
> investigating us."**

The goal is to make NEXORA feel like a functioning company rather than a
collection of puzzle screens.
