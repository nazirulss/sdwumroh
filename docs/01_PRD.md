# SDW UMROH — PRODUCT REQUIREMENTS DOCUMENT

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Product Requirements Document

---

# 1. PRODUCT OVERVIEW

## 1.1 Product Name

**SDW UMROH**

## 1.2 Product Vision

Build an integrated digital platform that manages the complete Umrah customer journey from first discovery through registration, payment, preparation, departure, Umrah journey, return, and alumni relationship.

## 1.3 Product Statement

SDW UMROH combines:

- public digital presence,
- lead generation,
- CRM,
- pilgrim management,
- document management,
- financial tracking,
- preparation,
- manasik,
- trip operations,
- communication,
- partner management,
- and alumni relationship management

into one connected platform.

---

# 2. PROBLEM STATEMENT

Traditional Umrah travel operations can become fragmented across:

- websites,
- WhatsApp conversations,
- spreadsheets,
- paper documents,
- payment records,
- staff notes,
- separate operational lists,
- and informal communication channels.

This creates several risks:

1. Information becomes scattered.
2. Follow-ups can be missed.
3. Pilgrim documents are difficult to monitor.
4. Payment status may require manual reconciliation.
5. Operational readiness is difficult to measure.
6. Pilgrims lack a single place to understand their preparation.
7. Management lacks a unified view of the business.

SDW needs a system that connects these activities into one operational flow.

---

# 3. PRODUCT OBJECTIVES

## Objective 1 — Improve Customer Experience

Give prospective and registered pilgrims a clear digital journey.

## Objective 2 — Centralize Pilgrim Data

Maintain one authoritative record for each pilgrim.

## Objective 3 — Improve Sales Follow-up

Provide CRM capabilities for leads and prospects.

## Objective 4 — Improve Operational Readiness

Make documents, payments, preparation and departure readiness visible.

## Objective 5 — Reduce Manual Administrative Work

Automate repetitive status tracking, notifications and reminders where appropriate.

## Objective 6 — Improve Management Visibility

Provide dashboards and reports for business and operational decision-making.

## Objective 7 — Build Long-Term Customer Relationships

Extend the relationship beyond the first Umrah through alumni and referral capabilities.

---

# 4. TARGET USERS

## 4.1 Public Visitor

Needs:

- information,
- trust,
- packages,
- education,
- contact,
- registration.

## 4.2 Prospective Pilgrim

Needs:

- consultation,
- package information,
- registration,
- follow-up,
- clear next steps.

## 4.3 Pilgrim

Needs:

- personal information,
- document status,
- payment status,
- preparation,
- manasik,
- itinerary,
- announcements,
- support.

## 4.4 Agent / Partner

Needs:

- referral,
- prospect tracking,
- sales information,
- commission information,
- marketing materials.

## 4.5 Sales

Needs:

- lead management,
- follow-up,
- prospect history,
- package information,
- conversion tracking.

## 4.6 Administration

Needs:

- registration management,
- pilgrim records,
- document verification,
- communication.

## 4.7 Finance

Needs:

- invoices,
- payment records,
- payment schedules,
- outstanding balances,
- financial reporting.

## 4.8 Operations

Needs:

- departure management,
- trip groups,
- itinerary,
- hotel,
- transportation,
- operational readiness.

## 4.9 Tour Leader / Muthawwif

Needs:

- relevant trip information,
- group information,
- itinerary,
- announcements,
- attendance/check-in where applicable.

## 4.10 Management

Needs:

- business overview,
- sales,
- revenue,
- outstanding payments,
- active pilgrims,
- upcoming departures,
- operational alerts,
- reports.

---

# 5. PRODUCT SURFACES

## 5.1 Public Website

### Primary Goal

Convert visitors into informed prospects and prospective pilgrims.

### Core Areas

- Homepage
- About SDW
- Umrah Packages
- Package Detail
- Departure Schedule
- Why SDW
- Testimonials
- Articles
- FAQ
- Contact
- Registration
- Consultation CTA

---

# 6. PILGRIM PWA

## Primary Goal

Become the pilgrim's personal digital companion.

