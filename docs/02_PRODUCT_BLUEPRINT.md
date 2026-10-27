# SDW UMROH — PRODUCT BLUEPRINT

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Product Architecture / Product Blueprint

---

# 1. BLUEPRINT OVERVIEW

SDW UMROH consists of four primary product experiences connected to one shared platform core.

```text
                         SDW UMROH
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
       WEBSITE               PWA              PARTNER
          │                   │                   │
       Public             Jamaah             Agent
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                         SDW CORE
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
      CRM                 OPERATIONS              FINANCE
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                         MANAGEMENT
```

---

# 2. PRODUCT ECOSYSTEM

## 2.1 Public Website

The website is the public front door.

### Primary jobs

1. Build trust.
2. Explain SDW services.
3. Present packages.
4. Educate prospective pilgrims.
5. Capture leads.
6. Start consultation.
7. Start registration.

---

## 2.2 Pilgrim PWA

The PWA is the pilgrim's personal journey center.

### Primary jobs

1. Show journey status.
2. Manage profile.
3. Manage documents.
4. Monitor payment.
5. Prepare for departure.
6. Access manasik.
7. Receive announcements.
8. Access itinerary.
9. Request help.
10. Continue relationship after the trip.

---

## 2.3 Partner Portal

The partner portal supports distribution.

### Primary jobs

1. Generate referrals.
2. Submit leads.
3. Track prospects.
4. Monitor referred pilgrims.
5. View commission information.
6. Access marketing resources.

---

## 2.4 SDW Backoffice

The Backoffice is the operational control center.

### Primary jobs

1. Manage leads.
2. Manage pilgrims.
3. Manage packages.
4. Manage departures.
5. Manage documents.
6. Manage payments.
7. Manage operations.
8. Manage communications.
9. Manage partners.
10. Monitor business performance.

---

# 3. PUBLIC WEBSITE BLUEPRINT

```text
/
├── Home
├── Packages
│   ├── Package List
│   └── Package Detail
├── Departures
├── About SDW
├── Why SDW
├── Testimonials
├── Articles
│   ├── Article List
│   └── Article Detail
├── FAQ
├── Contact
└── Registration
```

---

# 4. HOMEPAGE STRUCTURE

Recommended conceptual order:

```text
Hero
 ↓
Trust / Legality / Credibility
 ↓
Featured Packages
 ↓
Why Choose SDW
 ↓
How SDW Journey Works
 ↓
Upcoming Departures
 ↓
Testimonials
 ↓
Umrah Education / Articles
 ↓
FAQ
 ↓
Final CTA
 ↓
Footer
```

The exact content and ordering may be refined during UX design.

---

# 5. PACKAGE EXPERIENCE

## Package List

Each package card should communicate:

- package name,
- duration,
- departure,
- key differentiator,
- price,
- availability,
- CTA.

## Package Detail

The detail page may contain:

```text
Package Header
 ↓
Price / Departure
 ↓
Overview
 ↓
Itinerary
 ↓
Hotel
 ↓
Flight
 ↓
Transportation
 ↓
Included Services
 ↓
Excluded Services
 ↓
Payment Plan
 ↓
Important Information
 ↓
FAQ
 ↓
CTA
```

---

# 6. LEAD EXPERIENCE

The public website should provide multiple conversion paths.

```text
VIEW PACKAGE
    ↓
CONSULTATION

or

VIEW PACKAGE
    ↓
REGISTER

or

CONTACT SDW
    ↓
LEAD
```

All valid conversion paths should eventually connect to the CRM.

---

# 7. PILGRIM PWA BLUEPRINT

```text
/app
│
├── Dashboard
├── My Journey
├── Documents
├── Payments
├── Preparation
├── Manasik
├── Itinerary
├── Announcements
├── Notifications
├── Help
└── Profile
```

Post-trip:

```text
Alumni
```

may become available after the pilgrim completes the relevant journey state.

---

# 8. PILGRIM DASHBOARD

The dashboard should answer four questions immediately:

### 1. What is my Umrah?

Example:

> Umrah 12 Hari — 20 December 2026

### 2. What is my current progress?

Example:

> Preparation 80%

### 3. What do I need to do?

Example:

> Upload passport.

### 4. Is there important information?

Example:

> Manasik session Saturday, 10 October.

---

# 9. MY JOURNEY

The journey should be visualized as a timeline.

```text
✓ Registration
   │
✓ Document
   │
✓ Payment
   │
● Preparation
   │
○ Manasik
   │
○ Departure
   │
○ Umrah
   │
○ Return
```

The current stage should be visually dominant.

---

# 10. DOCUMENT CENTER

Conceptual structure:

