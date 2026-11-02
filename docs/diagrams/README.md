# Wasi Emas Implementation Guide

This folder is a Mermaid-only diagram pack for understanding the **current** Wasi Emas implementation. It covers the full system: pewasiat, wasi, public demise reporting, admin/legal operations, remote/local deployment, data model, security rules, and demo scenarios.

The diagrams describe the code and PocketBase schema as they exist now, not the target ideal. Each diagram uses the status labels below so that implemented, simulated, seed-assisted, and deferred behaviour are not mixed together.

## Status Labels

| Label | Meaning |
|---|---|
| **Implemented** | A working code path exists and the current demo can exercise it. |
| **Simulated** | The UI and records exist, but the external side effect is not real. Example: email/SMS is written to a notification log, not sent by a provider. |
| **Seed-assisted** | The scenario works only because demo records are pre-seeded. The self-service user path is not complete. Example: the pending Wasi claim is seeded; the Wasi does not create it through the current UI. |
| **Manual / out-of-system** | A human step happens outside the app. Example: LHDN stamping and physical IC verification. |
| **Deferred** | The capability is not implemented as a working end-to-end path. It may exist in schema or UI fragments. |
| **Out of scope** | Removed from the current product scope by the meeting decision. Example: Hibah Emas and Waqf. |

## English with BM Glossary

| English | BM / product term | Meaning in this system |
|---|---|---|
| Testator / account holder | **Pewasiat** | The KAB Gold account holder who creates the Wasi Emas and appoints a Wasi. |
| Trustee / executor | **Wasi** | The person appointed to administer and distribute the gold. The product uses the term Wasi, not Penama or Pentadbir. |
| Heirs | **Waris** | The faraid heirs listed by the Pewasiat for notification and distribution reference. |
| Witnesses | **Saksi** | The people who witness the physical signing of the document. |
| Wasi instrument / product | **Wasi Emas** | The commercial product/document managed by this system. The UI also uses "Wasiemas" in a few older names. |
| Claim | **Tuntutan** | A Wasi claim for release after a death is verified. |
| Verification | **Pengesahan** | Document, death certificate, identity, or physical verification. |
| Asset release | **Pelepasan aset** | The administrative action that marks assets as released to the Wasi. |
| Fee deduction | **Potongan fi** | The fee record for the activated Wasi Emas, reported to KAB Gold. |
| Legal firm | **Firma guaman** | The firm that checks signatures, records a timestamp, and uploads the LHDN-stamped document. In this implementation it is an admin submodule. |
| Inland Revenue Board | **LHDN** | The stamping authority. This is manual/out-of-system. |
| Administrator (avoid mixing) | **Pentadbir** | Not the primary term for this product. The product uses Wasi. |
| Nominee (avoid mixing) | **Penama** | Not used as the primary term. The product uses Wasi. |

## Diagram Index

| File | What it answers |
|---|---|
| [01-system-context.md](./01-system-context.md) | Who uses the system, what parts exist, and how local vs remote deployment works. |
| [02-navigation-components.md](./02-navigation-components.md) | Which pages/routes exist, how they connect, and how the frontend components are organised. |
| [03-data-model.md](./03-data-model.md) | What data is stored, how collections relate, and why wasi/waris/saksi are inside JSON. |
| [04-dfd.md](./04-dfd.md) | Data flow at context level and process level. |
| [05-use-cases.md](./05-use-cases.md) | Full actor/use-case map, including deferred use cases. |
| [06-sequences.md](./06-sequences.md) | Technical interaction for legal activation, death verification, and claim release. |
| [07-state-machines.md](./07-state-machines.md) | All status transitions and which actions trigger them. |
| [08-activity-swimlanes.md](./08-activity-swimlanes.md) | Business process across Pewasiat, Wasi, Admin/Legal, KAB Gold, and the system. |
| [09-permissions.md](./09-permissions.md) | Role and file permission matrix, plus the route guards and PocketBase rules. |
| [10-status-and-deferred.md](./10-status-and-deferred.md) | Exactly what is implemented, simulated, seed-assisted, deferred, and out of scope. |
| [11-demo-scenarios.md](./11-demo-scenarios.md) | Seeded storylines, demo order, step-by-step scenarios, and what not to claim. |

## Current System in One Paragraph

The React SPA supports three app roles: `pewasiat`, `wasi`, and `admin`. A Pewasiat completes a seven-step Wasi Emas wizard and uploads a signed PDF. The admin/legal submodule records a timestamp, uploads the LHDN-stamped PDF, and sets the record to `Active`. A public reporter can submit a death certificate. The admin opens the certificate, matches the deceased NRIC to a Wasi Emas record, and verifies or rejects the report. A seeded Wasi claim is then physically verified and released by the admin, and a waris notification log is written. Admin reports, fee marking, and user-contact maintenance are also implemented. Email/SMS, gold transfer, LHDN stamping, Wasi self-service claiming, QR, payment gateway, and a separate legal role are not real end-to-end integrations.

## How to View the Diagrams

- **VS Code:** open the Markdown preview with a Mermaid extension.
- **GitHub:** Mermaid code blocks render in Markdown files.
- **Mermaid Live:** paste a diagram block into <https://mermaid.live/>.

## Important Note on Diagram Types

The use-case and BPMN-style diagrams are Mermaid approximations, not strict UML/BPMN notation. They are intentionally used because this pack is Mermaid-only for now. The class, ERD, sequence, state, DFD, component, and deployment diagrams follow their usual Mermaid forms.

All 19 Mermaid diagrams in this pack were parse-checked with Mermaid 11. If you edit them, keep the status labels and the current/deferred distinction consistent with [10-status-and-deferred.md](./10-status-and-deferred.md).
