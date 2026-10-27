# SDW UMROH — SECURITY & AUDIT

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Security, Privacy, Authorization & Audit Specification

---

# 1. PURPOSE

SDW UMROH processes potentially sensitive information including:

- personal identity information,
- contact information,
- passport information,
- travel documents,
- payment information,
- registration information,
- operational travel data.

Security must therefore be treated as a foundational architecture concern.

---

# 2. SECURITY PRINCIPLE

The core security model is:

> **Never trust the client.**

The browser is an untrusted environment.

Therefore:

```text
Frontend validation
        ≠
Security
```

Security must be enforced server-side and at the database/storage layers.

---

# 3. SECURITY LAYERS

```text
Browser
  ↓
HTTPS
  ↓
Authentication
  ↓
Application Authorization
  ↓
Business Rules
  ↓
PostgreSQL RLS
  ↓
Storage Policies
  ↓
Audit
```

Multiple layers should reinforce one another.

---

# 4. IDENTITY VS AUTHORIZATION

Authentication establishes:

> This session belongs to user X.

Authorization establishes:

> User X can perform action Y on resource Z within scope S.

These must never be conflated.

---

# 5. RBAC MODEL

The approved model is:

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
 ↓
SCOPE
```

Examples:

```text
DOCUMENT_VERIFY
PAYMENT_VERIFY
PAYMENT_REFUND
LEAD_UPDATE
DEPARTURE_UPDATE
```

---

# 6. ROLE PRINCIPLE

Default roles include:

```text
OWNER
MANAGER
SALES
CUSTOMER_SERVICE
FINANCE
DOCUMENT_OFFICER
OPERATIONS
TOUR_LEADER
MUTHAWWIF
PARTNER
PILGRIM
ALUMNI
```

Roles are not sufficient by themselves.

Scope must also be evaluated.

---

# 7. LEAST PRIVILEGE

Every user should receive only the access required to perform their responsibilities.

Examples:

Finance should not automatically receive:

```text
document verification
```

Tour Leader should not automatically receive:

```text
financial records
```

Partner should not automatically receive:

```text
other partner records
```

---

# 8. RESOURCE SCOPE

Possible scopes:

```text
GLOBAL
TEAM
ASSIGNED
TRIP
OWN
REFERRAL
```

Example:

```text
Tour Leader
+
TRIP
=
records belonging to assigned trip
```

---

# 9. SERVER-SIDE AUTHORIZATION

Every sensitive mutation must verify authorization on the server.

Examples:

```text
verify payment
verify document
approve registration
refund payment
change package price
change departure
assign role
```

A client sending:

```json
{
  "status": "VERIFIED"
}
```

must never be treated as sufficient authorization.

---

# 10. DATABASE RLS

Supabase PostgreSQL Row Level Security must be enabled on sensitive application tables.

RLS must reflect approved access scopes.

Examples:

```text
Pilgrim
→ own data

Partner
→ permitted referrals

Tour Leader
→ assigned trip

Muthawwif
→ assigned trip/group

Finance
→ authorized financial scope
```

---

# 11. RLS IS NOT THE ONLY SECURITY LAYER

RLS provides database protection.

Application authorization provides business-level control.

Both are required.

```text
Application Authorization
+
RLS
```

---

# 12. STORAGE SECURITY

Private documents must not be publicly accessible.

Examples:

- passport,
- identity card,
- family card,
- personal photo,
- visa-related documents.

Use private buckets and controlled access.

---

# 13. DOCUMENT ACCESS

Document access should follow:

```text
Request
 ↓
Authenticated User
 ↓
Authorization
 ↓
Resource Ownership / Scope
 ↓
Temporary Access
 ↓
