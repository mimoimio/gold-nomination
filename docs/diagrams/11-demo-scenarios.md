# Demo Scenarios and Stories

This is the practical demo script for the current implementation. It uses the seeded storylines, names, and NRICs instead of volatile record IDs.

## Seeded Storylines

| Storyline | Pewasiat | Wasi Emas | Death report | Claim | Purpose |
|---|---|---|---|---|---|
| Legal activation | Ahmad Zaha, `840510-14-5566` | Pending Verification | Pending Verification | None | Show legal queue, timestamp, final LHDN upload, and activation. |
| Claim release | Siti Aminah, `850620-10-6622` | Active with final LHDN PDF | Verified with Wasi IC | Pending Review | Show matched death report, physical release, waris log, and fee. |

**Shared Wasi:** Siti Aishah, `900101-10-1234`, `wasi@wasiemas.test`.

**Shared waris in `wasiyyah_data`:** Waris 1 and Waris 2 with `waris1@example.com` and `waris2@example.com`.

## Demo Accounts

| Purpose | Email | Password |
|---|---|---|
| App admin / KAB Gold | `admin.kab@wasiemas.test` | `AdminDemo123!` |
| Pewasiat A — Ahmad Zaha | `pewasiat.a@wasiemas.test` | `PewasiatDemo123!` |
| Pewasiat B — Siti Aminah | `pewasiat.b@wasiemas.test` | `PewasiatDemo123!` |
| Wasi — Siti Aishah | `wasi@wasiemas.test` | `WasiDemo123!` |

The PocketBase **superuser** for the dashboard/seed scripts is separate from the app admin. Do not put the superuser password in this document.

## Recommended Demo Order

1. Admin overview.
2. Legal activation of Ahmad Zaha's Wasi Emas.
3. Death report verification and Wasi Emas matching for Ahmad Zaha.
4. Claim release and waris notification for Siti Aminah.
5. Fee marking and reporting.
6. Admin maintenance.
7. Optional: security/access checks.
8. Reset the demo before the next run.

## Scenario 1 — Admin Overview

**Story:** "This is the KAB Gold/admin command centre. It shows the work waiting across legal activation, death reports, claims, and fees."

**Steps:**
1. Log in as `admin.kab@wasiemas.test`.
2. Open `/admin`.

**Expected result:**
- Pending death reports: 1
- Pending legal verification: 1
- Active Wasi Emas: 1
- Pending Wasi claims: 1
- Pending fee deductions: 1
- Registered users: 4

**What is real:** the counts come from PocketBase.
**What is not real:** nothing in this screen; it is a read-only summary.

## Scenario 2 — Legal Firm Activation

**Story:** "Ahmad Zaha submitted his signed Wasi Emas. The legal firm checks the signatures, records a timestamp, gets the LHDN stamp, and uploads the final stamped PDF. The system then activates the document and logs the activation notification."

**Steps:**
1. Open `/admin/legal-verification`.
2. Find Ahmad Zaha's pending Wasi Emas.
3. Click **Lihat Dokumen Ditandatangani** to open the protected signed PDF.
4. Click **Rekod Cap Masa**. Status becomes `Processing LHDN`.
5. Select any PDF as the final LHDN-stamped document.
6. Click **Muat Naik & Aktifkan**.
7. Observe the activation notification log.

**Expected result:**
- Status becomes `Active`.
- `final_lhdn_pdf` is stored.
- Pending legal count drops to 0.
- Notification log shows entries for the Pewasiat and the appointed Wasi.

**What is real:** timestamp status, final PDF upload, status `Active`, protected file access, notification-log write.
**What is manual:** LHDN stamping.
**What is simulated:** the email/SMS entries. No real email or SMS is sent.

## Scenario 3 — Public Report and Death Verification

**Story:** "A waris reports Ahmad Zaha's death. The admin checks the death certificate and confirms that Ahmad has a Wasi Emas and that Siti Aishah is the appointed Wasi."

### Option A — Use the pre-seeded pending report

1. Log in as admin.
2. Open `/admin/claims`.
3. In the pending death-report table, find Ahmad Zaha's NRIC `840510-14-5566`.
4. Click **Sijil** to view the death certificate.
5. Confirm the matched Wasi Emas and appointed Wasi are displayed.
6. Click **Sahkan**, enter verification notes, and confirm.

**Expected result:**
- Report status becomes `Verified`.
- `wasiemas_id` and `wasi_id` are saved.
- Report disappears from the pending table.
- Pending death reports count drops to 0.

### Option B — Demonstrate the public form

1. Log out or open `/report-demise`.
2. Submit a death report for a dummy NRIC such as `999999-99-9999`.
3. Log in as admin and open `/admin/claims`.
4. The dummy report appears with **Tiada padanan**.
5. Click **Tolak** and enter a reason.

**Expected result:**
- Public report creation works.
- Unmatched report can be rejected.
- Rejection does not send a notification.

**What is real:** public create, certificate view, matching, verify/reject.
**What is simulated:** nothing in the verification itself.
**What is manual:** the admin's visual check of the certificate.

## Scenario 4 — Claim Release and Waris Notification

