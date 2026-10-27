# SDW UMROH — USER ROLES & PERMISSIONS

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Roles, Access Control & Permissions Specification  
**Parent Documents:**  
- `00_PROJECT_CONTEXT.md`
- `01_PRD.md`
- `02_PRODUCT_BLUEPRINT.md`

---

# 1. PURPOSE

This document defines the actors, roles, access boundaries, and permission principles for the SDW UMROH platform.

The objective is to ensure that:

1. Every user receives only the access required for their responsibilities.
2. Sensitive pilgrim information is protected.
3. Internal workflows remain controlled.
4. Management can access appropriate aggregated information.
5. Agents cannot access other agents' customers.
6. Pilgrims can only access their own information.
7. Operational personnel can access relevant trip information without automatically receiving access to unrelated financial or administrative data.
8. Important actions can be audited.

---

# 2. ACCESS CONTROL PRINCIPLE

SDW uses a **Role-Based Access Control (RBAC)** model.

The conceptual hierarchy is:

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
```

Example:

```text
Sales User
    ↓
CRM Role
    ↓
Lead Permissions
    ↓
Lead #SDW-001
    ↓
View / Update / Follow-up
```

---

# 3. CORE ACCESS PRINCIPLES

## 3.1 Least Privilege

Users receive only the minimum permissions required to perform their role.

---

## 3.2 Explicit Authorization

Access must be granted explicitly.

The system must never assume that a user can access data merely because the UI happens to expose a route.

Authorization must be enforced server-side.

---

## 3.3 Ownership Boundary

Where applicable, access is limited by ownership.

Examples:

- Agent → their own referrals
- Sales → assigned leads
- Pilgrim → their own profile
- Tour Leader → assigned trip
- Muthawwif → relevant trip/group

---

## 3.4 Sensitive Data Protection

Sensitive information should have stricter access.

Potential sensitive information includes:

- identity information,
- passport information,
- uploaded documents,
- financial information,
- contact information,
- emergency information.

Not every internal user needs access to all of this information.

---

## 3.5 Read vs Write

Viewing information and modifying information are separate permissions.

Example:

```text
VIEW_PAYMENT
RECORD_PAYMENT
EDIT_PAYMENT
VOID_PAYMENT
REFUND_PAYMENT
```

These must not automatically be treated as the same permission.

---

## 3.6 Destructive Actions

Actions such as:

- delete,
- cancel,
- void,
- refund,
- permanently archive,
- change critical status

should require elevated permission and should be audited.

Where appropriate, destructive operations should be implemented as state transitions rather than physical deletion.

---

# 4. USER TYPES

The platform contains two major categories.

```text
EXTERNAL
├── Visitor
├── Prospective Pilgrim
├── Pilgrim
├── Alumni
└── Partner / Agent

