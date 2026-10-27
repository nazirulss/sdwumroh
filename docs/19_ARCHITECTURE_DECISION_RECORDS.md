# SDW UMROH — ARCHITECTURE DECISION RECORDS

**Document Status:** REVIEW  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Architecture Decision Record Register  
**Parent Documents:** `00–18`

---

# 1. PURPOSE

Dokumen ini mencatat keputusan arsitektur yang mempengaruhi:

- application architecture;
- database;
- security;
- workflows;
- financial integrity;
- AI implementation;
- future maintainability.

Tujuan ADR:

> Mengetahui bukan hanya **apa yang dipilih**, tetapi juga **mengapa dipilih** dan **apa yang tidak boleh dilakukan tanpa revisi keputusan**.

---

# 2. ADR STATUS

```text
PROPOSED
ACCEPTED
LOCKED
SUPERSEDED
DEPRECATED
```

---

# 3. ADR-001 — MODULAR MONOLITH

**Status:** ACCEPTED

## Decision

SDW UMROH menggunakan:

```text
Modular Monolith
```

sebagai default application architecture.

## Reason

Produk memiliki banyak domain:

```text
CRM
Customer
Registration
Documents
Finance
Operations
Partner
Alumni
```

tetapi belum membutuhkan distributed microservices.

## Consequence

Domain modules harus memiliki boundaries yang jelas walaupun berada dalam satu application.

## Prohibited Without Approval

Tidak boleh otomatis menambahkan:

```text
microservices
Kubernetes
service mesh
distributed event infrastructure
```

---

# 4. ADR-002 — NEXT.JS

**Status:** ACCEPTED

## Decision

Primary application framework:

```text
Next.js + TypeScript
```

## Reason

Mendukung:

- public website;
- authenticated application;
- server-side functionality;
- PWA;
- API/route handlers;
- shared UI.

---

# 5. ADR-003 — SUPABASE / POSTGRESQL

**Status:** ACCEPTED

## Decision

Primary transactional database:

```text
PostgreSQL via Supabase
```

Supabase juga menjadi platform untuk:

```text
Authentication
Database
Storage
RLS
```

where appropriate.

---

# 6. ADR-004 — POSTGRESQL AS SOURCE OF TRUTH

**Status:** ACCEPTED

Core business state resides in PostgreSQL.

Frontend state:

```text
temporary
derived
presentation
```

bukan authoritative business state.

---

# 7. ADR-005 — AUTHENTICATION

**Status:** ACCEPTED

Authentication uses:

```text
Supabase Auth
```

Application identity is represented separately from business entities.

Concept:

```text
auth.users
 ↓
users
 ↓
customer/pilgrim relationships
```

---

# 8. ADR-006 — USER ≠ PILGRIM

**Status:** ACCEPTED / LOCKED PRINCIPLE

Authentication identity and business journey identity are separate.

```text
User
≠
Customer
≠
Lead
≠
Pilgrim
```

This allows repeat journeys without recreating identity.

---

# 9. ADR-007 — PACKAGE ≠ DEPARTURE ≠ TRIP

**Status:** ACCEPTED

Definitions:

```text
Package
=
commercial offering

Departure
=
scheduled departure

Trip
=
operational execution
```

Relationship:

```text
Package
 ↓
Departure
 ↓
Trip
```

---

# 10. ADR-008 — WORKFLOW-FIRST ARCHITECTURE

**Status:** LOCKED PRINCIPLE

Critical business functionality is modeled through:

```text
EVENT
 ↓
STATE
 ↓
AUTHORIZED ACTION
 ↓
BUSINESS RULE
 ↓
STATE CHANGE
 ↓
NOTIFICATION
 ↓
AUDIT
```

CRUD-only architecture is insufficient.

---

# 11. ADR-009 — EXPLICIT STATE MACHINES

**Status:** LOCKED PRINCIPLE

Stateful entities must use explicit transition rules.

Generic status mutation is prohibited for critical entities.

Canonical states are defined in:

`14_STATE_MACHINES.md`

---

# 12. ADR-010 — RBAC + SCOPE

**Status:** LOCKED PRINCIPLE

Authorization model:

```text
USER
 ↓
ROLE
 ↓
PERMISSION
 ↓
RESOURCE
 ↓
ACTION
 ↓
SCOPE
```

Role alone is not sufficient for authorization.

---

# 13. ADR-011 — RLS AS DATABASE SECURITY BOUNDARY

**Status:** LOCKED PRINCIPLE

Supabase PostgreSQL RLS is part of the security model.

Application authorization and RLS are complementary.

Neither should be treated as a replacement for the other.

---

# 14. ADR-012 — PRIVATE DOCUMENT STORAGE