```text
Documents
│
├── Required
│   ├── KTP
│   ├── KK
│   ├── Passport
│   └── Photo
│
├── Verification
│
└── Travel Documents
```

Each document needs a visible status.

Example:

```text
NOT UPLOADED
UPLOADED
UNDER REVIEW
VERIFIED
REVISION REQUIRED
EXPIRED
```

Exact statuses will be finalized in the workflow specification.

---

# 11. PAYMENT CENTER

Conceptual structure:

```text
Payment
│
├── Package Total
├── Amount Paid
├── Outstanding
├── Payment Schedule
├── Invoice
└── Payment History
```

The user must clearly understand the difference between:

- total package price,
- amount already paid,
- outstanding balance,
- next payment,
- payment due date.

---

# 12. PREPARATION CENTER

The preparation screen should behave as an actionable checklist.

```text
Preparation
│
├── Documents
├── Payments
├── Manasik
├── Travel Briefing
├── Equipment
└── Other Requirements
```

Example:

```text
Preparation Progress

████████████░░░ 82%

8 of 10 completed
```

---

# 13. MANASIK CENTER

Potential structure:

```text
Manasik
│
├── Learning
│   ├── Articles
│   ├── Videos
│   ├── Audio
│   └── Quiz
│
├── Sessions
│
└── Progress
```

The platform should distinguish between:

**self-learning content**

and

**scheduled physical/online manasik sessions**, where applicable.

---

# 14. TRIP / ITINERARY

Each pilgrim should be able to see relevant trip information.

```text
Trip
│
├── Departure
├── Flight
├── Hotel
├── Transportation
├── Itinerary
├── Tour Leader
├── Muthawwif
└── Announcements
```

Only information appropriate for the user's role should be exposed.

---

# 15. SUPPORT

The PWA should provide a clear support area.

Potential actions:

```text
Help
│
├── Contact SDW
├── Tour Leader
├── Muthawwif
├── Office
├── FAQ
└── Emergency Information
```

Emergency-related information must be designed carefully and should not imply services or guarantees that SDW does not actually provide.

---

# 16. PARTNER PORTAL BLUEPRINT

```text
Partner
│
├── Dashboard
├── Referral Link
├── Leads
├── Prospects
├── Pilgrims
├── Commission
├── Marketing Materials
└── Profile
```

The partner should only access data associated with their permitted relationship.

---

# 17. BACKOFFICE BLUEPRINT

```text
/admin
│
├── Dashboard
│
├── CRM
│   ├── Leads
│   ├── Activities
│   └── Follow-ups
│
├── Customers
│   └── Pilgrims
│
├── Products
│   ├── Packages
│   └── Departures
│
├── Operations
│   ├── Trip Groups
│   ├── Itinerary
│   ├── Hotels
│   ├── Transport
│   ├── Tour Leaders
│   └── Muthawwifs
│
├── Documents
│
├── Finance
│   ├── Invoices
│   ├── Payments
│   └── Outstanding
│
├── Manasik
│
├── Communications
│
├── Partners
│
├── Alumni
│
├── Reports
│
└── Settings
```

---

# 18. CRM BLUEPRINT

CRM should follow the sales funnel.

```text
NEW
 ↓
CONTACTED
 ↓
CONSULTATION
 ↓
PROPOSAL / PACKAGE
 ↓
FOLLOW-UP
 ↓
REGISTRATION
 ↓
CONVERTED
```

Potential exception states:

```text
LOST
DORMANT
UNQUALIFIED
```

Exact state definitions belong in the workflow and business rules documentation.

---

# 19. PILGRIM LIFECYCLE

The core lifecycle:

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
ON TRIP
    ↓
RETURNED
    ↓
ALUMNI
```

The actual state machine must be defined separately before production implementation.

---

# 20. OPERATIONAL READINESS

For every upcoming departure, the Backoffice should eventually provide a readiness overview.

Example:

```text
DEPARTURE
20 DECEMBER 2026

Pilgrims              42

Documents
██████████████ 95%

Payment
████████████  88%

Manasik
██████████████ 100%

Preparation
████████████░  86%

Operational Readiness
████████████░  89%
```

The readiness calculation must be based on explicitly defined rules, not arbitrary visual percentages.

---

# 21. MANAGEMENT DASHBOARD

Management should see a high-level business overview.

Potential sections:

```text
BUSINESS
├── Leads
├── Registrations
├── Conversion
├── Active Pilgrims
└── Revenue

OPERATIONS
├── Upcoming Departures
├── Readiness
├── Pending Documents
└── Operational Alerts

FINANCE
├── Collected
├── Outstanding
└── Upcoming Payments

