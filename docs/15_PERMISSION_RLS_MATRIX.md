# SDW UMROH — PERMISSION & RLS MATRIX

**Document Status:** REVIEW  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Authorization, Scope & Row-Level Security Contract  
**Parent Documents:**
- `03_USER_ROLES_AND_PERMISSIONS.md`
- `05_DOMAIN_MODEL.md`
- `06_BUSINESS_RULES.md`
- `10_DATABASE_SPEC.md`
- `12_SECURITY_AND_AUDIT.md`
- `14_STATE_MACHINES.md`

---

# 1. PURPOSE

Dokumen ini menghubungkan:

```text
ROLE
 ↓
PERMISSION
 ↓
RESOURCE
 ↓
ACTION
 ↓
SCOPE
 ↓
DATABASE TABLE
 ↓
RLS POLICY
```

Tujuan:

- least privilege;
- explicit authorization;
- partner isolation;
- pilgrim self-access;
- internal role separation;
- database-level enforcement.

---

# 2. AUTHORIZATION LAYERS

Authorization harus berlapis:

```text
Authentication
 ↓
Role
 ↓
Permission
 ↓
Scope
 ↓
Server Authorization
 ↓
PostgreSQL RLS
```

Frontend visibility bukan security boundary.

---

# 3. SCOPE TYPES

Canonical scopes:

```text
GLOBAL
TEAM
ASSIGNED
TRIP
OWN
REFERRAL
```

---

# 4. ROLE GROUPS

## External

```text
Visitor
Prospective Pilgrim
Pilgrim
Alumni
Partner
```

## Internal

```text
Owner
Manager
Sales
Customer Service/Admin
Finance
Document/Visa Officer
Operations
Tour Leader
Muthawwif
```

---

# 5. PERMISSION NAMING

Format:

```text
RESOURCE_ACTION
```

Examples:

```text
LEAD_VIEW
LEAD_CREATE
LEAD_UPDATE
LEAD_ASSIGN

DOCUMENT_VIEW
DOCUMENT_VERIFY
DOCUMENT_REQUEST_REVISION

PAYMENT_VIEW
PAYMENT_VERIFY

REGISTRATION_VIEW
REGISTRATION_APPROVE
REGISTRATION_CANCEL
```

---

# 6. ACTION CLASSES

Canonical action vocabulary:

```text
VIEW
CREATE
UPDATE
SUBMIT
VERIFY
APPROVE
REJECT
ASSIGN
PUBLISH
CANCEL
VOID
REFUND
EXPORT
DELETE
```

Not every resource needs every action.

---

# 7. RESOURCE GROUPS

```text
USER
CUSTOMER
LEAD
SALES_ACTIVITY
FOLLOW_UP
PACKAGE
DEPARTURE
REGISTRATION
PILGRIM
DOCUMENT_REQUIREMENT
DOCUMENT
INVOICE
PAYMENT_SCHEDULE
PAYMENT
REFUND
TRIP
TRIP_MEMBER
ITINERARY
HOTEL
TRANSPORT
TOUR_LEADER
MUTHAWWIF
MANASIK
PREPARATION
ANNOUNCEMENT
NOTIFICATION
PARTNER
REFERRAL
COMMISSION
ALUMNI
CONTENT
AUDIT
REPORT
SETTINGS
```

---

# 8. PILGRIM ACCESS

A Pilgrim may:

```text
VIEW own profile
UPDATE permitted own profile
VIEW own registration
VIEW own journey
VIEW own documents
UPLOAD own documents
VIEW own payment information
VIEW own invoices
VIEW own preparation
VIEW own manasik
VIEW own itinerary
VIEW own announcements
VIEW own notifications
CREATE support request
```

A Pilgrim may not:

```text
VIEW another pilgrim
VERIFY own document
VERIFY payment
CHANGE agreed price
CHANGE registration state arbitrarily
VIEW internal notes
VIEW other customers
```

---

# 9. PARTNER ACCESS

Partner scope:

