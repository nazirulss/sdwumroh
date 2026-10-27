# SDW UMROH — PROJECT CONTEXT

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Project Context / AI Context  
**Priority:** Foundational

---

# 1. PROJECT IDENTITY

## Product Name

**SDW UMROH**

## Product Category

Digital Umrah Tour & Travel Platform.

## Product Type

A unified digital platform consisting of:

1. Public Website
2. Jamaah PWA
3. Partner / Agent Portal
4. SDW Backoffice
5. CRM & Sales Management
6. Umrah Operational Management
7. Finance Management
8. Communication & Notification
9. Alumni & Referral Ecosystem

---

# 2. CORE VISION

SDW UMROH is designed to transform the traditional Umrah travel business into an integrated digital service platform.

The platform should manage the complete customer journey:

**Discover → Consult → Register → Verify → Pay → Prepare → Depart → Umrah → Return → Alumni**

The platform must not be treated merely as a company profile website or online registration form.

It is an operational platform that connects:

**Prospective Pilgrims + Pilgrims + Sales + Administration + Finance + Operations + Tour Leaders + Muthawwifs + Agents + Management**

within one coherent system.

---

# 3. CORE PRODUCT PHILOSOPHY

## "ONE JOURNEY, ONE PLATFORM."

Every pilgrim should experience one continuous digital journey from the first interaction with SDW until after returning from Umrah.

The system should avoid fragmented workflows where:

- leads are stored separately from registrations,
- registrations are disconnected from payments,
- payments are disconnected from departures,
- documents are managed manually,
- operational information is distributed across chat groups,
- and management has no unified view of the business.

The platform should create a connected chain:

**Lead → Customer → Registration → Payment → Preparation → Trip → Return → Alumni**

---

# 4. PRODUCT PROMISE

SDW UMROH should provide three major values.

## For Pilgrims

A clear, reassuring, simple and transparent Umrah journey.

Pilgrims should always be able to understand:

- what package they selected,
- what they have completed,
- what documents are required,
- what payments remain,
- what preparation is needed,
- when they must take action,
- what their itinerary is,
- and where to obtain assistance.

## For SDW Team

A centralized operational system that reduces:

- repetitive manual work,
- scattered information,
- missed follow-ups,
- document confusion,
- payment tracking problems,
- operational uncertainty,
- and dependence on individual staff knowledge.

## For Management

A reliable business overview covering:

- leads,
- sales,
- pilgrims,
- departures,
- payments,
- operational readiness,
- agent performance,
- customer relationships,
- and business activity.

---

# 5. TARGET EXPERIENCE

The platform should feel:

- Trustworthy
- Calm
- Professional
- Human
- Clear
- Simple
- Modern
- Islamic without becoming visually excessive
- Premium without becoming intimidating

The interface must prioritize clarity over visual decoration.

The system should never make a pilgrim feel like they are interacting with a complicated enterprise application.

---

# 6. PRIMARY USER GROUPS

The platform is designed around the following actors.

### External Users

1. Visitor
2. Prospective Pilgrim
3. Registered Pilgrim
4. Alumni
5. Agent / Partner

### Internal Users

6. Owner / Management
7. Manager
8. Sales / Marketing
9. Customer Service / Admin
10. Finance
11. Document / Visa Officer
12. Operations
13. Tour Leader
14. Muthawwif

Each role must have appropriate access and must not automatically receive access to all information.

---

# 7. PRIMARY PRODUCT SURFACES

## 7.1 Public Website

Purpose:

**Discovery + Trust + Information + Conversion**

The public website should communicate:

- who SDW is,
- why customers should understand and trust the service,
- available Umrah packages,
- departure information,
- educational content,
- FAQs,
- contact channels,
- and registration options.

The website should function as the primary public-facing digital presence of SDW.

---

## 7.2 Jamaah PWA

Purpose:

**Self-Service + Journey Management**

The PWA is the personal digital companion for registered pilgrims.

Core capabilities include:

- personal profile,
- registration status,
- document management,
- payment status,
- invoice information,
- preparation checklist,
- manasik materials,
- itinerary,
- departure information,
- announcements,
- notifications,
- support/contact,
- and post-trip alumni access.

The PWA must be mobile-first.

---

## 7.3 Partner / Agent Portal

Purpose:

**Distribution + Referral + Relationship Management**

Partners may receive capabilities such as:

- referral links,
- lead submission,
- prospect tracking,
- registered pilgrim tracking,
- sales information,
- commission information,
- marketing materials,
- and partner profile management.

Access must be restricted to the partner's permitted data.

---

## 7.4 SDW Backoffice

Purpose:

**Business Operations**

The Backoffice is the internal control center.

It should provide modules for:

- Dashboard
- CRM
- Leads
- Pilgrims
- Packages
- Departures
- Documents
- Payments
- Finance
- Manasik
- Itinerary
- Operations
- Agents
- Communications
- Alumni
- Reports
- Settings

