# SDW UMROH — USER JOURNEYS & WORKFLOWS

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** User Journey & Workflow Specification  
**Parent Documents:**  
- `00_PROJECT_CONTEXT.md`
- `01_PRD.md`
- `02_PRODUCT_BLUEPRINT.md`
- `03_USER_ROLES_AND_PERMISSIONS.md`

---

# 1. PURPOSE

This document defines how users and business processes move through the SDW UMROH platform.

The system must not be designed only around screens.

It must be designed around:

**Actors + Trigger + State + Action + Decision + Outcome**

---

# 2. CORE CUSTOMER JOURNEY

The primary SDW journey is:

```text
DISCOVER
   ↓
CONSULT
   ↓
REGISTER
   ↓
VERIFY
   ↓
PAY
   ↓
PREPARE
   ↓
DEPART
   ↓
UMRAH
   ↓
RETURN
   ↓
ALUMNI
   ↓
REFER / REPEAT
```

---

# 3. WORKFLOW DEFINITIONS

Every workflow should eventually contain:

```text
Workflow ID
Name
Actor
Trigger
Preconditions
Steps
Decision Points
State Changes
Notifications
Exceptions
Outcome
Audit Requirements
```

---

# 4. WF-001 — WEBSITE VISITOR → LEAD

## Purpose

Convert an interested website visitor into a manageable sales lead.

## Actor

Visitor / Prospective Pilgrim

## Trigger

User submits:

- consultation form,
- package inquiry,
- registration interest,
- contact form.

## Flow

```text
VISITOR
 ↓
View Package / Content
 ↓
CTA
 ↓
Lead Form
 ↓
Submit
 ↓
Lead Created
 ↓
Lead Assigned
 ↓
Sales Follow-up
```

## Required Actions

1. User submits lead information.
2. System validates required fields.
3. System creates lead.
4. System records source.
5. System assigns lead according to configured rules.
6. Sales receives notification.
7. Lead becomes available in CRM.

## Initial Lead State

`NEW`

## Possible Next States

```text
CONTACTED
CONSULTATION
FOLLOW_UP
REGISTERED
LOST
DORMANT
```

---

# 5. WF-002 — LEAD QUALIFICATION

## Actor

Sales

## Trigger

New lead assigned.

## Flow

```text
NEW
 ↓
CONTACT
 ↓
UNDERSTAND NEED
 ↓
PACKAGE DISCUSSION
 ↓
QUALIFY
 ↓
FOLLOW-UP / REGISTRATION
```

## Sales Actions

- contact lead,
- record activity,
- record notes,
- identify desired departure,
- identify package interest,
- schedule follow-up,
- send approved information.

## Important Rule

Sales activity should be recorded in CRM rather than existing only in private notes or personal devices.

---

# 6. WF-003 — PACKAGE CONSULTATION

## Actor

Sales / Customer Service

## Trigger

Prospective pilgrim requests consultation.

## Flow

```text
Lead
 ↓
Needs Identification
 ↓
Package Matching
 ↓
Package Explanation
 ↓
Questions
 ↓
Decision
```

## Possible Outcomes

```text
Continue Follow-up
Register
Not Interested
Dormant
```

The system should not force a registration if the user is not ready.

---

# 7. WF-004 — REGISTRATION

## Actor

Prospective Pilgrim

## Trigger

User chooses to register.

## Flow

```text
SELECT PACKAGE
 ↓
SELECT DEPARTURE
 ↓
ENTER BASIC DATA
 ↓
CREATE ACCOUNT
 ↓
SUBMIT REGISTRATION
 ↓
REGISTRATION CREATED
 ↓
DOCUMENT REQUIREMENTS GENERATED
```

## System Actions

- create registration,
- associate selected package,
- associate departure where applicable,
- create/associate pilgrim profile,
- generate required document checklist,
- generate applicable payment structure,
- notify relevant staff.

## Initial Registration State

`SUBMITTED`

Possible states:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
NEEDS_REVISION
APPROVED
CONFIRMED
CANCELLED
```

Exact state transitions require business-rule approval.

---

# 8. WF-005 — DOCUMENT SUBMISSION

## Actor

Pilgrim

## Trigger

Registration requires documents.

## Flow

```text
Document Requirement
 ↓
