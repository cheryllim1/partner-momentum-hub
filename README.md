## Partner Momentum Hub
Designed by [Cheryl Lim](https://www.linkedin.com/in/cheryl-ai-tian-lim/)<br>
Access Demo: [Partner Momentum Hub](https://partner-momentum-hub.lovable.app)

---
### The Business Challenge
Signing a partner agreement is only the starting line—in most B2B ecosystems, **90% of signed partners remain passive**:
- **Post-Signing Drop-Off:** Partners sign contracts with good intentions, then stall due to a lack of structured onboarding, clear next steps, or technical readiness.
- **Blind Spots Across Regions:** Without granular tracking across all 7 global regions (`NA`, `LATAM`, `EMEA N`, `EMEA S`, `DACH`, `GCN`, `APAC`), Partner Managers cannot tell which partners are genuinely progressing versus quietly churning. Ensuring partners are getting the right support and resources. 
- **Unmeasured Enablement:** Teams send generic training decks without tracking whether enablement milestones actually convert passive partners into active, deal-registering sellers. 

### The Solution
The Partner Momentum Hub is an operational tracking tool built to manage the end-to-end **partner activation and enablement journey**. It gives Partner Managers visibility into where every partner sits along the activation and enablement, signed partners into active revenue contributors through structured milestones, tiered enablement, and QBR governance.

### Key Capabilities
- **Activation & Readiness Tracking:** Monitors partner progression from initial onboarding through enablement completion to active co-selling, flagging stalled partners before they go dormant.
- **7-Region Coverage & Stakeholder Mapping:** Tracks regional capacity and key cross-functional contacts across `NA`, `LATAM`, `EMEA N`, `EMEA S`, `DACH`, `GCN`, and `APAC`.
- **Tiered Enablement Execution:** Operationalizes targeted enablement motions (`1:1`, `1:Few`, `1:Many`) and tracks asset utilization against actual deal registration velocity.
---

### The Boring Stuff (Data Engineering & Tech Stack)

- **Frontend & UI:** Built and deployed on **Lovable** (React, TypeScript, Tailwind CSS)
- **Data Pipeline & Enrichment:** **Python, Pandas, and Jupyter Notebook**
  * Extracted and cleaned **604 real OpenText partner records** (`opentext_clean_partners.json`) and product categories (`opentext_clean_products.json`) from the [OpenText Partner Directory](https://www.opentext.com/partners/partner-directory).
  * Standardised membership tiers to OpenText's official 4-tier structure, migrating legacy `"Authorized"` labels to `"Bronze"`.
  * Generated synthetic activation stages, enablement completion scores, and regional pipeline metrics to simulate partner progression and dormancy alerts. In short, the operational KPIs are simulated data built on top of real partner records. In short, these are made with fake data. 

---

Designed by [Cheryl Lim](https://www.linkedin.com/in/cheryl-ai-tian-lim/)<br>
Access Demo: [Partner Momentum Hub](https://partner-momentum-hub.lovable.app)

```
