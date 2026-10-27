# SDW UMROH — AI BUILD INSTRUCTIONS

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** AI Development / Gemini / Antigravity Implementation Contract

---

# 1. PURPOSE

This document is the final instruction layer for AI coding and product-development agents working on SDW UMROH.

It is intended for:

- Gemini,
- Gemini Canvas,
- Antigravity,
- coding agents,
- AI-assisted IDE workflows,
- future development agents.

The purpose is to ensure that AI builds the system from the approved specification rather than inventing architecture or business logic.

---

# 2. PRIMARY DIRECTIVE

> **Build SDW UMROH from the specification. Do not redesign the product while implementing it.**

The AI is an implementation assistant.

It is not the final business owner.

It must not silently make major product, architectural, financial, security, or workflow decisions.

---

# 3. SOURCE-OF-TRUTH HIERARCHY

The documents must be interpreted in this order:

```text
00_PROJECT_CONTEXT.md
        ↓
01_PRD.md
        ↓
02_PRODUCT_BLUEPRINT.md
        ↓
03_USER_ROLES_AND_PERMISSIONS.md
        ↓
04_USER_JOURNEYS_AND_WORKFLOWS.md
        ↓
05_DOMAIN_MODEL.md
        ↓
06_BUSINESS_RULES.md
        ↓
07_INFORMATION_ARCHITECTURE.md
        ↓
08_UI_UX_DESIGN_SYSTEM.md
        ↓
09_TECHNICAL_ARCHITECTURE.md
        ↓
10_DATABASE_SPEC.md
        ↓
11_API_CONTRACT.md
        ↓
12_SECURITY_AND_AUDIT.md
```

Implementation comes after these specifications.

---

# 4. DOCUMENT AUTHORITY

If two documents appear inconsistent:

1. identify the conflict,
2. do not silently choose,
3. report the conflict,
4. identify which document has higher authority,
5. request clarification when required.

Do not "fix" specification conflicts by inventing a new rule.

---

# 5. LOCKED VS DRAFT

Document status matters.

```text
DRAFT
REVIEW
APPROVED
LOCKED
IMPLEMENTED
DEPRECATED
```

### LOCKED

Do not change without explicit human approval.

### APPROVED

Treat as authoritative for implementation.

### DRAFT

May still change.

AI must clearly identify assumptions made against draft material.

---

# 6. NEVER INVENT BUSINESS RULES

The AI must not invent:

- cancellation fees,
- refund formulas,
- commission rates,
- payment schedules,
- legal requirements,
- document requirements,
- readiness percentages,
- minimum payment thresholds,
- package pricing,
- eligibility rules.

If not defined:

```text
TBD
```

or:

> Requires business decision.

---

# 7. NEVER INVENT PERMISSIONS

Do not assume:

```text
Admin = everything
Manager = everything
Finance = all finance
Tour Leader = all pilgrims
```

Use:

```text
ROLE
+
PERMISSION
+
SCOPE
```

from `03_USER_ROLES_AND_PERMISSIONS.md`.

---

# 8. NEVER TRUST THE CLIENT

Never rely on:

```text
hidden UI
disabled button
frontend validation
localStorage
client-provided role
client-provided user ID
```

for security.

Every sensitive operation requires server-side authorization.

---

# 9. NEVER BYPASS RLS

Supabase RLS is part of the architecture.

Do not disable RLS merely because it makes development easier.

If a query fails because of RLS:

1. inspect the intended access model,
2. inspect the policy,
3. fix the policy or authorized server flow,
4. do not disable security as a shortcut.

---

# 10. DO NOT CREATE SCREEN-DRIVEN DATABASES

Do not create tables merely because a page exists.

Bad reasoning:

```text
There is a Payments screen
→ create payments_screen table
```

Correct reasoning:

```text
Payment is a business entity
→ model Payment
→ define relationships
→ define workflow
→ define authorization
→ expose through UI
```

---

# 11. DO NOT DUPLICATE SOURCES OF TRUTH

Examples of prohibited architecture:

```text
Payment balance in frontend
+
Payment balance in database
+
Payment balance in localStorage
```

There must be one authoritative source.

Derived values should be calculated from authoritative records.

---

