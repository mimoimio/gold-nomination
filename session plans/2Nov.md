Created the full Mermaid diagram pack in `frontend/docs/diagrams/`.

## Start here

Open `frontend/docs/diagrams/README.md`. It contains:
- Status legend: implemented, simulated, seed-assisted, manual, deferred, out of scope
- English/BM glossary
- Index and recommended reading order
- Current-system summary

## What was built

19 Mermaid diagrams across 11 files:

| File | Contents |
|---|---|
| `01-system-context.md` | System context + local/remote deployment |
| `02-navigation-components.md` | Full route/role map + frontend component map |
| `03-data-model.md` | UML class diagram + ERD with embedded `wasiyyah_data` |
| `04-dfd.md` | DFD Level 0 + Level 1 |
| `05-use-cases.md` | Full actor/use-case map, including deferred cases |
| `06-sequences.md` | Legal activation, death verification/matching, claim release |
| `07-state-machines.md` | Wasi Emas, demise report, and claim statuses |
| `08-activity-swimlanes.md` | Wasi Emas lifecycle + death claim lifecycle |
| `09-permissions.md` | Permission matrix, route guards, PocketBase rules |
| `10-status-and-deferred.md` | Exact implemented/simulated/seed-assisted/deferred breakdown |
| `11-demo-scenarios.md` | Seeded storylines, 8 demo scenarios, demo order, reset |

## Best reading order for “I’m lost”

1. `02-navigation-components.md` — what pages and components exist.
2. `03-data-model.md` — what data is stored, and why wasi/waris/saksi are inside JSON.
3. `06-sequences.md` — how legal activation and claim release actually work.
4. `07-state-machines.md` — what each status means.
5. `09-permissions.md` — who can access what.
6. `10-status-and-deferred.md` — what is real, simulated, seeded, or deferred.
7. `11-demo-scenarios.md` — exactly what you can demonstrate later.

## Deferred clarity

`10-status-and-deferred.md` defines “deferred” precisely and lists exactly what is missing, including:

- Wasi self-service claim creation
- Real email/SMS delivery
- Actual gold transfer/balance update
- LHDN integration
- QR/OTP
- Payment gateway
- KAB Gold panel/SSO
- Separate legal role
- Automatic Wasi invitation
- Early waris notification
- Claim rejection / Wasi Emas revocation UI
- User document library
- One-time briefing session
- Hibah Emas / Waqf

It also lists what you **can safely claim** and what you **must not claim** during the demo.

## Demo scenarios

`11-demo-scenarios.md` covers:
1. Admin overview
2. Legal activation of Ahmad Zaha’s Wasi Emas
3. Public death report + admin verification/matching
4. Claim release + waris notification for Siti Aminah
5. Fee marking + reports/CSV
6. Admin maintenance
7. Security/access checks
8. Reset before demo

All 19 Mermaid diagrams were parse-checked with Mermaid 11. No commit was made.