INTERNAL
├── Owner
├── Manager
├── Sales
├── Customer Service / Admin
├── Finance
├── Document Officer
├── Operations
├── Tour Leader
└── Muthawwif
```

A single person may potentially have more than one role if explicitly authorized.

---

# 5. VISITOR

## Purpose

Anonymous public website visitor.

## Access

Public information only.

### Can

- browse website,
- browse packages,
- view departure information,
- read articles,
- view FAQ,
- contact SDW,
- submit consultation request,
- begin registration.

### Cannot

- access internal dashboard,
- view pilgrim information,
- view CRM,
- view financial data,
- access private documents.

---

# 6. PROSPECTIVE PILGRIM

A prospective customer who has entered the SDW sales/registration process but is not yet an active pilgrim.

## Can

- submit personal information required for inquiry,
- request consultation,
- view relevant package information,
- communicate with SDW,
- continue registration,
- view their own registration progress where an account exists.

## Cannot

- access other customers,
- access internal CRM,
- modify verified internal records,
- access internal financial reports.

---

# 7. PILGRIM

A registered SDW customer associated with a package/departure.

## Can

### Profile

- view own profile,
- update permitted contact information,
- submit required personal information.

### Documents

- upload own documents,
- view own document status,
- replace documents requested for revision.

### Finance

- view own package price,
- view own payment schedule,
- view own payment history,
- view invoices,
- submit payment evidence where applicable.

### Journey

- view own journey,
- view preparation checklist,
- access approved manasik content,
- view relevant itinerary,
- view relevant announcements.

### Support

- contact SDW,
- access permitted support channels.

## Cannot

- view another pilgrim's private information,
- alter verified documents directly,
- modify payment records,
- change package price,
- change own financial status,
- access internal operational controls.

---

# 8. ALUMNI

A completed pilgrim journey may transition the user into Alumni status.

## Can

- access permitted alumni content,
- view their completed journey information,
- access documentation made available to alumni,
- participate in referral programs where enabled,
- receive relevant future offers or information.

## Cannot

- access internal data,
- access another user's private information,
- modify historical trip records.

---

# 9. PARTNER / AGENT

Partner users represent external distribution/referral relationships.

## Can

### Partner

- view own dashboard,
- access own referral link/code,
- submit leads,
- view own leads,
- view status of permitted referrals,
- view permitted commission information,
- access approved marketing materials,
- update own profile.

### Cannot

- view other partners' leads,
- access unrestricted pilgrim data,
- modify financial transactions,
- verify documents,
- modify package pricing,
- change pilgrim status,
- access internal reports.

---

# 10. OWNER / MANAGEMENT

Highest business-level access.

## Can

- view all permitted business information,
- view dashboards,
- manage organization configuration,
- manage users and roles,
- manage packages,
- manage departures,
- access CRM,
- access finance information,
- access operational information,
- access reports,
- review audit logs,
- approve sensitive actions where configured.

## Important Principle

Owner access does not eliminate the need for audit logging.

Administrative actions performed by owners must remain traceable.

---

# 11. MANAGER

Operational/business management role.

## Can

- view management dashboard,
- manage operational workflows,
- supervise CRM,
- supervise pilgrim management,
- supervise departures,
- review operational readiness,
- view relevant finance summaries,
- review reports.

## May Require Approval

Depending on final business rules:

- package price changes,
- cancellation,
- refund,
- sensitive status overrides,
- user role changes.

---

# 12. SALES / MARKETING

Primary role:

**Lead → Consultation → Conversion**

## Can

### CRM

- create lead,
- view assigned leads,
- update lead status,
- record sales activities,
- schedule follow-up,
- add notes,
- assign/transfer lead if authorized.

### Package

- view active packages,
- view package details,
- share package information.

### Customer

- view permitted prospect/pilgrim information needed for sales.

## Cannot

- edit financial transactions,
- verify identity documents,
- change payment status,
- access unrelated finance reports,
- modify operational configuration.

---

# 13. CUSTOMER SERVICE / ADMIN

Primary role:

**Registration + Customer Administration**

## Can

- manage registrations,
- create/update pilgrim records,
- assist profile completion,
- view relevant documents,
- communicate with pilgrims,
- manage basic customer information,
- monitor journey status,
- manage permitted announcements.

## Cannot

- directly alter financial transactions unless separately authorized,
- modify critical operational records without permission,
- access unrestricted system administration.

---

# 14. FINANCE

Primary role:

**Payment + Financial Administration**

## Can

- view invoices,
- create invoices,
- record payments,
- verify payment evidence,
- manage payment schedules,
- view outstanding balances,
- generate finance reports,
- process permitted adjustments.

## Restricted

Actions such as:

- refund,
- void,
- write-off,
- financial correction

may require elevated approval.

## Cannot

- modify passport/document verification,
- modify operational itinerary,
- access unrelated CRM controls.

---

# 15. DOCUMENT / VISA OFFICER

Primary role:

**Document Readiness**

## Can

- view required documents,
- review uploads,
- approve documents,
- reject documents,
- request revision,
- record document verification,
- monitor document readiness.

## Cannot

- modify payment transactions,
- modify package pricing,
- access unrestricted financial information,
- change unrelated operational data.

---

# 16. OPERATIONS

Primary role:

**Trip Readiness + Departure Operations**

## Can

- manage departures,
- manage trip groups,
- assign operational resources,
- manage itinerary,
- manage transportation information,
- manage accommodation information,
- manage tour leader assignments,
- manage muthawwif assignments,
- monitor readiness.

## Cannot

- modify financial transactions,
- modify document verification decisions,
- access unrestricted CRM.

---

# 17. TOUR LEADER

Primary role:

**Field Trip Leadership**

Access should be limited to assigned trips.

## Can

- view assigned trip,
- view relevant pilgrim list,
- view itinerary,
- view operational announcements,
- perform permitted check-in/attendance actions,
- communicate relevant trip information.

## Cannot

- access unrelated departures,
- edit financial records,
- change package prices,
- verify financial transactions,
- access unrestricted customer data.

---

# 18. MUTHAWWIF

Primary role:

**Religious Guidance / Pilgrim Assistance**

Access should be limited to relevant assigned trip/group.

## Can

- view assigned trip,
- view relevant group information,
- view itinerary,
- access relevant manasik information,
- provide permitted trip announcements,
- perform permitted attendance/check-in actions.

## Should Not Automatically See

- full financial information,
- internal sales notes,
- unrelated customer records,
- internal management reports.

---

# 19. ROLE-PERMISSION MATRIX

The following is a high-level matrix.

| Module | Owner | Manager | Sales | Admin | Finance | Document | Ops | TL | Muthawwif | Agent | Pilgrim |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Public Content | ✓ | ✓ | ✓ | ✓ | - | - | - | - | - | Limited | Public |
| CRM | ✓ | ✓ | ✓ | Limited | - | - | Limited | - | - | Own | - |
| Pilgrims | ✓ | ✓ | Limited | ✓ | Limited | Limited | Limited | Assigned | Assigned | Own Referrals | Own |
| Documents | ✓ | ✓ | Limited | ✓ | - | ✓ | Limited | Limited | Limited | - | Own |
| Payments | ✓ | ✓ | View | View | ✓ | - | - | - | - | Limited | Own |
| Packages | ✓ | ✓ | View | View | View | - | View | View | View | View | View |
| Departures | ✓ | ✓ | View | View | View | View | ✓ | Assigned | Assigned | Referral | Own |
| Trip Operations | ✓ | ✓ | - | Limited | - | - | ✓ | Assigned | Assigned | - | Relevant |
| Manasik | ✓ | ✓ | View | Manage | - | - | Manage | View | Manage | - | Own |
| Partners | ✓ | ✓ | Manage | Limited | Commission | - | - | - | - | Own | - |
| Reports | ✓ | ✓ | Limited | Limited | Finance | Docs | Ops | - | - | Own | Own |
| User Management | ✓ | Limited | - | Limited | - | - | - | - | - | - | - |
| Settings | ✓ | Limited | - | - | - | - | - | - | - | - | - |
| Audit Logs | ✓ | Review | - | Limited | Finance | Docs | Ops | - | - | - | - |

**Note:** This matrix is a product-level draft. Final permission granularity must be defined at action level.

---

# 20. PERMISSION NAMING CONVENTION

Permissions should follow a consistent naming model.

Recommended format:

```text
<RESOURCE>_<ACTION>
```

Examples:

```text
LEAD_VIEW
LEAD_CREATE
LEAD_UPDATE
LEAD_ASSIGN

