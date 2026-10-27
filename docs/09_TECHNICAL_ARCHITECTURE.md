# SDW UMROH — TECHNICAL ARCHITECTURE

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Technical Architecture Specification  
**Parent Documents:**
- `00_PROJECT_CONTEXT.md`
- `01_PRD.md`
- `02_PRODUCT_BLUEPRINT.md`
- `03_USER_ROLES_AND_PERMISSIONS.md`
- `04_USER_JOURNEYS_AND_WORKFLOWS.md`
- `05_DOMAIN_MODEL.md`
- `06_BUSINESS_RULES.md`
- `07_INFORMATION_ARCHITECTURE.md`
- `08_UI_UX_DESIGN_SYSTEM.md`

---

# 1. PURPOSE

This document defines how SDW UMROH should be technically constructed.

It translates the approved product, domain, workflow, permission, and UX specifications into:

- application architecture,
- frontend architecture,
- backend architecture,
- database architecture,
- authentication,
- authorization,
- storage,
- API communication,
- background processing,
- notifications,
- observability,
- deployment,
- testing,
- scalability boundaries.

This document is an implementation contract.

AI coding agents must not introduce a fundamentally different architecture without explicit approval.

---

# 2. ARCHITECTURAL PRINCIPLE

SDW UMROH should initially use a:

> **Modular Monolith + PostgreSQL + Supabase + Next.js**

architecture.

The objective is to maintain:

- strong domain boundaries,
- simple deployment,
- low operational complexity,
- transactional consistency,
- clear authorization,
- easy development,
- future extensibility.

Microservices are **not required for MVP**.

---

# 3. HIGH-LEVEL ARCHITECTURE

```text
                         USERS
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
     WEBSITE              PWA              PARTNER
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    NEXT.JS APPLICATION
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
     UI LAYER         APPLICATION LAYER    API LAYER
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                     DOMAIN SERVICES
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
       CRM             OPERATIONS          FINANCE
        │                  │                  │
        ├────────────── DOCUMENTS ───────────┤
        │                  │                  │
        ├────────────── MANASIK ─────────────┤
        │                  │                  │
        └────────────── CUSTOMER ────────────┘
                           │
                  SUPABASE PLATFORM
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
   PostgreSQL             Auth               Storage
       │                   │                   │
       ├───────────────────┼───────────────────┤
       │                   │                   │
     RLS              Realtime             Functions
       │
       ▼
   AUDIT / EVENTS
```

---

# 4. TECHNOLOGY BASELINE

The preferred baseline is:

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Web Framework | Next.js |
| UI | React |
| Styling | Design-token-based CSS / approved UI system |
| PWA | Web App Manifest + Service Worker |
| Database | PostgreSQL |
| Backend Platform | Supabase |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Authorization | Application authorization + PostgreSQL RLS |
| Hosting | Vercel |
| Source Control | GitHub |
| Validation | Zod or equivalent schema validation |
| Testing | Unit + Integration + E2E |
| Monitoring | Production observability solution |
| CI/CD | GitHub-based deployment pipeline |

Exact package versions should be pinned in the repository and upgraded deliberately.

---

# 5. APPLICATION STRUCTURE

