# SDW UMROH — DOMAIN MODEL

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Business Domain Model  
**Parent Documents:**
- `00_PROJECT_CONTEXT.md`
- `01_PRD.md`
- `02_PRODUCT_BLUEPRINT.md`
- `03_USER_ROLES_AND_PERMISSIONS.md`
- `04_USER_JOURNEYS_AND_WORKFLOWS.md`

---

# 1. PURPOSE

This document defines the major business objects that exist within the SDW UMROH platform and the relationships between them.

The domain model is the bridge between:

**Business Concept → Workflow → Data Model → Application Architecture**

This document must be understood before designing the final database schema.

---

# 2. CORE DOMAIN

The SDW UMROH domain is centered around the relationship between:

```text
CUSTOMER
   ↓
LEAD
   ↓
REGISTRATION
   ↓
PILGRIM
   ↓
PACKAGE
   ↓
DEPARTURE
   ↓
TRIP
   ↓
ALUMNI
```

Supporting domains:

```text
CRM
FINANCE
DOCUMENTS
PREPARATION
MANASIK
OPERATIONS
COMMUNICATION
PARTNER
AUDIT
```

---

# 3. DOMAIN MAP

```text
                           SDW ORGANIZATION
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
            USER                PACKAGE             PARTNER
             │                    │                    │
             │                    │                    │
             ▼                    ▼                    ▼
           LEAD ───────────→ REGISTRATION ←────── REFERRAL
             │                    │
             │                    ▼
             │                 PILGRIM
             │                    │
             │          ┌─────────┼─────────┐
             │          │         │         │
             │       DOCUMENT   PAYMENT   PREPARATION
             │          │         │         │
             │          └─────────┼─────────┘
             │                    │
             │                    ▼
             │                DEPARTURE
             │                    │
             │                    ▼
             │                   TRIP
             │                    │
             │          ┌─────────┼──────────┐
             │          │         │          │
             │       ITINERARY   HOTEL      TRANSPORT
             │          │
             │          ▼
             │      ANNOUNCEMENT
             │
             ▼
           CRM / SALES

TRIP
  ↓
COMPLETED
  ↓
ALUMNI
  ↓
REFERRAL
  ↓
NEW LEAD
```

---

# 4. ORGANIZATION

Represents the SDW business entity operating the platform.

Potential attributes:

- organization identity,
- legal/business information,
- contact information,
- office information,
- branding,
- configuration,
- operational settings.

The system should be designed so organizational configuration is not hard-coded into application logic.

---

# 5. USER

Represents an authenticated identity that can access the platform.

A user may be associated with:

- internal staff,
- pilgrim,
- partner/agent,
- alumni.

Important distinction:

**User ≠ Pilgrim**

A user is an authentication/access identity.

A pilgrim is a business entity representing a customer.

One person may have a user account and a pilgrim record.

---

# 6. ROLE

Represents an authorization role.

Examples:

- Owner
- Manager
- Sales
- Admin
- Finance
- Document Officer
- Operations
- Tour Leader
- Muthawwif
- Agent
- Pilgrim

Role determines permission.

Role should not be used as a substitute for business state.

---

# 7. LEAD

Represents a prospective customer entering the sales process.

A lead may originate from:

- website,
- WhatsApp,
- social media,
- referral,
- agent,
- event,
- office,
- manual entry,
- other approved channels.

A lead is not necessarily a registered pilgrim.

Potential relationship:

```text
LEAD
  ↓
REGISTRATION
  ↓
PILGRIM
```

A lead should retain its acquisition/source information.

---

# 8. SALES ACTIVITY

Represents an interaction or action performed during the sales process.

Examples:

- phone call,
- WhatsApp conversation,
- consultation,
- meeting,
- package presentation,
- follow-up,
- note,
- scheduled contact.

Sales activities belong to the CRM domain.

They should provide a chronological history of the relationship.

---

# 9. FOLLOW-UP

Represents a future sales action that needs attention.

Example:

```text
Lead:
Ahmad

Action:
Follow up package discussion

Due:
2026-10-05

Assigned:
Sales User
```

A follow-up is different from a sales activity.

**Activity = what happened.**

**Follow-up = what needs to happen.**

---

# 10. PACKAGE

Represents a commercially defined Umrah offering.

A package may contain:

- name,
- description,
- duration,
- included services,
- excluded services,
- pricing,
- accommodation,
- transportation,
- airline information,
- manasik/service components,
- terms,
- public information.

A package is a product definition.

It should not be confused with a specific departure.

---

# 11. DEPARTURE

Represents a scheduled departure offering.

A departure may reference a package and contain specific operational information.

Potential information:

- departure date,
- return date,
- capacity,
- registration availability,
- flight information,
- operational status,
- assigned resources.

Conceptually:

```text
PACKAGE
   │
   ├── DEPARTURE A
   ├── DEPARTURE B
   └── DEPARTURE C
```

The exact cardinality must be confirmed during implementation.

---

