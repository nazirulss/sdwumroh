# SDW UMROH — INFORMATION ARCHITECTURE

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Information Architecture & Navigation Specification  
**Parent Documents:**
- `00_PROJECT_CONTEXT.md`
- `01_PRD.md`
- `02_PRODUCT_BLUEPRINT.md`
- `03_USER_ROLES_AND_PERMISSIONS.md`
- `04_USER_JOURNEYS_AND_WORKFLOWS.md`
- `05_DOMAIN_MODEL.md`
- `06_BUSINESS_RULES.md`

---

# 1. PURPOSE

This document defines how information, pages, navigation and application surfaces are organized across the SDW UMROH platform.

The architecture must support four primary experiences:

1. Public Website
2. Pilgrim PWA
3. Partner Portal
4. SDW Backoffice

All experiences connect to one shared business core.

---

# 2. INFORMATION ARCHITECTURE PRINCIPLE

The information architecture should follow:

**User Need → Journey → Task → Information**

not:

**Database Table → Menu Item**

A database entity does not automatically deserve a top-level navigation item.

---

# 3. PLATFORM STRUCTURE

```text
SDW UMROH
│
├── PUBLIC WEB
│
├── AUTHENTICATED EXPERIENCE
│   ├── PILGRIM
│   └── PARTNER
│
└── INTERNAL EXPERIENCE
    └── BACKOFFICE
```

---

# 4. PUBLIC WEBSITE

Suggested route structure:

```text
/
├── /packages
│   └── /packages/[slug]
│
├── /departures
│   └── /departures/[slug]
│
├── /about
├── /why-sdw
├── /testimonials
│
├── /articles
│   └── /articles/[slug]
│
├── /faq
├── /contact
│
├── /consultation
└── /register
```

---

# 5. PUBLIC NAVIGATION

Primary navigation:

```text
Home
Paket Umroh
Keberangkatan
Tentang SDW
Artikel
FAQ
Kontak
```

Primary CTA:

**Konsultasi / Daftar**

Secondary CTA may be:

**Login Jamaah**

---

# 6. PUBLIC HOMEPAGE INFORMATION HIERARCHY

```text
1. Hero
2. Trust / Credibility
3. Featured Packages
4. SDW Journey
5. Upcoming Departures
6. Why SDW
7. Testimonials
8. Educational Content
9. FAQ
10. CTA
11. Footer
```

The final visual hierarchy is subject to UX testing.

---

# 7. PACKAGE INFORMATION ARCHITECTURE

## Package List

Information:

- package name,
- duration,
- departure,
- starting price,
- availability,
- key highlights.

## Package Detail

```text
Overview
Pricing
Departure
Flight
Hotel
Transportation
Included
Excluded
Itinerary
Payment Information
Terms
FAQ
CTA
```

---

# 8. AUTHENTICATION

Suggested routes:

```text
/login
/forgot-password
/reset-password
```

Additional onboarding may include:

```text
/verify-account
/complete-profile
```

Authentication flows must remain independent from authorization.

---

# 9. PILGRIM PWA

Suggested structure:

```text
/app
│
├── /dashboard
├── /journey
├── /documents
├── /payments
├── /preparation
├── /manasik
├── /itinerary
├── /announcements
├── /notifications
├── /help
├── /profile
└── /alumni
```

---

# 10. PILGRIM PRIMARY NAVIGATION

Recommended mobile navigation:

```text
Home
Journey
Preparation
Notifications
Profile
```

Secondary functions may live within contextual menus or nested pages.

The navigation should not attempt to expose every feature at the bottom navigation level.

---

# 11. PILGRIM DASHBOARD INFORMATION HIERARCHY

The dashboard should prioritize:

```text
1. Current Journey
2. Current Status
3. Next Required Action
4. Upcoming Event
5. Important Announcement
6. Progress
7. Quick Actions
```

Example:

```text
Assalamu'alaikum, Ahmad

Umrah 12 Hari
20 December 2026

Current Stage
Preparation

Next Action
Upload Passport

Upcoming
Manasik — Saturday

Progress
82%
```

