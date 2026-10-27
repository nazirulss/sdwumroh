# SDW UMROH — BUSINESS RULES

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Business Rules Specification

---

# 1. PURPOSE

This document defines rules that determine how SDW UMROH business data and workflows behave.

Business rules are different from UI behavior.

A rule must remain valid regardless of whether an action is performed through:

- website,
- PWA,
- admin dashboard,
- API,
- automation,
- or another authorized interface.

---

# 2. RULE CLASSIFICATION

Rules are categorized as:

```text
CUSTOMER
CRM
REGISTRATION
PACKAGE
DOCUMENT
FINANCE
PAYMENT
TRIP
OPERATIONS
MANASIK
PARTNER
COMMUNICATION
SECURITY
AUDIT
```

---

# 3. CUSTOMER RULES

## BR-CUS-001 — Unique Customer Identity

The system should avoid creating duplicate customer records when sufficient identifying information already exists.

Possible matching fields may include:

- phone,
- email,
- identity number where appropriate,
- passport number where appropriate.

Matching criteria must be finalized before automatic duplicate handling is implemented.

---

## BR-CUS-002 — Historical Customer Record

A customer record must remain available even after a trip is completed.

Completion does not mean deletion.

---

## BR-CUS-003 — Repeat Journey

A pilgrim may register for a future Umrah journey without creating an entirely new person identity.

Historical registrations and trips must remain separate.

---

# 4. CRM RULES

## BR-CRM-001 — Every Lead Has a Source

A lead should record how it entered the system where the source is known.

Examples:

- Website
- WhatsApp
- Instagram
- Referral
- Agent
- Event
- Office
- Manual

---

## BR-CRM-002 — Lead Ownership

A lead should have an identifiable responsible sales owner where the workflow requires assignment.

---

## BR-CRM-003 — Follow-up Is Not Activity

A completed interaction must not automatically be treated as the next follow-up.

Activity records historical events.

Follow-up records future action.

---

## BR-CRM-004 — Conversion Preservation

When a lead becomes a registered customer, the relationship between the lead and resulting registration/pilgrim must be preserved.

This is required for sales attribution and history.

---

# 5. PACKAGE RULES

## BR-PKG-001 — Package vs Departure

A package represents a product offering.

A departure represents a scheduled instance.

They must not be treated as interchangeable concepts.

---

## BR-PKG-002 — Published Package

A package must not become publicly visible merely because it exists.

It must have an explicit publish state.

---

## BR-PKG-003 — Package Price

The price shown to the public must come from an approved package/departure pricing source.

UI developers must not hard-code business prices.

---

## BR-PKG-004 — Historical Price

A price used in an existing registration must remain historically traceable.

Changing the current package price must not silently rewrite historical financial records.

---

# 6. REGISTRATION RULES

## BR-REG-001 — Registration Must Reference Product

A registration must reference the relevant package and, where applicable, departure.

---

## BR-REG-002 — Registration Has State

Registration must have an explicit state.