Pilgrim Upload
 ↓
Validation
 ↓
UNDER_REVIEW
 ↓
Document Officer
 ↓
VERIFY
```

## Possible Outcomes

```text
VERIFIED
REVISION_REQUIRED
REJECTED
```

## Revision Flow

```text
REVISION_REQUIRED
 ↓
Notify Pilgrim
 ↓
New Upload
 ↓
UNDER_REVIEW
 ↓
Verification
```

---

# 9. WF-006 — DOCUMENT VERIFICATION

## Actor

Document / Visa Officer

## Trigger

Document uploaded.

## Flow

```text
UPLOADED
 ↓
UNDER_REVIEW
 ↓
Officer Review
 ↓
Decision
```

### If valid

```text
VERIFIED
```

### If correction required

```text
REVISION_REQUIRED
 ↓
Notify Pilgrim
```

## Audit

Every verification decision should record:

- reviewer,
- timestamp,
- status,
- relevant reason/comment.

---

# 10. WF-007 — PAYMENT SETUP

## Actor

System / Finance

## Trigger

Registration reaches a state where payment information can be generated.

## Flow

```text
Registration
 ↓
Determine Package Price
 ↓
Determine Payment Schedule
 ↓
Generate Invoice / Payment Plan
 ↓
Display to Pilgrim
```

The exact calculation rules belong in:

`06_BUSINESS_RULES.md`

---

# 11. WF-008 — PAYMENT

## Actor

Pilgrim / Finance

## Possible Payment Flow

```text
PAYMENT DUE
 ↓
Pilgrim Initiates Payment
 ↓
Payment Method
 ↓
Payment Submitted
 ↓
Verification / Gateway Confirmation
 ↓
PAYMENT RECORDED
 ↓
Outstanding Balance Updated
```

## Possible States

```text
PENDING
SUBMITTED
VERIFIED
FAILED
REJECTED
CANCELLED
REFUNDED
```

Final financial state definitions require approval.

---

# 12. WF-009 — REGISTRATION CONFIRMATION

A pilgrim should not automatically become fully confirmed merely because a registration record exists.

Confirmation should depend on defined business conditions.

Potential conditions:

```text
Registration Valid
+
Required Minimum Payment
+
Required Documents
+
Package / Departure Available
```

Then:

```text
CONFIRMED
```

Exact conditions must be locked in business rules.

---

# 13. WF-010 — PREPARATION

## Actor

Pilgrim

## Trigger

Registration becomes confirmed.

## Flow

```text
CONFIRMED
 ↓
Preparation Checklist Generated
 ↓
Pilgrim Completes Requirements
 ↓
System Tracks Progress
 ↓
Pending Items Identified
```

Potential checklist categories:

```text
Documents
Payment
Manasik
Travel Briefing
Equipment
Other Requirements
```

---

# 14. WF-011 — MANASIK

## Actor

Pilgrim / Admin / Manasik Coordinator

## Flow

```text
Manasik Content Available
 ↓
Pilgrim Accesses Material
 ↓
Learning
 ↓
Attendance / Completion
 ↓
Progress Recorded
```

Scheduled manasik:

```text
Session Created
 ↓
Pilgrim Assigned
 ↓
Reminder
 ↓
Attendance
 ↓
Completion
```

---

# 15. WF-012 — DEPARTURE READINESS

## Actor

Operations

## Trigger

Departure date approaches.

## Flow

```text
Upcoming Departure
 ↓
Evaluate Pilgrims
 ↓
Check Documents
 ↓
Check Payment
 ↓
Check Preparation
 ↓
Check Operational Data
 ↓
Identify Exceptions
 ↓
Resolve Exceptions
 ↓
READY
```

The system should expose unresolved issues.

Example:

```text
Departure: 20 Dec 2026

42 Pilgrims

✓ 40 Ready
⚠ 2 Exceptions

Ahmad
Passport verification pending

