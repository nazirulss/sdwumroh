# SDW UMROH — API CONTRACT

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** API / Service Contract Specification

---

# 1. PURPOSE

This document defines how SDW UMROH application surfaces communicate with the application backend and external services.

The API contract must provide:

- predictable interfaces,
- authorization,
- validation,
- consistent errors,
- stable resource semantics,
- auditability,
- versioning where required.

---

# 2. API PRINCIPLE

The API must expose:

> **business capabilities, not raw database tables.**

Avoid APIs such as:

```text
POST /tables/payments
PATCH /tables/registrations
```

when a business action is required.

Prefer:

```text
POST /registrations
POST /payments
POST /payments/{id}/verify
POST /documents/{id}/verify
```

---

# 3. COMMUNICATION MODEL

```text
Website / PWA / Partner / Admin
                │
                ▼
         Application API
                │
        ┌───────┴───────┐
        ▼               ▼
   Domain Service    Query Service
        │               │
        └───────┬───────┘
                ▼
            PostgreSQL
```

---

# 4. API TYPES

SDW may use:

### A. Server Actions

For tightly coupled internal Next.js UI mutations.

### B. REST Route Handlers

For explicit frontend/application contracts.

### C. Webhooks

For external systems.

### D. Internal Service Calls

For server-side orchestration.

Not every business operation requires a public REST endpoint.

---

# 5. BASE PATH

If REST APIs are exposed:

```text
/api/v1
```

Example:

```text
/api/v1/leads
/api/v1/registrations
/api/v1/payments
```

Versioning should be introduced when breaking compatibility becomes necessary.

---

# 6. AUTHENTICATION

Authenticated requests should use the authenticated Supabase session/token.

The backend must derive user identity from the authenticated context.

Never trust:

```json
{
  "user_id": "..."
}
```

from the client as proof of identity.

---

# 7. AUTHORIZATION

Every protected endpoint must evaluate:

```text
Who?
 ↓
Role?
 ↓
Permission?
 ↓
Scope?
 ↓
Resource?
 ↓
Action?
```

Example:

```text
Can user X verify document Y?
```

requires more than:

```text
Does user X have DOCUMENT_VERIFY?
```

The resource scope must also be checked.

---

# 8. VALIDATION

Incoming data must be validated at the server boundary.

Use a typed validation strategy such as:

```text
Zod
```

or an equivalent approved schema library.

Validation should cover:

- required fields,
- types,
- formats,
- ranges,
- allowed values,
- cross-field conditions.

---

# 9. REQUEST FORMAT

JSON is the default for structured API requests.

Example:

```json
{
  "package_id": "uuid",
  "departure_id": "uuid",
  "customer": {
    "full_name": "Example User",
    "phone": "08xxxxxxxxxx"
  }
}
```

Sensitive information should only be sent when necessary.

---

# 10. RESPONSE FORMAT

Successful responses should have predictable structures.

Example:

```json
{
  "data": {
    "id": "uuid",
    "status": "SUBMITTED"
  },
  "meta": {}
}
```

Collection example:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 100
  }
}
```

Exact envelope conventions may be refined before implementation.

---

# 11. ERROR FORMAT

Recommended:

```json
{
  "error": {
    "code": "DOCUMENT_REVISION_REQUIRED",
    "message": "The document requires revision.",
    "details": {}
  }
}
```

Do not expose stack traces or internal database errors to users.

---

# 12. HTTP STATUS GUIDANCE

Use conventional statuses:

```text
200 OK
201 CREATED
204 NO CONTENT
400 BAD REQUEST
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT FOUND
409 CONFLICT
422 UNPROCESSABLE ENTITY
429 TOO MANY REQUESTS
500 INTERNAL SERVER ERROR
502/503 EXTERNAL SERVICE ERROR
```

---

# 13. LEAD API

Potential endpoints:

```text
GET    /leads
POST   /leads
GET    /leads/{id}
PATCH  /leads/{id}
POST   /leads/{id}/activities
POST   /leads/{id}/follow-ups
POST   /leads/{id}/convert
```

---

# 14. REGISTRATION API

```text
POST   /registrations
GET    /registrations/{id}
PATCH  /registrations/{id}
POST   /registrations/{id}/submit
POST   /registrations/{id}/approve
POST   /registrations/{id}/cancel
```

State-changing actions must enforce business rules.

---

# 15. DOCUMENT API

```text
GET    /pilgrims/{id}/documents
POST   /documents
GET    /documents/{id}
POST   /documents/{id}/revision
POST   /documents/{id}/verify
POST   /documents/{id}/request-revision
```

Binary upload may use a controlled storage upload flow rather than sending the file through the business API.

---

# 16. PAYMENT API

```text
GET    /registrations/{id}/payments
POST   /payments
GET    /payments/{id}
POST   /payments/{id}/submit
POST   /payments/{id}/verify
POST   /payments/{id}/reject
POST   /payments/{id}/refund
```

High-risk actions require elevated authorization.

---

# 17. INVOICE API

```text
GET    /invoices
GET    /invoices/{id}
POST   /invoices
POST   /invoices/{id}/void
```

Invoice mutation must preserve financial history.

---

# 18. PACKAGE API

Public:

```text
GET /packages
GET /packages/{slug}
```

Admin:

```text
POST  /admin/packages
PATCH /admin/packages/{id}
POST  /admin/packages/{id}/publish
POST  /admin/packages/{id}/pause
```

Public endpoints should expose only approved public information.

---

# 19. DEPARTURE API

Public:

```text
GET /departures
GET /departures/{id}
```

Internal:

```text
POST  /admin/departures
PATCH /admin/departures/{id}
POST  /admin/departures/{id}/open
POST  /admin/departures/{id}/close
```

---

# 20. PILGRIM API

```text
GET   /me
PATCH /me