**Story:** "Siti Aminah's Wasi Emas is active. The appointed Wasi has a pending claim. The admin verifies the Wasi's physical IC at KAB Gold HQ, releases the assets, and records the waris notification."

**Steps:**
1. Open `/admin/claims`.
2. In the claim table, find Siti Aishah's pending claim.
3. Open the death certificate and Wasi IC.
4. Click **Sahkan IC & Lepaskan**.
5. Enter physical verification notes and confirm.
6. Observe the waris notification log.

**Expected result:**
- Claim status becomes `Approved & Released`.
- Physical verification fields and `audit_log` are written.
- Claim disappears from pending claims.
- Notification log shows waris1 and waris2 on email and SMS channels.

**What is real:** claim validation against `wasiyyah_data.wasi_list`, physical verification record, release status, audit log, notification log.
**What is manual:** physical IC verification.
**What is simulated:** waris email/SMS.
**What is seed-assisted:** the pending claim already exists; the Wasi does not submit it through the current UI.
**What is deferred:** actual gold transfer/balance update and early notification at claim submission.

## Scenario 5 — Fee and Reporting

**Story:** "KAB Gold needs a record of active Wasi Emas and fees. The admin marks the fee as deducted and exports a monthly report."

**Steps:**
1. Open `/admin/fee-reporting`.
2. Find the active Wasi Emas with the RM100 fee.
3. Click **Tanda Fi Ditolak** and confirm.
4. Open `/admin/reports`.
5. Show the status counts and monthly activation table.
6. Click **Eksport CSV**.

**Expected result:**
- Fee record disappears from the pending fee list.
- `fee_deducted`, `fee_deducted_at`, and `fee_deducted_by` are written.
- Report shows all Wasi Emas statuses and monthly activations.
- CSV downloads.

**What is real:** fee flag, fee report, monthly report, CSV.
**What is not real:** no gold deduction and no payment gateway.
**What is deferred:** KAB Gold login panel/SSO. The report/CSV is the current substitute.

**Demo note:** after activating Ahmad Zaha's Wasi Emas, the fee page may show a second active record with **Belum ditetapkan** because the legal activation does not assume a fee amount. Only Siti Aminah's seeded record has RM100. This is intentional; the fee amount is not confirmed by the client.

## Scenario 6 — Admin Maintenance

**Story:** "A user calls to update their contact details. The admin searches and updates the record."

**Steps:**
1. Open `/admin/maintenance`.
2. Search by name, NRIC, or email.
3. Edit phone or address.
4. Click **Simpan**.

**Expected result:**
- The user record is updated in PocketBase.

**What is real:** user contact fields.
**What is partial:** editing the address inside `wasiyyah_data` or the Wasi Emas document is not implemented.

## Scenario 7 — Security and Access Checks (Optional)

**Story:** "The system is not only role-gated in the UI; PocketBase rules enforce access to records and files."

**Checks:**

```powershell
# Remote example
$env:PB_URL='https://gold-nomination.pockethost.io'
node scripts/verify-local-demo.mjs
node scripts/verify-files.mjs
Remove-Item Env:PB_URL
```

**Expected result:**
- Anonymous users list: 0.
- Anonymous protected-file access: 404.
- Admin and Wasi access succeed.
- Public report creation works.
- Forced `Verified` status on public creation is rejected.

**What is real:** API rules, file-token protection, role-based access.

## Scenario 8 — Reset Before Demo

Run this before a clean demo. It deletes all app users and Wasi Emas/claim/death-report records and reseeds the storylines. It does not delete superusers or collections.

```powershell
cd frontend
$env:PB_URL='https://gold-nomination.pockethost.io'
$env:PB_SUPERUSER_EMAIL='admin@wasiemas.test'
$env:PB_SUPERUSER_PASSWORD='<superuser password>'
$env:RESET_ALL='true'
node scripts/seed-local-demo.mjs

Remove-Item Env:PB_URL
Remove-Item Env:PB_SUPERUSER_EMAIL
Remove-Item Env:PB_SUPERUSER_PASSWORD
Remove-Item Env:RESET_ALL
```

For local:

```powershell
$env:PB_URL='http://127.0.0.1:8090'
$env:PB_SUPERUSER_PASSWORD='<superuser password>'
$env:RESET_ALL='true'
node scripts/seed-local-demo.mjs
```

After reset, record IDs change. Use names and NRICs in the demo, not IDs.

## What Not to Demo Yet

- Wasi self-service claim creation.
- Real email or SMS delivery.
- LHDN integration.
- Actual gold transfer or gold balance deduction.
- QR/OTP.
- Payment gateway.
- KAB Gold login panel/SSO.
- Separate legal-firm role.
- Claim rejection or Wasi Emas revocation.
- Early waris notification at claim submission.
- User document library or verified-document download.
- One-time Wasi/Waris briefing session.
- Hibah Emas or Waqf.

## One-Sentence Story for the Supervisor

"The current system demonstrates the full administrative record lifecycle for Wasi Emas: Pewasiat creates and uploads a signed document, legal/admin activates it after LHDN upload, the public reports a death, admin verifies and matches the deceased to the Wasi Emas, the Wasi claim is physically verified and released, and waris notifications, fees, and reports are recorded. Email/SMS, LHDN, and gold transfer are represented as logs/manual steps rather than external integrations."
