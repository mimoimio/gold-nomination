# Sequence Diagrams

## 1. Legal Firm Activation

This is the path from a signed Wasi Emas PDF to an `Active` record.

```mermaid
sequenceDiagram
  autonumber
  actor P as Pewasiat
  participant SPA as React SPA
  participant PB as PocketBase
  actor L as Admin / Legal Firm
  participant N as emailService / notification log

  P->>SPA: Complete 7-step Wasi Emas wizard
  SPA->>SPA: Generate PDF with jsPDF
  P->>P: Print and sign physically in front of saksi
  P->>SPA: Upload signed PDF
  SPA->>PB: Create wasiemas (status Pending Verification, wasiyyah_data, signed PDF)
  PB-->>SPA: Record created
  SPA-->>P: "Wasi Emas berjaya dihantar"

  L->>SPA: Open /admin/legal-verification
  SPA->>PB: Fetch pending + Processing LHDN wasiemas
  PB-->>SPA: Queue with pewasiat and wasi data
  L->>SPA: Open signed document
  SPA->>PB: Get protected-file token
  PB-->>SPA: Token
  SPA-->>L: Signed PDF in new tab

  L->>SPA: Record timestamp
  SPA->>PB: Update status to Processing LHDN
  PB-->>SPA: Updated

  Note over L,PB: LHDN stamping is manual / out-of-system.<br/>The app does not call LHDN.

  L->>SPA: Select final LHDN-stamped PDF
  SPA->>N: Build activation notification entries
  N-->>SPA: Email/SMS log entries (simulated)
  SPA->>PB: Update final_lhdn_pdf, status Active, activated_at, notification_log
  PB-->>SPA: Active record
  SPA-->>L: Activation notification log

  Note over SPA,N: No real email or SMS is sent.<br/>The log is a prototype record.
```

### Status coverage

- `Pending Verification -> Processing LHDN`: implemented.
- `Processing LHDN -> Active`: implemented.
- `Active -> Revoked`: schema only; no UI action. Deferred.
- Activation email/SMS: simulated by notification-log entries.

## 2. Death Report Verification and Wasi Emas Matching

```mermaid
sequenceDiagram
  autonumber
  actor R as Public reporter / Waris
  participant SPA as React SPA
  participant PB as PocketBase
  actor A as Admin / KAB Gold

  R->>SPA: Submit deceased NRIC, reporter details, death certificate
  SPA->>PB: Create demise_reports (status Pending Verification)
  PB-->>SPA: Pending report
  SPA-->>R: "Laporan Kematian Dihantar"

  A->>SPA: Open /admin/claims
  SPA->>PB: Fetch pending death reports
  SPA->>PB: Fetch wasiemas with pewasiat and wasi expansion
  PB-->>SPA: Reports + Wasi Emas records
  SPA->>SPA: Match report.deceased_nric to wasiemas.pewasiat_nric

  A->>SPA: View death certificate
  SPA->>PB: Get protected-file token
  PB-->>SPA: Token
  SPA-->>A: Certificate in new tab

  alt Verify
    A->>SPA: Confirm certificate and add notes
    SPA->>PB: Update status Verified, wasiemas_id, wasi_id, verified_at, verified_by, notes
    PB-->>SPA: Verified report
    SPA-->>A: Report removed from pending list
  else Reject / return
    A->>SPA: Add rejection notes
    SPA->>PB: Update status Rejected and verification_notes
    PB-->>SPA: Rejected report
    SPA-->>A: Report removed from pending list
  end

  Note over SPA,PB: Matching is currently done in the SPA.<br/>It is not a server-side PocketBase hook.
  Note over A,R: Rejection does not send a notification to the reporter or waris.
```

### Status coverage

- `Pending Verification -> Verified`: implemented.
- `Pending Verification -> Rejected`: implemented.
- No transition back from `Verified` or `Rejected` in the current UI.
- The matched Wasi Emas can still be `Pending Verification` at this stage. The claim/release flow requires a separate active Wasi Emas.

## 3. Wasi Claim and Asset Release

The current demo claim is **seeded**. The Wasi self-service claim path is deferred.

```mermaid
sequenceDiagram
  autonumber
  actor A as Admin / KAB Gold
  participant SPA as React SPA
  participant PB as PocketBase
  participant N as emailService / notification log
  actor W as Wasi

  Note over W,PB: Seed-assisted: a Pending Review claim already exists<br/>for the active Wasi Emas.
  W-->>PB: (Deferred) Wasi self-service claim creation
  A->>SPA: Open /admin/claims
  SPA->>PB: Fetch pending wasi_claims with wasi, report, wasiemas expansion
  PB-->>SPA: Pending claim

  A->>SPA: Open death certificate / Wasi IC
  SPA->>PB: Get protected-file token
  PB-->>SPA: Token
  SPA-->>A: Protected files in new tab

  A->>SPA: Confirm physical IC verification + notes
  SPA->>SPA: Validate Wasi against wasiyyah_data.wasi_list
  SPA->>N: Build waris notification entries from wasiyyah_data.waris_list
  N-->>SPA: Email/SMS log entries (simulated)
  SPA->>PB: Update status Approved & Released, physical fields, audit_log, notification_log
  PB-->>SPA: Released claim
  SPA-->>A: Notification log visible
  SPA-->>A: Claim removed from pending list

  Note over SPA,PB: No gold transfer or balance update occurs.<br/>The release is recorded through status, audit log, and notification log.
  Note over SPA,N: No real email or SMS is sent.
```

### Status coverage

- `Pending Review -> Approved & Released`: implemented.
- `Pending Review -> Rejected`: schema only; no UI action. Deferred.
- `preverified_at`, `physical_verified_at`, and `physical_verified_by` are fields, not separate statuses.
- The Wasi appointment check is done by comparing the claim's Wasi NRIC/email to `wasiyyah_data.wasi_list`.
- The Wasi Emas status is not changed by release.