# 12. PRESERVE DOMAIN DISTINCTIONS

Never collapse these concepts merely for convenience:

```text
User ≠ Customer
Customer ≠ Lead
Lead ≠ Pilgrim
Package ≠ Departure
Departure ≠ Trip
Document Requirement ≠ Document
Invoice ≠ Payment
Payment ≠ Refund
Manasik Content ≠ Session
Activity ≠ Follow-up
```

---

# 13. WORKFLOW-FIRST IMPLEMENTATION

Every important feature must map to a workflow.

Before implementing a mutation, identify:

```text
Current State
 ↓
Authorized Action
 ↓
Business Rule
 ↓
New State
 ↓
Notification
 ↓
Audit
```

---

# 14. STATE MACHINES MUST BE EXPLICIT

Do not allow arbitrary state changes.

Bad:

```text
PATCH status = anything
```

Better:

```text
SUBMITTED
 ↓
UNDER_REVIEW
 ↓
APPROVED
```

Only approved transitions should be possible.

---

# 15. IMPLEMENT BUSINESS ACTIONS EXPLICITLY

For high-impact operations, prefer:

```text
verifyPayment()
verifyDocument()
approveRegistration()
cancelRegistration()
refundPayment()
publishPackage()
```

rather than generic unrestricted:

```text
updateRecord()
```

---

# 16. UI IMPLEMENTATION RULE

Every screen should implement:

```text
Loading
Empty
Success
Error
Permission Denied
Unauthorized
Validation Error
Conflict
```

Do not build only the happy path.

---

# 17. DESIGN SYSTEM RULE

Use the design system from:

`08_UI_UX_DESIGN_SYSTEM.md`

Do not randomly introduce:

- colors,
- fonts,
- radius values,
- shadows,
- button styles,
- component variants.

If the official SDW brand system is not yet supplied, use semantic provisional tokens rather than inventing a final brand identity.

---

# 18. GOLDEN SCREEN RULE

If a screen has been explicitly approved as a Golden Screen:

> **Do not redesign it without explicit instruction.**

You may:

- fix bugs,
- improve accessibility,
- fix responsiveness,
- fix implementation defects.

You may not silently:

- rearrange major hierarchy,
- replace approved components,
- introduce a new visual language,
- alter primary user flow.

---

# 19. RESPONSIVE RULE

Do not simply shrink desktop layouts.

For mobile:

```text
Primary task
 ↓
Current status
 ↓
Next action
 ↓
Important information
```

For desktop:

```text
Overview
+
Tables
+
Filters
+
Related information
+
Bulk operations
```

---

# 20. PUBLIC WEBSITE RULE

The public website should communicate:

```text
Trust
Clarity
Information
Human support
Conversion
```

Avoid:

- exaggerated claims,
- artificial urgency,
- unsupported guarantees,
- fake trust badges,
- invented legal claims.

---

# 21. PILGRIM PWA RULE

The pilgrim interface should answer:

```text
Where am I?
What is my status?
What do I need to do?
What happens next?
Where can I get help?
```

Do not overload the pilgrim dashboard with internal operational information.

---

# 22. BACKOFFICE RULE

Backoffice UI should prioritize:

```text
Operational awareness
Actionability
Traceability
Efficiency
```

A beautiful dashboard that hides unresolved operational issues is not considered successful.

---

# 23. PARTNER RULE

Partners must only see data associated with their authorized relationship.

Never expose another partner's:

- leads,
- commissions,
- customers,
- internal notes,
- operational data.

---

# 24. DATABASE IMPLEMENTATION RULE

Before creating a table, answer:

1. What domain entity does this represent?
2. Why does it exist?
3. What owns it?
4. What does it reference?
5. What references it?
6. What are its states?
7. Who can access it?
8. What must be audited?
9. What is its retention requirement?

If these cannot be answered, stop and ask.

---

# 25. MIGRATION RULE

Every database change must produce a migration.

Never rely on:

```text
manual production edits
```

as the normal development process.

---

# 26. RLS IMPLEMENTATION RULE

For every sensitive table:

```text
Who can SELECT?
Who can INSERT?
Who can UPDATE?
Who can DELETE?
```

must be explicitly answered.