Recommended conceptual structure:

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (app)/
│   ├── (partner)/
│   └── (admin)/
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── journey/
│   ├── documents/
│   ├── payments/
│   ├── crm/
│   └── operations/
│
├── features/
│   ├── auth/
│   ├── crm/
│   ├── customers/
│   ├── packages/
│   ├── departures/
│   ├── registrations/
│   ├── documents/
│   ├── finance/
│   ├── preparation/
│   ├── manasik/
│   ├── operations/
│   ├── partners/
│   ├── alumni/
│   └── communications/
│
├── domain/
│   ├── customer/
│   ├── crm/
│   ├── registration/
│   ├── documents/
│   ├── finance/
│   ├── operations/
│   └── shared/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── permissions/
│   ├── validation/
│   ├── audit/
│   └── utilities/
│
├── server/
│   ├── actions/
│   ├── services/
│   ├── queries/
│   └── integrations/
│
└── types/
```

The exact folder structure may evolve, but domain boundaries must remain recognizable.

---

# 6. ARCHITECTURAL LAYERS

## 6.1 Presentation Layer

Responsible for:

- rendering UI,
- forms,
- navigation,
- loading states,
- error states,
- accessibility,
- responsive behavior.

It must not contain critical business rules.

---

## 6.2 Application Layer

Responsible for:

- use cases,
- workflow orchestration,
- authorization checks,
- validation,
- transaction coordination,
- notifications,
- audit generation.

Example:

```text
submitDocument()
verifyDocument()
recordPayment()
approveRegistration()
createDeparture()
```

---

## 6.3 Domain Layer

Responsible for business concepts and rules.

Examples:

```text
Registration
Pilgrim
Document
Payment
Departure
Trip
Referral
Commission
```

Business decisions should be represented here or in explicit business-rule services.

---

## 6.4 Infrastructure Layer

Responsible for:

- PostgreSQL,
- Supabase,
- Storage,
- external APIs,
- email,
- WhatsApp,
- payment gateways,
- logging,
- queues/background jobs.

External integrations must not leak deeply into domain logic.

---

# 7. MODULAR DOMAIN ARCHITECTURE

Recommended modules:

```text
AUTH
CUSTOMER
CRM
PRODUCT
REGISTRATION
DOCUMENT
FINANCE
PREPARATION
MANASIK
OPERATIONS
COMMUNICATION
PARTNER
ALUMNI
REPORTING
AUDIT
SYSTEM
```

Modules should have explicit boundaries.

Example:

```text
CRM
 └── owns Lead behavior

REGISTRATION
 └── owns Registration behavior

FINANCE
 └── owns Invoice / Payment behavior

DOCUMENT
 └── owns Document behavior

OPERATIONS
 └── owns Departure / Trip behavior
```

---

# 8. SOURCE OF TRUTH

The authoritative source for transactional business data is:

> **PostgreSQL**

Not:

- browser state,
- localStorage,
- spreadsheets,
- manually maintained JSON,
- duplicated frontend state,
- WhatsApp conversations.

External systems may contain copies, but PostgreSQL remains the application source of truth unless explicitly documented otherwise.

---

# 9. FRONTEND DATA STRATEGY

Frontend should distinguish:

### Server State

Examples:

- pilgrim profile,
- payments,
- documents,
- departures,
- CRM records.

### UI State

Examples:

- modal open/closed,
- selected tab,
- temporary filter,
- drawer state.

### Form State

Examples:

- registration form,
- document upload form,
- payment submission.

Do not use global state as a replacement for the database.

---

# 10. SERVER-FIRST PRINCIPLE

Sensitive or authoritative data should preferably be fetched and mutated through server-side application logic.

Examples:

```text
Payment verification
Document verification
Role assignment
Refund
Cancellation
Price change
Departure capacity
Permission changes
```

These must not depend solely on browser-side logic.

---

# 11. NEXT.JS ARCHITECTURE

Next.js should provide:

- public pages,
- authenticated application,
- admin interface,
- server rendering,
- API endpoints where appropriate,
- server actions where appropriate,
- route protection,
- metadata/SEO,
- PWA shell.

Use Server Components where beneficial.

Use Client Components only when interaction requires them.

---

# 12. ROUTE GROUPS

Conceptually:

```text
app/
├── (public)/
├── (auth)/
├── (app)/
├── (partner)/
└── (admin)/
```

Each authenticated surface should have explicit authorization.

Route grouping is not itself a security boundary.

---

# 13. AUTHENTICATION

Supabase Auth is the preferred authentication foundation.

Potential methods:

- email/password,
- magic link,
- OTP,
- other approved authentication mechanisms.

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

These must remain separate concepts.

---

# 14. AUTHORIZATION

Authorization must operate at multiple layers:

```text
UI
 ↓
Application
 ↓