```text
REFERRAL
```

Partner may:

```text
VIEW own dashboard
CREATE referral
VIEW own referrals
VIEW own attributed leads
VIEW own attributed prospects
VIEW eligible commission information
VIEW marketing materials
UPDATE own profile
```

Partner may not:

```text
VIEW another partner's data
VERIFY documents
VERIFY payments
CHANGE package pricing
CHANGE registration status
VIEW unrestricted pilgrim records
```

---

# 10. SALES ACCESS

Sales may:

```text
VIEW assigned leads
CREATE leads
UPDATE assigned leads
CREATE activities
CREATE follow-ups
ASSIGN within permitted scope
VIEW package information
VIEW relevant prospect/customer information
```

Sales should not by default:

```text
VERIFY payments
VERIFY sensitive documents
EXECUTE refunds
CHANGE financial records
```

---

# 11. CUSTOMER SERVICE / ADMIN

Admin may, according to granted permissions:

```text
VIEW customer
CREATE customer
UPDATE permitted profile data
VIEW registration
ASSIST registration
VIEW relevant documents
COMMUNICATE with customer
```

Admin does not automatically gain:

```text
finance mutation
document verification
refund approval
role administration
```

---

# 12. FINANCE

Finance may:

```text
VIEW invoices
CREATE invoice
UPDATE permitted financial records
VIEW payment
VERIFY payment
VIEW outstanding
VIEW payment schedule
CREATE approved financial adjustment
VIEW financial reports
```

High-risk actions such as:

```text
REFUND
VOID
WRITE-OFF
```

require explicitly granted permission and approval policy.

---

# 13. DOCUMENT / VISA OFFICER

May:

```text
VIEW required documents
VIEW submitted documents
VIEW document versions
VERIFY document
REQUEST REVISION
MARK EXPIRED
VIEW relevant pilgrim information
```

Must not automatically receive:

```text
financial mutation
partner commission access
unrelated CRM data
```

---

# 14. OPERATIONS

Operations may:

```text
VIEW departures
CREATE departure
UPDATE operational data
MANAGE trip
MANAGE itinerary
MANAGE hotel
MANAGE transport
ASSIGN tour leader
ASSIGN muthawwif
VIEW readiness
CREATE operational alert
PUBLISH operational announcement
```

Financial mutation remains separate.

---

# 15. TOUR LEADER

Scope:

```text
TRIP
```

May:

```text
VIEW assigned trip
VIEW trip members
VIEW itinerary
VIEW operational announcements
PERFORM approved check-in
CREATE relevant operational update
```

Should not automatically see:

```text
full financial information
internal sales notes
unrelated customers
```

---

# 16. MUTHAWWIF

Scope:

```text
TRIP
```

May:

```text
VIEW assigned group
VIEW relevant pilgrim information
VIEW itinerary
VIEW manasik information
VIEW announcements
RECORD attendance where authorized
```

Financial access is not granted by default.

---

# 17. MANAGER

Manager may have broader operational/business access:

```text
VIEW reports
VIEW CRM
VIEW customers
VIEW operations
VIEW finance
APPROVE configured actions
```

However:

> Manager ≠ unrestricted database access.

Sensitive actions must remain explicit.

---

# 18. OWNER

Owner has the broadest administrative role.

Owner may receive:

```text
GLOBAL
```

scope where explicitly configured.

All elevated/high-impact actions remain auditable.

---

# 19. HIGH-LEVEL MATRIX

