# SDW UMROH — FINANCIAL MODEL

**Document Status:** REVIEW  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** Financial Domain & Accounting-Adjacent Transaction Model  
**Parent Documents:**
- `05_DOMAIN_MODEL.md`
- `06_BUSINESS_RULES.md`
- `10_DATABASE_SPEC.md`
- `11_API_CONTRACT.md`
- `12_SECURITY_AND_AUDIT.md`
- `14_STATE_MACHINES.md`

---

# 1. PURPOSE

Dokumen ini mendefinisikan model finansial SDW UMROH dari sisi product/domain.

Dokumen ini **bukan pengganti kebijakan akuntansi formal**.

Tujuan utamanya adalah memastikan:

- harga historis tidak berubah;
- invoice dapat ditelusuri;
- payment tidak disamakan dengan invoice;
- outstanding tidak diedit manual;
- refund tidak menghapus payment;
- seluruh financial mutation dapat diaudit.

---

# 2. CORE FINANCIAL PRINCIPLE

```text
PACKAGE PRICE
 ↓
COMMERCIAL SNAPSHOT
 ↓
REGISTRATION
 ↓
FINANCIAL OBLIGATION
 ↓
INVOICE / PAYMENT SCHEDULE
 ↓
PAYMENT TRANSACTION
 ↓
REFUND / ADJUSTMENT
 ↓
OUTSTANDING
```

---

# 3. FINANCIAL SOURCE OF TRUTH

Authoritative financial records:

```text
Commercial Snapshot
Invoice
Payment Schedule
Payment
Refund
Approved Adjustment
```

Frontend is never the financial source of truth.

---

# 4. PACKAGE PRICE

Package may contain current public pricing.

Example:

```text
Package:
Umrah Reguler

Current Price:
Rp X
```

But this price is not automatically the historical agreed price of an existing registration.

---

# 5. COMMERCIAL SNAPSHOT

When a registration is commercially committed, the system must preserve the relevant agreed terms.

Conceptually:

```text
registration
 ├── package_id
 ├── departure_id
 ├── agreed_price
 ├── currency
 ├── discount
 ├── final_price
 └── pricing_reference
```

Exact fields:

**TBD — Commercial Policy**

---

# 6. PRICE IMMUTABILITY PRINCIPLE

If:

```text
Package Price
Rp 35,000,000
```

later changes to:

```text
Rp 38,000,000
```

existing registration must not silently change from:

```text
Rp 35,000,000
```

to:

```text
Rp 38,000,000
```

Historical commercial terms must remain traceable.

---

# 7. DISCOUNT

Discount is a financial/commercial adjustment.

Possible model:

```text
LIST PRICE
-
DISCOUNT
=
AGREED PRICE
```

Exact discount authorization:

**TBD**

Potential requirements:

- who may create;
- maximum amount;
- approval threshold;
- reason;
- audit.

---

# 8. INVOICE

Invoice represents a financial obligation/document.

It is not a payment.

Concept:

```text
Invoice
 ↓
amount_due
 ↓
payment schedule
```

Invoice should preserve:

- invoice number;
- registration;
- issue date;
- due date;
- amount;
- currency;
- status;
- references.

---

# 9. PAYMENT SCHEDULE

Payment Schedule represents expected installments.

Concept:

```text
Registration
 ↓
Payment Schedule
 ├── Installment 1
 ├── Installment 2
 ├── Installment 3
 └── ...
```

Each installment may have:

```text
sequence
amount
due_date
status
```

Exact installment rules:

**TBD**

---

# 10. PAYMENT

Payment represents an actual payment attempt/transaction.

It must not be used as a replacement for invoice or payment schedule.

Potential fields:

```text
payment_id
registration_id
invoice_id
amount
currency
method
submitted_at
verified_at
reference
status
verified_by
```

---

# 11. PAYMENT EVIDENCE

Manual bank-transfer workflows may include evidence:

```text
receipt
transfer screenshot
bank reference
```

Evidence is not automatically equivalent to verified payment.

Flow:

```text
Evidence Submitted
 ↓
Finance Review
 ↓
Verified / Rejected
```

---

# 12. PAYMENT VERIFICATION

Only authorized finance personnel/system integration may mark payment as verified.

Verification should preserve:

```text
actor
timestamp
reference
amount
method
source
```

---

# 13. PAYMENT WEBHOOKS

If a payment provider is integrated:

```text
Provider
 ↓
Webhook
 ↓
Validate authenticity
 ↓
Idempotency check
 ↓
Match transaction
 ↓
Record payment
 ↓
Verify according to provider/business rules
```

Never trust an unauthenticated client callback.

---

# 14. OUTSTANDING

Conceptually:

```text
Outstanding
=
Authoritative Obligation
-
Verified Payments
+
Approved Adjustments
-
Completed Refunds where applicable
```

Exact formula depends on financial policy.

The frontend must not calculate an independent authoritative outstanding value.

---

# 15. PAYMENT STATUS VS INVOICE STATUS

These are separate.

Example:

```text
Invoice:
PARTIALLY_PAID

Payment #1:
VERIFIED

Payment #2:
PENDING
```

