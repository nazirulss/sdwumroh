# SDW UMROH — UI/UX DESIGN SYSTEM

**Document Status:** DRAFT  
**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Document Type:** UI/UX & Design System Specification  
**Parent Documents:**
- `00_PROJECT_CONTEXT.md`
- `01_PRD.md`
- `02_PRODUCT_BLUEPRINT.md`
- `07_INFORMATION_ARCHITECTURE.md`

---

# 1. PURPOSE

This document defines the visual, interaction and experience principles for SDW UMROH.

The design system must create one recognizable SDW experience across:

- Public Website,
- Pilgrim PWA,
- Partner Portal,
- Backoffice.

The interfaces may differ in density and purpose, but they must feel like one product ecosystem.

---

# 2. DESIGN PHILOSOPHY

The SDW experience should communicate:

**Trust + Calm + Clarity + Human Touch + Professionalism**

The design should feel appropriate for an Umrah service without becoming visually overloaded with stereotypical religious decoration.

---

# 3. CORE UX PRINCIPLES

## UX-001 — Clarity First

Users should understand what is happening without having to interpret complicated UI.

---

## UX-002 — Journey First

The interface should communicate:

> Where am I in my journey?

before exposing secondary information.

---

## UX-003 — One Primary Action

Each important screen should have one visually dominant primary action.

---

## UX-004 — Progressive Disclosure

Show essential information first.

Reveal additional detail when the user needs it.

---

## UX-005 — Human Support

Digital self-service should not make the user feel abandoned.

Relevant support/contact options should remain accessible.

---

## UX-006 — Trust Through Transparency

Where relevant, clearly communicate:

- status,
- dates,
- prices,
- payment,
- documents,
- next steps.

Avoid ambiguous wording.

---

## UX-007 — Calm Interaction

Avoid excessive animation, unnecessary popups, aggressive notifications and visual clutter.

---

# 4. BRAND DIRECTION

Final SDW brand colors and typography are **TBD** until official brand assets are supplied.

The design system must not invent a final corporate identity and present it as approved.

Until then, use a provisional visual direction:

### Character

- warm,
- elegant,
- trustworthy,
- modern,
- restrained,
- human.

---

# 5. COLOR SYSTEM

Final color values:

**TBD**

The implementation should use semantic color tokens rather than hard-coded colors.

Example:

```text
color.brand.primary
color.brand.secondary

color.surface.default
color.surface.subtle
color.surface.elevated

color.text.primary
color.text.secondary
color.text.muted

color.border.default

color.status.success
color.status.warning
color.status.error
color.status.info
```

---

# 6. STATUS COLORS

Status colors should communicate meaning consistently.

Suggested semantic mapping:

```text
SUCCESS
Verified
Completed
Paid
Ready

WARNING
Pending
Upcoming
Attention

ERROR
Failed
Rejected
Overdue
Blocked

INFO
Information
In Progress
Scheduled

NEUTRAL
Draft
Not Started
Inactive
Archived
```

Exact colors are TBD.

Color must not be the only indicator of status.

Use:

- text,
- icon,
- badge,
- label

as supporting signals.

---

# 7. TYPOGRAPHY

Final typeface:

**TBD**

Typography should prioritize:

- readability,
- Indonesian language support,
- Arabic support where required,
- clear hierarchy,
- mobile legibility.

Suggested hierarchy:

```text
Display
H1
H2
H3
H4
Body Large
Body
Body Small
Caption
Label
```

Typography should be semantic rather than manually styled per page.

---

# 8. SPACING

Use a consistent spacing scale.

Recommended conceptual scale:

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

Exact token implementation may be adjusted during engineering.

---

# 9. BORDER RADIUS

Use restrained, consistent radius values.

Components should not randomly mix:

- sharp corners,
- highly rounded cards,
- pills,
- circles

without a design rationale.

---

# 10. SHADOWS / ELEVATION

Elevation should communicate hierarchy, not decoration.

Use:

- subtle shadow,
- border,
- surface contrast

where appropriate.

Avoid excessive card shadows.

---

# 11. ICONOGRAPHY

Icons should be:

- consistent,
- simple,
- recognizable,
- accessible,
- semantically appropriate.

Do not mix unrelated icon styles.

---

# 12. IMAGERY

Photography should communicate:

- authentic travel,
- people,
- hospitality,
- calmness,
- spiritual journey,
- professionalism.

Avoid excessive use of generic stock imagery when authentic SDW photography is available.

---

# 13. PUBLIC WEBSITE EXPERIENCE

The public website should feel:

**Inspirational + Trustworthy + Informative**

It should not feel like an administrative dashboard.

Primary visual priorities:

1. Trust
2. Package discovery
3. Clear CTA
4. Social proof
5. Information

---

# 14. PILGRIM PWA EXPERIENCE

The PWA should feel:

**Personal + Calm + Actionable**

The pilgrim should immediately see:

```text
My Journey
Current Status
Next Action
Upcoming Event
Important Information
```

---

# 15. PARTNER EXPERIENCE

Partner portal should feel:

**Efficient + Clear + Performance-Oriented**

Primary information:

- leads,
- referrals,
- status,
- commission,
- next action.

---

# 16. BACKOFFICE EXPERIENCE

Backoffice should feel:

**Operational + Dense + Controlled**

It may use:

- tables,
- filters,
- status badges,
- side panels,
- bulk actions,
- dashboards.

However, density should not compromise readability.

---

# 17. RESPONSIVE PRINCIPLE

Design mobile first for:

- pilgrims,
- partners,
- quick operational actions.

Design desktop-first density for:

- finance,
- CRM,
- operations,
- management.

Do not merely scale desktop layouts down to mobile.

---

# 18. COMPONENT SYSTEM

The design system should provide reusable components.

Core components:

```text
Button
Link
IconButton
Input
Textarea
Select
Combobox
Checkbox
Radio
Switch
DatePicker
FileUpload
Form
Card
Badge
StatusBadge
Avatar
Table
Tabs
Accordion
Modal
Drawer
Dialog
Toast
Alert
Tooltip
Dropdown
Breadcrumb
Pagination
Search
Filter
Stepper
Timeline
Progress
Skeleton
EmptyState
ErrorState
```

---

# 19. BUTTON SYSTEM

Primary action:

```text
Primary
```

Secondary action:

```text
Secondary
```

Supporting action:

```text
Tertiary / Ghost
```

Dangerous action:

```text
Destructive
```

Buttons should communicate hierarchy.

Do not make every button visually dominant.

---

# 20. FORM DESIGN

Forms must:

- use clear labels,
- explain required fields,
- validate input,
- show errors near the relevant field,
- preserve user input where possible,
- provide clear submission feedback.

Avoid long intimidating forms when a multi-step flow is more appropriate.

---

# 21. MULTI-STEP FORMS

Registration should likely use a guided sequence.

Concept:

```text
1. Package
2. Personal Data
3. Documents
4. Review
5. Submit
```

The exact registration steps may change after workflow validation.

Users should always know:

- current step,
- completed steps,
- remaining steps.

---

# 22. STATUS COMPONENT

Statuses must use consistent components.

Example:

```text
[ VERIFIED ]
[ PENDING ]
[ REVISION REQUIRED ]
[ PAID ]
[ OUTSTANDING ]
[ READY ]
```

The text must remain understandable without relying on color alone.

---

# 23. PROGRESS COMPONENT

Progress indicators must represent real measurable progress.

Examples:

- document completion,
- preparation completion,
- learning progress.

Never display an arbitrary percentage.

---

# 24. JOURNEY TIMELINE

The pilgrim journey should use a timeline/stepper where appropriate.

Example:

```text
✓ Registration
│
✓ Documents
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

The current stage should receive the strongest emphasis.

---

# 25. DASHBOARD CARDS

Cards should answer a question.

Good:

> Payment Remaining

> Next Action

> Upcoming Manasik

> Documents Requiring Attention

Avoid cards that merely display numbers without context.

---

# 26. TABLES

Tables are primarily for desktop/admin experiences.

Tables should support:

- sorting where useful,
- filtering,
- pagination,
- row actions,
- responsive alternatives.

On mobile, dense tables should transform into cards/list views where appropriate.

---

# 27. DETAIL PAGES

Recommended pattern:

```text
Header
 ↓
Status
 ↓
Primary Information
 ↓
Primary Action
 ↓
Tabs / Sections
 ↓
Related Information
 ↓