---

# 12. JOURNEY INFORMATION ARCHITECTURE

```text
Journey
│
├── Overview
├── Timeline
├── Current Stage
├── Next Action
├── Completed
└── Upcoming
```

The journey view should be the primary mental model for the pilgrim.

---

# 13. DOCUMENT INFORMATION ARCHITECTURE

```text
Documents
│
├── Required
├── Submitted
├── Under Review
├── Revision Required
├── Verified
└── Travel Documents
```

The interface should make missing and action-required documents immediately visible.

---

# 14. PAYMENT INFORMATION ARCHITECTURE

```text
Payments
│
├── Summary
├── Payment Schedule
├── Outstanding
├── History
└── Invoices
```

Important summary:

```text
Total
Paid
Outstanding
Next Due
```

---

# 15. PREPARATION INFORMATION ARCHITECTURE

```text
Preparation
│
├── All Tasks
├── Documents
├── Payment
├── Manasik
├── Briefing
├── Equipment
└── Completed
```

The user should be able to distinguish:

**Need Action**

from:

**Already Complete**

---

# 16. MANASIK INFORMATION ARCHITECTURE

```text
Manasik
│
├── My Sessions
├── Learning
│   ├── Video
│   ├── Audio
│   ├── Articles
│   └── Quiz
└── Progress
```

---

# 17. TRIP INFORMATION ARCHITECTURE

```text
Trip
│
├── Overview
├── Itinerary
├── Flight
├── Hotel
├── Transport
├── Team
└── Announcements
```

The exact information displayed depends on role and operational relevance.

---

# 18. PARTNER PORTAL

Suggested routes:

```text
/partner
├── /dashboard
├── /referrals
├── /leads
├── /prospects
├── /pilgrims
├── /commission
├── /marketing
└── /profile
```

Primary navigation:

```text
Dashboard
Leads
Referrals
Commission
Marketing
Profile
```

---

# 19. BACKOFFICE

Suggested route structure:

```text
/admin
│
├── /dashboard
│
├── /crm
│   ├── /leads
│   ├── /activities
│   └── /follow-ups
│
├── /customers
│   └── /pilgrims
│
├── /products
│   ├── /packages
│   └── /departures
│
├── /operations
│   ├── /trips
│   ├── /itineraries
│   ├── /hotels
│   ├── /transport
│   ├── /tour-leaders
│   └── /muthawwifs
│
├── /documents
│
├── /finance
│   ├── /invoices
│   ├── /payments
│   └── /outstanding
│
├── /manasik
├── /communications
├── /partners
├── /alumni
├── /reports
└── /settings
```

---

# 20. BACKOFFICE NAVIGATION GROUPS

The sidebar should be organized by business purpose.

## Overview

- Dashboard

## Customer & Sales

- CRM
- Leads
- Follow-ups
- Pilgrims

## Products

- Packages
- Departures

## Operations

- Trips
- Itinerary
- Hotels
- Transport
- Tour Leaders
- Muthawwifs
- Readiness

## Customer Preparation

- Documents
- Manasik

## Finance

- Invoices
- Payments
- Outstanding
- Refunds where authorized

## Relationship

- Partners
- Alumni

## Communication

- Announcements
- Notifications

## Intelligence

- Reports
- Analytics

## System

- Users
- Roles
- Settings
- Audit Logs

---

# 21. ROLE-BASED NAVIGATION

Navigation must adapt to user permissions.

Example:

### Sales

```text
Dashboard
CRM
Leads
Follow-ups
Pilgrims
Packages
```

### Finance

```text
Dashboard
Pilgrims
Invoices
Payments
Outstanding
Reports
```

### Operations

```text
Dashboard
Departures
Trips
Readiness
Itinerary
Transport
Hotels
Tour Leaders
Muthawwifs
```

### Pilgrim

```text
Home
Journey
Preparation
Notifications
Profile
```

A role must not receive menu items merely because the route exists.

---

