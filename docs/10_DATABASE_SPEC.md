# SDW UMROH — DATABASE SPECIFICATION

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** PostgreSQL / Supabase Database Specification

---

# 1. PURPOSE

This document translates the SDW UMROH domain model into a PostgreSQL/Supabase database architecture.

The database must represent:

- customers,
- leads,
- registrations,
- pilgrims,
- packages,
- departures,
- documents,
- invoices,
- payments,
- trips,
- preparation,
- manasik,
- partners,
- communications,
- alumni,
- audit history.

---

# 2. DATABASE PRINCIPLES

1. PostgreSQL is the transactional source of truth.
2. Foreign keys should preserve referential integrity.
3. Important state transitions must be explicit.
4. Historical financial and operational records must be preserved.
5. Sensitive records require restricted access.
6. Soft-delete/archive should be preferred over destructive deletion.
7. Derived values should not become conflicting sources of truth.
8. Timestamps should be recorded consistently.
9. IDs should be non-sequential where public exposure is possible.
10. Database authorization must complement application authorization.

---

# 3. SCHEMA STRATEGY

Recommended primary schema:

```text
public
```

Potential supporting schemas:

```text
private
audit
```

if justified by implementation needs.

The initial system should avoid unnecessary schema fragmentation.

---

# 4. COMMON COLUMN CONVENTIONS

Most business tables should use:

```text
id
created_at
updated_at
created_by
updated_by
```

Where applicable:

```text
deleted_at
archived_at
status
```

Not every table requires every column.

---

# 5. ID STRATEGY

Preferred:

```text
UUID
```

or PostgreSQL-supported UUID-compatible identifiers.

Public URLs should not expose predictable sequential business identifiers.

---

# 6. ORGANIZATION

Table:

```text
organizations
```

Purpose:

Represents the SDW organization/business entity.

Potential columns:

```text
id
name
legal_name
slug
status
contact_phone
contact_email
address
created_at
updated_at
```

The system should support organization context even if MVP operates with a single SDW organization.

---

# 7. USERS

Table:

```text
users
```

Purpose:

Application-level identity profile linked to Supabase Auth.

Relationship:

```text
auth.users
      │
      ▼
public.users
```

Potential columns:

```text
id
auth_user_id
display_name
phone
email
status
last_login_at
created_at
updated_at
```

`auth_user_id` must reference the appropriate authentication identity.

---

# 8. ROLES

Tables:

```text
roles
permissions
user_roles
role_permissions
```

Concept:

```text
USER
 ↓
USER_ROLE
 ↓
ROLE
 ↓
ROLE_PERMISSION
 ↓
PERMISSION
```

Example permissions:

```text
LEAD_VIEW
LEAD_CREATE
LEAD_UPDATE
DOCUMENT_VERIFY
PAYMENT_VERIFY
PAYMENT_REFUND
DEPARTURE_UPDATE
```

---

# 9. CUSTOMERS / PERSON

A person-centric model should prevent duplicate identities.

Recommended table:

```text
customers
```

Potential fields:

```text
id
full_name
email
phone
date_of_birth
gender
identity_number
address
city
province
country
status
created_at
updated_at
```

Sensitive identity fields require additional protection.

Exact legal data requirements remain subject to SDW policy and applicable regulations.

---

# 10. LEADS

Table:

```text
leads
```

Potential columns:

```text
id
customer_id
source
campaign
status
assigned_to
package_id
departure_id
notes
created_at
updated_at
```

Relationship:

```text
Lead
 ├── Customer
 ├── Sales Owner
 ├── Package
 └── Departure
```

A lead should preserve its conversion history.

---

# 11. SALES ACTIVITIES

Table:

```text
sales_activities
```

Potential columns:

```text
id
lead_id
activity_type
subject
notes
performed_by
performed_at
created_at
```

Examples:

```text
CALL
WHATSAPP
MEETING
CONSULTATION
EMAIL
NOTE
```

Activity history should not be silently overwritten.

---

# 12. FOLLOW-UPS

Table:

```text
follow_ups
```

Potential columns:

```text
id
lead_id
assigned_to
due_at
status
priority
notes
completed_at
created_at
updated_at
```

Activities and follow-ups are distinct entities.

---

# 13. PACKAGES