GET /me/journey
GET /me/documents
GET /me/payments
GET /me/preparation
GET /me/manasik
GET /me/itinerary
GET /me/announcements
GET /me/notifications
```

The `/me` pattern reduces accidental cross-user access.

---

# 21. PARTNER API

```text
GET /partner/dashboard
GET /partner/leads
POST /partner/leads
GET /partner/referrals
GET /partner/pilgrims
GET /partner/commissions
GET /partner/marketing
```

Partner scope must be enforced server-side.

---

# 22. ADMIN API

Admin APIs may cover:

```text
CRM
CUSTOMERS
PACKAGES
DEPARTURES
DOCUMENTS
FINANCE
OPERATIONS
MANASIK
COMMUNICATIONS
PARTNERS
ALUMNI
REPORTS
SETTINGS
```

Admin does not mean unrestricted access.

Permission and scope remain mandatory.

---

# 23. STATE-CHANGE ENDPOINTS

Important transitions should use explicit actions.

Example:

```text
POST /documents/{id}/verify
```

rather than:

```text
PATCH /documents/{id}

{
  "status": "VERIFIED"
}
```

Why:

- authorization is clearer,
- business rules are centralized,
- audit is explicit,
- invalid transitions are easier to reject.

---

# 24. IDEMPOTENCY

Operations that may be retried must support idempotency where appropriate.

Especially:

- payment callbacks,
- webhook processing,
- external notifications,
- financial transactions.

Example header:

```text
Idempotency-Key: <unique-key>
```

Duplicate requests must not create duplicate financial records.

---

# 25. PAGINATION

Collection endpoints should use pagination.

Example:

```text
?page=1&page_size=20
```

Large datasets must not be returned without limits.

---

# 26. FILTERING

Filtering should use explicit supported parameters.

Example:

```text
/status
/assigned_to
/departure_id
/date_from
/date_to
```

Do not expose arbitrary SQL-like query parameters.

---

# 27. SORTING

Only approved sort fields should be accepted.

Example:

```text
?sort=created_at
&direction=desc
```

Never concatenate raw client values into SQL.

---

# 28. SEARCH

Search endpoints should define:

- searchable fields,
- minimum query length,
- pagination,
- access scope.

Sensitive fields should not automatically become searchable.

---

# 29. FILE UPLOAD API

Preferred flow:

```text
Request Upload
 ↓
Authorization
 ↓
Generate Controlled Upload Target
 ↓
Upload to Private Storage
 ↓
Confirm Upload
 ↓
Create / Update Document Record
```

The client should not be given unrestricted storage access.

---

# 30. WEBHOOKS

Webhook endpoints should:

1. authenticate the sender,
2. validate payload,
3. verify signature where supported,
4. enforce idempotency,
5. persist relevant event,
6. process safely,
7. return appropriate response.

Example:

```text
POST /api/v1/webhooks/payment
```

---

# 31. API AUDIT

Critical API actions must generate audit records.

Examples:

```text
PAYMENT_VERIFY
DOCUMENT_VERIFY
DOCUMENT_REVISION
REGISTRATION_APPROVE
REGISTRATION_CANCEL
REFUND_APPROVE
ROLE_ASSIGN
PACKAGE_PUBLISH
DEPARTURE_UPDATE
```

---

# 32. RATE LIMITING

Rate limits should protect:

- authentication,
- public lead forms,
- registration,
- password/reset operations,
- file operations,
- APIs exposed externally,
- webhooks.

Limits should reflect legitimate user behavior.

---

# 33. SECURITY HEADERS

Production APIs should use appropriate:

- HTTPS,
- secure cookies,
- content security policy where applicable,
- anti-clickjacking controls,
- appropriate CORS,
- secure headers.

---

# 34. API OBSERVABILITY

Capture:

```text
request ID
endpoint
method
status
duration
actor
correlation ID
error category
```

Do not log:

- passwords,
- access tokens,
- full identity documents,
- sensitive financial details,
- private document URLs.

---

# 35. API VERSIONING

Breaking changes should not silently alter existing clients.

Preferred:

```text
/api/v1
/api/v2
```

when required.

Internal Server Actions may evolve with the application release cycle.

---

# 36. CONTRACT TESTING

Critical API contracts should be tested for:

- valid requests,
- invalid requests,
- unauthorized requests,
- forbidden requests,
- state conflicts,
- duplicate requests,
- missing resources,
- external failures.

---

# 37. API DEFINITION OF DONE

An API feature is incomplete unless it has:

- endpoint/action definition,
- input schema,
- output schema,
- authorization,
- validation,
- business rules,
- error handling,
- audit requirements,
- idempotency where needed,
- tests,
- documentation.

---

# 38. FINAL API PRINCIPLE

The API is not merely a transport layer.

It is a controlled boundary between:

```text
USER INTENT
     ↓
AUTHORIZATION
     ↓
VALIDATION
     ↓
BUSINESS RULE
     ↓
STATE CHANGE
     ↓
DATABASE
     ↓
EVENT / AUDIT / NOTIFICATION
```

This pattern should be preserved throughout the system.