**Status:** LOCKED PRINCIPLE

Sensitive pilgrim documents use private storage.

Examples:

```text
passport
identity documents
payment evidence
other sensitive travel documents
```

No public permanent URL.

---

# 15. ADR-013 — FINANCIAL IMMUTABILITY

**Status:** LOCKED PRINCIPLE

Authoritative financial transactions should not be silently overwritten or deleted.

Corrections use:

```text
refund
adjustment
void
reversal
```

according to approved business rules.

---

# 16. ADR-014 — COMMERCIAL PRICE SNAPSHOT

**Status:** ACCEPTED / REQUIRES SCHEMA LOCK

A registration must preserve its agreed commercial terms.

Concept:

```text
Package Current Price
        ↓
Registration
        ↓
Commercial Snapshot
```

This protects historical pricing.

Exact schema fields:

**TBD**

---

# 17. ADR-015 — OUTSTANDING IS DERIVED

**Status:** ACCEPTED

Outstanding balance must be derived from authoritative financial records.

Do not maintain independently editable:

```text
outstanding_amount
```

as an arbitrary dashboard value.

If a cached value is eventually used for performance, it must remain derivable/reconcilable from the source of truth.

---

# 18. ADR-016 — NO FRONTEND FINANCIAL AUTHORITY

**Status:** LOCKED

Frontend may display:

```text
total
paid
outstanding
```

but cannot authoritatively determine:

```text
verified payment
refund amount
financial balance
```

---

# 19. ADR-017 — AUDIT CRITICAL ACTIONS

**Status:** LOCKED

Audit is required for:

```text
permission changes
document verification
payment verification
refund
cancellation
price changes
departure changes
critical overrides
sensitive exports
```

---

# 20. ADR-018 — PUBLIC PROJECTION

**Status:** ACCEPTED

Public website APIs should use explicit public projections/DTOs.

Do not expose raw database rows.

---

# 21. ADR-019 — API / SERVER ACTION BOUNDARY

**Status:** ACCEPTED

Default:

### Server Actions

For internal application mutations where appropriate.

### Route/API

For:

- explicit contracts;
- external consumers;
- webhooks;
- integration;
- future clients.

### Domain Services

For reusable business orchestration.

---

# 22. ADR-020 — EXTERNAL SERVICE ADAPTERS

**Status:** ACCEPTED

External providers must be isolated behind interfaces/adapters.

Examples:

```text
PaymentService
NotificationService
StorageService
```

Provider-specific code must not leak throughout the domain.

---

# 23. ADR-021 — IDEMPOTENT EXTERNAL EVENTS

**Status:** LOCKED PRINCIPLE

External callbacks must support idempotency.

Especially:

```text
payment webhooks
notification delivery
external callbacks
```

Duplicate events must not duplicate business transactions.

---

# 24. ADR-022 — NO PREMATURE MICROSERVICES

**Status:** LOCKED

Distributed architecture requires explicit justification and approval.

The current default remains:

```text
Modular Monolith
```

---

# 25. ADR-023 — NO SECOND SOURCE OF TRUTH

**Status:** LOCKED

Do not introduce:

```text
second user database
second production database
second payment ledger
parallel pilgrim registry
```

without explicit architecture decision.

---

# 26. ADR-024 — AI AS IMPLEMENTATION AGENT

**Status:** LOCKED

AI may:

```text
implement
refactor
test
analyze
propose
```

AI may not silently:

```text
change architecture
change financial rules
change permission model
change state machine
change security boundary
```

---

# 27. ADR-025 — SPECIFICATION HIERARCHY

**Status:** LOCKED

Canonical hierarchy:

```text
00
 ↓
01
 ↓
02
 ↓
03
 ↓
04
 ↓
05
 ↓
06
 ↓
07
 ↓
08
 ↓
09
 ↓
10
 ↓
11
 ↓
12
 ↓
13
 ↓
14–19
 ↓
Implementation
```

Later documents refine implementation but must not casually contradict higher-level product intent.

---

# 28. ADR-026 — DRAFT DOES NOT MEAN APPROVED

**Status:** LOCKED

AI must distinguish:

```text
DRAFT
APPROVED
LOCKED
```

A draft proposal must not silently become production behavior.

---

# 29. ADR-027 — GOLDEN SCREEN GOVERNANCE

**Status:** ACCEPTED

Once a screen is explicitly designated Golden Screen:

```text
structure
hierarchy
visual language
interaction
```

become protected design decisions.

Bug/accessibility fixes remain allowed.

Redesign requires approval.

---

# 30. ADR-028 — DESIGN TOKENS

**Status:** ACCEPTED