Table:

```text
packages
```

Potential columns:

```text
id
name
slug
description
duration_days
status
base_price
currency
capacity_description
published_at
created_at
updated_at
```

Public package data should be exposed through controlled queries/views.

---

# 14. PACKAGE PRICING HISTORY

Price changes should be historically traceable.

Potential table:

```text
package_prices
```

Fields:

```text
id
package_id
price
currency
effective_from
effective_to
status
created_by
created_at
```

Existing registrations must retain their authoritative agreed pricing.

---

# 15. DEPARTURES

Table:

```text
departures
```

Potential columns:

```text
id
package_id
code
departure_date
return_date
capacity
status
registration_open_at
registration_close_at
notes
created_at
updated_at
```

Relationship:

```text
Package
   │
   ├── Departure A
   ├── Departure B
   └── Departure C
```

---

# 16. REGISTRATIONS

Table:

```text
registrations
```

Potential columns:

```text
id
registration_number
customer_id
package_id
departure_id
status
registered_at
confirmed_at
cancelled_at
cancel_reason
created_by
updated_by
created_at
updated_at
```

Registration is the commercial/journey commitment between customer and selected offering.

---

# 17. PILGRIMS

Table:

```text
pilgrims
```

Potential columns:

```text
id
customer_id
status
preferred_name
notes
created_at
updated_at
```

A customer may have multiple registrations.

A pilgrim is a business identity used for the Umrah journey.

---

# 18. REGISTRATION ↔ PILGRIM

Depending on finalized domain rules:

```text
registration
      │
      ▼
pilgrim
```

The relationship must preserve historical registrations.

Do not create duplicate pilgrim identities merely because the same person joins another departure.

---

# 19. DOCUMENT REQUIREMENTS

Table:

```text
document_requirements
```

Potential columns:

```text
id
code
name
description
required_for
required
allowed_file_types
max_file_size
active
created_at
updated_at
```

Examples:

```text
KTP
KK
PASSPORT
PHOTO
```

A requirement is not the uploaded document itself.

---

# 20. PILGRIM DOCUMENTS

Table:

```text
pilgrim_documents
```

Potential columns:

```text
id
pilgrim_id
registration_id
requirement_id
status
storage_path
original_filename
mime_type
file_size
version
submitted_at
verified_at
verified_by
revision_reason
expires_at
created_at
updated_at
```

Document status:

```text
NOT_UPLOADED
UPLOADED
UNDER_REVIEW
VERIFIED
REVISION_REQUIRED
EXPIRED
```

The exact final state machine remains subject to workflow approval.

---

# 21. DOCUMENT VERSIONING

Replacing a document should not necessarily destroy the old record.

Possible model:

```text
document
 ├── version 1
 ├── version 2
 └── version 3
```

This provides traceability.

Sensitive historical files should follow retention rules.

---

# 22. INVOICES

Table:

```text
invoices
```

Potential columns:

```text
id
invoice_number
registration_id
customer_id
status
currency
subtotal
discount
total
issued_at
due_at
created_at
updated_at
```

Invoice is an obligation/financial document.

It is not the payment itself.

---

# 23. PAYMENT SCHEDULE

Table:

```text
payment_schedules
```

Potential columns:

```text
id
registration_id
invoice_id
sequence
description
amount
due_at
status
created_at
updated_at
```

This enables:

```text
Installment 1
Installment 2
Installment 3
```

without hardcoding payment schedules into UI.

---

# 24. PAYMENTS

Table:

```text
payments
```

Potential columns:

```text
id
invoice_id
registration_id
customer_id
amount
currency
method
status
reference
external_reference
submitted_at
verified_at
verified_by
created_at
updated_at
```

Payment status:

```text
PENDING
SUBMITTED
VERIFIED
FAILED
REJECTED
CANCELLED
REFUNDED
```

---

# 25. REFUNDS

Table:

```text
refunds
```

Potential columns:

```text
id
payment_id
registration_id
amount
reason
status
requested_by
approved_by
processed_at
created_at
updated_at
```

Refund policy must be defined before implementation.

---

# 26. TRIPS

Table:

```text
trips
```

Potential columns:

```text
id
departure_id
trip_code
status
tour_leader_id
muthawwif_id
started_at
completed_at
created_at
updated_at
```

