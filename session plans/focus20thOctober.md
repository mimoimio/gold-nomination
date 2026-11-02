Given the 20 Oct meeting, your admin scope is clear:

- Legal-firm activation: timestamp → LHDN stamping → upload final PDF → status `Active` → email pewasiat and wasi.
- Death claims: view death certificate → verify/reject → match to the Wasi Emas record and appointed wasi.
- Wasi claim: online IC pre-verification → physical IC verification at the office → release → notify waris.
- Admin maintenance: edit user/record information such as address.
- Admin reporting: counts by status, activated/endorsed totals, daily/monthly report for KAB Gold.
- Fee/KAB Gold: deduction or report basis; no payment gateway.
- BM terminology.

Dr. Najahan explicitly said a draft/progress is enough for this round (`20Oct2026.md:335`), and the next meeting is **3 Nov**. So do not try to finish the whole admin module. Make one credible admin story work end-to-end, and be honest about what is deferred.

## Immediate sequence

### 0. Unblock the data layer first — 1 to 2 hours

Do this before touching more UI.

- In PocketBase admin, add/verify:
  - `wasiemas.fee_deducted` (bool)
  - `wasiemas.final_lhdn_pdf` (file)
  - `wasiemas.status` includes `Processing LHDN`
  - optional: `activated_at`, `verified_at`, `verified_by`
- Lock API rules now:
  - `users`: list/view only self or admin; create allowed for signup but force `role = pewasiat` and `total_gold_balance = 0`.
  - `wasiemas`: owner pewasiat + admin; create only pewasiat; update admin/legal.
  - `wasi_claims`: wasi owner + admin; create wasi only; update admin.
  - `demise_reports`: public create only; list/view admin/legal; update admin/legal.
  - Mark PDFs and death certificates as protected files.
- Fix demo data:
  - Change one existing `investor` user to `pewasiat`.
  - Create one `wasi` test account.
  - Seed one Wasi Emas with `wasiyyah_data` containing the wasi email and two waris emails/phones.
  - Seed one death report for the same NRIC.
  - Seed or walk through one `wasi_claims` record.

**Done when:** anonymous `/users` no longer returns records, and the admin screens show seeded data instead of empty states.

### 1. Fix the demo blockers — 30 to 60 minutes

- `Dashboard.tsx:56` → change `/user/claim` to `/report-demise`.
- `CreateWasiyyah.tsx:28` and `:78` → hide/disable the bottom “Selesai & Hantar” on step 7 so upload is the only submission path.
- If you want activation emails in the demo, add the missing wasi email input in `Step2Wasi`. The type already has `email`; the form does not render it.

**Done when:** create → upload → record appears; no dead route and no bypass.

### 2. Admin overview + death claims — 2 to 3 hours

This is the most important screen for the next meeting.

- Add `/admin` overview with KPI cards:
  - pending death reports
  - pending legal verification
  - active Wasi Emas
  - pending wasi claims
  - pending fee deductions
- Add an “Admin” link in the header.
- In `AdminClaimsDashboard`:
  - Wire “View Cert” to `pb.files.getUrl(report, report.death_certificate)`.
  - When viewing a report, fetch `wasiemas` with `expand: 'pewasiat_id'` and match `pewasiat_id.nric_number === report.deceased_nric`.
  - Show the matched Wasi Emas and the appointed wasi from `wasiyyah_data.wasi_list`.
  - Add verify and reject/return actions.
  - If the `demise_reports.wasiemas_id` field exists, save the match when verifying.

**Done when:** admin can open the certificate, see “Matched Wasi Emas + appointed Wasi”, and verify or reject.

### 3. Claim, release, and waris notification — 2 hours

- In the claim screen/admin view, show the wasi IC and a pre-verification state.
- Add a physical verification checkbox/notes field for the admin.
- On release:
  - update `wasi_claims.status` to `Approved & Released`;
  - append an audit log entry with date/officer/notes;
  - parse `wasiyyah_data.waris_list` and send notifications to the real emails/phones;
  - show a visible “Notification log” list (recipient, channel, time).
- Do not zero real user balances. For the demo, only zero the seeded user; otherwise record the release in the audit log.

**Done when:** one claim goes `Pending Review → physical verified → Approved & Released`, and the waris notification log shows the seeded waris.