UI uses semantic design tokens.

Until official brand identity is supplied:

```text
brand colors = TBD
typography = TBD
```

AI must not invent a final brand system.

---

# 31. ADR-029 — JOURNEY STATUS IS DERIVED

**Status:** ACCEPTED

PWA journey status should be derived from domain state.

Avoid maintaining multiple independently editable:

```text
journey_status
registration_status
payment_status
document_status
```

as unrelated duplicate truths.

---

# 32. ADR-030 — NEXT ACTION IS RULE-DRIVEN

**Status:** ACCEPTED

The PWA's:

```text
Next Action
```

should eventually derive from:

```text
current journey state
+
blocking conditions
+
authorized action
+
business rule
```

It must not be hard-coded independently on each screen.

---

# 33. ADR-031 — READINESS IS RULE-BASED

**Status:** ACCEPTED / BUSINESS RULE TBD

Readiness cannot be an arbitrary percentage.

It must account for:

```text
documents
payment
preparation
manasik
operations
```

including hard blockers.

Exact weights/formula remain:

**TBD**

---

# 34. ADR-032 — DATA CLASSIFICATION

**Status:** ACCEPTED

Data classification:

```text
PUBLIC
INTERNAL
RESTRICTED
SENSITIVE
```

Sensitive data receives stronger access/storage/logging controls.

---

# 35. ADR-033 — DELETE BY DEFAULT DENIED

**Status:** ACCEPTED

Business-critical records should normally use:

```text
archive
cancel
void
deactivate
```

rather than physical deletion.

---

# 36. ADR-034 — AUDIT IS NOT BUSINESS DATA

**Status:** ACCEPTED

Audit logs are evidence of actions.

They should not become the primary source for:

```text
current payment
current registration
current document state
```

Current business state remains in the domain tables.

---

# 37. ADR-035 — HUMAN-IN-THE-LOOP

**Status:** LOCKED PRINCIPLE

Automation may:

```text
identify
remind
notify
calculate
recommend
create task
```

High-impact irreversible actions require appropriate human authorization.

---

# 38. ADR-036 — MVP DISCIPLINE

**Status:** ACCEPTED

AI must not implement future roadmap features simply because their domain model exists.

Implementation follows:

```text
MVP scope
→ approved iteration
→ later roadmap
```

---

# 39. ADR-037 — DOCUMENTATION IS IMPLEMENTATION INPUT

**Status:** LOCKED

The `00–19` specification pack is part of the engineering input.

AI must inspect the relevant documentation before modifying:

```text
database
API
security
workflow
UI
```

---

# 40. ADR-038 — TRACEABILITY REQUIRED

**Status:** LOCKED

Important implementation must be traceable:

```text
Requirement
 ↓
Workflow
 ↓
Domain
 ↓
Database
 ↓
API
 ↓
UI
 ↓
Permission
 ↓
RLS
 ↓
Test
```

---

# 41. ADR-039 — ARCHITECTURE CHANGE PROCESS

**Status:** LOCKED

Significant architectural changes require:

```text
Problem
Current Decision
Proposed Decision
Reason
Tradeoffs
Security Impact
Data Impact
Migration
Rollback
Approval
```

---

# 42. ADR-040 — UNKNOWN REMAINS UNKNOWN

**Status:** LOCKED

If the specification does not define:

```text
business rule
legal requirement
financial rule
permission
integration
```

AI must not fabricate certainty.

Use:

```text
TBD
```

until an authorized decision exists.

---

# 43. DECISIONS STILL REQUIRING BUSINESS LOCK

The following remain intentionally unresolved:

```text
Commercial pricing structure
Payment schedule
Minimum confirmation payment
Cancellation policy
Refund formula
Commission policy
Document requirements
Departure capacity rule
Registration capacity reservation
Readiness formula
Manasik ownership role
Final provider integrations
Organization/multi-tenancy depth
Retention periods
Legal/compliance implementation
```

These are not architecture failures.

They are explicit business decisions awaiting approval.

---

# 44. ARCHITECTURE BASELINE

The currently accepted technical baseline is:

```text
Next.js
+
TypeScript
+
PWA
+
Supabase
+
PostgreSQL
+
Supabase Auth
+
RLS
+
Private Storage
+
Modular Monolith
+
Explicit State Machines
+
RBAC + Scope
+
Audit
+
Service Adapters
```

---

# 45. FINAL ADR PRINCIPLE

> **Architecture should make the intended business behavior easier to enforce and the unintended behavior harder to create.**

SDW UMROH should therefore optimize for:

```text
Explicitness
Traceability
Security
Financial Integrity
Maintainability
Controlled Evolution
```

rather than premature technical complexity.