If DELETE is not part of the business model, do not create a permissive DELETE policy.

---

# 27. STORAGE RULE

Private documents belong in private storage.

Never make passport or identity documents publicly accessible merely to simplify previews.

---

# 28. API IMPLEMENTATION RULE

API endpoints must represent business capabilities.

Prefer:

```text
POST /documents/{id}/verify
```

over unrestricted:

```text
PATCH /documents/{id}
```

for critical state transitions.

---

# 29. VALIDATION RULE

Validate at:

```text
UI
+
Server
+
Database constraints where appropriate
```

Client validation improves UX.

Server validation provides trust boundaries.

Database constraints protect integrity.

---

# 30. ERROR HANDLING RULE

Never silently swallow errors.

Bad:

```text
try {
   ...
} catch {
   return success
}
```

Errors should be:

- categorized,
- logged appropriately,
- communicated appropriately,
- recoverable where possible.

---

# 31. FINANCE RULE

Financial records require exceptional care.

Never allow frontend code to determine:

```text
paid amount
outstanding amount
verified status
refund amount
```

as authoritative values.

---

# 32. DOCUMENT RULE

Uploading a file does not equal verification.

Maintain:

```text
UPLOADED
UNDER_REVIEW
VERIFIED
REVISION_REQUIRED
EXPIRED
```

according to approved workflow.

---

# 33. AUDIT RULE

When implementing an important mutation, ask:

> Should this action be auditable?

If it changes:

- financial state,
- document verification,
- permissions,
- registration state,
- operational state,
- pricing,
- cancellation,
- refund,

the answer is generally yes.

---

# 34. NOTIFICATION RULE

Do not send notifications simply because a database row changed.

A notification should have:

```text
Event
+
Rule
+
Audience
+
Channel
+
Message
```

---

# 35. AUTOMATION RULE

Automation may:

```text
remind
notify
calculate
identify
recommend
create task
```

Automation must not silently perform irreversible high-impact decisions.

---

# 36. AI FEATURE RULE

AI may assist with:

- summarization,
- classification,
- customer support drafts,
- operational recommendations,
- anomaly identification,
- content assistance,
- workflow suggestions.

AI output must not automatically become authoritative business truth without appropriate validation/approval.

---

# 37. EXTERNAL INTEGRATION RULE

Never hard-code a provider throughout the domain layer.

Use adapters:

```text
PaymentService
NotificationService
StorageService
```

Providers can then change without rewriting the business domain.

---

# 38. DEPENDENCY RULE

Before adding a package:

1. verify whether the capability already exists,
2. verify maintenance status,
3. verify security implications,
4. verify bundle/runtime impact,
5. verify licensing,
6. verify whether it introduces unnecessary complexity.

Do not install libraries merely because they are popular.

---

# 39. CODE QUALITY RULE

Prefer:

```text
clear
typed
small
testable
explicit
boring
```

over:

```text
clever
abstract
over-engineered
magical
```

---

# 40. TYPE SAFETY

Use TypeScript strictly.

Avoid unnecessary:

```text
any
unknown casts
as any
non-null assertions
```

When a type escape is necessary, document why.

---

# 41. DATA ACCESS RULE

Do not scatter raw Supabase queries throughout UI components.

Prefer:

```text
UI
 ↓
Server Action / Route
 ↓
Service
 ↓
Data Access
 ↓
Supabase
```

---

# 42. COMPONENT RULE

Build reusable components when repetition is meaningful.

Avoid premature abstraction.

A component should have a clear responsibility.

---

# 43. FEATURE IMPLEMENTATION LOOP

Every feature should follow:

```text
READ SPEC
 ↓
IDENTIFY DOMAIN
 ↓
IDENTIFY WORKFLOW
 ↓
IDENTIFY ROLE
 ↓
IDENTIFY DATA
 ↓
IDENTIFY API
 ↓
IDENTIFY SECURITY
 ↓
IMPLEMENT
 ↓
TEST
 ↓
AUDIT
 ↓
DOCUMENT
```

---

# 44. BEFORE CODING

AI should inspect:

```text
00–13 documentation
existing repository
existing database
existing migrations
existing routes
existing components
existing environment configuration
existing tests
```

Do not assume the repository is empty.

---

