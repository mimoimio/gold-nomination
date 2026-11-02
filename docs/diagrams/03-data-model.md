# Data Model

## UML Class Diagram

```mermaid
classDiagram
  class User {
    +string id
    +string email
    +string full_name
    +string nric_number
    +string role
    +float total_gold_balance
    +bool verified
    +string phone
    +string address
    +datetime created
    +datetime updated
  }

  class Wasiemas {
    +string id
    +string pewasiat_id
    +string pewasiat_nric
    +string[] wasi_ids
    +json wasiyyah_data
    +file signed_document_pdf
    +file final_lhdn_pdf
    +string status
    +bool fee_deducted
    +float fee_amount
    +datetime fee_deducted_at
    +string fee_deducted_by
    +datetime activated_at
    +json notification_log
    +datetime created
    +datetime updated
  }

  class WasiyyahData {
    +PewasiatInfo pewasiat
    +WasiEntry[] wasi_list
    +string wasi_execution
    +Aset aset
    +WarisEntry[] waris_list
    +Duties duties
    +SaksiEntry[] saksi_list
  }

  class PewasiatInfo {
    +string release_type
    +bool use_yusuf_advisory
  }

  class WasiEntry {
    +string name
    +string nric
    +string phone
    +string email
    +string address
    +string relationship
  }

  class WarisEntry {
    +string name
    +string nric
    +string relationship
    +string address
    +string email
    +string phone
  }

  class SaksiEntry {
    +string name
    +string nric
    +string address
  }

  class Aset {
    +bool uncang_emas
    +bool other_assets
  }

  class Duties {
    +number[] hold_HibahEmas
    +number[] apply_probate
    +number[] update_info
    +number[] pay_debts
    +number[] faraid_distribution
    +number[] child_guardian
  }

  class DemiseReport {
    +string id
    +string deceased_nric
    +string reporter_name
    +string reporter_contact
    +file death_certificate
    +file wasi_ic
    +string status
    +string wasiemas_id
    +string wasi_id
    +datetime verified_at
    +string verified_by
    +string verification_notes
    +datetime created
    +datetime updated
  }

  class WasiClaim {
    +string id
    +string wasi_id
    +string demise_report_id
    +string wasiemas_id
    +string status
    +datetime preverified_at
    +datetime physical_verified_at
    +string physical_verified_by
    +string physical_verification_notes
    +string audit_log
    +json notification_log
    +datetime created
    +datetime updated
  }

  User "1" --> "0..*" Wasiemas : pewasiat_id
  User "0..*" --> "0..3" Wasiemas : wasi_ids
  Wasiemas "1" *-- "1" WasiyyahData : embeds JSON
  WasiyyahData *-- "1" PewasiatInfo
  WasiyyahData *-- "1..3" WasiEntry
  WasiyyahData *-- "0..*" WarisEntry
  WasiyyahData *-- "2..4" SaksiEntry
  WasiyyahData *-- "1" Aset
  WasiyyahData *-- "1" Duties

  User "0..*" --> "0..*" DemiseReport : wasi_id / verified_by
  Wasiemas "0..1" --> "0..*" DemiseReport : wasiemas_id
  User "1" --> "0..*" WasiClaim : wasi_id / physical_verified_by
  Wasiemas "1" --> "0..*" WasiClaim : wasiemas_id
  DemiseReport "1" --> "0..*" WasiClaim : demise_report_id

  note for Wasiemas "status values:<br/>Pending Verification<br/>Processing LHDN<br/>Active<br/>Revoked"
  note for DemiseReport "status values:<br/>Pending Verification<br/>Verified<br/>Rejected"
  note for WasiClaim "status values:<br/>Pending Review<br/>Approved & Released<br/>Rejected"
  note for WasiyyahData "This is a JSON field inside wasiemas.<br/>Wasi, waris, and saksi are not separate tables."
```

### Model notes

- `wasiyyah_data` is stored as a JSON object inside `wasiemas`. It is not a relational table.
- `wasi_ids` is a multi-relation to `users`, but the full wasi details remain in the JSON.
- `demise_reports.wasiemas_id` and `wasi_id` are stored as relations after the admin verifies and matches the report.
- `notification_log` is a JSON array of `{ channel, recipient, subject, sent_at }` entries. It is a record of simulated notification activity, not proof that an email/SMS was delivered.
- `audit_log` is plain text appended by the release action.

## ERD

```mermaid
erDiagram
  USERS ||--o{ WASIEMAS : "pewasiat_id"
  USERS }o--o{ WASIEMAS : "wasi_ids"
  USERS ||--o{ DEMISE_REPORTS : "wasi_id"
  USERS ||--o{ DEMISE_REPORTS : "verified_by"
  WASIEMAS ||--o{ DEMISE_REPORTS : "wasiemas_id"
  USERS ||--o{ WASI_CLAIMS : "wasi_id"
  USERS ||--o{ WASI_CLAIMS : "physical_verified_by"
  WASIEMAS ||--o{ WASI_CLAIMS : "wasiemas_id"
  DEMISE_REPORTS ||--o{ WASI_CLAIMS : "demise_report_id"

  USERS {
    string id PK
    string email
    string full_name
    string nric_number
    string role
    number total_gold_balance
    bool verified
    string phone
    string address
  }

  WASIEMAS {
    string id PK
    string pewasiat_id FK
    string pewasiat_nric
    json wasiyyah_data
    file signed_document_pdf
    file final_lhdn_pdf
    string status
    bool fee_deducted
    number fee_amount
    datetime activated_at
    json notification_log
  }

  DEMISE_REPORTS {
    string id PK
    string deceased_nric
    file death_certificate
    file wasi_ic
    string status
    string wasiemas_id FK
    string wasi_id FK
    datetime verified_at
    string verified_by FK
    string verification_notes
  }

  WASI_CLAIMS {
    string id PK
    string wasi_id FK
    string demise_report_id FK
    string wasiemas_id FK
    string status
    datetime preverified_at
    datetime physical_verified_at
    string physical_verified_by FK
    string audit_log
    json notification_log
  }
```

### ERD notes

- `WASIEMAS.wasiyyah_data` contains the embedded `wasi_list`, `waris_list`, and `saksi_list`. It is intentionally not normalised into separate relational tables.
- The same `users` collection is used for Pewasiat, Wasi, and Admin accounts.
- A `Wasiemas` record can have up to three Wasi users in `wasi_ids`, but the Wasi details used for PDF generation and notifications are read from the JSON.
- `demise_reports` can exist without a matched Wasi Emas until the admin verifies it. The current UI matches by `deceased_nric` against `wasiemas.pewasiat_nric`.
- `wasi_claims` is the claim/release record. Physical verification is represented by fields, not by a separate verification table.