### 4. Legal-firm activation — 2 hours

- `LegalFirmDashboard`:
  - replace the dummy file with a real file input;
  - upload to `final_lhdn_pdf`;
  - move `Pending Verification → Processing LHDN → Active`;
  - parse `wasiyyah_data.wasi_list` and send activation emails to the actual wasi list plus pewasiat;
  - show the same notification log.

**Done when:** pending document → timestamp → final LHDN PDF upload → Active → emails logged to the actual wasi/pewasiat.

### 5. Reporting and fee — 1 to 2 hours

- Add a simple admin report:
  - counts by status (`Pending Verification`, `Processing LHDN`, `Active`, `Revoked`);
  - monthly activations;
  - CSV export.
- Fix `AdminFeeReporting`:
  - add `fee_deducted`;
  - remove the failing fallback;
  - show active Wasi Emas awaiting deduction;
  - mark deducted and show a count/total.
- For now, make it a **report/CSV**, not a KAB Gold login panel. That matches Puan Joharia’s preference and avoids the payment-gateway cost/security issue.

**Done when:** counts and monthly table render, CSV downloads, and the fee list works without demo fallback.

### 6. Maintenance and BM — only if time remains

- Add a simple admin search by NRIC and edit contact/address.
- Translate the admin screens you touch to BM.
- Do not refactor the whole app’s language now.

## If the meeting is tomorrow

Do **steps 0–4**. That gives you a credible admin story:

1. Admin overview with counts.
2. Death certificate verified and matched to a Wasi Emas.
3. Wasi claim physically released.
4. Waris notification log.
5. Legal firm final upload and activation.

If you only have a few hours, do **step 0, step 1, and step 2**, then show the rest as the next sprint. Dr. Najahan said a draft is acceptable; a working verify/match/release path is much stronger than many half-finished screens.

## What to defer, and how to explain it

- **QR/OTP:** defer; 20 Oct leaned toward email instead of OTP.
- **Payment gateway:** defer; use deduction/report basis.
- **KAB Gold login panel:** defer; provide monthly CSV/report first.
- **Separate legal-firm role:** keep legal verification under admin for now; add a `legal` role later.
- **Automatic wasi account invitation:** seed a wasi account for the demo; implement invitation after admin.
- **Full BM refactor:** translate admin screens only.
- **Maintenance:** include only if time.

This keeps you aligned with the academics’ scope-control concern.

## Two questions before I turn this into an implementation plan

1. Is the 3 Nov meeting still happening tomorrow, or do you have the full two-week window?
2. Should the legal-firm screen remain an admin submodule for now, or do you want a separate `legal` role in this sprint?

Once you confirm, I can implement steps 0–2 first, then 3–4.


are you able to change them and seed data in @backend\ the pocketbase?

Yes — **for the local backend** in `backend/`, I can do this once you switch me out of plan mode. I cannot modify the live `gold-nomination.pockethost.io` backend without its superuser/admin credentials.

## What I can do locally

- Create/update the missing collections: `wasiemas`, `wasi_claims`.
- Add fields: `final_lhdn_pdf`, `fee_deducted`, `activated_at`, and `wasiemas_id` on `demise_reports`.
- Add `Processing LHDN` to the `wasiemas.status` select.
- Set PocketBase API rules to private/role-based access.
- Generate proper migration files so the schema is reproducible.
- Create demo users, Wasi Emas records, demise reports, and claims.
- Generate dummy signed PDFs/death certificates for seeding.
- Start the local PocketBase server, apply migrations, seed via the API, and verify the results.
- Point the frontend at local PocketBase via an env-based URL instead of the hardcoded remote URL.

## Important constraint

The frontend currently points to the remote pockethost backend:

`frontend/src/lib/pocketbase.ts:2`

So if I seed the local backend but leave that line unchanged, the app will still show the remote data. For a safe 3 Nov demo, I recommend:

1. Seed the **local** backend.
2. Switch the frontend to local via `VITE_PB_URL` with the remote as fallback.
3. Demo locally with fake data.
4. Mirror the schema/rules to pockethost later through its admin UI or with credentials you provide.

## Proposed local setup plan

