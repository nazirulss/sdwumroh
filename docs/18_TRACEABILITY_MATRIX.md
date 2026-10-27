# SDW UMROH — TRACEABILITY MATRIX

**Document Status:** REVIEW  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Requirement-to-Implementation Traceability Contract  
**Parent Documents:** `00–17`

---

# 1. PURPOSE

Traceability memastikan setiap keputusan penting dapat ditelusuri:

```text
REQUIREMENT
 ↓
WORKFLOW
 ↓
DOMAIN ENTITY
 ↓
DATABASE
 ↓
API
 ↓
UI
 ↓
PERMISSION
 ↓
RLS
 ↓
TEST
```

Tujuan:

- mencegah fitur kehilangan security layer;
- memudahkan audit implementation;
- membantu Antigravity/Gemini memahami dampak perubahan;
- mencegah orphaned tables/routes/API;
- memastikan requirement benar-benar terimplementasi.

---

# 2. TRACEABILITY RULE

Tidak ada critical feature yang dianggap complete jika salah satu layer penting hilang.

---

# 3. CORE TRACEABILITY

| ID | Requirement | Workflow | Domain | DB | API | UI | Security | Test |
|---|---|---|---|---|---|---|---|---|
| TR-001 | Lead capture | WF-001 | Lead | leads | Lead API | Public forms/CRM | Lead scope | Lead creation |
| TR-002 | Lead qualification | WF-002 | Lead/Activity | leads/activities | CRM API | CRM | Sales scope | State transition |
| TR-003 | Registration | WF-004 | Registration | registrations | Registration API | `/register` | Own/Admin | Submission |
| TR-004 | Documents | WF-005/006 | Document | pilgrim_documents | Document API | `/app/documents` | Own/Docs | Upload/verify |
| TR-005 | Payment | WF-007/008 | Invoice/Payment | invoices/payments | Finance API | `/app/payments` | Own/Finance | Verification |
| TR-006 | Confirmation | WF-009 | Registration/Journey | registrations | Confirmation action | Journey | State + rule | Eligibility |
| TR-007 | Preparation | WF-010 | Preparation | preparation_items | Preparation API | `/app/preparation` | Own/Ops | Completion |
| TR-008 | Readiness | WF-012 | Readiness | derived/alerts | Readiness service | Ops dashboard | Ops scope | Readiness rules |
| TR-009 | Briefing | WF-013 | Announcement | announcements | Announcement API | PWA | Audience | Publication |
| TR-010 | Check-in | WF-014 | Trip Member | trip_members | Check-in action | Ops/TL | Trip scope | Check-in |
| TR-011 | Trip | WF-015/016 | Trip | trips | Trip API | PWA/Ops | Trip scope | Lifecycle |
| TR-012 | Alumni | WF-020 | Alumni | alumni | Alumni API | `/app/alumni` | Own | Transition |
| TR-013 | Referral | WF-021 | Referral | referrals | Referral API | Partner/PWA | Attribution | Conversion |
| TR-014 | Reminder | WF-022/023 | Notification | notifications | Notification service | PWA | Audience | Delivery |
| TR-015 | Refund | WF-027 | Refund | refunds | Refund action | Finance | Approval | Authorization |

---

# 4. PUBLIC WEBSITE TRACEABILITY

Core public surfaces:

```text
Home
Packages
Package Detail
Departures
About
Why SDW
Testimonials
Articles
FAQ
Contact
Consultation
Registration
```

Each public route must trace to:

```text
content/domain source
+
public projection
+
SEO requirements
+
access model
```

---

# 5. PILGRIM PWA TRACEABILITY

| Route | Domain | Main Workflow |
|---|---|---|
| `/app/dashboard` | Journey | Multiple |
| `/app/journey` | Registration/Trip | WF-009–019 |
| `/app/documents` | Document | WF-005/006 |
| `/app/payments` | Invoice/Payment | WF-007/008 |
| `/app/preparation` | Preparation | WF-010 |
| `/app/manasik` | Manasik | WF-011 |
| `/app/itinerary` | Trip/Itinerary | WF-016/017 |
| `/app/announcements` | Announcement | WF-018 |
| `/app/notifications` | Notification | WF-022–024 |
| `/app/profile` | Customer/Pilgrim | Identity |
| `/app/alumni` | Alumni | WF-020 |

---

# 6. PARTNER TRACEABILITY

| Route | Domain | Security Scope |
|---|---|---|
| Dashboard | Partner | OWN |
| Leads | Lead | REFERRAL |
| Referrals | Referral | OWN |
| Prospects | Customer/Lead | REFERRAL |
| Pilgrims | Pilgrim | REFERRAL/APPROVED |
| Commission | Commission | OWN |
| Marketing | Content | PUBLIC/APPROVED |
| Profile | Partner | OWN |

