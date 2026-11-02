# Navigation and Components

## Full Route and Role Map

```mermaid
flowchart TD
  Start(["Browser entry"]) --> Root{"Root route /"}
  Root -->|"not logged in"| Login["/login"]
  Root -->|"role = pewasiat or wasi"| Dashboard["/dashboard"]
  Root -->|"role = admin"| AdminOverview["/admin<br/>Admin Overview"]

  Login --> Dashboard
  Login -->|"email/password"| AuthStore["PocketBase auth store + AuthContext"]
  Signup["/signup"] -->|"create pewasiat account"| AuthStore
  AuthStore --> Root

  subgraph Public["Public"]
    ReportDemise["/report-demise<br/>Lapor Kematian"]
  end

  subgraph User["Pewasiat"]
    Dashboard
    CreateWasiemas["/wasiyyah/create<br/>7-step Wasi Emas wizard"]
  end

  subgraph Wasi["Wasi"]
    WasiClaim["/wasi/claim-assets<br/>secondary page; seed-assisted"]
  end

  subgraph Admin["Admin / Legal Firm submodule"]
    AdminOverview
    AdminClaims["/admin/claims<br/>death verification + claim release"]
    Legal["/admin/legal-verification<br/>timestamp + LHDN upload"]
    Fee["/admin/fee-reporting<br/>fee marking + report link"]
    Reports["/admin/reports<br/>status + monthly + CSV"]
    Maintenance["/admin/maintenance<br/>user contact maintenance"]
  end

  Dashboard --> CreateWasiemas
  Dashboard --> ReportDemise
  AdminOverview --> AdminClaims
  AdminOverview --> Legal
  AdminOverview --> Fee
  AdminOverview --> Reports
  AdminOverview --> Maintenance

  classDef implemented fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef seed fill:#ffedd5,stroke:#ea580c,color:#7c2d12
  classDef public fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
  classDef admin fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
  class Login,Signup,Dashboard,CreateWasiemas,AdminOverview,AdminClaims,Legal,Fee,Reports,Maintenance,AuthStore,Root implemented
  class ReportDemise public
  class WasiClaim seed
```

### Route notes

- `ProtectedRoute` only checks that a user is authenticated and redirects admins to `/admin`.
- `AdminRoute` requires `role = admin`.
- There is no separate `legal` role. The legal-firm page is under `/admin`.
- `/wasi/claim-assets` exists but is not the source of the seeded claim. It is limited because `demise_reports` is admin-only in the current API rules.
- The public report form does not require login.

## Frontend Component Map

```mermaid
flowchart LR
  subgraph AppShell["App shell"]
    App["App.tsx"]
    Header["Header"]
    Auth["AuthContext"]
    Theme["ThemeProvider / ModeToggle"]
    Router["HashRouter + guards"]
  end

  subgraph Pages["Pages"]
    Login["Login"]
    Signup["Signup"]
    Dashboard["Dashboard"]
    Wizard["CreateWasiyyah + Step1..Step7"]
    Report["ReportClaim"]
    WasiPage["WasiClaimAssets"]
    AdminHome["AdminOverview"]
    AdminClaimsPage["AdminClaimsDashboard"]
    LegalPage["LegalFirmDashboard"]
    FeePage["AdminFeeReporting"]
    ReportsPage["AdminReports"]
    MaintenancePage["AdminMaintenance"]
  end

  subgraph Libs["Shared libraries"]
    PB["lib/pocketbase.ts"]
    Files["lib/files.ts"]
    WasiData["lib/wasiemas.ts"]
    Email["lib/emailService.ts"]
    Types["types/database.ts + types/wasiyyah.ts"]
  end

  subgraph PocketBase["PocketBase collections"]
    Users[("users")]
    Wasiemas[("wasiemas")]
    Demise[("demise_reports")]
    Claims[("wasi_claims")]
  end

  App --> Header
  App --> Auth
  App --> Router
  App --> Theme
  Router --> Login
  Router --> Signup
  Router --> Dashboard
  Router --> Wizard
  Router --> Report
  Router --> WasiPage
  Router --> AdminHome
  Router --> AdminClaimsPage
  Router --> LegalPage
  Router --> FeePage
  Router --> ReportsPage
  Router --> MaintenancePage

  Auth --> PB
  Login --> PB
  Signup --> PB
  Dashboard --> Auth
  Wizard --> PB
  Report --> PB
  AdminClaimsPage --> PB
  AdminClaimsPage --> WasiData
  AdminClaimsPage --> Files
  AdminClaimsPage --> Email
  LegalPage --> PB
  LegalPage --> WasiData
  LegalPage --> Files
  LegalPage --> Email
  FeePage --> PB
  ReportsPage --> PB
  MaintenancePage --> PB
  WasiPage --> PB
  Wizard --> Types
  AdminClaimsPage --> Types

  PB --> Users
  PB --> Wasiemas
  PB --> Demise
  PB --> Claims

  classDef implemented fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef simulated fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef seed fill:#ffedd5,stroke:#ea580c,color:#7c2d12
  class App,Header,Auth,Theme,Router,Login,Signup,Dashboard,Wizard,Report,AdminHome,AdminClaimsPage,LegalPage,FeePage,ReportsPage,MaintenancePage,PB,Files,WasiData,Types,Users,Wasiemas,Demise,Claims implemented
  class Email simulated
  class WasiPage seed
```

### Component notes

- `lib/wasiemas.ts` parses `wasiyyah_data`, extracts wasi/waris, and matches a death report to a Wasi Emas by NRIC.
- `lib/files.ts` obtains a PocketBase file token before opening protected files.
- `lib/emailService.ts` writes notification entries and logs them; it is the simulated email/SMS boundary.
- `AdminClaimsDashboard` and `LegalFirmDashboard` both parse the embedded `wasiyyah_data` JSON rather than querying separate wasi/waris tables.
- `WasiClaimAssets` is a secondary/seed-assisted page, not the current source of the seeded claim.