Budi
Payment outstanding
```

---

# 16. WF-013 — PRE-DEPARTURE BRIEFING

## Actor

Operations / Tour Leader

## Trigger

Configured period before departure.

## Flow

```text
Departure Approaching
 ↓
Travel Information Finalized
 ↓
Briefing Published
 ↓
Notification
 ↓
Pilgrim Acknowledgement / View
```

Information may include:

- meeting point,
- gathering time,
- flight,
- baggage information,
- transport,
- coordinator,
- important instructions.

---

# 17. WF-014 — CHECK-IN

## Actor

Operations / Tour Leader

## Trigger

Departure check-in.

## Flow

```text
Pilgrim Arrives
 ↓
Identify Pilgrim
 ↓
Check-in
 ↓
Record Time
 ↓
Update Departure Status
```

Potential implementation:

- QR,
- manual search,
- verified identity.

Exact implementation is TBD.

---

# 18. WF-015 — DEPARTURE

## Actor

Operations / Tour Leader

## Flow

```text
READY
 ↓
CHECK-IN
 ↓
DEPARTED
```

System should update relevant journey state.

---

# 19. WF-016 — TRIP OPERATIONS

## Actor

Operations / Tour Leader / Muthawwif

The trip contains operational events.

```text
Departure
 ↓
Arrival
 ↓
Hotel
 ↓
Itinerary
 ↓
Religious Activities
 ↓
Announcements
 ↓
Return
```

The system should allow authorized personnel to publish relevant information.

---

# 20. WF-017 — ITINERARY UPDATE

## Actor

Authorized Operations User

## Trigger

Operational schedule changes.

## Flow

```text
Existing Itinerary
 ↓
Authorized User Updates
 ↓
Validation
 ↓
Publish
 ↓
Affected Users Notified
 ↓
Audit Log
```

Important operational changes should be traceable.

---

# 21. WF-018 — TRIP ANNOUNCEMENT

## Actor

Authorized Operations / Tour Leader

## Flow

```text
Create Announcement
 ↓
Select Audience
 ↓
Review
 ↓
Publish
 ↓
Notification
```

Audience may be:

- entire departure,
- specific group,
- specific users.

---

# 22. WF-019 — RETURN

## Actor

Operations / Tour Leader

## Flow

```text
TRIP
 ↓
RETURN JOURNEY
 ↓
ARRIVAL
 ↓
TRIP COMPLETED
 ↓
PILGRIM RETURNED
```

The system should preserve historical trip information.

Historical trip records should not be casually deleted.

---

# 23. WF-020 — ALUMNI TRANSITION

## Trigger

Trip completed.

## Flow

```text
RETURNED
 ↓
Trip Completed
 ↓
Alumni Eligibility
 ↓
ALUMNI
```

Potential alumni capabilities:

- trip history,
- documentation,
- testimonial,
- referral,
- future packages,
- alumni communication.

---

# 24. WF-021 — REFERRAL

## Actor

Alumni / Partner

## Flow

```text
Referral Link
 ↓
New Visitor
 ↓
Lead
 ↓
Registration
 ↓
Attribution Preserved
 ↓
Conversion
 ↓
Referral Reward / Commission
```

Attribution must be recorded at the appropriate stage.

The exact reward/commission rules belong to the business rules document.

---

# 25. WF-022 — PAYMENT REMINDER

## Trigger

Payment due date approaches.

## Flow

```text
Payment Schedule
 ↓
Due Date Approaching
 ↓
Check Outstanding
 ↓
Create Reminder
 ↓
Send Notification
```

Possible channels:

- PWA notification,
- WhatsApp,
- email.

The actual channels are configurable.

---

# 26. WF-023 — DOCUMENT REMINDER

## Trigger

Required document remains incomplete.

## Flow

```text
Required Document Missing
 ↓
Check Deadline
 ↓
Create Reminder
 ↓
Notify Pilgrim
 ↓
Notify Responsible Staff if escalation threshold reached
```

---

# 27. WF-024 — OPERATIONAL ALERT

## Trigger

An important readiness condition is unresolved.

Examples:

```text
Departure Approaching
+
Document Missing

OR

Departure Approaching
+
Payment Incomplete

OR