History / Activity
```

---

# 28. NOTIFICATION UX

Notifications must have:

- clear title,
- meaningful message,
- relevant time,
- action where appropriate.

Example:

> Passport needs revision  
> Please upload a clearer passport image.  
> **Review document**

Avoid generic:

> Update available.

---

# 29. EMPTY STATE UX

Empty states should explain the situation.

Example:

> Belum ada dokumen yang perlu diunggah.

Not:

> No data.

Where useful, include a next action.

---

# 30. ERROR UX

Error messages should answer:

1. What happened?
2. What can I do?
3. Is my previous action saved?

Example:

> Pembayaran belum dapat dikonfirmasi. Data pembayaran Anda belum berubah. Silakan coba lagi atau hubungi bagian Finance.

---

# 31. LOADING UX

Use:

- skeletons,
- progress indicators,
- disabled states,
- optimistic UI only where safe.

Do not use endless spinners without context.

---

# 32. CONFIRMATION UX

High-impact actions require confirmation.

Examples:

- cancel registration,
- cancel departure,
- refund,
- void payment,
- delete/archive critical record.

Confirmation should explain consequences.

---

# 33. FILE UPLOAD UX

For documents:

Show:

```text
Document Type
Accepted Format
Maximum Size
Upload Progress
Preview where appropriate
Verification Status
Revision Reason
```

The user should understand whether the file has actually been received.

---

# 34. MOBILE PWA PRINCIPLES

The PWA should support:

- thumb-friendly controls,
- sufficient touch targets,
- sticky primary action where useful,
- readable typography,
- low cognitive load,
- network/error awareness,
- installable experience.

Offline behavior must be explicitly defined before being promised.

---

# 35. PWA HOME SCREEN

Recommended priority:

```text
Greeting
 ↓
Journey Card
 ↓
Next Action
 ↓
Important Alert
 ↓
Upcoming Event
 ↓
Quick Actions
 ↓
Progress
```

---

# 36. PUBLIC CTA PRINCIPLE

Primary CTAs should be action-oriented.

Examples:

**Lihat Paket**

**Konsultasi Umroh**

**Daftar Sekarang**

Avoid vague CTAs such as:

**Klik Di Sini**

---

# 37. CONTENT TONE

Default content tone:

- warm,
- respectful,
- clear,
- reassuring,
- concise.

Avoid:

- excessive corporate jargon,
- exaggerated claims,
- fear-based sales language,
- unnecessary religious clichés,
- unsupported promises.

---

# 38. TRUST DESIGN

Trust should be communicated through evidence.

Possible elements:

- legal/official information where applicable,
- transparent package information,
- office/contact information,
- real documentation,
- customer testimonials,
- clear payment information,
- clear terms.

Do not create artificial trust badges or claims.

---

# 39. ACCESSIBILITY

The system should target reasonable accessibility standards.

Minimum principles:

- sufficient contrast,
- keyboard accessibility where applicable,
- semantic HTML,
- form labels,
- focus states,
- readable text,
- meaningful alt text,
- non-color-only status communication.

---

# 40. RTL / ARABIC SUPPORT

Where Arabic content is required:

- typography must support Arabic,
- directionality must be correct,
- mixed Indonesian/Arabic content must remain readable,
- layout should support RTL content without breaking the primary Indonesian interface.

Full RTL application mode is not assumed unless later required.

---

# 41. DESIGN TOKENS

Implementation should use tokens.

Example:

```text
--color-brand-primary
--color-brand-secondary

--color-text-primary
--color-text-secondary

--color-surface
--color-surface-muted

--color-border

--color-success
--color-warning
--color-error
--color-info

--space-1
--space-2
--space-3
...

--radius-sm
--radius-md
--radius-lg

--shadow-sm
--shadow-md
```

Exact values remain TBD until brand direction is approved.

---

# 42. COMPONENT STATES

Reusable components should support appropriate states.

Example button:

```text
DEFAULT
HOVER
FOCUS
ACTIVE
DISABLED
LOADING
```

Example input:

```text
DEFAULT
FOCUS
FILLED
ERROR
DISABLED
READONLY
```

---

# 43. GOLDEN SCREEN PRINCIPLE

Some screens may eventually be designated as:

**GOLDEN SCREENS**

A Golden Screen is a screen whose:

- structure,
- hierarchy,
- visual language,
- interaction pattern

has been explicitly approved.

AI agents must not redesign a Golden Screen without explicit instruction.

---

# 44. AI DESIGN RULES

Gemini Canvas and Antigravity must:

1. Follow this design system.
2. Reuse existing components.
3. Avoid inventing new visual styles without reason.
4. Avoid arbitrary colors.
5. Avoid arbitrary typography.
6. Avoid inconsistent spacing.
7. Preserve approved screen hierarchy.
8. Ask before changing locked design decisions.

---

# 45. DESIGN SYSTEM MATURITY

The design system will evolve.

Status:

```text
FOUNDATION
 ↓
PROTOTYPE
 ↓
REVIEW
 ↓
APPROVED
 ↓
LOCKED
```

Approved components should become reusable primitives rather than page-specific implementations.

---

# 46. FINAL DESIGN PRINCIPLE

SDW UMROH should feel like:

> **A calm, trustworthy digital companion for an important journey.**

The design should make complex operational processes feel simple without hiding important information.

The system should prioritize:

**Clarity over decoration.**

**Trust over hype.**

**Journey over features.**

**Human support over automation for its own sake.**

**Consistency over novelty.**