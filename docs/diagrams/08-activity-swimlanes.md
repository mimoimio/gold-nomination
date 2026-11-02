# Activity / Swimlane Flows

These are Mermaid flowchart approximations of BPMN-style swimlanes. They are intended to show who does what, not strict BPMN notation.

## 1. Wasi Emas Lifecycle — Pewasiat to Legal Activation to Fee

```mermaid
flowchart TD
  subgraph Pewasiat["Pewasiat"]
    P1([Start])
    P2["Fill 7-step wizard"]
    P3["Generate PDF"]
    P4["Print and sign physically<br/>in front of saksi"]
    P5["Upload signed PDF"]
    P6["Receive activation<br/>notification log"]
  end

  subgraph System["System / PocketBase"]
    S1["Create wasiemas<br/>status Pending Verification"]
    S2["Store wasiyyah_data JSON<br/>+ signed PDF"]
    S3["Update status<br/>Processing LHDN"]
    S4["Update status Active<br/>+ final LHDN PDF"]
    S5["Write activation<br/>notification_log"]
  end

  subgraph Legal["Admin / Legal Firm"]
    L1["Open legal queue"]
    L2["View signed PDF"]
    L3["Record timestamp"]
    L4["LHDN stamping<br/>manual / out-of-system"]
    L5["Upload final<br/>LHDN-stamped PDF"]
  end

  subgraph KAB["KAB Gold / Admin"]
    K1["Fee report / mark fee deducted"]
  end

  P1 --> P2 --> P3 --> P4 --> P5
  P5 --> S1 --> S2 --> L1
  L1 --> L2 --> L3 --> S3
  S3 --> L4 --> L5 --> S4
  S4 --> S5
  S4 --> K1

  S5 -.->|"simulated email/SMS log"| P6
  L4 -.->|"manual"| L5

  classDef implemented fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef simulated fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef manual fill:#ffedd5,stroke:#ea580c,color:#7c2d12
  classDef deferred fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
  class P1,P2,P3,P4,P5,P6,S1,S2,S3,S4,S5,L1,L2,L3,L5,K1 implemented
  class L4 manual
```

### What is real here

- The wizard, PDF generation, signed-PDF upload, legal timestamp, final LHDN upload, status transition, and notification log are implemented.
- LHDN stamping is manual.
- The activation email/SMS is a simulation recorded in `notification_log`.
- The legal firm is an admin submodule, not a separate role.
- Fee is a report/mark action, not a gold deduction.

## 2. Death Claim Lifecycle — Public Report to Release

```mermaid
flowchart TD
  subgraph Public["Public reporter / Waris"]
    R1([Someone reports a death])
    R2["Enter deceased NRIC,<br/>reporter details"]
    R3["Upload death certificate"]
    R4["Submit report"]
    R5["Receive waris<br/>notification log"]
  end

  subgraph Admin["Admin / KAB Gold"]
    A1["Open /admin/claims"]
    A2["View death certificate"]
    A3["Verify or reject"]
    A4["Open pending claim"]
    A5["View death cert / Wasi IC"]
    A6["Confirm physical IC<br/>and release"]
  end

  subgraph Wasi["Wasi"]
    W1["Seeded Pending Review claim"]
    W2["Self-service claim creation<br/>deferred"]
  end

  subgraph System["System / PocketBase"]
    S1["Create demise_report<br/>Pending Verification"]
    S2["Match deceased NRIC<br/>to wasiemas"]
    S3["Update report<br/>Verified / Rejected"]
    S4["Read pending claim"]
    S5["Update claim Approved & Released<br/>audit_log + notification_log"]
  end

  subgraph KAB["KAB Gold"]
    K1["Release recorded"]
    K2["Actual gold transfer<br/>deferred"]
  end

  R1 --> R2 --> R3 --> R4 --> S1
  S1 --> A1
  A1 --> A2
  A1 --> S2
  A2 --> A3 --> S3
  S2 --> A3

  W1 --> S4
  W2 -.->|"deferred"| S4
  S4 --> A4 --> A5 --> A6
  A6 --> S5 --> K1
  K1 -.->|"deferred"| K2

  S5 -.->|"simulated waris email/SMS log"| R5

  classDef implemented fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef simulated fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef manual fill:#ffedd5,stroke:#ea580c,color:#7c2d12
  classDef deferred fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
  classDef seed fill:#ffedd5,stroke:#ea580c,color:#7c2d12
  class R1,R2,R3,R4,R5,A1,A2,A3,A4,A5,A6,S1,S2,S3,S4,S5,K1 implemented
  class W1 seed
  class W2,K2 deferred
  class S5 simulated
```

### What is real here

- Public reporting, certificate viewing, admin verification/rejection, matching, physical verification recording, release status, audit log, and waris notification log are implemented.
- The pending claim is seeded. The Wasi does not create it through the current UI.
- Physical IC verification is a recorded admin action, not a scanner/reader integration.
- "Release" records the decision; it does not move gold or update balances.
- Waris notification is a simulated email/SMS log.
- Early waris notification at claim submission is not implemented.
- Claim rejection and Wasi Emas revocation are schema-only/deferred.