Operational Resource Missing
```

## Flow

```text
Condition Detected
 ↓
Alert Created
 ↓
Responsible Role Identified
 ↓
Notification
 ↓
Action
 ↓
Resolution
 ↓
Alert Closed
```

---

# 28. WF-025 — LEAD FOLLOW-UP

## Actor

Sales

## Flow

```text
Lead
 ↓
Follow-up Due
 ↓
Sales Notification
 ↓
Contact Lead
 ↓
Record Activity
 ↓
Next Follow-up
```

The system should make overdue follow-ups visible.

---

# 29. WF-026 — CANCELLATION

Cancellation must be treated as a controlled workflow.

Potential flow:

```text
Cancellation Request
 ↓
Review
 ↓
Determine Conditions
 ↓
Approval if Required
 ↓
Financial Handling
 ↓
Status Change
 ↓
Notification
 ↓
Audit
```

The exact cancellation/refund policy must be defined separately.

---

# 30. WF-027 — REFUND

Refund is a high-risk financial workflow.

Potential flow:

```text
Refund Request
 ↓
Review
 ↓
Eligibility Check
 ↓
Approval
 ↓
Refund Execution
 ↓
Financial Record
 ↓
Notification
 ↓
Audit
```

No automatic refund behavior should be implemented before the business rules are explicitly defined.

---

# 31. WF-028 — USER ACCESS

## Actor

Owner / Authorized Administrator

## Flow

```text
Create User
 ↓
Assign Role
 ↓
Assign Scope
 ↓
Activate
 ↓
User Login
 ↓
Permission Evaluation
```

When access is revoked:

```text
Disable
 ↓
Sessions / Access Invalidated as Appropriate
 ↓
Audit
```

---

# 32. WF-029 — SUPPORT REQUEST

## Actor

Pilgrim

## Flow

```text
Need Help
 ↓
Open Support Channel
 ↓
Request
 ↓
Assigned Staff
 ↓
Response
 ↓
Resolution
```

The initial version may use an external communication channel rather than a full ticketing system.

---

# 33. WF-030 — PACKAGE CREATION

## Actor

Authorized Admin / Manager

## Flow

```text
Create Package
 ↓
Basic Information
 ↓
Pricing
 ↓
Departure
 ↓
Services
 ↓
Review
 ↓
Publish
```

A package should not automatically become publicly visible merely because it exists in the database.

Recommended states:

```text
DRAFT
IN_REVIEW
PUBLISHED
PAUSED
ARCHIVED
```

---

# 34. WF-031 — DEPARTURE CREATION

## Actor

Operations / Manager

## Flow

```text
Create Departure
 ↓
Select Package
 ↓
Set Date
 ↓
Set Capacity
 ↓
Set Operational Information
 ↓
Review
 ↓
Publish / Open Registration
```

The exact relationship between package and departure must be defined in the domain model.

---

# 35. WF-032 — LEAD → PILGRIM CONVERSION

This is a critical bridge.

```text
LEAD
 ↓
Registration
 ↓
Existing User?
 ├── YES → Link Account
 └── NO → Create Account
 ↓
Create / Link Pilgrim
 ↓
Associate Package
 ↓
Associate Departure
 ↓
Continue Registration
```

The system must avoid creating duplicate customer records.

---

# 36. WF-033 — DUPLICATE CUSTOMER DETECTION

Before creating a new pilgrim record, the system should attempt to identify possible duplicates using approved matching criteria.

Potential criteria:

- phone,
- email,
- identity number where legally appropriate,
- passport number where appropriate.

If a possible duplicate exists:

```text
Potential Duplicate
 ↓
Review
 ↓
Merge / Link / Create New
```

Automatic destructive merging should not be performed without defined rules.

---

# 37. WF-034 — EXCEPTION HANDLING

Every major workflow must have an exception path.

Examples:

```text
Payment Failed
Document Rejected
Departure Full
Registration Cancelled
User Lost Access
Operational Change
Duplicate Customer
Missing Information
External Service Failure
```

The system must not leave users in an ambiguous state.

---

# 38. WORKFLOW STATE PRINCIPLE

Every important workflow should have:

```text
CURRENT STATE
+
AVAILABLE ACTIONS
+
NEXT POSSIBLE STATES
```

Example:

```text
DOCUMENT = UNDER_REVIEW