Suggested initial states:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
NEEDS_REVISION
APPROVED
CONFIRMED
CANCELLED
```

Final states require approval.

---

## BR-REG-003 — No Silent Confirmation

A registration must not become confirmed merely because a registration form was submitted.

Confirmation conditions must be satisfied.

---

## BR-REG-004 — Duplicate Registration Protection

The system should prevent accidental duplicate registrations for the same pilgrim and same departure unless explicitly allowed.

---

# 7. DOCUMENT RULES

## BR-DOC-001 — Requirement vs Document

A required document and an uploaded document are separate concepts.

---

## BR-DOC-002 — Verification

A document is not considered verified merely because it was uploaded.

---

## BR-DOC-003 — Revision

When a document requires correction, the system should preserve the reason/request for revision.

---

## BR-DOC-004 — Verification Audit

Document verification decisions must be auditable.

---

## BR-DOC-005 — Sensitive Access

Document files must not be publicly accessible merely because a file URL exists.

Access must be authorized.

---

# 8. PAYMENT RULES

## BR-PAY-001 — Payment Does Not Equal Invoice

An invoice/payment obligation is distinct from an actual payment transaction.

---

## BR-PAY-002 — Payment Must Be Traceable

Every accepted payment must have a reference or transaction identity.

---

## BR-PAY-003 — Balance Calculation

Outstanding balance should be calculated from authoritative financial records.

It must not be manually overwritten as the source of truth.

---

## BR-PAY-004 — Payment Verification

Where manual payment evidence is used, the payment should remain unverified until an authorized process confirms it.

---

## BR-PAY-005 — Payment Status

A payment record must have explicit status.

Potential states:

```text
PENDING
SUBMITTED
VERIFIED
FAILED
REJECTED
CANCELLED
REFUNDED
```

Final state machine requires approval.

---

## BR-PAY-006 — No Unauthorized Financial Mutation

Sales, operations, tour leader and muthawwif roles must not automatically receive financial mutation permissions.

---

# 9. REFUND RULES

## BR-REF-001 — Refund Is Controlled

Refunds require an explicit workflow.

---

## BR-REF-002 — Refund Is Audited

Refund actions must record:

- requester,
- approver where applicable,
- amount,
- reason,
- date,
- resulting financial state.

---

## BR-REF-003 — Refund Policy

Eligibility and calculation rules must be defined by SDW policy before implementation.

The application must not invent refund formulas.

---

# 10. PILGRIM CONFIRMATION RULES

A pilgrim may be considered confirmed only when defined business conditions are satisfied.

Potential conditions:

```text
Valid Registration
+
Required Minimum Payment
+
Required Documents
+
Available Departure
```

This is a placeholder until SDW confirms its actual operational policy.

---

# 11. PREPARATION RULES

## BR-PREP-001

Preparation progress must be based on explicitly defined requirements.

---

## BR-PREP-002

A checklist item should have a clear completion condition.

---

## BR-PREP-003

The system must distinguish:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
BLOCKED
NOT_APPLICABLE
```

where appropriate.

---

# 12. DEPARTURE RULES

## BR-DEP-001 — Capacity

A departure may have a defined capacity.

The system should prevent registrations exceeding approved capacity unless an authorized override exists.

---

## BR-DEP-002 — Departure Status

Potential states:

```text
DRAFT
OPEN
FULL
CLOSED
DEPARTED
COMPLETED
CANCELLED
```

Final definitions require approval.

---

## BR-DEP-003 — Historical Departure

A completed departure must remain historically accessible.

---

# 13. READINESS RULES

Operational readiness must be calculated from explicit conditions.

Possible dimensions:

```text
DOCUMENT
PAYMENT
PREPARATION
MANASIK
OPERATIONAL_RESOURCE
```

A readiness percentage must never be a decorative number.

Every percentage must be explainable.

---

# 14. TRIP RULES

## BR-TRIP-001

A trip must reference its departure.

---

## BR-TRIP-002

Trip members must reference valid pilgrims/registrations.

---

## BR-TRIP-003

Tour Leader access is restricted to assigned trips.

---

## BR-TRIP-004

Muthawwif access is restricted to relevant trips/groups.

---

# 15. ITINERARY RULES

## BR-ITN-001

Only authorized operational users may modify published itinerary information.

---

## BR-ITN-002

Important itinerary changes should generate notifications to affected users.

---

## BR-ITN-003

Material changes should be auditable.

---

# 16. ANNOUNCEMENT RULES

## BR-COM-001

Every announcement must have an audience.

---

## BR-COM-002

An announcement should not be visible to users outside its intended audience.

---

## BR-COM-003

Operational announcements should identify their originating role/user.

---

# 17. MANASIK RULES

## BR-MNS-001

Manasik content and manasik sessions are separate concepts.

---

## BR-MNS-002

A pilgrim's attendance/completion must be traceable.

---

