I read all three transcripts and cross-checked the current routes, wizard, admin/legal/fee screens, types, local PocketBase schema, and the live PocketBase API. No code changes made.

Caveat: the transcripts are noisy and occasionally contradictory. I treated **20 Oct as the latest source of truth**, kept 6/13 Oct requirements unless superseded, and flagged ambiguities.

## Bottom line

The **screen coverage is strong**, but the **workflow integrity is still weak**. The wizard, PDF generation, public demise report, admin verify/release, legal-firm queue, and fee screen exist. However, the appointment → activation → claim → release chain is mostly mocked, authorization is not enforced, the live schema is missing fields the UI writes, and the latest admin requirements are largely absent.

It is demo-ready for a controlled happy-path walkthrough, but **not yet safe for real PII or a credible end-to-end client demo**.

## Per-meeting delta

| Meeting | Main asks | Current state |
|---|---|---|
| **6 Oct** | Six-section Wasiyyah form, print/sign/upload, firm verification, wasi notification, waris/saksi details | Form and PDF are mostly there. Firm verification is partial. Wasi notification and several legal details are missing. |
| **13 Oct** | Rename to Wasi Emas, remove Manage Beneficiaries, waris email/phone, public report demise, wasi login, admin death claims/reporting | Rename partly done; Manage Beneficiaries removed from UI; waris contacts done; public report done. Wasi login/accounts and admin reporting missing. |
| **20 Oct** | Legal-firm timestamp/LHDN/upload, QR/email, wasi IC pre-verify + physical release, fee deduction/KAB Gold, admin reporting/maintenance, BM terminology | Legal/fee screens added but rely on missing fields; physical release is only a label; QR/payment/reporting/maintenance missing; language mixed. |

## Requirement scorecard

| Area | Status | Assessment |
|---|---|---|
| Overview and navigation | **Partial** | Synopsis + two cards exist, but the “Report Demise” card navigates to `/user/claim` (`Dashboard.tsx:56`) while the real route is `/report-demise` (`App.tsx:61`). |
| Seven-step Wasi Emas form | **Strong** | All six Anis-draft sections are represented, plus a finale. Content is close to the source document. |
| Wasi rules: 2 mandatory, max 3, contact/email | **Weak** | Max 3 works, but there is no email input in `Step2Wasi` despite `wasi.email` existing in the type, and no enforcement that Wasi 1 and 2 are mandatory. No step validation. |
| Waris email/phone + faraid guidance | **Strong** | Email and phone are captured in Step 4; faraid category guide is present. |
| Witness legal composition and contacts | **Weak** | Up to 4 witnesses supported, but no gender field and no phone/email. The UI text says “2 male or 1 male + 2 female” but the form cannot enforce it. |
| Consent and required-field validation | **Weak** | `ConsentFooter` checkboxes are local state only, not persisted or gated. Users can advance with empty fields. |
| Print/sign/upload | **Partial** | jsPDF generation and download work; upload to `wasiemas` exists. But the step-7 footer button bypasses upload entirely (`CreateWasiyyah.tsx:28`, `:78`). No QR. |
| Legal-firm activation | **Partial** | Queue, signed-PDF view, timestamp, and “Active” status exist. Final LHDN upload is a dummy `File` (`LegalFirmDashboard.tsx:100`), `final_lhdn_pdf` is missing live, and activation email goes to a dummy wasi. |
| Public demise report | **Strong / Partial** | Public route and form are implemented. Missing wasi IC, wasiemas lookup, and pre-verification. Errors are converted to fake success (`ReportClaim.tsx:38`). |
| Wasi identity and invitation | **Missing** | No wasi email capture, no account creation/invite, and the wasi list exists only inside `wasiyyah_data` JSON. Live data has **0 wasi users**. |
| Wasi-only claim | **Missing** | The route only checks login/admin (`App.tsx:18`, `:66`); any non-admin can access it. `WasiClaimAssets` fetches all verified reports, not reports tied to the logged-in wasi (`WasiClaimAssets.tsx:20`, `:47`). |
| Death report → wasiemas matching | **Missing** | The public report never links to a `wasiemas` record or finds the appointed wasi by deceased NRIC. Admin cannot see “this deceased has Wasi Emas and this wasi is appointed.” |
| Admin verify/release | **Partial** | Verify updates status, but “View Cert” has no handler (`AdminClaimsDashboard.tsx:132`). No reject/return flow. Release uses dummy waris (`:78`) and does not transfer/zero gold or write an audit log. |
| Notifications | **Weak** | `emailService` only logs to console. Activation uses a dummy wasi; release uses dummy waris. No SMS and no early claim notification. |
| Fee deduction / KAB Gold | **Partial / Missing** | Fee screen exists, but live `fee_deducted` is missing, so the query fails and falls back to demo (`AdminFeeReporting.tsx:22`). No fee amount, no actual gold deduction, no KAB Gold role/report. |
| Admin reporting and maintenance | **Missing** | No counts by status, no daily/monthly report, no address/info editing. These were explicit 13/20 Oct asks. |
| Roles and dashboards | **Partial** | Only `admin`, `pewasiat`, `wasi`. Legal and fee screens sit under admin; there is no legal-firm role or KAB Gold role. A separate wasi dashboard exists, although the 20 Oct discussion leaned toward handling wasi actions inside report demise. |
| Naming, BM, and scope | **Partial / Contradicts** | Mixed BM/English. “Wasiemas”, “Wasiyyah”, and “Wasi Emas” are used interchangeably. Hibah Emas and Waqf are still offered in Step 1 (`Step1Pewasiat.tsx:58`) even though 13 Oct scoped them out. |
| Data and security | **Critical** | The live `users` list is publicly readable and returns email, NRIC, name, role, and balance. Live users are **4 `investor` + 1 `admin`, 0 `pewasiat`, 0 `wasi`**, so existing demo accounts will not see pewasiat navigation. Local DB still lacks `wasiemas`/`wasi_claims`. |
| Build and quality | **Partial** | `tsc` passes. 28 lint errors remain. No tests. Many catch blocks hide failures behind “simulated for demo” success. |

