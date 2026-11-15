# Partner Momentum Hub

Build an enterprise-grade "Partner Activation & Dormancy Prevention Hub" web application designed for Partner Managers, Partner Operations, and Partner Enablement teams. The primary business goal is converting newly signed, passive partners into active revenue generators by driving them to their First Deal Registration (before requiring paid technical certifications).
Use a clean, modern B2B SaaS aesthetic (slate/indigo palette, crisp cards, status badges, and subtle shadows) with 3 top navigation tabs:
1. "Activation & Dormancy Pipeline"
2. "Demand-First Enablement Playbooks (1:1 / 1:Few / 1:Many)"
3. "Deal-Triggered Certification & Incentive Rules"
Use this exact mock dataset of signed partners:
[
  {
    "id": "PTR-201",
    "name": "Nordic Digital Advisory",
    "tier": "Gold",
    "motion": "1:Few Cohort",
    "region": "Nordics",
    "partnerManager": "Marcus Lindqvist",
    "daysSinceSigned": 74,
    "activationState": "At Risk of Dormancy",
    "portalLoggedIn": true,
    "salesKitDownloaded": true,
    "accountOverlapCount": 8,
    "dealsRegistered": 0,
    "certifications": 0,
    "recommendedPlay": "Send 8 Overlapping Target Accounts + Co-Sell Spiff"
  },
  {
    "id": "PTR-202",
    "name": "Vanguard Cloud Partners",
    "tier": "Bronze",
    "motion": "1:Many Digital",
    "region": "Benelux",
    "partnerManager": "Automated Ops",
    "daysSinceSigned": 112,
    "activationState": "Dormant (90d+)",
    "portalLoggedIn": false,
    "salesKitDownloaded": false,
    "accountOverlapCount": 3,
    "dealsRegistered": 0,
    "certifications": 0,
    "recommendedPlay": "Automated Campaign-in-a-Box Sequence"
  },
  {
    "id": "PTR-203",
    "name": "Accenture Cloud EMEA",
    "tier": "Platinum",
    "motion": "1:1 Strategic",
    "region": "UK & Ireland",
    "partnerManager": "Sarah Jenkins",
    "daysSinceSigned": 42,
    "activationState": "Activated (1st Deal Reg)",
    "portalLoggedIn": true,
    "salesKitDownloaded": true,
    "accountOverlapCount": 24,
    "dealsRegistered": 2,
    "certifications": 4,
    "recommendedPlay": "Unlock SE Pre-Sales Support & Fast-Track Certs"
  },
  {
    "id": "PTR-204",
    "name": "Kestrel Systems Group",
    "tier": "Silver",
    "motion": "1:Many Digital",
    "region": "DACH",
    "partnerManager": "Automated Ops",
    "daysSinceSigned": 19,
    "activationState": "Newly Signed (0-30d)",
    "portalLoggedIn": true,
    "salesKitDownloaded": false,
    "accountOverlapCount": 5,
    "dealsRegistered": 0,
    "certifications": 0,
    "recommendedPlay": "Deliver Zero-Cost Sales Pitch Kit & ICP Guide"
  },
  {
    "id": "PTR-205",
    "name": "Stratos Enterprise Consulting",
    "tier": "Platinum",
    "motion": "1:1 Strategic",
    "region": "France",
    "partnerManager": "Claire Moreau",
    "daysSinceSigned": 85,
    "activationState": "At Risk of Dormancy",
    "portalLoggedIn": true,
    "salesKitDownloaded": true,
    "accountOverlapCount": 14,
    "dealsRegistered": 0,
    "certifications": 1,
    "recommendedPlay": "Book 1:1 Executive Account Mapping Session"
  },
  {
    "id": "PTR-206",
    "name": "Apex Cyber Solutions",
    "tier": "Gold",
    "motion": "1:Few Cohort",
    "region": "North America",
    "partnerManager": "David Chen",
    "daysSinceSigned": 58,
    "activationState": "Activated (1st Deal Reg)",
    "portalLoggedIn": true,
    "salesKitDownloaded": true,
    "accountOverlapCount": 11,
    "dealsRegistered": 1,
    "certifications": 2,
    "recommendedPlay": "Trigger 50% Certification Voucher on Deal #1"
  }
]
Build the 3 tabs with these interactive workflows:
Tab 1: Activation & Dormancy Pipeline
- Top KPI Cards:
  1. "Activation Rate (Signed → 1st Deal Reg)" (33.3%)
  2. "Avg Days to First Deal Registration" (50 Days)
  3. "Partners At Risk / Dormant (0 Deals)" (3 Partners)
  4. "Untapped Account Overlaps in Dormant Base" (25 Warm Accounts)
- Filter bar by Activation State (All, Newly Signed, At Risk of Dormancy, Dormant 90d+, Activated) and Tier (All, Platinum, Gold, Silver, Bronze).
- Interactive Partner Table showing: Partner Name, Tier Badge, Days Since Signed, Pre-Deal Readiness Signals (icons/pills for Portal Login, Sales Kit Downloaded, Account Overlaps), Deals Registered count, and Activation Status Badge.
- Each unactivated partner row includes an interactive "Launch Activation Play" button (e.g., "Push Account Overlaps" or "Send Campaign-in-a-Box") that opens a modal previewing the exact email/Slack outreach with their overlapping accounts, plus a "Simulate 1st Deal Reg" button so I can demo flipping a partner from "At Risk" to "Activated" live in an interview!
Tab 2: Demand-First Enablement Playbooks (1:1 / 1:Few / 1:Many)
- Showcase how Enablement scales activation without forcing upfront certification costs, organized into 3 columns:
  - Column 1: 1:1 Strategic (Platinum) — Dedicated PM, Joint Account Mapping, Co-Branded Sales Kit, Live Co-Sell Demo, Dedicated Sandbox, Executive Sponsorship.
  - Column 2: 1:Few Segmented (Gold) — Cohort Office Hours, Vertical Playbooks, Competitor Battlecards, Shared Demo Environment, Targeted First-Deal SPIFFs.
  - Column 3: 1:Many Long-Tail (Silver & Bronze) — Automated Deal Reg Portal, Guided Selling Scripts, Interactive Product Tours, Self-Serve Knowledge Base, Campaign-in-a-Box templates.
- Include a filter bar across the 6 pillars: [All Pillars, Commercial, Sales, Product Roadmap, Training / Enablement, Support, Marketing].
Tab 3: Deal-Triggered Certification & Incentive Rules
- An interactive RevOps automation builder showing the "Demand Before Investment" ruleset:
  - Rule 1: Partner Signs Agreement (Day 0) → Unlock Free Sales Kit & Account Overlap Check (No paid certs required).
  - Rule 2: Partner Reaches Day 60 with 0 Deals → Trigger Automated Account Overlap Nudge (1:Many) or PM Account Mapping Alert (1:1 / 1:Few).
  - Rule 3: Partner Submits 1st Deal Registration → Automatically unlock 50% Technical Certification Voucher + Assign Solutions Engineer for Deal Support.
- Include toggle switches to enable/disable rules and a live simulator slider ("Partner Tier" + "Deal Size") showing the exact incentives unlocked upon First Deal Registration.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://partner-momentum-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/33b491b0-c416-4cf7-8fb2-463393d5afb9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