# 22. SEARCH

Search should eventually be contextual.

## Backoffice Global Search

Potential searchable entities:

- lead,
- pilgrim,
- registration,
- invoice,
- payment,
- departure,
- trip.

## Pilgrim Search

Not required in the initial version.

---

# 23. FILTERING

Data-heavy interfaces should support filters appropriate to the domain.

Examples:

### Leads

- status,
- source,
- sales owner,
- date.

### Pilgrims

- departure,
- status,
- document readiness,
- payment status.

### Departures

- date,
- status,
- capacity.

### Payments

- status,
- date,
- payment method,
- departure.

---

# 24. DETAIL PAGE PATTERN

Major entities should generally follow:

```text
LIST
 ↓
DETAIL
 ↓
OVERVIEW
 ↓
RELATED INFORMATION
 ↓
ACTIVITY / HISTORY
 ↓
ACTIONS
```

Example:

```text
Pilgrim
├── Overview
├── Journey
├── Documents
├── Payments
├── Preparation
├── Trip
└── Activity
```

---

# 25. DASHBOARD PRINCIPLE

A dashboard should not become a collection of random widgets.

Every dashboard must answer:

1. What is happening?
2. What requires attention?
3. What is next?
4. What is abnormal?
5. What action can I take?

---

# 26. STATUS NAVIGATION

Status should be visible wherever it matters.

Example:

```text
Payment
[OUTSTANDING]

Document
[VERIFIED]

Registration
[CONFIRMED]

Departure
[OPEN]
```

Status must use consistent visual semantics defined by the design system.

---

# 27. MOBILE INFORMATION ARCHITECTURE

Mobile screens should prioritize:

```text
PRIMARY TASK
 ↓
CURRENT STATUS
 ↓
NEXT ACTION
 ↓
SUPPORTING INFORMATION
```

Secondary information should not overwhelm the main task.

---

# 28. DESKTOP INFORMATION ARCHITECTURE

Desktop can expose more information simultaneously.

Suitable patterns:

- tables,
- side panels,
- filters,
- dashboards,
- multi-column detail views,
- bulk actions.

---

# 29. EMPTY STATES

Every major collection should define an empty state.

Examples:

```text
No Leads Yet
No Payments Found
No Upcoming Departures
No Documents Required
No Notifications
```

Empty states should explain what the user can do next where appropriate.

---

# 30. ERROR STATES

Errors must be contextual.

Bad:

> Something went wrong.

Better:

> Payment confirmation could not be completed. Please try again or contact Finance.

The UI should not expose technical implementation details to ordinary users.

---

# 31. INFORMATION HIERARCHY PRINCIPLE

The same data may appear differently for different roles.

Example:

```text
Pilgrim:
"Payment Remaining: Rp 5.000.000"

Finance:
"Invoice INV-2026-001
Paid: Rp 25.000.000
Outstanding: Rp 5.000.000
Status: PARTIALLY_PAID"
```

Same domain data.

Different context.

---

# 32. NAVIGATION PRINCIPLE

The navigation structure must remain stable enough that users can build familiarity.

New features should preferably be placed within existing conceptual groups rather than creating unnecessary top-level navigation items.

---

# 33. URL PRINCIPLE

URLs should be:

- predictable,
- semantic,
- stable,
- role-aware where appropriate,
- free of sensitive information.

Sensitive identifiers should not be unnecessarily exposed in public URLs.

---

# 34. INFORMATION ARCHITECTURE RULE

Do not design navigation from database tables.

Design navigation from:

**User → Goal → Workflow → Task → Information**

---

# 35. FINAL IA MODEL

```text
                    SDW UMROH
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      PUBLIC           AUTH              ADMIN
        │                │                │
      WEBSITE       ┌────┴────┐       BACKOFFICE
                    │         │
                 PILGRIM    PARTNER
                    │         │
                    └────┬────┘
                         │
                     SDW CORE
```

The IA must remain aligned with the domain model and workflow model.

No major navigation item should exist without a clear business/user purpose.