PILGRIM_VIEW
PILGRIM_CREATE
PILGRIM_UPDATE

DOCUMENT_VIEW
DOCUMENT_UPLOAD
DOCUMENT_VERIFY
DOCUMENT_REJECT

PAYMENT_VIEW
PAYMENT_CREATE
PAYMENT_VERIFY
PAYMENT_VOID
PAYMENT_REFUND

DEPARTURE_VIEW
DEPARTURE_CREATE
DEPARTURE_UPDATE
DEPARTURE_PUBLISH

USER_VIEW
USER_CREATE
USER_UPDATE
USER_DISABLE
```

---

# 21. ACTION CLASSIFICATION

Actions should generally belong to one of these categories:

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

High-risk actions require stronger controls.

---

# 22. SCOPE TYPES

Permissions may have different scopes.

## GLOBAL

Access across the organization.

Example:

Owner.

## TEAM

Access to users or records within a team.

Example:

Sales Manager.

## ASSIGNED

Access only to assigned records.

Example:

Salesperson.

## TRIP

Access to a specific departure/trip.

Example:

Tour Leader.

## OWN

Access to the user's own record.

Example:

Pilgrim.

## REFERRAL

Access to records attributed to a partner.

Example:

Agent.

---

# 23. DATA VISIBILITY LEVELS

A record may have different visibility levels.

```text
PUBLIC
INTERNAL
RESTRICTED
SENSITIVE
```

Example:

### Public

Package name and public price.

### Internal

Sales notes.

### Restricted

Operational information.

### Sensitive

Identity documents and financial details.

---

# 24. UI AUTHORIZATION

Menu visibility should reflect permissions.

However:

**Hidden UI is NOT authorization.**

The system must enforce permissions at:

1. UI level,
2. server/action level,
3. database/data-access level.

---

# 25. AUDIT REQUIREMENTS

The system should audit high-value actions.

Examples:

```text
Who
What
When
Which record
Previous state
New state
Reason
```

Examples of audited actions:

- document verification,
- payment verification,
- payment void,
- refund,
- package price change,
- role change,
- departure cancellation,
- critical status override.

---

# 26. ROLE EXTENSIBILITY

The initial roles are defaults.

The architecture should allow future roles without rewriting the permission system.

Potential future roles:

- Branch Manager
- Finance Manager
- Marketing Manager
- Compliance Officer
- Customer Success
- Content Editor
- Super Admin

---

# 27. SECURITY RULE

No frontend route, button, API endpoint, or database query should rely solely on the assumption:

> "The user probably has access."

Every protected operation must be explicitly authorized.

---

# 28. FINAL ACCESS MODEL

```text
USER
 ↓
AUTHENTICATION
 ↓
ROLE
 ↓
PERMISSIONS
 ↓
SCOPE
 ↓
RESOURCE
 ↓
ACTION
 ↓
AUDIT
```

This model is the foundation for SDW's access-control implementation.