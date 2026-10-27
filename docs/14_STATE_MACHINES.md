# SDW UMROH — STATE MACHINES

**Document Status:** REVIEW  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** State Machine & Transition Contract  
**Parent Documents:**
- `00_PROJECT_CONTEXT.md`
- `04_USER_JOURNEYS_AND_WORKFLOWS.md`
- `05_DOMAIN_MODEL.md`
- `06_BUSINESS_RULES.md`
- `13_AI_BUILD_INSTRUCTIONS.md`

---

# 1. PURPOSE

Dokumen ini mendefinisikan state machine canonical untuk entity dan workflow penting SDW UMROH.

State machine menjadi kontrak antara:

```text
BUSINESS RULE
↓
WORKFLOW
↓
DATABASE
↓
API
↓
UI
↓
TEST
```

Tujuan utama:

- mencegah state berubah sembarangan;
- memastikan setiap transition memiliki actor/permission;
- memastikan invalid transition ditolak;
- menjaga historical traceability;
- memberi dasar untuk API dan database constraints;
- mencegah AI membuat status baru tanpa keputusan eksplisit.

---

# 2. CORE STATE MODEL

Setiap stateful entity harus memiliki:

```text
CURRENT STATE
+
AVAILABLE ACTIONS
+
AUTHORIZED ACTOR
+
PRECONDITIONS
+
NEXT STATE
+
SIDE EFFECTS
+
AUDIT REQUIREMENT
```

Model implementasi:

```text
EVENT
 ↓
CURRENT STATE
 ↓
AUTHORIZED ACTION
 ↓
BUSINESS RULE
 ↓
VALIDATION
 ↓
STATE CHANGE
 ↓
SIDE EFFECT
 ↓
AUDIT
```

---

# 3. GLOBAL TRANSITION RULES

## SM-001 — No Arbitrary Status Mutation

Client tidak boleh melakukan:

```text
PATCH status = "CONFIRMED"
```

tanpa business action yang valid.

Gunakan action khusus:

```text
submitRegistration()
approveRegistration()
verifyDocument()
verifyPayment()
confirmRegistration()
cancelRegistration()
```

---

## SM-002 — Every Transition Must Be Validated

Server harus memeriksa:

```text
current_state
+
requested_action
+
actor
+
scope
+
business_preconditions
```

---

## SM-003 — Invalid Transition Must Fail

Contoh:

```text
CANCELLED → CONFIRMED
```

harus ditolak.

---

## SM-004 — State History Must Be Preserved

Untuk entity kritis, perubahan state harus dapat ditelusuri melalui audit/event history.

---

# 4. LEAD STATE MACHINE

## States

```text
NEW
CONTACTED
QUALIFIED
CONSULTATION
PROPOSAL
FOLLOW_UP
REGISTRATION
CONVERTED
LOST
DORMANT
UNQUALIFIED
```

## Primary Flow

```text
NEW
 ↓
CONTACTED
 ↓
QUALIFIED
 ↓
CONSULTATION
 ↓
PROPOSAL
 ↓
FOLLOW_UP
 ↓
REGISTRATION
 ↓
CONVERTED
```

## Alternative Outcomes

```text
QUALIFIED → UNQUALIFIED
FOLLOW_UP → DORMANT
FOLLOW_UP → LOST
CONSULTATION → LOST
```

## Rules

- `CONVERTED` berarti lead berhasil menghasilkan business conversion.
- Registration adalah domain entity tersendiri.
- Lead record tidak boleh dihapus hanya karena conversion terjadi.
- Conversion relationship harus preserved.

---

# 5. REGISTRATION STATE MACHINE

## States

```text
DRAFT
SUBMITTED
UNDER_REVIEW
NEEDS_REVISION
APPROVED
CONFIRMED
CANCELLED
```

## Primary Flow

```text
DRAFT
 ↓
SUBMITTED
 ↓
UNDER_REVIEW
 ↓
APPROVED
 ↓
CONFIRMED
```

## Revision Flow

```text
SUBMITTED
 ↓
UNDER_REVIEW
 ↓
NEEDS_REVISION
 ↓
SUBMITTED
```

## Cancellation

Cancellation harus mengikuti policy yang telah disetujui.

```text
SUBMITTED → CANCELLED
UNDER_REVIEW → CANCELLED
APPROVED → CANCELLED
CONFIRMED → CANCELLED
```

Exact eligibility:

**TBD — Business Policy**

## Forbidden

```text
DRAFT → CONFIRMED
NEEDS_REVISION → CONFIRMED
CANCELLED → CONFIRMED
```