Database / RLS
```

UI hiding alone is never sufficient.

The final authorization contract is defined in:

`03_USER_ROLES_AND_PERMISSIONS.md`

---

# 15. DATABASE ACCESS

Application access should use controlled data-access functions/services.

Avoid scattering raw database queries throughout UI components.

Preferred:

```text
UI
 ↓
Use Case / Server Action
 ↓
Service
 ↓
Repository / Query
 ↓
PostgreSQL
```

---

# 16. SUPABASE USAGE

Supabase should provide:

### PostgreSQL

Primary transactional database.

### Auth

Identity and session management.

### Storage

Private document/file storage.

### Realtime

Only where real-time behavior genuinely improves UX.

### Edge Functions

Use when an isolated server-side function is appropriate.

### Database Functions

Use selectively for database-level atomicity or reusable database logic.

Do not move all business logic into database functions.

---

# 17. STORAGE ARCHITECTURE

Sensitive documents must use private storage.

Conceptually:

```text
storage/
└── pilgrim-documents/
    └── <pilgrim-id>/
        └── <document-id>/
            └── <version>
```

Public URLs must not expose private documents.

Access should use controlled authorization and short-lived signed URLs where appropriate.

---

# 18. FILE UPLOAD FLOW

```text
Pilgrim
 ↓
Upload Request
 ↓
Authorization
 ↓
File Validation
 ↓
Private Storage
 ↓
Document Record
 ↓
UNDER_REVIEW
 ↓
Document Officer
 ↓
Verification
```

File metadata and business status belong in PostgreSQL.

The binary file belongs in Storage.

---

# 19. TRANSACTIONAL INTEGRITY

Operations involving multiple authoritative changes should be transactional.

Example:

```text
Verify Payment
 ↓
Update Payment
 ↓
Update Invoice Balance
 ↓
Create Audit Event
 ↓
Create Notification Event
```

These should not leave the system in an inconsistent intermediate state.

---

# 20. EVENT-DRIVEN INTERNAL MODEL

Important business events may be represented as:

```text
REGISTRATION_SUBMITTED
DOCUMENT_UPLOADED
DOCUMENT_VERIFIED
DOCUMENT_REVISION_REQUIRED
PAYMENT_SUBMITTED
PAYMENT_VERIFIED
DEPARTURE_APPROACHING
TRIP_COMPLETED
```

Events may trigger:

- notifications,
- tasks,
- analytics,
- audit records,
- automation.

Events do not automatically imply irreversible actions.

---

# 21. BACKGROUND PROCESSING

Long-running or asynchronous operations should not block the user request.

Examples:

- sending bulk notifications,
- generating reports,
- processing external integration callbacks,
- scheduled reminders,
- large exports.

A queue/job mechanism may be introduced when required.

The MVP should avoid unnecessary infrastructure complexity.

---

# 22. NOTIFICATION ARCHITECTURE

Conceptually:

```text
Business Event
      ↓
Notification Rule
      ↓
Audience Resolver
      ↓
Channel Adapter
      ↓
Delivery
      ↓
Delivery Log
```

Channels may include:

```text
IN_APP
PUSH
EMAIL
WHATSAPP
```

Actual providers are TBD.

---

# 23. EXTERNAL INTEGRATIONS

Integrations must be isolated behind adapters.

Example:

```text
PaymentService
 ├── PaymentGatewayA
 └── PaymentGatewayB

NotificationService
 ├── EmailProvider
 └── WhatsAppProvider