1. **Back up `backend/pb_data`** before any changes.
2. Start local PocketBase on `127.0.0.1:8090`.
3. Create or upsert a local superuser (or use the existing one if you give me the login).
4. Create the collections/fields and apply secure rules.
5. Generate a migration snapshot into `backend/pb_migrations`.
6. Seed:
   - one `pewasiat` demo user,
   - one `wasi` demo user,
   - one `admin` demo user,
   - one `wasiemas` record with a real-looking `wasiyyah_data` JSON containing wasi email and two waris emails/phones,
   - one matching `demise_reports` record,
   - one `wasi_claims` record,
   - dummy signed PDF and death certificate files.
7. Verify through the API that:
   - anonymous users cannot list `users`,
   - only the correct roles can read/update each collection,
   - the admin can see the seeded certificate, matched Wasi Emas, appointed wasi, claim, and waris.
8. Switch the frontend to local and run the demo script.

## Rules I would apply

- `users`: list/view only self or admin; signup restricted to `pewasiat`; role/balance not user-controlled.
- `wasiemas`: owner pewasiat + admin; create only pewasiat; update admin.
- `wasi_claims`: wasi owner + admin; create only wasi; update admin.
- `demise_reports`: public create only; list/view/update admin; no public listing of death certificates.
- Files: protected.

For now I would keep the legal firm as an **admin submodule**, not add a separate `legal` role yet, unless you want that in this sprint.

## What I need from you

1. Should I seed **local only**, or do you also want the remote pockethost backend changed?
2. If local, may I switch `frontend/src/lib/pocketbase.ts` to an env-based URL and use `VITE_PB_URL=http://127.0.0.1:8090`?
3. Do you have the existing local superuser password, or should I create a local dev superuser with a generated password?
4. Should I create new demo accounts with known passwords, or reuse the existing local `adib@gmail.com` (pewasiat) and `danish@gmail.com` (wasi)? I don’t know their passwords.
5. If you need the remote backend changed, please provide the pockethost admin login/API token or apply the schema/rules yourself in the pockethost dashboard.

My recommendation: **local seed + env switch for the 3 Nov demo**, fake data only, and keep remote untouched.


Yes. I checked the local backend: PocketBase is running on `127.0.0.1:8090`, `users` is now empty, there is 1 existing superuser, and the schema still only has `users`, `nominations`, `claims`, and `demise_reports`. I can create the missing collections, add fields/rules, create a new superuser, seed demo data, and point the frontend to local.

## Plan

### 1. Backup and server handling

- Copy `backend/pb_data` to a timestamped backup outside the repo.
- The local server is currently running (PID `10424`). I will briefly stop/restart it while applying schema and superuser changes.
- Leave `backend/pocketbase.exe`, `CHANGELOG.md`, and `LICENSE.md` untouched.

### 2. Create a new local superuser

Create:

- `admin@wasiemas.test` with a generated local password.

The existing superuser `adibbida12@gmail.com` will remain untouched.

### 3. Create the missing schema

#### `wasiemas`

- `pewasiat_id` — relation to `users`, single, required.
- `pewasiat_nric` — text, indexed, optional (for easy death-report matching).
- `wasi_ids` — relation to `users`, up to 3, optional.
- `wasiyyah_data` — JSON, required.
- `signed_document_pdf` — file, PDF only, protected, required.
- `final_lhdn_pdf` — file, PDF only, protected, optional.
- `status` — select: `Pending Verification`, `Processing LHDN`, `Active`, `Revoked`.
- `fee_deducted` — bool, default false.
- `fee_amount` — number, optional.
- `fee_deducted_at` — date, optional.
- `fee_deducted_by` — relation to `users`, optional.
- `activated_at` — date, optional.
- Indexes on `pewasiat_id`, `pewasiat_nric`, and `status`.

#### `wasi_claims`

- `wasi_id` — relation to `users`, required.
- `demise_report_id` — relation to `demise_reports`, required.
- `wasiemas_id` — relation to `wasiemas`, required.
- `status` — select: `Pending Review`, `Approved & Released`, `Rejected`.
- `preverified_at` — date, optional.
- `physical_verified_at` — date, optional.
- `physical_verified_by` — relation to `users`, optional.
- `physical_verification_notes` — text, optional.
- `wasi_ic` — file, protected, optional.
- `audit_log` — text.
- `notification_log` — JSON, optional.
- Indexes on `wasi_id`, `wasiemas_id`, and `status`.