A departure is a commercial/registration unit.

A trip is the operational journey.

---

# 27. TRIP MEMBERS

Table:

```text
trip_members
```

Potential columns:

```text
id
trip_id
pilgrim_id
registration_id
group_name
check_in_status
check_in_at
status
created_at
updated_at
```

A pilgrim can participate in multiple trips historically.

---

# 28. ITINERARIES

Potential tables:

```text
itineraries
itinerary_items
```

Example:

```text
itinerary
 ├── day 1
 ├── day 2
 ├── day 3
 └── ...
```

Potential item fields:

```text
trip_id
date
start_time
end_time
title
description
location
type
status
```

---

# 29. HOTELS

Table:

```text
hotels
```

Potential fields:

```text
id
name
city
address
contact_information
notes
created_at
updated_at
```

Historical trip assignments should not change merely because the master hotel record changes.

---

# 30. TRANSPORT

Potential tables:

```text
transport_resources
transport_assignments
```

This separates:

```text
Resource
```

from:

```text
Assignment to Trip
```

---

# 31. TOUR LEADERS AND MUTHAWWIFS

Potential tables:

```text
tour_leaders
muthawwifs
```

These may reference application users where appropriate.

Trip assignment should be explicit.

Access must be scoped to assigned trips/groups.

---

# 32. PREPARATION

Potential tables:

```text
preparation_templates
preparation_items
pilgrim_preparation
```

A preparation item may represent:

```text
Passport verified
Payment complete
Manasik completed
Briefing attended
Equipment prepared
```

Potential status:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
BLOCKED
NOT_APPLICABLE
```

---

# 33. MANASIK

Separate content from sessions.

Tables:

```text
manasik_contents
manasik_sessions
manasik_participants
manasik_progress
```

Content:

```text
article
video
audio
quiz
```

Session:

```text
date
time
location
type
instructor
```

Participation:

```text
assigned
attended
completed
```

---

# 34. ANNOUNCEMENTS

Table:

```text
announcements
```

Potential fields:

```text
id
title
body
status
audience_type
trip_id
departure_id
published_at
expires_at
created_by
created_at
updated_at
```

Audience targeting must not rely solely on frontend filtering.

---

# 35. NOTIFICATIONS

Tables:

```text
notifications
notification_deliveries
```

Notification:

```text
id
user_id
type
title
body
related_entity_type
related_entity_id
read_at
created_at
```

Delivery:

```text
notification_id
channel
status
provider_reference
sent_at
delivered_at
failed_at
```

---

# 36. PARTNERS

Table:

```text
partners
```

Potential fields:

```text
id
customer_id
code
status
joined_at
created_at
updated_at
```

Additional tables:

```text
partner_referrals
partner_commissions
```

---

# 37. REFERRALS

Table:

```text
referrals
```

Potential fields:

```text
id
partner_id
lead_id
registration_id
source_code
attributed_at
status
created_at
updated_at
```

Attribution must be historically traceable.

---

# 38. COMMISSIONS

Table:

```text
commissions
```

Potential fields:

```text
id
partner_id
registration_id
basis_amount
commission_amount
status
approved_at
paid_at
created_at
updated_at
```

Exact commission calculation remains TBD.

---

# 39. ALUMNI

Table:

```text
alumni_profiles
```

Potential fields:

```text
id
customer_id
status
joined_at
notes
created_at
updated_at
```

Alumni should not replace historical pilgrim/trip records.

---

# 40. CONTENT

Potential table:

```text
contents
```

Can support:

- articles,
- educational content,
- announcements where appropriate.

If a CMS is introduced later, integration must preserve SDW's canonical business relationships.

---

# 41. TESTIMONIALS

Table:

```text
testimonials
```

Potential fields:

```text
id
customer_id
content
status
published_at
created_at
updated_at
```

Publication requires explicit authorization.

---

# 42. AUDIT LOGS

Table:

```text
audit_logs
```

Potential fields:

```text
id
actor_user_id
action
resource_type
resource_id
before_data
after_data
reason
ip_address
user_agent
created_at
```

Sensitive fields should be redacted or excluded from audit payloads where necessary.

---

# 43. DATABASE RELATIONSHIP MAP

```text
CUSTOMER
   │
   ├── LEADS
   │     │
   │     └── ACTIVITIES
   │
   ├── PILGRIM
   │     │
   │     ├── DOCUMENTS
   │     ├── PREPARATION
   │     └── TRIP MEMBERS
   │
   └── REGISTRATIONS
          │
          ├── PACKAGE
          ├── DEPARTURE
          ├── INVOICE
          │     └── PAYMENTS
          │
          └── TRIP
                ├── ITINERARY
                ├── HOTEL
                ├── TRANSPORT
                ├── TOUR LEADER
                └── MUTHAWWIF
