# System Context and Deployment

## System Context (C4-inspired)

```mermaid
flowchart LR
  subgraph Actors
    P["Pewasiat<br/>account holder"]
    W["Wasi<br/>appointed trustee"]
    R["Public reporter / Waris"]
    A["Admin / KAB Gold"]
    L["Legal firm<br/>admin submodule"]
  end

  subgraph System["Wasi Emas System"]
    SPA["React SPA<br/>React 19 + Vite + Tailwind"]
    PB["PocketBase API<br/>remote pockethost or local 8090"]
    FS["Protected file storage<br/>signed PDF, LHDN PDF, death cert, Wasi IC"]
    LOG["Notification log<br/>email/SMS entries recorded, not sent"]
    RULES["PocketBase API rules<br/>role and file access control"]
  end

  subgraph Deferred["Deferred integrations"]
    QR["QR / OTP verification"]
    PAY["Payment gateway"]
    KAB["KAB Gold login panel / SSO"]
  end

  P -->|"Cipta Wasi Emas + upload signed PDF"| SPA
  R -->|"Lapor Kematian + upload death certificate"| SPA
  W -->|"View appointment and claim status"| SPA
  A -->|"Verify death, release claim, fee, reports, maintenance"| SPA
  L -->|"Timestamp and upload LHDN-stamped PDF"| SPA

  SPA -->|"REST + auth token"| PB
  PB --> RULES
  PB --> FS
  SPA --> LOG

  P -.->|"deferred"| QR
  A -.->|"deferred"| PAY
  A -.->|"deferred"| KAB

  classDef implemented fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef simulated fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef deferred fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
  class SPA,PB,FS,RULES,P,W,R,A,L implemented
  class LOG simulated
  class QR,PAY,KAB deferred
```

### What to notice

- The SPA talks directly to PocketBase. There is no custom backend service.
- The legal firm is not a separate role. It is the same admin role using the legal-verification page.
- Email/SMS is represented by `emailService`, which writes notification entries and updates `notification_log`; it does not call a real provider.
- LHDN stamping is a manual file step. The app only records the timestamp/status and stores the uploaded final document.
- The deferred integrations are shown with dashed arrows so they are not confused with implemented flows.

## Deployment

```mermaid
flowchart LR
  subgraph Development
    Dev["Developer browser"]
    Vite["Vite dev server<br/>localhost:5173"]
    LocalPB["Local PocketBase<br/>127.0.0.1:8090"]
    LocalFiles[("Local pb_data storage")]
  end

  subgraph Production["GitHub Pages production"]
    GHA["GitHub Actions<br/>Node 22 + npm ci + npm run build"]
    Pages["Static SPA bundle<br/>dist/"]
    Visitor["Public visitor"]
    RemotePB["PocketBase<br/>gold-nomination.pockethost.io"]
    RemoteFiles[("Remote file storage")]
  end

  Dev --> Vite
  Vite -->|"VITE_PB_URL=http://127.0.0.1:8090"| LocalPB
  LocalPB --> LocalFiles

  GHA -->|"VITE_PB_URL=https://gold-nomination.pockethost.io"| Pages
  Visitor --> Pages
  Pages -->|"HTTPS REST + auth token"| RemotePB
  RemotePB --> RemoteFiles

  classDef implemented fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef simulated fill:#fef9c3,stroke:#ca8a04,color:#713f12
  class Vite,LocalPB,LocalFiles,GHA,Pages,Visitor,RemotePB,RemoteFiles,Dev implemented
```

### Deployment notes

- `frontend/src/lib/pocketbase.ts` defaults to the remote pockethost URL.
- `.env.local` can override the URL for local development.
- The GitHub Pages workflow sets `VITE_PB_URL` explicitly during the build.
- Remote and local PocketBase schemas are kept in sync through migrations and the remote schema setup script.
- Protected files are not public URLs. The frontend calls `pb.files.getToken()` and appends the token when opening a protected file.