| Resource | Pilgrim | Partner | Sales | Admin | Finance | Docs | Ops | TL | Muthawwif | Manager | Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Lead | Own-related | Referral | Assigned | Relevant | — | — | — | — | — | View | Global |
| Customer | Own | Referral | Assigned | Relevant | Relevant | Relevant | Relevant | Trip | Trip | Broad | Global |
| Registration | Own | Relevant | View | Manage | View | Relevant | Relevant | Trip | Trip | Manage | Global |
| Document | Own/upload | — | View limited | Relevant | — | Verify | Relevant | Trip-limited | Trip-limited | Broad | Global |
| Invoice | Own/view | — | — | Limited | Manage | — | — | — | — | View/Approve | Global |
| Payment | Own/view | — | — | — | Manage/Verify | — | — | — | — | View/Approve | Global |
| Departure | Relevant | — | View | Relevant | View | View | Manage | View | View | Manage | Global |
| Trip | Own member | Relevant | Limited | Relevant | — | Relevant | Manage | Assigned | Assigned | Manage | Global |
| Itinerary | View | — | — | — | — | — | Manage | Assigned | Assigned | Manage | Global |
| Partner | — | Own | — | Relevant | Commission | — | — | — | — | Manage | Global |
| Commission | — | Own | — | — | Finance | — | — | — | — | Approve | Global |
| Reports | — | Own | Assigned | Relevant | Finance | Docs | Ops | Trip | Trip | Broad | Global |
| Settings | — | Own profile | — | Limited | Finance settings | Doc settings | Ops settings | — | — | Manage | Global |

This is a high-level matrix. Exact permission rows are authoritative at implementation level.

---

# 20. DATABASE RLS PRINCIPLE

Every sensitive table must have explicit policies.

Concept:

```text
USING
=
which existing rows can be seen/affected

WITH CHECK
=
which new/updated rows are allowed
```

---

# 21. PILGRIM RLS PATTERN

Example conceptual rule:

```text
Pilgrim can SELECT
WHERE pilgrim.user_id = auth.uid()
```

For related tables:

```text
documents
payments
registrations
preparation
notifications
```

access should be derived through authorized ownership relationships.

---

# 22. PARTNER RLS PATTERN

Partner access must be scoped through:

```text
partner_id = current_partner()
```

or equivalent relationship.

Never rely only on:

```text
request.query.partner_id
```

because client-supplied IDs are untrusted.

---

# 23. TRIP-SCOPED RLS

Tour Leader and Muthawwif access should be based on assignment:

```text
trip_members
trip_staff_assignments
```

not merely on role.

Example:

```text
role = TOUR_LEADER
AND
user assigned to trip
```

---

# 24. FINANCE RLS

Financial tables require:

```text
role/permission
+
organization scope
+
record scope
```

Pilgrim:

```text
own records only
```

Finance:

```text
authorized organizational records
```

---

# 25. DOCUMENT STORAGE SECURITY

Database RLS is not sufficient for storage files.

Private documents require:

```text
private bucket
+
authorized access policy
+
short-lived signed access where needed
```

Never expose permanent public URLs for sensitive documents.

---

# 26. DELETE POLICY

Default:

```text
DELETE = DENY
```

unless explicitly required.

Prefer:

```text
archive
cancel
void
deactivate
```

for business records.

---

# 27. EXPORT POLICY

`EXPORT` is a separate permission.

A user who can:

```text
VIEW
```

does not automatically have:

```text
EXPORT
```

because exports can create a new data-exposure channel.

---

# 28. AUDIT REQUIREMENTS

Audit at minimum:

```text
role changes
permission changes
document verification
payment verification
refund
cancellation
price change
departure changes
sensitive exports
critical overrides
```

---

# 29. AUTHORIZATION DECISION MODEL

Every sensitive mutation should resolve:

```text
Authenticated?
 ↓
Role?
 ↓
Permission?
 ↓
Scope?
 ↓
Current State?
 ↓
Business Rule?
 ↓
Allowed?
```

---

# 30. FINAL RLS PRINCIPLE

> **Application authorization determines what the user is allowed to attempt. RLS determines what the database will allow the request to access.**

Both layers are required.

---

# 31. IMPLEMENTATION GATE

Before marking a protected feature complete:

```text
✓ UI permission
✓ Server authorization
✓ RLS policy
✓ Storage policy if applicable
✓ Scope test
✓ Wrong-user test
✓ Wrong-role test
✓ Direct API test
✓ Audit test
```