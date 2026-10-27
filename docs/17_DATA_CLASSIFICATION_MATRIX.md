# SDW UMROH — DATA CLASSIFICATION MATRIX

**Document Status:** REVIEW  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Data Classification, Privacy & Access Contract  
**Parent Documents:**
- `03_USER_ROLES_AND_PERMISSIONS.md`
- `05_DOMAIN_MODEL.md`
- `10_DATABASE_SPEC.md`
- `12_SECURITY_AND_AUDIT.md`
- `15_PERMISSION_RLS_MATRIX.md`

---

# 1. PURPOSE

Dokumen ini menentukan sensitivitas data SDW UMROH dan prinsip aksesnya.

Tujuan:

- mencegah accidental exposure;
- mendukung RLS;
- mendukung storage security;
- membedakan public/internal/restricted/sensitive;
- menentukan kebutuhan audit;
- membantu AI memahami data yang tidak boleh diperlakukan sebagai data biasa.

---

# 2. CLASSIFICATION LEVELS

## PUBLIC

Data yang memang ditujukan untuk publik.

Examples:

```text
published package
public departure information
public article
FAQ
contact information
public testimonial
```

---

## INTERNAL

Data operasional yang tidak ditujukan untuk publik tetapi relatif rendah sensitivitasnya.

Examples:

```text
internal task
operational note
general staff information
non-sensitive activity metadata
```

---

## RESTRICTED

Data yang hanya boleh diakses oleh role tertentu.

Examples:

```text
CRM notes
sales activities
internal operational information
partner information
commission information
management reports
```

---

## SENSITIVE

Data yang membutuhkan perlindungan tinggi.

Examples:

```text
identity number
passport information
passport files
payment evidence
financial transaction details
authentication-related information
security logs
certain personal contact information
```

---

# 3. DATA CLASSIFICATION PRINCIPLE

Classification harus mengikuti:

```text
Purpose
+
Sensitivity
+
Business Need
+
Legal/Privacy Requirement
```

Jika ragu antara dua level:

> gunakan level yang lebih restrictive sampai ada keputusan.

---

# 4. ENTITY CLASSIFICATION

| Entity | Default Classification |
|---|---|
| Public Package | PUBLIC |
| Public Departure | PUBLIC |
| Public Article | PUBLIC |
| Public FAQ | PUBLIC |
| User Account Metadata | RESTRICTED |
| Customer Profile | RESTRICTED |
| Pilgrim Profile | RESTRICTED |
| Lead | RESTRICTED |
| Sales Activity | RESTRICTED |
| Follow-up | RESTRICTED |
| Registration | RESTRICTED |
| Document Requirement | INTERNAL/RESTRICTED |
| Pilgrim Document Metadata | SENSITIVE |
| Document File | SENSITIVE |
| Invoice | RESTRICTED |
| Payment | SENSITIVE |
| Payment Evidence | SENSITIVE |
| Refund | SENSITIVE |
| Trip Member | RESTRICTED |
| Itinerary | INTERNAL/RESTRICTED |
| Internal Operational Notes | RESTRICTED |
| Partner Profile | RESTRICTED |
| Commission | SENSITIVE/RESTRICTED |
| Alumni Profile | RESTRICTED |
| Notification | RESTRICTED |
| Audit Log | SENSITIVE |
| Security Alert | SENSITIVE |
| System Settings | SENSITIVE |

---

# 5. CUSTOMER DATA

Potential fields:

```text
name
phone
email
address
identity reference
```

Default:

```text
RESTRICTED
```

Sensitive identifiers may be:

```text
SENSITIVE
```

depending on exact field.

---

# 6. PASSPORT DATA

Passport information is:

```text
SENSITIVE
```

Passport files must be stored privately.

Do not expose:

```text
public URL
search engine indexing
unrestricted CDN URL
```

---

# 7. DOCUMENT FILES

All pilgrim-uploaded identity/travel documents should default to:

```text
SENSITIVE
```

Storage:

```text
PRIVATE BUCKET
```

Access:

```text
authorized application
+
RLS/Storage Policy
+
signed access where appropriate
```

---

# 8. PAYMENT DATA

Payment transaction details are:

```text
SENSITIVE
```

Access must be limited by:

```text
role
permission
scope
ownership
```

---

# 9. PAYMENT EVIDENCE

Screenshots/receipts containing bank or financial information are:

```text
SENSITIVE
```

They require private storage and controlled access.

---

# 10. FINANCIAL REPORTS

Detailed financial reports:

```text
RESTRICTED / SENSITIVE
```

Public dashboards must never expose individual financial records.

---

# 11. CRM DATA

CRM notes may contain sensitive customer context.

Default:

```text
RESTRICTED
```

Sales notes should not automatically become visible to:

```text
Pilgrim
Partner
Tour Leader
Muthawwif
```

---

# 12. OPERATIONAL DATA

Operational itinerary may be:

```text
INTERNAL
```