#### `demise_reports` additions

- `wasiemas_id` — relation to `wasiemas`, optional.
- `wasi_id` — relation to `users`, optional.
- `wasi_ic` — file, protected, optional.
- `verified_at` — date, optional.
- `verified_by` — relation to `users`, optional.
- `verification_notes` — text, optional.
- Index on `deceased_nric` and `status`.

#### `users` additions

- `phone` — text, optional.
- `address` — text, optional.
- Index on `nric_number`.

The legacy `claims` and `nominations` collections will be left as-is.

### 4. Apply secure API rules

- `users`
  - list/view: self or admin
  - create: only `role = pewasiat` and `total_gold_balance = 0`
  - update: admin only
  - delete: admin only
- `wasiemas`
  - list/view: owning pewasiat, appointed wasi, or admin
  - create: authenticated pewasiat, with `pewasiat_id = @request.auth.id`
  - update/delete: admin
- `wasi_claims`
  - list/view: owning wasi or admin
  - create: authenticated wasi, with `wasi_id = @request.auth.id`
  - update/delete: admin
- `demise_reports`
  - create: public, but status forced to `Pending Verification`
  - list/view/update/delete: admin
- Protected files: signed PDF, final LHDN PDF, death certificate, wasi IC.

### 5. Seed demo data

Create fresh accounts:

| Account | Email | Role |
|---|---|---|
| Pewasiat A | `pewasiat.a@wasiemas.test` | `pewasiat` |
| Pewasiat B | `pewasiat.b@wasiemas.test` | `pewasiat` |
| Wasi | `wasi@wasiemas.test` | `wasi` |
| Admin | `admin@wasiemas.test` | `admin` |

I will use local demo passwords and print them after seeding. They will not be committed.

Seed records:

- **Pending Wasi Emas** for Pewasiat A:
  - status `Pending Verification`
  - signed PDF attached
  - `wasiyyah_data` includes Wasi email/phone/NRIC and two waris with email/phone
- **Active Wasi Emas** for Pewasiat B:
  - signed PDF + final LHDN PDF
  - status `Active`
  - `fee_deducted = false`
- **Pending demise report** for Pewasiat B:
  - death certificate attached
  - status `Pending Verification`
- **Verified demise report** linked to the active Wasi Emas:
  - death certificate + wasi IC
  - status `Verified`
- **Pending wasi claim**:
  - linked to the Wasi, the verified report, and the active Wasi Emas
  - status `Pending Review`
  - pre-verification/audit log populated
- Dummy PDFs for signed document, final LHDN document, death certificate, and wasi IC.

This gives every admin screen data to show.

### 6. Generate a migration snapshot

After creating the schema through the local admin API, I will generate a migration file in `backend/pb_migrations` so the local schema is reproducible. I will verify the file includes the new collections, fields, indexes, and rules.

### 7. Point the frontend to local

Change `frontend/src/lib/pocketbase.ts` to use an env-based URL with local as the default:

- `VITE_PB_URL` or `http://127.0.0.1:8090`
- Add `frontend/.env.local` with `VITE_PB_URL=http://127.0.0.1:8090` (already ignored by git).
- Remote pockethost will not be touched.

### 8. Verify

- Local server health check.
- Login as each seeded account.
- Admin can see:
  - pending legal verification
  - pending death report + certificate
  - active Wasi Emas + fee pending
  - pending wasi claim
- Anonymous API cannot list users.
- Public report form can still create a report.
- Frontend admin screens load seeded data instead of falling back to demo mocks.

## What this does not include yet

This plan is **backend + seed + local URL**. The admin UI still needs the next code pass:

- “View Cert” wiring
- matched Wasi Emas/wasi display
- real physical verification and release
- real waris notifications and notification log
- legal final-upload file picker
- admin reporting/maintenance screens

I recommend doing the backend seed first, then immediately doing the admin UI wiring against the seeded data.

## Please confirm

1. Demo account emails can be `pewasiat.a@wasiemas.test`, `pewasiat.b@wasiemas.test`, `wasi@wasiemas.test`, `admin@wasiemas.test`.
2. I may briefly stop/restart the local PocketBase server.
3. I may add `phone` and `address` fields to `users` for admin maintenance.
4. After the backend is seeded, should I proceed directly to the admin UI fixes in the same build session?