# 12. REGISTRATION

Represents a customer's registration attempt/application for an Umrah package/departure.

Registration is an important transactional entity.

It connects:

```text
LEAD / USER
      ↓
REGISTRATION
      ↓
PACKAGE
      ↓
DEPARTURE
      ↓
PILGRIM
```

Registration should preserve historical information about the customer's enrollment process.

---

# 13. PILGRIM

Represents the customer participating in an Umrah journey.

A pilgrim may have:

- identity information,
- contact information,
- emergency contact,
- document records,
- registration history,
- payment history,
- trip history,
- preparation progress,
- manasik participation,
- alumni status.

Important principle:

**A person can become a pilgrim more than once.**

Therefore, the domain must support historical registrations/trips rather than treating a pilgrim as permanently tied to one departure.

---

# 14. PILGRIM DOCUMENT

Represents a document associated with a pilgrim or registration process.

Examples:

- KTP,
- KK,
- passport,
- photograph,
- visa/travel documents,
- other required documents.

A document should have:

- document type,
- owner,
- file reference,
- status,
- verification history,
- upload time,
- verification time,
- reviewer,
- revision/rejection reason where applicable.

---

# 15. DOCUMENT REQUIREMENT

Represents the requirement that a particular document is needed.

This is conceptually different from the uploaded document.

Example:

```text
Requirement:
Passport

Status:
Missing

↓
Pilgrim uploads passport

Document:
Uploaded

↓
Review

Status:
Verified
```

This separation allows requirements to vary by:

- package,
- departure,
- customer situation,
- operational policy.

---

# 16. INVOICE

Represents a financial billing record.

An invoice may be associated with:

- registration,
- pilgrim,
- package/departure,
- payment schedule.

Invoice is not the same as payment.

---

# 17. PAYMENT SCHEDULE

Represents an expected payment obligation.

Example:

```text
Total:
Rp 30.000.000

Schedule:

DP       Rp 5.000.000
Termin 1 Rp 10.000.000
Termin 2 Rp 10.000.000
Pelunasan Rp 5.000.000
```

The actual payment schedule depends on approved business rules.

---

# 18. PAYMENT

Represents an actual financial transaction.

Payment may originate from:

- payment gateway,
- bank transfer,
- cash,
- other approved methods.

Payment must be traceable.

It should not simply overwrite an outstanding balance.

Conceptually:

```text
PAYMENT SCHEDULE
       ↓
PAYMENT TRANSACTION
       ↓
FINANCIAL BALANCE
```

---

# 19. REFUND

Represents money returned to a customer after an approved cancellation/refund process.

Refund must not be treated as a normal payment.

It requires separate business rules and audit controls.

---

# 20. TRIP

Represents the actual operational journey associated with a departure.

A departure describes the scheduled offering.

A trip represents the operational execution of that departure.

Conceptually:

```text
PACKAGE
   ↓
DEPARTURE
   ↓
TRIP
   ↓
TRIP MEMBERS
```

The final distinction between `Departure` and `Trip` must be preserved unless operational analysis determines that they should be unified.

---

# 21. TRIP MEMBER

Represents the relationship between a pilgrim and a trip/departure.

This entity is important because:

- one pilgrim may have multiple trips historically,
- one trip contains many pilgrims.

Conceptually:

```text
PILGRIM ←→ TRIP
        via
     TRIP_MEMBER
```

---

# 22. ITINERARY

Represents scheduled activities within a trip.

Examples:

- airport gathering,
- flight,
- hotel check-in,
- city transfer,
- ziarah,
- manasik activity,
- Umrah,
- return journey.

An itinerary should support ordering and time/location information.

---

# 23. HOTEL

Represents accommodation information associated with a trip.

Potential information:

- hotel name,
- city,
- location,
- room allocation,
- check-in,
- check-out,
- relevant notes.

The domain should not assume that SDW itself operates hotel inventory.

Hotel information may originate from external suppliers.

---

# 24. TRANSPORT

Represents transportation associated with a trip.

Potential examples:

- airport transfer,
- bus,
- city transfer,
- local transportation.

Transport should be modeled as an operational resource rather than embedded directly into itinerary text.

---

# 25. TOUR LEADER

Represents the person responsible for operational leadership of a trip.

A tour leader may be assigned to one or more trips according to business rules.

---

# 26. MUTHAWWIF

Represents the person responsible for religious guidance and/or relevant pilgrim assistance.

A muthawwif may be assigned to one or more trips/groups.

Access should be scoped to relevant trips.

---

# 27. MANASIK CONTENT

Represents educational content.

Possible types:

- article,
- video,
- audio,
- quiz,
- document,
- checklist.

Content is separate from a scheduled manasik session.

---

# 28. MANASIK SESSION

Represents a scheduled manasik event.

Potential information:

- date,
- time,
- location,
- instructor,
- audience,
- attendance status.

---

# 29. MANASIK PARTICIPATION

Represents a pilgrim's relationship with a manasik session or learning requirement.