---

# 8. CORE BUSINESS JOURNEY

The primary lifecycle is:

```text
VISITOR
   ↓
PROSPECTIVE PILGRIM
   ↓
LEAD
   ↓
CONSULTATION
   ↓
PACKAGE SELECTION
   ↓
REGISTRATION
   ↓
DOCUMENT VERIFICATION
   ↓
PAYMENT
   ↓
CONFIRMED PILGRIM
   ↓
PREPARATION
   ↓
MANASIK
   ↓
DEPARTURE
   ↓
UMRAH JOURNEY
   ↓
RETURN
   ↓
ALUMNI
   ↓
REFERRAL / REPEAT JOURNEY
```

This lifecycle is one of the primary foundations of the system.

---

# 9. CORE PRODUCT PRINCIPLES

## Principle 1 — Journey First

The system must be designed around the pilgrim journey, not around disconnected administrative modules.

## Principle 2 — Single Source of Truth

Important business information must have one authoritative source.

The same pilgrim should not exist as unrelated records in multiple systems.

## Principle 3 — Role-Based Access

Users only receive access required for their role.

## Principle 4 — Explicit State

Important business entities must have explicit statuses.

Examples:

- Lead status
- Registration status
- Document status
- Payment status
- Departure status
- Trip status

## Principle 5 — Traceability

Important actions should be traceable.

Examples:

- who changed a status,
- who verified a document,
- who recorded a payment,
- who modified operational information.

## Principle 6 — Mobile First for Pilgrims

The pilgrim experience must be optimized for smartphones.

## Principle 7 — Automation Where Valuable

The system should proactively identify:

- pending documents,
- upcoming payments,
- incomplete preparation,
- approaching departures,
- unresolved operational tasks,
- and important notifications.

Automation must support humans rather than remove necessary human oversight.

## Principle 8 — Progressive Complexity

The interface should reveal complexity only when needed.

A pilgrim should see a simple journey.

An operator may see operational detail.

Management may see aggregated business information.

---

# 10. NON-GOALS FOR INITIAL VERSION

The first version should NOT attempt to become:

- a general ERP,
- a general accounting application,
- a generic marketplace,
- a social network,
- a generic Islamic education platform,
- a complete airline/hotel booking engine,
- or a replacement for every external system used by SDW.

The initial platform should focus on the core SDW Umrah journey and its operational requirements.

---

# 11. TECHNOLOGY DIRECTION

The technology direction is intentionally high-level at this stage.

Expected architecture:

- Next.js
- TypeScript
- PWA
- Supabase
- PostgreSQL
- Vercel
- GitHub

These technologies are implementation direction, not permission to introduce unnecessary dependencies.

Detailed technical architecture belongs in:

`09_TECHNICAL_ARCHITECTURE.md`

Detailed database specifications belong in:

`10_DATABASE_SPEC.md`

---

# 12. AI / DEVELOPMENT CONTEXT

Gemini Canvas and Antigravity are expected to assist with:

- product visualization,
- UI/UX prototyping,
- architecture implementation,
- code generation,
- refactoring,
- testing,
- and iterative development.

AI must not invent major product decisions.

When a requirement is ambiguous and materially affects:

- business logic,
- permissions,
- data structure,
- payment behavior,
- customer journey,
- security,
- or architecture,

the ambiguity must be surfaced before implementation.

---

# 13. SOURCE-OF-TRUTH HIERARCHY

The project documentation follows this hierarchy:

```text
00_PROJECT_CONTEXT.md
        ↓
01_PRD.md
        ↓
02_PRODUCT_BLUEPRINT.md
        ↓
Domain / Workflow / Business Rules
        ↓
UX / Technical Architecture
        ↓
Implementation
```

When two documents conflict, the higher-level approved specification takes precedence until the conflict is explicitly resolved.

---

# 14. SPECIFICATION STATUS

Every major specification should eventually have one of these states:

```text
DRAFT
REVIEW
APPROVED
LOCKED
IMPLEMENTED
DEPRECATED
```

AI agents must treat:

**LOCKED**

as a protected specification.

A locked specification must not be changed implicitly during implementation.

---

# 15. CURRENT PROJECT STATUS

This document represents the foundational product direction.

The following are intentionally not yet locked:

- final SDW brand system,
- final package catalog,
- exact operational workflow,
- final user permission matrix,
- final database schema,
- external service integrations,
- final payment architecture,
- final legal/compliance implementation,
- detailed UI design system.

These will be defined in subsequent specifications.

---

# 16. DEFINING STATEMENT

SDW UMROH is not simply a website for selling Umrah packages.

It is a **digital journey and operational platform for an Umrah Tour & Travel business**, connecting customer acquisition, registration, document management, payment, preparation, trip operations, communication, and post-trip relationship management in one coherent ecosystem.

**Core concept:**

> **ONE JOURNEY, ONE PLATFORM.**