File
```

Long-lived public document URLs should be avoided.

---

# 14. DOCUMENT VERSION SECURITY

When a document is replaced:

- previous version remains controlled,
- current version is clearly identified,
- verification belongs to a specific version,
- access remains restricted.

Do not allow a verified status to silently migrate to a different file version.

---

# 15. PERSONAL DATA

Personal data should be collected only when necessary for the business process.

Do not collect fields merely because the database can store them.

Each sensitive field should have:

- business purpose,
- access rule,
- retention consideration.

---

# 16. DATA MINIMIZATION

Avoid exposing unnecessary information.

Example:

A Tour Leader may need:

```text
name
group
relevant travel information
check-in state
```

but may not need:

```text
full payment history
internal sales notes
identity verification details
```

---

# 17. FINANCIAL SECURITY

Financial operations require elevated controls.

High-risk actions include:

```text
payment verification
refund
void
write-off
financial override
price change
```

Where appropriate:

```text
Maker
 ↓
Reviewer
 ↓
Approval
 ↓
Execution
```

The exact segregation-of-duties policy is TBD.

---

# 18. PAYMENT INTEGRITY

The system must distinguish:

```text
Payment Submitted
```

from:

```text
Payment Verified
```

Manual evidence must not automatically become authoritative financial confirmation.

---

# 19. WEBHOOK SECURITY

External callbacks must be protected by:

- signature validation where supported,
- authentication,
- idempotency,
- payload validation,
- event logging,
- replay protection where appropriate.

---

# 20. SESSION SECURITY

Authentication should use secure session handling.

Consider:

- secure cookies,
- appropriate expiration,
- session invalidation,
- password reset protection,
- account recovery controls,
- suspicious activity detection.

---

# 21. PASSWORD / AUTHENTICATION SECURITY

The application must not store raw passwords.

Authentication should be delegated to the approved identity provider.

Reset and recovery flows must be designed to prevent account takeover.

---

# 22. ADMIN SECURITY

Administrative accounts should receive stronger controls.

Potential future controls:

- MFA,
- trusted device management,
- session monitoring,
- elevated-action confirmation,
- privileged access logging.

MFA policy is TBD and should be explicitly approved before being treated as mandatory.

---

# 23. INPUT SECURITY

All external input must be treated as untrusted.

Protect against:

- SQL injection,
- XSS,
- CSRF where applicable,
- malicious file uploads,
- path traversal,
- oversized requests,
- malformed payloads,
- authorization bypass,
- parameter tampering.

---

# 24. FILE SECURITY

Uploaded files should be validated for:

- MIME type,
- extension,
- size,
- storage path,
- ownership,
- allowed file category.

Additional malware scanning may be introduced if required.

---

# 25. PII IN LOGS

Logs must not contain unnecessary sensitive data.

Avoid logging:

```text
passport number
identity number
full document contents
password
access token
payment credentials
private document URLs
```

---

# 26. AUDIT LOG PRINCIPLE

Audit answers:

> Who did what, to which resource, when, from which context, and what changed?

Minimum conceptual structure:

```text
ACTOR
ACTION
RESOURCE
RESOURCE_ID
BEFORE
AFTER
TIMESTAMP
REASON
CONTEXT
```

---

# 27. AUDITABLE EVENTS

At minimum:

### Access

- role assignment,
- role removal,
- permission changes,
- account activation/deactivation.

### Documents

- upload,
- replacement,
- verification,
- revision request,
- rejection.

### Finance

- invoice creation,
- invoice change,
- payment submission,
- payment verification,
- rejection,
- refund,
- void,
- write-off.

### Operations

- departure creation,
- departure change,
- trip assignment,
- itinerary change,
- operational announcement.

### Customer

- registration approval,
- cancellation,
- customer merge,
- sensitive profile changes.

---

# 28. AUDIT IMMUTABILITY

Audit records should not be casually editable or deletable by ordinary users.

Audit access itself should be restricted.

---

# 29. BEFORE / AFTER DATA

For critical mutations, capture meaningful before/after state.

Example:

```text
Resource:
Payment #123

Before:
PENDING