### Core Areas

- Dashboard
- My Journey
- Profile
- Documents
- Payments
- Invoices
- Preparation Checklist
- Manasik
- Itinerary
- Announcements
- Notifications
- Help / Support
- Alumni

---

# 7. PARTNER PORTAL

## Primary Goal

Support SDW's agent/referral ecosystem.

### Core Areas

- Partner Dashboard
- Referral Link
- Leads
- Prospects
- Registered Pilgrims
- Sales
- Commission
- Marketing Materials
- Profile

---

# 8. BACKOFFICE

## Primary Goal

Operate the SDW business.

### Core Modules

```text
Dashboard
CRM
Leads
Pilgrims
Packages
Departures
Documents
Payments
Finance
Manasik
Itinerary
Operations
Agents
Communications
Alumni
Reports
Settings
```

---

# 9. CORE FUNCTIONAL REQUIREMENTS

## FR-001 — Public Package Catalog

The system shall allow visitors to browse available Umrah packages.

Package information may include:

- package name,
- duration,
- departure,
- airline,
- hotel,
- transportation,
- included services,
- price,
- payment information,
- available quota,
- and other relevant information.

---

## FR-002 — Lead Capture

The system shall allow prospective customers to enter the SDW sales funnel.

Sources may include:

- website,
- social media,
- WhatsApp,
- referral,
- agent,
- event,
- direct office contact.

---

## FR-003 — CRM

The system shall allow authorized staff to:

- view leads,
- assign sales personnel,
- record activities,
- schedule follow-ups,
- update lead status,
- record notes,
- and monitor conversion.

---

## FR-004 — Registration

The system shall support digital pilgrim registration.

The registration process should collect only information required for the relevant process.

---

## FR-005 — Document Management

The system shall support:

- document upload,
- document categorization,
- document status,
- verification,
- rejection/request revision,
- and verification history.

---

## FR-006 — Payment Management

The system shall support:

- invoice information,
- payment schedule,
- payment records,
- outstanding balance,
- payment status,
- and relevant receipts.

---

## FR-007 — Pilgrim Journey

The system shall display the pilgrim's current journey state.

Example:

```text
Registration
    ↓
Documents
    ↓
Payment
    ↓
Preparation
    ↓
Manasik
    ↓
Departure
    ↓
Trip
    ↓
Return
    ↓
Alumni
```

---

## FR-008 — Preparation Checklist

The system shall provide a checklist of required preparation activities.

Items may include:

- documents,
- payment,
- manasik,
- equipment,
- travel briefing,
- and other package-specific requirements.

---

## FR-009 — Manasik

The platform shall provide digital manasik resources.

Potential content:

- video,
- article,
- audio,
- checklist,
- quiz,
- session information.

---

## FR-010 — Departure Management

Authorized staff shall be able to manage:

- departure,
- trip group,
- pilgrim members,
- itinerary,
- transportation,
- accommodation,
- tour leader,
- muthawwif,
- and operational information.

---

## FR-011 — Notifications

The system shall support notifications for relevant events.

Examples:

- registration updates,
- document requests,
- payment reminders,
- manasik reminders,
- departure reminders,
- operational announcements.

---

## FR-012 — Check-in

Where operationally appropriate, the platform may support QR-based or digital check-in.

---

## FR-013 — Partner Referral

The system shall support referral attribution for participating partners.

---

## FR-014 — Alumni

After a completed trip, a pilgrim may transition into alumni status.

The alumni experience may include:

- trip documentation,
- testimonials,
- community information,
- future Umrah opportunities,
- referral,
- and relevant content.

---

## FR-015 — Dashboard & Reporting

Authorized users shall have dashboards appropriate to their roles.

Management dashboard may include:

- leads,
- conversions,
- pilgrims,
- active departures,
- payments,
- outstanding balances,
- operational readiness,
- and other relevant KPIs.

---

# 10. NON-FUNCTIONAL REQUIREMENTS

## NFR-001 — Responsive

The public website and internal interfaces must work across:

- mobile,
- tablet,
- desktop.

The pilgrim experience is mobile-first.

## NFR-002 — Performance

