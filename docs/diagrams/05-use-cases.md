# Use Cases

This is a Mermaid use-case map, not strict UML use-case notation. Actors are on the left/right, use cases are stadium shapes, and dashed arrows show includes or deferred relationships.

## Full Use-Case Map

```mermaid
flowchart LR
  Public(["Public / Waris"])
  Pew(["Pewasiat"])
  Wasi(["Wasi"])
  Admin(["Admin / KAB Gold"])
  Legal(["Legal Firm<br/>admin submodule"])

  subgraph PublicCases["Public"]
    U1([Register / login])
    U2([Report demise])
    U3([Upload death certificate])
  end

  subgraph PewCases["Pewasiat"]
    U4([View dashboard])
    U5([Create Wasi Emas])
    U6([Generate / print Wasi Emas PDF])
    U7([Upload signed PDF])
  end

  subgraph WasiCases["Wasi"]
    U8([Log in])
    U9([View appointment / claim status])
  end

  subgraph AdminCases["Admin / KAB Gold"]
    U10([Log in])
    U11([View admin overview])
    U12([Verify death report])
    U13([Reject / return death report])
    U14([View death certificate])
    U15([Match Wasi Emas and appointed Wasi])
    U16([View Wasi claim])
    U17([Physical IC verification])
    U18([Release assets])
    U19([Waris notification])
    U20([Mark fee deducted])
    U21([View reports / export CSV])
    U22([Maintain user contact details])
  end

  subgraph LegalCases["Legal Firm / Admin"]
    U23([View legal verification queue])
    U24([Record timestamp])
    U25([Upload final LHDN-stamped PDF])
    U26([Activate Wasi Emas])
    U27([Activation notification])
  end

  subgraph DeferredCases["Deferred / not end-to-end"]
    D1([Wasi self-service claim])
    D2([Real email / SMS delivery])
    D3([QR / OTP verification])
    D4([Payment gateway])
    D5([KAB Gold login panel / SSO])
    D6([Automatic Wasi account invitation])
    D7([Early waris notification at claim submission])
    D8([Claim rejection / Wasi Emas revocation UI])
    D9([View / download verified document])
    D10([One-time Wasi/Waris briefing session])
    D11([Hibah Emas / Waqf])
  end

  Public --- U1
  Public --- U2
  U2 -.->|include| U3

  Pew --- U1
  Pew --- U4
  Pew --- U5
  U5 -.->|include| U6
  U5 -.->|include| U7

  Wasi --- U8
  Wasi --- U9

  Admin --- U10
  Admin --- U11
  Admin --- U12
  Admin --- U13
  Admin --- U14
  Admin --- U15
  Admin --- U16
  Admin --- U17
  Admin --- U18
  Admin --- U19
  Admin --- U20
  Admin --- U21
  Admin --- U22

  Legal --- U23
  Legal --- U24
  Legal --- U25
  Legal --- U26
  U26 -.->|include| U27

  U12 -.->|include| U14
  U12 -.->|include| U15
  U18 -.->|include| U17
  U18 -.->|include| U19

  Wasi -.->|deferred| D1
  U19 -.->|simulated| D2
  U27 -.->|simulated| D2
  Admin -.->|deferred| D3
  Admin -.->|deferred| D4
  Admin -.->|deferred| D5
  Pew -.->|deferred| D6
  U19 -.->|deferred| D7
  Admin -.->|deferred| D8
  Pew -.->|deferred| D9
  Admin -.->|deferred| D10
  Pew -.->|out of scope| D11

  classDef implemented fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef simulated fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef deferred fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
  classDef out fill:#e5e7eb,stroke:#6b7280,color:#111827
  class U1,U2,U3,U4,U5,U6,U7,U8,U10,U11,U12,U13,U14,U15,U16,U17,U18,U20,U21,U22,U23,U24,U25,U26 implemented
  class U19,U27 simulated
  class U9,D1,D2,D3,D4,D5,D6,D7,D8,D9,D10 deferred
  class D11 out
```

## Use-Case Rules

- `U12 Verify death report` includes viewing the certificate and matching the Wasi Emas.
- `U18 Release assets` includes physical IC verification and waris notification.
- `U19 Waris notification` and `U27 Activation notification` are simulated as notification-log entries.
- `U9 View appointment / claim status` is only partially possible; there is no dedicated Wasi appointment page and the claim page is limited by current rules.
- `D1 Wasi self-service claim` is the main missing user path. The demo claim is seeded.
- `D11 Hibah Emas / Waqf` is out of scope for the current product.