```

---

# 44. INDEXING

Indexes should be created around real query patterns.

Likely candidates:

```text
leads.status
leads.assigned_to
leads.created_at

registrations.customer_id
registrations.departure_id
registrations.status

pilgrim_documents.pilgrim_id
pilgrim_documents.status

payments.registration_id
payments.status
payments.due_at

departures.departure_date
departures.status

trip_members.trip_id
trip_members.pilgrim_id

notifications.user_id
notifications.read_at
```

Do not create indexes blindly on every column.

---

# 45. CONSTRAINTS

Use database constraints wherever practical.

Examples:

```text
NOT NULL
UNIQUE
CHECK
FOREIGN KEY
```

Examples:

```text
payment.amount > 0
departure.capacity >= 0
invoice.total >= 0
```

Business logic that requires external context may remain in application services.

---

# 46. ENUM STRATEGY

Database enums should be used carefully.

For rapidly evolving workflow states, lookup/reference tables or constrained text may provide more flexibility.

The implementation team must not create dozens of immutable PostgreSQL enums without need.

---

# 47. MONEY

Do not use floating-point types for financial amounts.

Preferred:

```text
NUMERIC
```

with explicit currency handling.

Currency should not be assumed to be permanently IDR merely because MVP operates in Indonesia.

---

# 48. TIME

Use timezone-aware timestamps where appropriate.

Recommended:

```text
timestamptz
```

Display timezone should be determined by application/user context.

---

# 49. SOFT DELETE / ARCHIVE

Important historical records should generally not be physically deleted.

Prefer:

```text
status = ARCHIVED
```

or:

```text
archived_at
```

Destructive deletion requires explicit policy.

---

# 50. DERIVED DATA

Derived values should have one authoritative calculation source.

Example:

```text
Outstanding
=
Authoritative Invoice Obligation
-
Verified Payments
+
Applicable Adjustments
```

Do not allow arbitrary frontend values to overwrite derived financial totals.

---

# 51. RLS

Supabase Row Level Security must protect sensitive tables.

Examples:

```text
Pilgrim sees own records.
Partner sees permitted referral records.
Tour Leader sees assigned trip records.
Finance sees permitted finance records.
Document Officer sees permitted documents.
Owner/Manager access follows approved scope.
```

RLS policies must be tested independently.

---

# 52. DATABASE FUNCTIONS

Database functions may be used for:

- atomic operations,
- complex calculations,
- secure data access,
- reusable database operations.

They should not become an unstructured second backend.

---

# 53. VIEWS

Views may provide:

- reporting,
- safe public projections,
- dashboard aggregates,
- operational summaries.

Public views must never unintentionally expose sensitive columns.

---

# 54. DATABASE SEEDING

Development seed data should be clearly synthetic.

Example:

```text
Demo Customer
Demo Pilgrim
Demo Departure
Demo Payment
```

Never seed production-like real personal documents into development environments.

---

# 55. MIGRATION PRINCIPLE

Every schema change must be represented by a migration.

```text
schema
 ↓
migration
 ↓
review
 ↓
test
 ↓
deploy
```

No undocumented production schema changes.

---

# 56. DATABASE DEFINITION OF DONE

A database feature is incomplete if it lacks:

- table design,
- relationships,
- constraints,
- indexes where needed,
- authorization/RLS,
- migration,
- seed strategy where applicable,
- audit requirements,
- backup/recovery consideration,
- data retention consideration.

---

# 57. FINAL DATABASE PRINCIPLE

The database must model:

> **business truth, not screen layout.**

Screens may change.

Workflows may evolve.

But customer identity, registration, financial obligations, payment history, documents, departures, trips, and audit history must remain structurally reliable.