---

# 7. BACKOFFICE TRACEABILITY

Backoffice groups:

```text
Overview
Customer & Sales
Products
Operations
Customer Preparation
Finance
Relationship
Communication
Intelligence
System
```

Each menu must have:

```text
purpose
role
permission
route
domain
data source
```

---

# 8. DATABASE TRACEABILITY

Core domain entities:

```text
Organization
User
Customer
Lead
Sales Activity
Follow-up
Package
Departure
Registration
Pilgrim
Document Requirement
Pilgrim Document
Invoice
Payment Schedule
Payment
Refund
Trip
Trip Member
Itinerary
Hotel
Transport
Tour Leader
Muthawwif
Manasik Content
Manasik Session
Preparation Item
Announcement
Notification
Partner
Referral
Commission
Alumni
Content
Audit Log
```

Each must have:

```text
owner
relationship
state
authorization
retention
audit requirement
```

---

# 9. API TRACEABILITY

Critical API operations should map to workflows.

Examples:

```text
POST /leads
→ WF-001

POST /registrations
→ WF-004

POST /documents/{id}/verify
→ WF-006

POST /payments/{id}/verify
→ WF-008

POST /registrations/{id}/confirm
→ WF-009

POST /preparation/{id}/complete
→ WF-010

POST /trips/{id}/check-in
→ WF-014

POST /refunds
→ WF-027
```

Exact URL naming remains governed by `11_API_CONTRACT.md`.

---

# 10. SECURITY TRACEABILITY

Every sensitive operation must map:

```text
Endpoint
 ↓
Permission
 ↓
Scope
 ↓
RLS
 ↓
Audit
```

Example:

```text
POST /payments/:id/verify
        ↓
PAYMENT_VERIFY
        ↓
Finance scope
        ↓
payment RLS
        ↓
Audit
```

---

# 11. TEST TRACEABILITY

Critical workflows require tests for:

```text
happy path
invalid state
wrong role
wrong scope
wrong user
duplicate request
validation failure
database failure
external service failure
```

---

# 12. CHANGE IMPACT RULE

If a domain state changes, inspect:

```text
14_STATE_MACHINES
05_DOMAIN_MODEL
06_BUSINESS_RULES
10_DATABASE
11_API
12_SECURITY
UI
TESTS
```

If a permission changes, inspect:

```text
03_ROLES
15_PERMISSION_RLS
12_SECURITY
API
UI
TESTS
```

If a financial field changes, inspect:

```text
16_FINANCIAL_MODEL
10_DATABASE
11_API
12_SECURITY
REPORTS
TESTS
```

---

# 13. FEATURE TRACEABILITY TEMPLATE

Every new feature should document:

```text
Feature ID:
Requirement:
User:
Workflow:
State:
Domain:
Database:
API:
Route:
Permission:
Scope:
RLS:
Audit:
Notification:
Tests:
```

---

# 14. REQUIREMENT COVERAGE

At MVP stage, required coverage:

```text
FR-001 Package Catalog
FR-002 Lead Capture
FR-003 CRM
FR-004 Registration
FR-005 Documents
FR-006 Payment
FR-007 Journey
FR-008 Preparation
FR-009 Manasik foundation where applicable
FR-010 Departure
FR-011 Notifications
FR-012 Check-in foundation where applicable
FR-013 Partner foundation where applicable
FR-014 Alumni foundation where applicable
FR-015 Reporting
```

Feature availability follows the MVP/post-MVP boundaries defined in `01_PRD.md` and `02_PRODUCT_BLUEPRINT.md`.

---

# 15. ORPHAN DETECTION

The project should periodically detect:

### Orphan Table

Table without documented domain purpose.

### Orphan Route

Route without business purpose.

### Orphan API

Endpoint without workflow/use case.

### Orphan Permission

Permission without resource/action justification.

### Orphan UI

Screen without workflow.

### Orphan State

State without transition definition.

### Orphan Notification

Notification without event/rule.

---

# 16. IMPLEMENTATION STATUS

Recommended status per trace item:

```text
SPECIFIED
DESIGNED
IMPLEMENTED
TESTED
VERIFIED
LOCKED
```

---

# 17. FINAL TRACEABILITY PRINCIPLE

> **Every important line of code should have a reason to exist, and every important business requirement should have a place in the code.**

---

# 18. IMPLEMENTATION GATE

Before release:

```text
✓ Requirement traced
✓ Workflow traced
✓ Domain traced
✓ Database traced
✓ API traced
✓ UI traced
✓ Permission traced
✓ RLS traced
✓ Audit traced
✓ Test traced
```