Action:
VERIFY

After:
VERIFIED

Actor:
Finance User

Reason:
Bank transfer matched
```

Do not blindly store huge entire-row snapshots if unnecessary.

---

# 30. REASON REQUIREMENTS

Some actions should require a reason.

Potential examples:

```text
Reject document
Request revision
Cancel registration
Refund payment
Void invoice
Override readiness
Change price
```

The exact list is a business-policy decision.

---

# 31. SECURITY EVENTS

Potential security event categories:

```text
LOGIN_FAILURE
ACCESS_DENIED
ROLE_CHANGED
PASSWORD_RESET
SUSPICIOUS_ACTIVITY
UNUSUAL_DOWNLOAD
PRIVILEGED_ACTION
```

The platform may later provide security alerting.

---

# 32. RATE LIMITING

Apply protection to:

- login,
- OTP,
- password reset,
- public forms,
- APIs,
- uploads,
- high-frequency actions.

---

# 33. BACKUP AND RECOVERY

Production database requires:

- automated backups,
- tested restoration process,
- defined retention,
- recovery objectives.

Backup strategy must be verified in the actual Supabase/Vercel production configuration.

A backup that has never been restored successfully should not be treated as a proven recovery strategy.

---

# 34. DATA RETENTION

Retention periods for:

- identity documents,
- payment records,
- audit records,
- customer information,
- operational history

must be defined according to applicable legal requirements and SDW policy.

Do not invent retention periods in code.

---

# 35. DATA EXPORT

Exports are sensitive operations.

Permissions should distinguish:

```text
VIEW
```

from:

```text
EXPORT
```

Exports should be:

- authorized,
- scoped,
- logged,
- protected.

---

# 36. DATA DELETION

Deletion requests must be evaluated against:

- legal requirements,
- financial record retention,
- operational history,
- audit obligations,
- business policy.

Never implement blanket hard deletion merely because a user requests it.

---

# 37. SECURITY TESTING

Required categories:

```text
Authentication tests
Authorization tests
RLS tests
Storage access tests
Input validation tests
File upload tests
API abuse tests
State transition tests
Audit tests
```

Critical negative tests are especially important.

---

# 38. NEGATIVE TESTING

Examples:

```text
Pilgrim attempts to access another pilgrim's document
Partner attempts to access another partner's lead
Tour Leader attempts to view finance
Sales attempts to verify payment
Pilgrim attempts to mark own payment VERIFIED
Client attempts to bypass registration state
User modifies another user's ID in request
```

These must fail.

---

# 39. SECURITY INCIDENT MODEL

If a security incident is detected:

```text
DETECT
 ↓
CONTAIN
 ↓
ASSESS
 ↓
PRESERVE EVIDENCE
 ↓
REMEDIATE
 ↓
RECOVER
 ↓
REVIEW
```

Operational incident procedures should be documented separately when the production system matures.

---

# 40. SECURITY DEFINITION OF DONE

A sensitive feature is incomplete without:

- authentication,
- authorization,
- RLS,
- input validation,
- secure storage where relevant,
- audit,
- negative tests,
- error handling,
- logging,
- retention consideration.

---

# 41. SECURITY PRINCIPLE

The platform should assume:

```text
Client may be manipulated.
Request may be forged.
ID may be changed.
User may be curious.
External service may fail.
Automation may make mistakes.
```

Therefore:

> **Security must be enforced by architecture, not by user honesty.**

---

# 42. FINAL SECURITY MODEL

```text
                 USER
                   │
              AUTHENTICATE
                   │
             AUTHORIZATION
                   │
             BUSINESS RULE
                   │
          ┌────────┴────────┐
          ▼                 ▼
      DATABASE             STORAGE
         RLS               POLICY
          │                 │
          └────────┬────────┘
                   ▼
                 AUDIT
                   │
                MONITOR
```

Security is part of every feature, not a separate final phase.