## Highest-risk findings

1. **Public PII exposure.** An unauthenticated request to the live `users` collection returns user records including email, NRIC, role, and gold balance. The same unauthenticated collection endpoints accept requests for `wasiemas`, `wasi_claims`, and `demise_reports`; their rules must be locked down before any real data is seeded. This directly conflicts with the security concerns raised by Puan Ainin.

2. **The wasi identity chain is not implemented.** Wasi email is never captured in the form, no account is created or invited, and claims are not checked against the appointed wasi. This means the “only the appointed wasi can claim/release” rule from 13/20 Oct is not actually enforced.

3. **Death reports are not linked to Wasi Emas records.** The system cannot currently show “this deceased NRIC matches an active Wasi Emas, and this is the appointed wasi.” That is the core nomination check described in the 6 Oct process.

4. **Legal-firm and fee flows depend on non-existent or unverified schema.** The live `wasiemas` collection appears to lack `fee_deducted` and `final_lhdn_pdf`; filter probes return 400. Local migrations do not include `wasiemas` or `wasi_claims` at all. The fee screen therefore falls back to demo data, and the legal final-upload will fail.

5. **Admin release is cosmetic.** “View Cert” is dead, there is no reject/return, the release uses dummy waris, and no gold movement or audit log occurs. The latest meeting’s admin focus is therefore the weakest part of the build.

6. **Several demo bugs will be visible immediately.** The dashboard “Report Demise” button goes to a non-existent route; the step-7 footer can submit nothing; live collections are empty, so admin/legal/wasi screens will show empty states rather than demo fallbacks.

7. **Legal safeguards are not encoded.** Wasi 1/2 mandatory, witness gender composition, consent persistence, and required-field validation are all missing. This matters because the document is intended to be legally executed.

8. **Scope and terminology have drifted.** Hibah Emas and Waqf remain in Step 1, English and BM are mixed, and the product is called Wasiemas/Wasiyyah/Wasi Emas in different places. The 20 Oct meeting asked for BM and terminology standardization.

## Recommended sequence

### P0 — before the 3 Nov admin meeting

1. **Lock PocketBase API rules immediately**, especially `users`, `wasiemas`, `wasi_claims`, and `demise_reports`. Treat files and JSON fields as private.
2. **Migrate demo data:** map existing `investor` users to `pewasiat` or support legacy `investor` in `AuthContext`; create at least one `wasi` test account; seed one Wasi Emas, one demise report, and one claim.
3. **Add the missing schema fields:** `fee_deducted`, `final_lhdn_pdf`, and confirm `Processing LHDN` is an allowed status. Add local migrations so local and remote match.
4. **Finish admin:** wire “View Cert,” add reject/return, use real wasi/waris data from `wasiyyah_data`, capture physical IC verification (officer/notes/timestamp), and record an audit log.
5. **Add admin reporting and maintenance:** counts by status, daily/monthly fee/claim report, and editing of user/record information.
6. **Fix legal and fee screens:** real final-PDF file picker, activation email to the actual wasi list, real fee query/report, and a decision on whether KAB Gold gets a panel or a report.
7. **Fix demo blockers:** dashboard route, step-7 footer bypass, and remove or hide Hibah/Waqaf.

### P1 — before an end-to-end demo

8. Capture wasi email in Step 2; create/invite wasi accounts.
9. Enforce `isWasi` on claim routes and match the logged-in user to the appointed wasi.
10. Link each demise report to the relevant `wasiemas`; add wasi IC upload and online pre-verification.
11. Notify waris on claim and again on release; replace dummy recipients.
12. Enforce wasi 1/2 mandatory, witness composition, consent, and required fields.

### P2 — confirm or defer

13. QR generation/scanning (20 Oct leaned toward email access, so clarify whether QR is still required).
14. Payment gateway vs deduction/report; KAB Gold role/SSO.
15. One-time wasi/waris briefing session.
16. External link for other assets.
17. User-facing document library and return of the verified document.

## Ambiguities to resolve with the client/academics

- Is the product name **Wasi Emas**, **Wasiemas**, **Wasiyyah**, or **surat wisoyah**? The current UI mixes all four.
- Is a separate **wasi dashboard** required, or should wasi actions live inside Report Demise? The 20 Oct transcript says both.
- Is the legal firm a **separate role/dashboard** or part of admin?
- Is QR still required, or is email notification sufficient?
- Is the fee handled by a **payment gateway**, a **KAB Gold panel**, or a **monthly report**?
- Should Hibah Emas/Waqf be visible as “coming soon,” or removed entirely?
- Are Wasi 1 and 2 still mandatory under the latest legal draft?

If useful, I can turn the P0 items into a concrete implementation plan for the 3 Nov meeting, or produce a short slide-ready gap summary.