# Data Flow Diagrams

These are Mermaid approximations of a structured-analysis DFD for readers who need that view alongside UML.

## DFD Level 0 — Context

```mermaid
flowchart LR
  Pewasiat["Pewasiat"]
  Wasi["Wasi"]
  Public["Public reporter / Waris"]
  Admin["Admin / KAB Gold"]
  Legal["Legal firm"]

  System(("0<br/>Wasi Emas<br/>System"))

  D1[("D1 Users")]
  D2[("D2 Wasi Emas")]
  D3[("D3 Demise Reports")]
  D4[("D4 Wasi Claims")]
  D5[("D5 Protected files")]

  Pewasiat -->|"account, Wasi Emas form, signed PDF"| System
  System -->|"status, activation notification log"| Pewasiat

  Public -->|"death report, death certificate"| System
  System -->|"verification outcome"| Public

  Admin -->|"verify, release, fee, maintenance"| System
  System -->|"pending reports, claims, reports, counts"| Admin

  Legal -->|"timestamp, LHDN-stamped PDF"| System
  System -->|"legal queue, signed PDF"| Legal

  Wasi -->|"view appointment / claim status"| System
  System -->|"appointment and claim status"| Wasi

  System <--> D1
  System <--> D2
  System <--> D3
  System <--> D4
  System <--> D5

  classDef implemented fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef simulated fill:#fef9c3,stroke:#ca8a04,color:#713f12
  class System,D1,D2,D3,D4,D5,Pewasiat,Public,Admin,Legal,Wasi implemented
```

## DFD Level 1 — Processes and Stores

```mermaid
flowchart LR
  Pewasiat["Pewasiat"]
  Wasi["Wasi"]
  Public["Public reporter / Waris"]
  Admin["Admin / KAB Gold"]
  Legal["Legal firm"]

  P1(("1.0<br/>Auth and<br/>accounts"))
  P2(("2.0<br/>Create<br/>Wasi Emas"))
  P3(("3.0<br/>Legal<br/>activation"))
  P4(("4.0<br/>Report and verify<br/>demise"))
  P5(("5.0<br/>Claim and<br/>release"))
  P6(("6.0<br/>Fee, reports,<br/>maintenance"))

  D1[("D1 Users")]
  D2[("D2 Wasi Emas")]
  D3[("D3 Demise Reports")]
  D4[("D4 Wasi Claims")]
  D5[("D5 Protected files")]

  Pewasiat -->|"signup/login"| P1
  P1 <--> D1
  P1 -->|"session and role"| Pewasiat

  Pewasiat -->|"7-step form + signed PDF"| P2
  P2 -->|"create pending record + files"| D2
  P2 --> D5
  P2 -->|"pending verification"| P3

  Legal -->|"timestamp request"| P3
  P3 -->|"status Processing LHDN"| D2
  Legal -->|"final LHDN PDF"| P3
  P3 -->|"status Active + notification log"| D2
  P3 --> D5
  P3 -.->|"simulated activation email/SMS"| Pewasiat
  P3 -.->|"simulated activation email/SMS"| Wasi

  Public -->|"deceased NRIC + certificate"| P4
  P4 -->|"create pending report"| D3
  P4 --> D5
  Admin -->|"view certificate / verify or reject"| P4
  P4 -->|"status Verified/Rejected + matched wasiemas_id + wasi_id"| D3
  P4 -->|"read matching Wasi Emas"| D2

  Wasi -.->|"seeded claim / claim status"| P5
  Admin -->|"physical verification and release"| P5
  P5 -->|"read verified report and Wasi Emas"| D3
  P5 --> D2
  P5 -->|"status Approved & Released + audit log + notification log"| D4
  P5 -.->|"simulated waris email/SMS log"| Public

  Admin -->|"fee marking, reports, maintenance"| P6
  P6 <--> D2
  P6 <--> D1
  P6 -->|"CSV / counts / monthly activations"| Admin

  classDef implemented fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef simulated fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef seed fill:#ffedd5,stroke:#ea580c,color:#7c2d12
  class P1,P2,P3,P4,P5,P6,D1,D2,D3,D4,D5,Pewasiat,Public,Admin,Legal,Wasi implemented
```

### DFD notes

- Dashed arrows represent simulated or seed-assisted data movement.
- `P5` receives a seeded claim in the current demo. Wasi self-service claim creation is not an end-to-end path.
- `P3` is a manual/out-of-system LHDN process; the app only stores the final PDF and status.
- `P6` writes/reads fee and reporting data but does not move gold or connect to KAB Gold.