# 45. WHEN SPECIFICATION IS MISSING

Use:

```text
TBD
```

Do not invent.

If implementation can proceed safely without the missing decision:

```text
implement behind an abstraction
```

If implementation cannot proceed safely:

```text
stop and ask
```

---

# 46. WHEN SPECIFICATIONS CONFLICT

AI must report:

```text
Conflict:
Document A says X.
Document B says Y.

Impact:
...

Recommended resolution:
...

Waiting for:
Human decision.
```

Do not silently select one.

---

# 47. WHEN AI HAS A BETTER IDEA

AI may propose an improvement.

But it must separate:

```text
CURRENT SPECIFICATION
```

from:

```text
PROPOSED IMPROVEMENT
```

It must not silently implement the proposal as if it were already approved.

---

# 48. ARCHITECTURAL CHANGE REQUEST

Any significant architectural change should include:

```text
Problem
Current Architecture
Proposed Change
Reason
Benefits
Tradeoffs
Security Impact
Data Impact
Migration Impact
Rollback Strategy
```

Human approval is required before implementation if the change affects locked architecture.

---

# 49. DATABASE CHANGE REQUEST

Any major database change should include:

```text
Why
Affected Tables
Relationships
Constraints
RLS
Migration
Backward Compatibility
Data Migration
Rollback
```

---

# 50. SECURITY CHANGE REQUEST

Any security-impacting change should explicitly identify:

```text
Authentication Impact
Authorization Impact
RLS Impact
Storage Impact
Audit Impact
Privacy Impact
```

---

# 51. TEST-FIRST FOR CRITICAL WORKFLOWS

Before declaring a critical workflow complete, test at minimum:

```text
Happy Path
Invalid Input
Unauthorized User
Wrong Scope
Invalid State Transition
Duplicate Request
External Failure
Database Failure
```

---

# 52. REQUIRED CRITICAL TESTS

At minimum:

### Authentication

```text
valid login
invalid login
expired session
revoked access
```

### Authorization

```text
correct role
wrong role
correct role / wrong scope
direct URL access
direct API access
```

### Documents

```text
upload
verify
revision
wrong-user access
```

### Payments

```text
submit
verify
duplicate callback
wrong-role verification
refund authorization
```

### Registration

```text
submit
approve
cancel
invalid transition
duplicate registration
```

---

# 53. ACCEPTANCE CRITERIA

A feature is not "done" because:

```text
the page renders
```

It is done when:

```text
UI
+
Workflow
+
Business Rule
+
Authorization
+
Database
+
RLS
+
Validation
+
Error State
+
Audit
+
Tests
```

are appropriately implemented.

---

# 54. AI OUTPUT FORMAT

When reporting completed implementation, AI should provide:

```text
1. What was implemented
2. Files changed
3. Database changes
4. API changes
5. Security changes
6. Tests executed
7. Known limitations
8. Remaining TBD decisions
```

---

# 55. ANTIGRAVITY ACCEPTANCE RULE

When Antigravity proposes a large change set:

The human should review:

```text
Files
Database
Authentication
Authorization
RLS
API
Business Logic
Dependencies
Environment Variables
Destructive Changes
```

before accepting.

Do not blindly approve large changes when the impact is unclear.

---

# 56. GEMINI CANVAS RULE

Gemini Canvas may be used for:

- product visualization,
- UX exploration,
- documentation,
- interface prototyping,
- architecture diagrams,
- content generation.

Canvas output must remain subordinate to the source-of-truth documentation.

A visual prototype does not automatically redefine the product specification.

---

# 57. AI MUST PRESERVE TRACEABILITY

Every important implementation decision should be traceable to:

```text
Requirement
 ↓
Workflow
 ↓
Business Rule
 ↓
Technical Decision
 ↓
Code
 ↓
Test
```

---

# 58. DO NOT OVERBUILD MVP

The AI must not automatically implement future modules merely because they appear in the roadmap.

MVP priority comes from:

`01_PRD.md`

and:

`02_PRODUCT_BLUEPRINT.md`

Future features should remain modular placeholders unless explicitly requested.

---

# 59. DO NOT CREATE MICROSERVICES PREMATURELY

The default architecture is:

> **Modular Monolith**

Do not introduce:

- Kubernetes,
- service mesh,
- independent microservices,
- event infrastructure,
- distributed queues,

unless an explicit architectural decision requires them.

---

# 60. DO NOT REPLACE SUPABASE WITHOUT APPROVAL

Supabase/PostgreSQL is the current architectural foundation.

Do not replace it with:

- Firebase,
- MongoDB,
- another hosted database,
- another authentication system,

without explicit approval.

---

# 61. DO NOT REPLACE NEXT.JS WITHOUT APPROVAL

Next.js is the current application framework.

Do not introduce another primary frontend framework without explicit architectural approval.

---

# 62. DO NOT INTRODUCE A SECOND SOURCE OF TRUTH

Examples prohibited without explicit architecture decision:

```text
Supabase + Firebase
Supabase + separate production PostgreSQL
PostgreSQL + independent payment database
Two independent user databases
Two independent pilgrim databases
```

---

# 63. IMPLEMENTATION PRIORITY

Recommended implementation order:

```text
1. Repository Foundation
2. Supabase Connection
3. Authentication
4. User / Role / Permission
5. Customer
6. CRM
7. Package
8. Departure
9. Registration
10. Documents
11. Finance
12. Pilgrim PWA
13. Preparation
14. Operations
15. Notifications
16. Partner
17. Alumni
18. Analytics
19. Advanced Automation
```

The exact sequencing may change after technical discovery.

---

# 64. FOUNDATION BEFORE FEATURES

Before implementing complex features, establish:

```text
TypeScript
Linting
Formatting
Environment handling
Supabase clients
Auth
RBAC
RLS
Database migrations
Error handling
Logging
Testing
Design tokens
UI primitives
```

---

# 65. DEFINITION OF READY

A feature is ready to build when:

```text
Requirement known
+
User known
+
Workflow known
+
Domain object known
+
Permission known
+
Business rule known
+
UI location known
+
Data requirement known
```

If one is missing, identify it before implementation.

---

# 66. DEFINITION OF DONE

A feature is done when:

```text
Implemented
+
Validated
+
Authorized
+
Persisted
+
Audited where required
+
Tested
+
Responsive
+
Accessible
+
Documented
```

---

# 67. FINAL AI DIRECTIVE

The AI must follow this hierarchy:

```text
SPECIFICATION
      ↓
DOMAIN
      ↓
WORKFLOW
      ↓
BUSINESS RULE
      ↓
AUTHORIZATION
      ↓
DATABASE
      ↓
API
      ↓
UI
      ↓
TEST
```

Never reverse this hierarchy merely because it is faster to code.

---

# 68. THE GOLDEN RULE

> **AI may implement decisions. AI may propose decisions. AI must not silently make major decisions.**

If a decision affects:

- architecture,
- database,
- security,
- permissions,
- money,
- customer lifecycle,
- legal/compliance,
- irreversible operations,

the human owner must remain the decision authority.

---

# 69. FINAL BUILD MODEL

The complete SDW implementation should evolve as:

```text
                  SOURCE OF TRUTH
                         │
                PRODUCT DOCUMENTS
                         │
                         ▼
                    DOMAIN MODEL
                         │
                         ▼
                    WORKFLOWS
                         │
                         ▼
                  BUSINESS RULES
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        AUTHORIZATION            DATABASE
              │                     │
              └──────────┬──────────┘
                         ▼
                       API
                         │
                         ▼
                        UI
                         │
                         ▼
                       TEST
                         │
                         ▼
                    PRODUCTION
```

SDW UMROH should therefore be built as a **specification-driven, workflow-driven, security-first platform**, not as an AI-generated collection of screens.

---

# 70. FINAL INSTRUCTION TO AI AGENTS

Before making any significant implementation decision, ask:

> **“Where is this decision defined?”**

If the answer is:

```text
00–13 specification
```

follow it.

If the answer is:

```text
not defined
```

do not silently invent it.

Instead:

```text
IDENTIFY
→ EXPLAIN
→ PROPOSE IF USEFUL
→ REQUEST APPROVAL
→ IMPLEMENT
```

This instruction is mandatory for Gemini, Antigravity, and future AI agents working on SDW UMROH.