Do not collapse all states into one generic `payment_status`.

---

# 16. REFUND

Refund is a financial transaction associated with a previous payment.

It must not delete or mutate away the historical payment.

Concept:

```text
Verified Payment
 ↓
Refund Request
 ↓
Review
 ↓
Approval
 ↓
Refund Transaction
```

---

# 17. REFUND POLICY

The following are intentionally:

**TBD**

```text
Refund eligibility
Refund percentage
Cancellation fee
Administrative fee
Non-refundable components
Provider charges
Visa/flight/hotel deductions
Approval threshold
```

AI must not invent these rules.

---

# 18. FINANCIAL ADJUSTMENT

Real-world operations may require:

```text
discount
credit
debit
write-off
correction
```

These must be represented as controlled financial adjustments rather than direct editing of historical transactions.

---

# 19. VOID

Void means a financial record is invalidated according to approved policy.

It must preserve:

```text
original record
void actor
void timestamp
reason
replacement/correction if applicable
```

---

# 20. CANCELLATION

Cancellation is a business workflow.

It may trigger:

```text
registration status change
financial review
refund calculation
capacity release
notification
audit
```

But the exact financial consequences are:

**TBD**

---

# 21. FINANCIAL APPROVAL

High-impact actions should use explicit approval:

```text
refund
write-off
large adjustment
manual correction
void
```

Approval thresholds:

**TBD**

---

# 22. CURRENCY

Default operating currency may be:

```text
IDR
```

but currency must be stored explicitly where financial records require it.

If foreign currency is eventually supported:

```text
currency
exchange_rate
exchange_rate_source
exchange_rate_date
```

must be modeled explicitly.

---

# 23. FINANCIAL PRECISION

Money must not be represented using floating-point arithmetic.

Use:

```text
PostgreSQL NUMERIC
```

with an explicitly chosen precision/scale.

Exact schema precision:

**TBD during database lock.**

---

# 24. FINANCIAL IMMUTABILITY

Once a transaction is financially authoritative:

```text
do not overwrite historical amount
do not silently change date
do not silently change reference
do not delete
```

Use adjustment/reversal/correction mechanisms.

---

# 25. FINANCIAL AUDIT

Audit at minimum:

```text
price changes
discounts
invoice creation
invoice cancellation
payment submission
payment verification
payment rejection
void
refund request
refund approval
refund completion
adjustments
write-off
```

---

# 26. FINANCIAL IDEMPOTENCY

Payment creation must support idempotency.

Example:

```text
Provider callback A
Provider callback A again
```

must not create:

```text
Payment #1
Payment #2
```

for the same transaction.

Use provider/reference/idempotency keys where available.

---

# 27. CONCURRENCY

Financial operations must be transaction-safe.

Example:

Two finance users attempt to verify the same payment.

Expected:

```text
one authoritative transition
+
one valid audit outcome
```

not duplicate verification effects.

---

# 28. PAYMENT METHOD

Potential methods:

```text
Bank Transfer
Payment Gateway
Cash
Other Approved Method
```

Exact supported methods:

**TBD**

---

# 29. FINANCIAL REPORTING

Initial reporting may derive from authoritative transactional records.

Examples:

```text
Total invoiced
Total verified payment
Outstanding
Upcoming due
Refunded
```

Reports must not create an alternative financial source of truth.

---

# 30. FINANCIAL DATA ACCESS

Financial data is restricted.

Default:

```text
Pilgrim → own relevant financial information
Finance → authorized financial records
Manager → permitted management reporting
Owner → authorized global access
```

Other roles receive only what their workflow requires.

---

# 31. RECOMMENDED DOMAIN RELATIONSHIP

```text
PACKAGE
   ↓
REGISTRATION
   ↓
COMMERCIAL SNAPSHOT
   ↓
INVOICE
   ↓
PAYMENT SCHEDULE
   ↓
PAYMENT
   ↓
REFUND / ADJUSTMENT
```

---

# 32. FINANCIAL INVARIANTS

The implementation should enforce invariants such as:

```text
Verified payment cannot exceed valid obligation
```

subject to approved overpayment policy.

```text
Refund cannot exceed eligible verified payment
```

subject to approved policy.

```text
Outstanding cannot be negative
```

unless credit balance is explicitly modeled.

```text
Historical payment cannot be silently rewritten.
```

---

# 33. MVP FINANCE

MVP may implement:

```text
package price
commercial snapshot
invoice
payment schedule
payment submission
payment verification
outstanding
payment history
```

Advanced:

```text
automated gateway
refund automation
advanced adjustments
accounting integration
commission settlement
```

may remain later phases.

---

# 34. FINANCIAL IMPLEMENTATION GATE

Before production finance:

```text
✓ Commercial snapshot defined
✓ Invoice model defined
✓ Payment model defined
✓ Payment schedule defined
✓ Outstanding formula defined
✓ Refund policy defined
✓ Adjustment model defined
✓ Authorization defined
✓ RLS defined
✓ Audit defined
✓ Idempotency defined
✓ Concurrency tested
```

---

# 35. FINAL PRINCIPLE

> **Money must be represented as traceable transactions, not mutable dashboard numbers.**