## BR-MNS-003

Completion of digital content and attendance at physical sessions should not automatically be treated as the same thing.

---

# 18. PARTNER RULES

## BR-PRT-001 — Referral Attribution

A valid referral should preserve its originating partner/source.

---

## BR-PRT-002 — Partner Data Isolation

A partner may only view permitted leads/customers associated with that partner.

---

## BR-PRT-003 — Commission

Commission must be calculated from explicit approved rules.

The system must not infer commission from arbitrary sales totals.

---

# 19. ALUMNI RULES

## BR-ALM-001

A customer becomes eligible for alumni status after the relevant journey is completed.

---

## BR-ALM-002

Alumni status must not remove historical pilgrim/trip records.

---

## BR-ALM-003

Referral capability may be enabled independently of alumni status.

---

# 20. CANCELLATION RULES

Cancellation must be treated as a controlled state transition.

Potential process:

```text
REQUEST
 ↓
REVIEW
 ↓
APPROVAL
 ↓
FINANCIAL HANDLING
 ↓
CANCELLED
```

The application must not invent cancellation fees or refund calculations.

---

# 21. SECURITY RULES

## BR-SEC-001

Frontend visibility is not sufficient authorization.

---

## BR-SEC-002

Sensitive operations must be authorized server-side.

---

## BR-SEC-003

Users must not access another user's private data by modifying a URL, ID, request payload or client-side state.

---

## BR-SEC-004

Document files require access control.

---

## BR-SEC-005

High-impact actions must be auditable.

---

# 22. DATA INTEGRITY RULES

## BR-DAT-001

Critical business records should not be physically deleted merely to remove them from normal views.

Where appropriate, use:

- archive,
- inactive,
- cancelled,
- voided,
- superseded.

---

## BR-DAT-002

Historical financial records must remain traceable.

---

## BR-DAT-003

Historical trip records must remain traceable.

---

# 23. AUTOMATION RULES

Automation may:

- remind,
- notify,
- calculate,
- create tasks,
- identify exceptions.

Automation must not silently perform irreversible/high-impact actions.

Examples requiring controlled human involvement:

- refund,
- cancellation,
- sensitive document decision,
- financial override,
- role escalation,
- destructive deletion.

---

# 24. NOTIFICATION RULES

Notifications should be generated by meaningful business events.

A notification should identify:

```text
EVENT
AUDIENCE
CHANNEL
MESSAGE
DELIVERY STATUS
```

The system should avoid duplicate notifications caused by repeated processing.

---

# 25. AUDIT RULES

At minimum, audit:

- login/security events where appropriate,
- role changes,
- permission changes,
- document verification,
- payment verification,
- refunds,
- cancellations,
- package price changes,
- departure changes,
- critical status overrides.

---

# 26. RULE PRIORITY

When business rules conflict:

```text
LEGAL / REGULATORY REQUIREMENT
        ↓
APPROVED SDW POLICY
        ↓
APPROVED BUSINESS RULE
        ↓
PRODUCT REQUIREMENT
        ↓
UX CONVENIENCE
```

The system should not prioritize convenience over an approved business rule.

---

# 27. UNKNOWN RULE PRINCIPLE

If the business has not yet defined a rule, the AI must not invent one.

It should mark the rule:

`TBD`

and surface the question for product/business approval.

---

# 28. FINAL BUSINESS RULE PRINCIPLE

Business logic belongs to the domain, not to the screen.

A rule must remain consistent regardless of whether the operation is initiated from:

- Website,
- PWA,
- Backoffice,
- API,
- Automation,
- or future interfaces.

---

# 29. APPROVAL STATUS

The following rules remain provisional until confirmed by SDW:

- exact registration confirmation conditions,
- payment schedule rules,
- cancellation policy,
- refund calculation,
- commission calculation,
- departure capacity policy,
- document requirements,
- operational readiness formula,
- exact status machines.

These must be finalized before production financial/operational logic is locked.