CUSTOMER
├── Active Pilgrims
├── Completed Trips
├── Alumni
└── Referrals
```

---

# 22. CROSS-PLATFORM RELATIONSHIP

The four major surfaces must not become separate products.

They share a common business core.

```text
PUBLIC WEBSITE
      │
      │ Lead
      ↓
     CRM
      │
      │ Conversion
      ↓
   PILGRIM
      │
      ├──────────→ FINANCE
      │
      ├──────────→ DOCUMENTS
      │
      ├──────────→ PREPARATION
      │
      ↓
   DEPARTURE
      │
      ↓
     TRIP
      │
      ↓
    ALUMNI
      │
      ↓
   REFERRAL
      │
      └──────────→ CRM
```

This loop is central to the product.

---

# 23. NOTIFICATION ARCHITECTURE

Notifications should be triggered by meaningful business events.

Potential triggers:

```text
Lead Assigned
Registration Submitted
Document Revision Required
Document Verified
Payment Recorded
Payment Due
Manasik Scheduled
Manasik Reminder
Departure Approaching
Travel Briefing
Operational Announcement
Trip Update
Return
Alumni Transition
```

Notification channels may include:

- in-app,
- push notification,
- WhatsApp,
- email.

The actual channels depend on approved integrations.

---

# 24. AUTOMATION CONCEPT

The platform should eventually evolve from:

**Data Recording**

into:

**Operational Assistance**

Example:

```text
IF
departure is 14 days away

AND
passport is not verified

THEN
create operational alert

AND
notify responsible staff

AND
show action to assigned user
```

Automation rules must be explicitly defined and must never silently modify important business records without authorization.

---

# 25. ANALYTICS LAYER

The platform should eventually make the journey measurable.

```text
Acquisition
   ↓
Leads
   ↓
Consultation
   ↓
Registration
   ↓
Payment
   ↓
Preparation
   ↓
Departure
   ↓
Trip
   ↓
Alumni
   ↓
Referral
```

This creates a measurable customer lifecycle.

---

# 26. DESIGN EXPERIENCE PRINCIPLE

All surfaces should share one design language while adapting to their context.

### Public Website

Marketing-oriented.

### Pilgrim PWA

Simple and reassuring.

### Partner Portal

Productivity-oriented.

### Backoffice

Information-dense and operational.

The same design system should connect all four.

---

# 27. RESPONSIVE STRATEGY

## Mobile

Primary for:

- pilgrims,
- partners,
- notifications,
- quick operational actions.

## Desktop

Primary for:

- CRM,
- finance,
- administration,
- management,
- data-heavy operations.

The interface must not simply shrink the desktop UI onto mobile.

---

# 28. MVP PRODUCT MAP

The first implementation should prioritize:

```text
PUBLIC WEBSITE
       +
PACKAGE
       +
LEAD / CRM
       +
REGISTRATION
       +
PILGRIM ACCOUNT
       +
DOCUMENTS
       +
PAYMENT STATUS
       +
DEPARTURE
       +
BASIC PREPARATION
       +
ADMIN DASHBOARD
```

After the foundation is stable:

```text
MANASIK
PARTNER
ADVANCED FINANCE
NOTIFICATION AUTOMATION
QR CHECK-IN
ALUMNI
REFERRAL
ANALYTICS
```

---

# 29. PRODUCT EXPANSION MODEL

SDW should be designed so that new modules can be added without rewriting the core.

Potential future modules:

- advanced CRM,
- WhatsApp automation,
- advanced financial integration,
- digital contract,
- digital signature,
- advanced reporting,
- partner network,
- alumni community,
- repeat pilgrimage,
- AI-assisted customer service,
- AI-assisted operations.

These are future possibilities, not MVP commitments.

---

# 30. BLUEPRINT PRINCIPLE

The platform must remain coherent as it grows.

Every new module should answer:

1. Which user needs it?
2. Which journey does it support?
3. Which business object does it operate on?
4. Which workflow does it change?
5. Which role can access it?
6. What happens before and after it?
7. Does it create a new source of truth?
8. Does it introduce unnecessary complexity?

If these questions cannot be answered, the feature is not ready for implementation.

---

# 31. FINAL BLUEPRINT

The SDW UMROH platform can be summarized as:

```text
                    SDW UMROH
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
    WEBSITE              PWA             PARTNER
       │                 │                 │
    Discover          Journey          Referral
    Trust             Prepare          Sales
    Packages          Pay              Commission
    Lead              Travel           Relationship
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                     SDW CORE
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
      CRM            OPERATIONS          FINANCE
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                    MANAGEMENT
                         │
                    ANALYTICS
                         │
                    AUTOMATION
```

**Core Product Loop:**

> **ATTRACT → CONSULT → REGISTER → VERIFY → PAY → PREPARE → DEPART → SERVE → RETURN → RETAIN → REFER**