Allowed:
VERIFY
REQUEST_REVISION
REJECT

Not allowed:
PAYMENT
DELETE
DEPART
```

---

# 39. NOTIFICATION PRINCIPLE

Notifications should be generated from meaningful events.

```text
EVENT
 ↓
RULE
 ↓
AUDIENCE
 ↓
CHANNEL
 ↓
MESSAGE
 ↓
DELIVERY
 ↓
LOG
```

Notifications should not become uncontrolled spam.

---

# 40. WORKFLOW AUDIT PRINCIPLE

Important state changes should generate an audit event.

Example:

```text
Document
ID: DOC-001

Before:
UNDER_REVIEW

Action:
VERIFY

After:
VERIFIED

Actor:
Document Officer

Timestamp:
...

Reason:
...

Audit ID:
...
```

---

# 41. HUMAN-IN-THE-LOOP PRINCIPLE

Automation may:

- identify,
- remind,
- calculate,
- notify,
- recommend,
- create tasks.

Automation should not silently make high-impact decisions involving:

- refunds,
- cancellations,
- sensitive document decisions,
- financial overrides,
- role escalation,
- irreversible deletion.

Human approval should be used where appropriate.

---

# 42. WORKFLOW PRIORITY

Not all workflows need to be implemented simultaneously.

## P0 — Foundation

```text
WF-001 Lead
WF-002 Qualification
WF-004 Registration
WF-005 Documents
WF-007 Payment Setup
WF-008 Payment
WF-009 Confirmation
WF-010 Preparation
WF-012 Departure Readiness
```

## P1 — Operations

```text
WF-013 Briefing
WF-014 Check-in
WF-015 Departure
WF-016 Trip Operations
WF-017 Itinerary
WF-018 Announcement
WF-019 Return
```

## P2 — Growth

```text
WF-021 Referral
WF-020 Alumni
WF-029 Support
```

## P3 — Advanced

```text
WF-022 Payment Reminder
WF-023 Document Reminder
WF-024 Operational Alert
WF-026 Cancellation
WF-027 Refund
WF-033 Duplicate Detection
```

---

# 43. CORE WORKFLOW MAP

The complete journey can be summarized as:

```text
                    PUBLIC
                      │
                      ▼
                   LEAD
                      │
                      ▼
                CONSULTATION
                      │
                      ▼
                 REGISTRATION
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
      DOCUMENT                 PAYMENT
          │                       │
          └───────────┬───────────┘
                      ▼
                  CONFIRMED
                      │
                      ▼
                 PREPARATION
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      MANASIK      BRIEFING    CHECKLIST
          │           │           │
          └───────────┼───────────┘
                      ▼
                 READY TO GO
                      │
                      ▼
                  CHECK-IN
                      │
                      ▼
                  DEPARTURE
                      │
                      ▼
                    TRIP
                      │
                      ▼
                   RETURN
                      │
                      ▼
                   ALUMNI
                      │
              ┌───────┴───────┐
              ▼               ▼
           REFERRAL        REPEAT
```

---

# 44. WORKFLOW DESIGN RULE

A screen must never be designed independently from its workflow.

Every major screen should answer:

1. Who is using this?
2. What state is the record in?
3. What can this user do?
4. What happens after the action?
5. Who sees the result?
6. What notification is generated?
7. Is the action audited?
8. What happens if the action fails?

---

# 45. DEFINITION OF WORKFLOW COMPLETION

A workflow is not complete merely because its happy path works.

It must define:

- trigger,
- precondition,
- state,
- action,
- validation,
- success,
- failure,
- exception,
- notification,
- authorization,
- audit,
- next state.

---

# 46. FINAL WORKFLOW PRINCIPLE

SDW UMROH should operate as a **state-driven journey platform**, not simply as a collection of CRUD screens.

The primary design model is:

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

This model should guide subsequent:

- UX design,
- database design,
- API design,
- backend services,
- automation,
- testing,
- and AI-assisted implementation.