```

Domain logic should depend on the service interface, not the provider.

---

# 24. API STRATEGY

The platform may use:

1. Server Actions for internal UI mutations where appropriate.
2. Route Handlers / REST API for explicit application endpoints.
3. Webhooks for external callbacks.
4. Service functions for internal domain orchestration.

Do not create APIs merely because every operation "needs an endpoint."

The API contract is defined separately in:

`11_API_CONTRACT.md`

---

# 25. SEO ARCHITECTURE

Public website must support:

- semantic HTML,
- metadata,
- Open Graph,
- canonical URLs,
- sitemap,
- robots configuration,
- structured content,
- performant rendering.

Authenticated application does not require public indexing.

---

# 26. PWA ARCHITECTURE

The PWA should provide:

- installability,
- responsive application shell,
- manifest,
- service worker,
- controlled caching,
- offline-friendly UX where appropriate,
- push notifications if supported.

Offline mode must not imply that sensitive transactional actions can be completed offline unless explicitly designed and secured.

---

# 27. CACHING

Cache only data whose staleness is acceptable.

Potential cache candidates:

- public articles,
- public package information,
- FAQ,
- static content.

Do not blindly cache:

- payment balance,
- document status,
- sensitive profile information,
- authorization-sensitive data.

---

# 28. OBSERVABILITY

Production system should capture:

```text
Application Errors
Request Failures
Authentication Failures
Authorization Failures
Integration Failures
Background Job Failures
Performance Signals
Critical Business Events
```

Sensitive personal data must not be dumped into logs.

---

# 29. ERROR HANDLING

Errors should be classified:

```text
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
NOT_FOUND
CONFLICT
BUSINESS_RULE_ERROR
EXTERNAL_SERVICE_ERROR
INTERNAL_ERROR
```

Users should receive understandable messages.

Internal diagnostic information must not be exposed unnecessarily.

---

# 30. TESTING ARCHITECTURE

Testing layers:

```text
UNIT
 ↓
DOMAIN / SERVICES
 ↓
INTEGRATION
 ↓
DATABASE / RLS
 ↓
E2E
 ↓
PRODUCTION MONITORING
```

Critical workflows must receive stronger coverage.

Priority:

```text
Authentication
Authorization
Registration
Document
Payment
Confirmation
Departure Readiness
```

---

# 31. ENVIRONMENT STRATEGY

Minimum environments:

```text
LOCAL
 ↓
DEVELOPMENT / PREVIEW
 ↓
PRODUCTION
```

Production secrets must never be committed to Git.

Environment variables must be separated.

---

# 32. DEPLOYMENT

Recommended:

```text
GitHub
   ↓
Pull Request
   ↓
CI
   ↓
Tests
   ↓
Preview Deployment
   ↓
Review
   ↓
Production
```

Database migrations must be version-controlled.

---

# 33. DATABASE MIGRATION PRINCIPLE

Never modify production schema manually without traceability.

Schema changes should be represented as migration files.

Example:

```text
migration_001_initial.sql
migration_002_add_documents.sql
migration_003_add_payments.sql
```

Migration history must be preserved.

---

# 34. SCALABILITY

The initial architecture should support growth without premature complexity.

Scale first through:

- database indexing,
- query optimization,
- pagination,
- caching,
- asynchronous jobs,
- storage optimization,
- efficient frontend rendering.

Only introduce service decomposition when measurable operational needs justify it.

---

# 35. ARCHITECTURAL BOUNDARIES

The following boundaries are mandatory:

```text
UI ≠ Business Rules
Business Rules ≠ Database Schema
Authentication ≠ Authorization
File Storage ≠ Document Business Record
Invoice ≠ Payment
Package ≠ Departure
Departure ≠ Trip
User ≠ Pilgrim
```

---

# 36. ARCHITECTURE DECISION RULE

Before introducing a new technology, service, framework, dependency, or architectural pattern, ask:

1. What problem does it solve?
2. Is the problem already solved?
3. Does it introduce another source of truth?
4. Does it increase operational complexity?
5. Does it affect security?
6. Does it affect data integrity?
7. Is it required for current scale?
8. Can the existing architecture solve the problem more simply?

---

# 37. ARCHITECTURE SUMMARY

The target architecture is:

```text
                 NEXT.JS APPLICATION
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
    WEBSITE             PWA             ADMIN
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                  APPLICATION LAYER
                         │
                  DOMAIN SERVICES
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
      CRM             OPERATIONS        FINANCE
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                    SUPABASE
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
   PostgreSQL           Auth             Storage
       │
      RLS
       │
      Audit
```

The architecture prioritizes:

> **simplicity + integrity + security + traceability + extensibility**

over premature distributed-system complexity.