This allows the system to distinguish:

- session exists,
- pilgrim is assigned,
- pilgrim attended,
- pilgrim completed.

---

# 30. PREPARATION ITEM

Represents an actionable requirement in the pilgrim journey.

Examples:

- upload passport,
- complete payment,
- attend manasik,
- attend briefing,
- prepare equipment.

A preparation item should be linked to a clear business requirement.

---

# 31. ANNOUNCEMENT

Represents information published to a defined audience.

Possible audiences:

- all pilgrims,
- departure,
- trip group,
- specific users,
- staff,
- partners.

Announcements should have publication state and audience scope.

---

# 32. NOTIFICATION

Represents a system-generated or manually triggered communication event.

Possible channels:

- in-app,
- push,
- WhatsApp,
- email.

Notification should have:

- recipient,
- event/source,
- channel,
- delivery state,
- timestamp.

---

# 33. PARTNER

Represents an external sales/referral partner.

Partner may have:

- account,
- referral identifier,
- assigned leads,
- referred customers,
- commission records,
- marketing resources.

---

# 34. REFERRAL

Represents attribution from an existing person/partner to a new lead or customer.

Potential sources:

```text
PARTNER
ALUMNI
STAFF
CAMPAIGN
```

The source must be preserved for attribution and reporting.

---

# 35. COMMISSION

Represents a financial entitlement associated with an approved partner/referral arrangement.

Commission rules must be defined separately.

Commission must not automatically equal payment received.

---

# 36. ALUMNI

Represents a customer who has completed an Umrah journey and is eligible for post-trip relationship features.

Alumni is a relationship/status concept, not a replacement for the historical pilgrim record.

---

# 37. TESTIMONIAL

Represents customer feedback that may be submitted for public or internal use.

A testimonial should have an approval/publication state.

Customer consent and appropriate usage controls must be respected.

---

# 38. CONTENT

Represents public informational content.

Examples:

- articles,
- FAQs,
- educational content,
- announcements,
- marketing pages.

Content management should remain separate from transactional data.

---

# 39. AUDIT LOG

Represents a record of important system actions.

Potential fields:

- actor,
- action,
- resource,
- resource ID,
- previous state,
- new state,
- timestamp,
- metadata,
- reason where required.

Audit logs are append-oriented records and should not be casually modified.

---

# 40. BUSINESS RELATIONSHIP MAP

The central relationship model:

```text
LEAD
 │
 │ may convert
 ▼
REGISTRATION
 │
 ├────────→ PACKAGE
 │
 ├────────→ DEPARTURE
 │
 └────────→ PILGRIM
                │
                ├── DOCUMENTS
                ├── PAYMENTS
                ├── PREPARATION
                ├── MANASIK
                │
                └── TRIP
                       │
                       ├── ITINERARY
                       ├── HOTEL
                       ├── TRANSPORT
                       ├── TOUR LEADER
                       ├── MUTHAWWIF
                       └── ANNOUNCEMENTS
                              │
                              ▼
                           RETURN
                              │
                              ▼
                           ALUMNI
```

---

# 41. CRITICAL DOMAIN DISTINCTIONS

The following distinctions must be preserved during implementation.

## User vs Pilgrim

Authentication identity ≠ customer record.

## Lead vs Pilgrim

Prospective relationship ≠ confirmed customer.

## Package vs Departure

Product offering ≠ scheduled departure.

## Departure vs Trip

Scheduled offering ≠ operational execution.

## Document Requirement vs Document

Requirement ≠ uploaded file.

## Invoice vs Payment

Billing obligation ≠ transaction.

## Payment vs Refund

Incoming transaction ≠ returned funds.

## Manasik Content vs Manasik Session

Learning material ≠ scheduled event.

## Activity vs Follow-up

Historical action ≠ future action.

## Pilgrim vs Trip Member

Customer identity ≠ participation in a specific trip.

---

# 42. HISTORICAL DATA PRINCIPLE

The system must preserve history.

A pilgrim may have:

```text
PILGRIM
 ├── REGISTRATION 2026-A
 │      └── TRIP 2026-A
 │
 ├── REGISTRATION 2027-B
 │      └── TRIP 2027-B
 │
 └── REGISTRATION 2028-C
        └── TRIP 2028-C
```

Historical trips must remain distinguishable.

---

# 43. DOMAIN MODELING RULE

The system should not create a new entity merely because a screen exists.

Entities should represent meaningful business concepts.

Likewise, important business concepts must not be hidden as unstructured text merely because they are inconvenient to model.

---

# 44. FINAL DOMAIN PRINCIPLE

The domain model should support this lifecycle:

```text
PERSON
 ↓
LEAD
 ↓
REGISTRATION
 ↓
PILGRIM
 ↓
TRIP PARTICIPATION
 ↓
RETURN
 ↓
ALUMNI
 ↓
REFERRAL
 ↓
NEW LEAD
```

while preserving:

**identity + history + financial records + operational records + authorization + auditability.**