before publication.

Published trip information may become:

```text
RESTRICTED
```

for the affected trip members.

---

# 13. PARTNER DATA

Partner-specific:

```text
leads
referrals
commission
internal notes
```

must be isolated.

Partner A must never access Partner B data.

---

# 14. AUDIT DATA

Audit logs may contain:

```text
actor
resource
action
timestamp
before
after
IP metadata
request context
```

Therefore:

```text
SENSITIVE
```

by default.

---

# 15. SECURITY ALERT DATA

Security alerts:

```text
SENSITIVE
```

Access should be limited to authorized management/security/admin roles.

---

# 16. FIELD-LEVEL CLASSIFICATION

Entity-level classification is not always sufficient.

Example:

```text
Customer
```

may contain:

```text
name → RESTRICTED
phone → RESTRICTED
email → RESTRICTED
passport_number → SENSITIVE
```

Therefore highly sensitive fields may require stronger handling than the containing entity.

---

# 17. DATA MINIMIZATION

Only collect data required for:

```text
service
legal/compliance requirement
operations
payment
customer support
```

Do not collect information merely because it might be useful someday.

---

# 18. PURPOSE LIMITATION

Data collected for one purpose should not automatically be exposed for another purpose.

Example:

```text
Passport
```

collected for travel/visa processing should not become:

```text
marketing data
```

without an appropriate basis and approved process.

---

# 19. ACCESS PRINCIPLE

Default:

```text
NO ACCESS
```

until access is explicitly justified.

Use:

```text
Need to Know
+
Least Privilege
```

---

# 20. EXPORT CLASSIFICATION

Exported files may increase sensitivity.

Example:

```text
Pilgrim CSV
```

may contain:

```text
name
phone
passport
payment
```

Therefore export permission must be explicit.

---

# 21. LOGGING SENSITIVE DATA

Do not place sensitive data into ordinary logs.

Avoid:

```text
console.log(passport)
console.log(payment)
console.log(document)
```

Logs should use identifiers and safe metadata.

---

# 22. AUDIT REDACTION

Audit records should avoid unnecessarily storing full sensitive payloads.

Prefer:

```text
field changed:
passport_number

before:
[REDACTED]

after:
[REDACTED]
```

or safe hashes/metadata where appropriate.

---

# 23. STORAGE CLASSIFICATION

| Storage | Classification |
|---|---|
| Public assets | PUBLIC |
| Published media | PUBLIC |
| Internal documents | INTERNAL/RESTRICTED |
| Passport files | SENSITIVE |
| Payment receipts | SENSITIVE |
| Identity files | SENSITIVE |
| Backups | Same or higher protection as source |

---

# 24. ACCESS MATRIX

| Data | Pilgrim | Partner | Sales | Finance | Docs | Ops | TL | Muthawwif | Manager | Owner |
|---|---|---|---|---|---|---|---|---|---|---|
| Own profile | Own | Own | Assigned | Relevant | Relevant | Relevant | Trip | Trip | Broad | Global |
| Passport | Own | — | Limited | — | Authorized | Relevant | Minimum | Minimum | Authorized | Authorized |
| Payment | Own | — | — | Authorized | — | — | — | — | Authorized | Authorized |
| Payment evidence | Own where needed | — | — | Authorized | — | — | — | — | Authorized | Authorized |
| CRM notes | — | Own-related limited | Assigned | — | — | — | — | — | Authorized | Authorized |
| Commission | — | Own | — | Authorized | — | — | — | — | Authorized | Authorized |
| Audit | — | — | — | Relevant | Relevant | Relevant | — | — | Authorized | Authorized |

Exact access must follow `15_PERMISSION_RLS_MATRIX.md`.

---

# 25. RETENTION

Retention periods are:

**TBD — Legal/Operational Policy**

However implementation should support:

```text
active
archived
retention_expired
legal_hold
```

without assuming immediate physical deletion.

---

# 26. DELETION

Sensitive data deletion must consider:

```text
legal obligation
operational necessity
financial record integrity
audit requirements
retention policy
backup copies
```

No AI agent may implement destructive deletion merely because a user asks for a DELETE endpoint.

---

# 27. DATA CLASSIFICATION IN CODE

Sensitive fields should be identifiable in:

```text
schema
types
access layer
logging policy
API response shaping
```

Avoid returning unnecessary sensitive fields from APIs.

---

# 28. API RESPONSE MINIMIZATION

An API should return only fields needed by its consumer.

Example:

Pilgrim itinerary endpoint should not return:

```text
internal finance fields
internal CRM notes
other pilgrims' sensitive data
```

---

# 29. PUBLIC PROJECTION

Public endpoints should use explicit public DTO/projection.

Do not expose database rows directly.

Example:

```text
packages table
```

must not automatically become:

```text
GET /public/packages
```

with every column.

---

# 30. SECURITY PRINCIPLE

> **If a user does not need to see the data to complete their task, do not expose it.**