Pages should load efficiently and avoid unnecessary client-side processing.

## NFR-003 — Security

The system must implement:

- authentication,
- authorization,
- role-based access,
- secure document handling,
- audit logging,
- appropriate database access controls.

## NFR-004 — Reliability

Important business actions must be persisted reliably.

## NFR-005 — Traceability

Important changes should be auditable.

## NFR-006 — Maintainability

The codebase should use modular architecture and reusable components.

## NFR-007 — Accessibility

The interface should follow reasonable accessibility practices, including:

- readable typography,
- sufficient contrast,
- keyboard accessibility where applicable,
- meaningful labels,
- clear error messages.

---

# 11. CORE BUSINESS STATES

The exact state machine will be defined separately, but the product must support explicit state management for:

- Lead
- Registration
- Pilgrim
- Document
- Payment
- Departure
- Trip
- Manasik
- Alumni

No critical workflow should rely only on free-form notes.

---

# 12. MVP SCOPE

The initial MVP should prioritize the core journey.

## MVP A — Public

- Homepage
- Package catalog
- Package detail
- About
- Contact
- FAQ
- Registration / consultation

## MVP B — CRM

- Lead capture
- Lead list
- Lead detail
- Sales assignment
- Follow-up
- Lead status

## MVP C — Pilgrim

- Account
- Profile
- Registration status
- Documents
- Payment status
- Preparation checklist

## MVP D — Operations

- Package
- Departure
- Trip group
- Basic itinerary
- Pilgrim readiness

## MVP E — Administration

- Dashboard
- User roles
- Basic reports
- Notifications

---

# 13. POST-MVP

Potential subsequent capabilities:

- advanced payment integration,
- advanced WhatsApp integration,
- digital manasik,
- QR check-in,
- agent portal,
- commission engine,
- alumni system,
- advanced analytics,
- automation engine,
- advanced trip operations,
- richer content management.

---

# 14. OUT OF SCOPE FOR MVP

Unless explicitly approved later:

- full accounting ERP,
- airline reservation engine,
- hotel reservation engine,
- public marketplace,
- social network,
- complex loyalty platform,
- AI autonomous sales agent,
- uncontrolled third-party integrations.

---

# 15. SUCCESS INDICATORS

The platform should eventually enable SDW to measure:

### Acquisition

- website visitors,
- leads,
- lead sources.

### Sales

- consultations,
- follow-ups,
- registrations,
- conversions.

### Customer

- active pilgrims,
- document completion,
- payment completion,
- preparation completion.

### Operations

- upcoming departures,
- readiness,
- incomplete requirements.

### Relationship

- alumni,
- referrals,
- repeat customers.

Exact KPI definitions should be established before analytics implementation.

---

# 16. UX REQUIREMENTS

The user should always understand:

1. Where am I?
2. What is my current status?
3. What needs to happen next?
4. Is there anything I need to do?
5. Where can I get help?

The system should avoid unnecessary complexity.

---

# 17. ERROR / EMPTY / LOADING STATES

Every major interface must consider:

- loading state,
- empty state,
- error state,
- success state,
- permission denied state,
- offline/unavailable state where relevant.

These states are part of the product, not optional polish.

---

# 18. PRODUCT QUALITY BAR

A feature is not considered complete merely because the happy path works.

A feature should also consider:

- permissions,
- validation,
- error handling,
- loading,
- empty states,
- mobile layout,
- auditability,
- security,
- accessibility,
- and edge cases.

---

# 19. PRODUCT DECISION RULE

When a feature conflicts with simplicity, the team should prefer the simplest design that still satisfies the actual business requirement.

When a feature introduces major complexity, its business value should be explicitly established before implementation.

---

# 20. FINAL PRODUCT DEFINITION

SDW UMROH is a unified digital platform for managing the complete Umrah customer journey and supporting the operational needs of an Umrah Tour & Travel business.

Its core product loop is:

**ATTRACT → CONSULT → REGISTER → VERIFY → PAY → PREPARE → DEPART → SERVE → RETURN → RETAIN**

The platform should make this loop visible, manageable and measurable.