tanpa explicit recovery workflow yang telah disetujui.

---

# 6. DOCUMENT STATE MACHINE

Canonical states:

```text
NOT_UPLOADED
UPLOADED
UNDER_REVIEW
VERIFIED
REVISION_REQUIRED
EXPIRED
```

## Flow

```text
NOT_UPLOADED
 ↓
UPLOADED
 ↓
UNDER_REVIEW
 ├── VERIFIED
 └── REVISION_REQUIRED
        ↓
      UPLOADED
```

## Expiration

```text
VERIFIED
 ↓
EXPIRED
```

jika document memang memiliki expiration requirement.

## Important Distinction

```text
Document Requirement
≠
Document
≠
Document Version
≠
Verification Decision
```

`REJECTED` tidak menjadi canonical document state pada versi ini.

Jika hard rejection diperlukan, harus menjadi business decision tersendiri.

---

# 7. PAYMENT STATE MACHINE

Payment transaction states:

```text
PENDING
SUBMITTED
VERIFIED
FAILED
REJECTED
CANCELLED
```

Refund bukan overwrite terhadap payment.

Refund memiliki lifecycle sendiri.

## Flow

```text
PENDING
 ↓
SUBMITTED
 ↓
VERIFIED
```

Failure:

```text
PENDING → FAILED
SUBMITTED → REJECTED
```

Cancellation:

```text
PENDING → CANCELLED
```

## Important Rule

Payment yang telah `VERIFIED` tidak boleh diubah menjadi nilai lain melalui generic update.

Koreksi harus menggunakan controlled financial action.

---

# 8. REFUND STATE MACHINE

Refund states:

```text
REQUESTED
UNDER_REVIEW
APPROVED
REJECTED
PROCESSING
COMPLETED
FAILED
CANCELLED
```

Flow:

```text
REQUESTED
 ↓
UNDER_REVIEW
 ↓
APPROVED
 ↓
PROCESSING
 ↓
COMPLETED
```

Alternative:

```text
UNDER_REVIEW → REJECTED
PROCESSING → FAILED
```

Refund amount:

**TBD — Financial Policy**

---

# 9. INVOICE STATE MACHINE

Proposed states:

```text
DRAFT
ISSUED
PARTIALLY_PAID
PAID
OVERDUE
VOID
CANCELLED
```

## Flow

```text
DRAFT
 ↓
ISSUED
 ↓
PARTIALLY_PAID
 ↓
PAID
```

Alternative:

```text
ISSUED → OVERDUE
OVERDUE → PARTIALLY_PAID
OVERDUE → PAID
```

`VOID` dan `CANCELLED` harus melalui authorized financial action.

---

# 10. PACKAGE STATE MACHINE

```text
DRAFT
IN_REVIEW
PUBLISHED
PAUSED
ARCHIVED
```

Flow:

```text
DRAFT
 ↓
IN_REVIEW
 ↓
PUBLISHED
 ↓
PAUSED
 ↓
PUBLISHED
```

Historical registrations must not change merely because package status changes.

---

# 11. DEPARTURE STATE MACHINE

```text
DRAFT
OPEN
FULL
CLOSED
DEPARTED
COMPLETED
CANCELLED
```

Flow:

```text
DRAFT
 ↓
OPEN
 ↓
FULL
 ↓
CLOSED
 ↓
DEPARTED
 ↓
COMPLETED
```

Alternative:

```text
OPEN → CLOSED
OPEN → CANCELLED
FULL → CLOSED
```

Capacity behavior:

**TBD — Business Rule**

---

# 12. TRIP STATE MACHINE

Trip represents the operational execution of a departure.

Proposed:

```text
PLANNING
READY
ACTIVE
COMPLETED
CANCELLED
```

Flow:

```text
PLANNING
 ↓
READY
 ↓
ACTIVE
 ↓
COMPLETED
```

A Trip is not equivalent to a Departure.

---

# 13. PREPARATION ITEM STATE MACHINE

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
BLOCKED
NOT_APPLICABLE
```

Flow:

```text
NOT_STARTED
 ↓
IN_PROGRESS
 ↓
COMPLETED
```

Alternative:

```text
IN_PROGRESS → BLOCKED
BLOCKED → IN_PROGRESS
```

`NOT_APPLICABLE` requires authorized rule/action.

---

# 14. MANASIK SESSION STATE MACHINE

```text
DRAFT
SCHEDULED
OPEN
IN_PROGRESS
COMPLETED
CANCELLED
```

Flow:

```text
DRAFT
 ↓
SCHEDULED
 ↓
OPEN
 ↓
IN_PROGRESS
 ↓
COMPLETED
```

Cancellation:

```text
SCHEDULED → CANCELLED
OPEN → CANCELLED
```

---

# 15. REFERRAL STATE MACHINE

```text
CREATED
ATTRIBUTED
CONVERTED
REJECTED
EXPIRED
```

Primary flow:

```text
CREATED
 ↓
ATTRIBUTED
 ↓
CONVERTED
```

Attribution must be preserved historically.

---

# 16. COMMISSION STATE MACHINE

```text
PENDING
ELIGIBLE
APPROVED
PAYABLE
PAID
REJECTED
CANCELLED
```

Exact eligibility and calculation:

**TBD — Partner/Commission Policy**

---

# 17. NOTIFICATION STATE MACHINE

Notification lifecycle:

```text
CREATED
QUEUED
SENT
DELIVERED
READ
FAILED
CANCELLED
```

Not every channel will support every state.

Delivery status should be tracked separately from logical notification status where required.

---

# 18. OPERATIONAL ALERT STATE MACHINE

```text
OPEN
ACKNOWLEDGED
IN_PROGRESS
RESOLVED
DISMISSED
```

Flow:

```text
OPEN
 ↓
ACKNOWLEDGED
 ↓
IN_PROGRESS
 ↓
RESOLVED
```

An alert should preserve:

- source condition,
- affected entity,
- responsible party,
- resolution,
- timestamp.

---

# 19. CUSTOMER / PILGRIM LIFECYCLE

Customer identity must not be confused with a single Umrah journey.

A customer may have:

```text
Lead #1
Registration #1
Trip #1
Registration #2
Trip #2
...
```

Therefore:

```text
Customer Lifecycle
```

is separate from:

```text
Journey Lifecycle
```

---

# 20. JOURNEY LIFECYCLE

The journey/registration-trip lifecycle is:

```text
PROSPECT
 ↓
REGISTERED
 ↓
DOCUMENTS
 ↓
PAYMENT
 ↓
CONFIRMED
 ↓
PREPARING
 ↓
READY
 ↓
DEPARTED
 ↓
ON_TRIP
 ↓
RETURNED
```

This is a derived journey representation.

It must not become a second independent source of truth.

---

# 21. ALUMNI STATUS

`ALUMNI` should represent a relationship/history derived from completed journey participation.

It should not overwrite:

```text
Customer
Pilgrim
Registration
Trip
```

A customer can be:

```text
ALUMNI
```

and later become an active repeat pilgrim.

---

# 22. STATE TRANSITION CONTRACT

Every API/service mutation must conceptually follow:

```text
load record
 ↓
check current state
 ↓
authorize actor
 ↓
validate preconditions
 ↓
perform transaction
 ↓
write audit
 ↓
emit event
 ↓
trigger notification if applicable
```

---

# 23. TRANSACTIONAL INTEGRITY

For high-impact state changes:

```text
state change
+
related record changes
+
audit
```

should be performed atomically where appropriate.

Example:

```text
verifyPayment()
```

should not produce:

```text
payment = VERIFIED
audit = missing
```

because one operation failed halfway.

---

# 24. IDEMPOTENCY

External callbacks and retryable operations must be idempotent.

Examples:

```text
payment webhook
notification delivery
registration submission
document upload confirmation
```

Duplicate requests must not create duplicate financial or journey records.

---

# 25. CONCURRENCY

State changes must account for concurrent actions.

Example:

```text
Two users attempt to take the final departure seat.
```

The system must use transactional protection/constraints rather than frontend availability alone.

---

# 26. STATE MACHINE IMPLEMENTATION RULE

AI agents must not add states because a UI needs a label.

New state requires:

```text
business meaning
+
transition rules
+
authorization
+
database impact
+
API impact
+
UI impact
+
audit impact
```

---

# 27. FINAL STATE MACHINE PRINCIPLE

> **State is business truth.**

UI labels, progress indicators and dashboards must derive from valid domain state rather than inventing their own lifecycle.

---

# 28. IMPLEMENTATION GATE

Before coding any stateful module, verify:

```text
✓ States defined
✓ Transitions defined
✓ Actors defined
✓ Permissions defined
✓ Preconditions defined
✓ Invalid transitions defined
✓ Audit defined
✓ Notification defined
✓ Concurrency considered
✓ Tests defined
```

Only then is the state machine implementation-ready.