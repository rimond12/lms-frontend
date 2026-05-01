# Plan: Flexible Scholarship, Installment Due Dates & Access Revocation

## Core Principles

- **Admin controls everything.** No amounts, percentages, or rules are hard-coded. Every value is entered by the admin and can be changed at any time per-batch and per-student.
- **Fully backward-compatible.** Every new field is optional on both the server schema and the client types. Existing production enrollments and batches work exactly as before — no migration needed, no data touched.
- **Simple code.** New logic is isolated in a small utility function. Existing service methods receive additive optional parameters only; no existing code paths are broken.

---

## What Admin Can Control (Summary)

| Setting | Where | Description |
|---|---|---|
| Define discount tiers | Batch edit page | Admin adds tiers like "Merit 10%", "Staff 50%", "Special BDT 500" — any label, any type, any value, activate/deactivate anytime |
| Plan-based auto-discount | Batch edit page | Admin optionally attaches a discount to a specific payment plan (1/2/3 plan). E.g. "1-plan gets 20% off" — value is freely editable, can be removed anytime |
| Per-student discount at enrollment | Add Student modal | Admin picks a discount tier OR enters a fully custom discount (type + value + reason) for that specific student |
| Which installments receive the discount | Add Student modal | Admin chooses: apply discount to **All installments** OR only to **Installment 1** (down-payment only) |
| Per-student discount in bulk | Bulk Enrollment modal | Same discount controls per row in the bulk table |
| Edit discount post-enrollment | Student detail modal | Admin can update discount fields after enrollment; system recalculates `effectivePrice` |
| Set installment due date | Student detail modal / payment approval | Date picker per installment; set after approving the prior installment |
| Enable access revocation | Batch edit page | Toggle + grace period days; off by default; does not affect batches where it is not turned on |

---

## Phase 1 — Server: Extend the Batch Schema (Non-Breaking)

### 1a. New interfaces in `batch.interface.ts`

```ts
// A reusable discount tier defined on the batch by the admin.
// Admin can add any number, with any label, type (% or fixed), and value.
interface IDiscountTier {
  _id?: string
  label: string                        // Free text, e.g. "Merit Scholarship", "Early Bird 15%"
  discountType: 'percentage' | 'fixed' // '%' or flat BDT amount
  discountValue: number                // e.g. 20 for 20%, 500 for BDT 500 — admin sets freely
  isActive: boolean                    // Admin can deactivate without deleting
}

// An optional auto-discount tied to a specific payment plan.
// Admin attaches these to a plan — or leaves a plan with no discount at all.
interface IPlanDiscount {
  planKey: '1-plan' | '2-plan' | '3-plan'
  discountType: 'percentage' | 'fixed'
  discountValue: number                // Completely admin-defined, no fixed values
  isActive: boolean
}

// Access revocation policy for overdue installment payments.
interface IInstallmentRevocationPolicy {
  enabled: boolean          // Master toggle — defaults to false, opt-in only
  gracePeriodDays: number   // Days after due date before access is cut; 0 = immediate
}
```

Add to `IBatch` — all optional with defaults:
```ts
discountTiers?: IDiscountTier[]                          // default []
planDiscounts?: IPlanDiscount[]                          // default []
installmentRevocationPolicy?: IInstallmentRevocationPolicy  // default { enabled: false, gracePeriodDays: 0 }
```

### 1b. Schema changes in `batch.model.ts`

Add three sub-schemas:
- `discountTierSchema` (for `discountTiers` array)
- `planDiscountSchema` (for `planDiscounts` array)
- `installmentRevocationPolicySchema` (embedded object, default `{ enabled: false, gracePeriodDays: 0 }`)

All set as **optional** on the Mongoose schema so existing batch documents are unaffected.

---

## Phase 2 — Server: Extend the Enrollment Schema (Non-Breaking)

### 2a. Discount snapshot fields — add to `IBatchEnrollment`

All optional, default to neutral values so existing enrollments are unaffected.

| Field | Type | Default | Purpose |
|---|---|---|---|
| `discountTierId` | `string?` | `undefined` | ID of the batch tier used (if any) |
| `discountType` | `'percentage' \| 'fixed' \| 'none'` | `'none'` | How the discount was calculated |
| `discountValue` | `number` | `0` | Admin-entered value (e.g. 20, 500) |
| `discountReason` | `string?` | `undefined` | Free-text label shown to the student |
| `discountScope` | `'all' \| 'first-only'` | `'all'` | Whether discount applies to all installments or only installment 1 |
| `originalPrice` | `number` | `batch.totalPrice` | Snapshot of batch price at enrollment time |
| `discountAmount` | `number` | `0` | Computed BDT deduction |
| `effectivePrice` | `number` | `batch.totalPrice` | Final price after discount — base for installment math |
| `planDiscountApplied` | `boolean` | `false` | Whether a plan-based discount contributed |

**`discountScope` explained:**
- `'all'` — discount reduces `effectivePrice`; all installments are split from that lower total.
- `'first-only'` — discount reduces only the first installment's amount; remaining installments are calculated from the original price minus the discounted first installment.

Example (`discountScope: 'first-only'`, 2-plan, BDT 20,000, 20% discount):
- Installment 1: `20,000 × 0.80 = BDT 16,000` (discounted)
- Installment 2: `20,000 - 16,000 = BDT 4,000` (remainder at full price)

Example (`discountScope: 'all'`, 2-plan, BDT 20,000, 20% discount):
- `effectivePrice = 16,000`
- Installment 1: `BDT 8,000`
- Installment 2: `BDT 8,000`

### 2b. Installment due date & revocation fields — add to `IPaymentRecord`

```ts
dueDate?: Date      // Admin sets after approving the prior installment
isOverdue?: boolean // Cached flag; set to true by cron when dueDate is passed
```

Add to `IBatchEnrollment`:
```ts
accessRevokedDueToOverdue?: boolean  // default false
accessRevokedAt?: Date
accessRestoreRequestedAt?: Date      // set when student submits late payment proof
```

### 2c. Model changes in `batchEnrollment.model.ts`

All new fields defined as optional in the Mongoose schema with matching defaults. Existing documents without these fields continue to work without any migration.

---

## Phase 3 — Server: Service Logic

### 3a. New utility file: `batchEnrollment.utils.ts`

Single exported function — keeps all new logic isolated and testable:

```ts
export function computeEnrollmentPricing(
  originalPrice: number,
  selectedPlan: '1-plan' | '2-plan' | '3-plan',
  discountType: 'percentage' | 'fixed' | 'none',
  discountValue: number,
  discountScope: 'all' | 'first-only'
): {
  discountAmount: number
  effectivePrice: number
  installmentAmounts: number[]   // array length matches plan (1, 2, or 3)
}
```

- For `discountType: 'none'` or `discountValue: 0`: returns `{ discountAmount: 0, effectivePrice: originalPrice, installmentAmounts: [...] }` — identical to current behaviour.
- For `discountScope: 'all'`: `effectivePrice = originalPrice - discountAmount`, then split equally.
- For `discountScope: 'first-only'`: installment 1 = `originalPrice - discountAmount × (1 / N contribution)` — see formula in code comment.
- Percentage calc: `Math.round(originalPrice * discountValue / 100)`, capped at `originalPrice`.
- Fixed calc: `Math.min(discountValue, originalPrice)`.

This function is **pure** (no DB calls), making it trivially testable.

### 3b. `getInstallmentOptions()` — updated signature

```ts
// batch.service.ts
getInstallmentOptions(
  batch: IBatch,
  effectivePrice?: number   // if omitted, falls back to batch.totalPrice (backward-compat)
): ICalculatedInstallment[]
```

No existing callers break — `effectivePrice` is optional.

### 3c. Enrollment service updates (`batchEnrollment.service.ts`)

Each of the three enrollment entry-points accepts new **optional** discount parameters. If none are provided, the function behaves exactly as it does today.

**`enrollInBatch(payload)`** — add to accepted payload:
```ts
discountType?: 'percentage' | 'fixed' | 'none'
discountValue?: number
discountReason?: string
discountTierId?: string
discountScope?: 'all' | 'first-only'
```
Internal additions:
1. Resolve `planDiscount` from `batch.planDiscounts` for the selected plan (if `isActive: true`).
2. Merge with any student-level override (student override takes precedence over plan default).
3. Call `computeEnrollmentPricing()` → store all snapshot fields.
4. Call `getInstallmentOptions(batch, effectivePrice)` → store computed installment amounts.

**`adminAddToBatch(payload)`** — same optional discount fields above. Existing `skipPayment: true` continues to work; if set, `effectivePrice = 0`.

**`bulkAddToBatch(payload)`** — each student row in the request body may include the same optional discount fields. Each student gets an independent `computeEnrollmentPricing()` call.

### 3d. New service method: `setInstallmentDueDate`

```ts
setInstallmentDueDate(enrollmentId: string, installmentNumber: 1|2|3, dueDate: Date): Promise<IBatchEnrollment>
```

- Finds the matching `IPaymentRecord` by `installmentNumber` and sets its `dueDate`.
- If no record exists yet for that installment number (not yet paid), creates a placeholder entry with `status: 'pending'` and the given `dueDate`.

New route: `PUT /batch-enrollments/:id/installments/:num/due-date` (Admin only).

### 3e. Overdue cron job: `batchEnrollment.cron.ts` (new file)

```
Schedule: daily at midnight (configurable via env)

Query:
  - enrollments where selectedPlan is '2-plan' or '3-plan'
  - a payment record exists with dueDate < (now - gracePeriodDays×86400000) and status != 'approved'
  - accessRevokedDueToOverdue is not true
  - the batch's installmentRevocationPolicy.enabled === true

Action per match:
  - hasAccess = false
  - accessRevokedDueToOverdue = true
  - accessRevokedAt = now
  - emit notification to student
```

Register in `LMS-SERVER-CODE/src/app.ts`. The existing batch auto-start cron can serve as a reference.

### 3f. Access restoration in `approvePayment()`

After setting payment status to `'approved'`:
- If `enrollment.accessRevokedDueToOverdue === true`:
  - Set `hasAccess = true`, `accessRevokedDueToOverdue = false`, clear `accessRevokedAt`.
  - Notify student: "Your access has been restored."
- No other changes to existing approval logic.

---

## Phase 4 — Server: API Validation

Add to the relevant request validators (Zod or existing custom validators):

```
discountType    → 'percentage' | 'fixed' | 'none'  (optional, default 'none')
discountValue   → number >= 0 (required if discountType is not 'none')
                  additionally <= 100 if discountType is 'percentage'
discountScope   → 'all' | 'first-only'  (optional, default 'all')
dueDate         → valid ISO date, must be > now
gracePeriodDays → integer >= 0
```

All fields optional — missing = no discount applied (existing behaviour preserved).

---

## Phase 5 — Client: Type Updates

### `batchApi.ts`

Add interfaces (all new, non-breaking):
```ts
interface IDiscountTier { _id?: string; label: string; discountType: 'percentage'|'fixed'; discountValue: number; isActive: boolean }
interface IPlanDiscount { planKey: '1-plan'|'2-plan'|'3-plan'; discountType: 'percentage'|'fixed'; discountValue: number; isActive: boolean }
interface IInstallmentRevocationPolicy { enabled: boolean; gracePeriodDays: number }
```

Update `IBatch` — all optional:
```ts
discountTiers?: IDiscountTier[]
planDiscounts?: IPlanDiscount[]
installmentRevocationPolicy?: IInstallmentRevocationPolicy
```

### `batchEnrollmentApi.ts`

Update `IPaymentRecord` — extend, not replace:
```ts
dueDate?: string
isOverdue?: boolean
```

Update `IBatchEnrollment` — all optional additions:
```ts
discountTierId?: string
discountType?: 'percentage' | 'fixed' | 'none'
discountValue?: number
discountReason?: string
discountScope?: 'all' | 'first-only'
originalPrice?: number
discountAmount?: number
effectivePrice?: number
planDiscountApplied?: boolean
accessRevokedDueToOverdue?: boolean
accessRevokedAt?: string
accessRestoreRequestedAt?: string
```

Add RTK mutation:
```ts
setInstallmentDueDate: builder.mutation<void, { enrollmentId: string; installmentNumber: number; dueDate: string }>
```

---

## Phase 6 — Client: Batch Edit Page

**File:** `manage-batches/[id]/page.tsx`

Add three collapsible sections below the existing installment plan toggles. Each section is independent and optional — admin can use one, all, or none.

### Section A: Plan-Based Discounts

A simple table — one editable row per plan:

| Plan | Discount Type | Discount Value | Active |
|------|--------------|----------------|--------|
| Full Payment (1×) | `%` / `BDT` radio | free number input | on/off switch |
| 2 Installments | `%` / `BDT` radio | free number input | on/off switch |
| 3 Installments | `%` / `BDT` radio | free number input | on/off switch |

- Admin types any number — no constraints enforced in the UI beyond basic numeric validation.
- Toggle a plan's discount off without losing the value (so it can be re-enabled later).
- Saved with the rest of the batch form on submit.

### Section B: Named Discount Tiers

Admin-managed list of reusable tiers for per-student assignment:

- "+ Add Tier" button appends a new blank row
- Each row: `Label` (free text), `Type` (% / BDT), `Value` (free number), `Active` switch, `Delete` button
- No limit on number of tiers
- Inactive tiers are hidden in dropdown menus but still stored (soft-delete)
- Saved with the rest of the batch form on submit

### Section C: Access Revocation Policy

A small card:
- `Enable auto access revocation for overdue installments` — toggle (default OFF)
- `Grace period (days)` — number input, visible only when toggle is ON; admin can set 0 for immediate revocation
- Descriptive help text: "When enabled, a student's course access will be automatically blocked if an installment payment is not made by the due date (plus grace period). Access is restored automatically after admin approves the payment."

---

## Phase 7 — Client: Individual Enrollment Modal (Add Student)

**File:** `manage-batches/[id]/students/` — existing Add Student modal

Keep all existing fields. Add a collapsible **"Pricing & Discount"** section at the bottom of the form:

### Step 1: Plan selection (existing)
After plan is selected, if the batch has an active `planDiscount` for that plan, show an info chip:
> "This plan has an auto-discount: −20% (Full Payment)" — still editable/overridable below.

### Step 2: Discount assignment (new section)

**Tier Picker:**
- Dropdown: "No Discount" (default) + all active `discountTiers` from the batch.
- Selecting a tier pre-fills `discountType`, `discountValue`, and `discountReason` — all remain editable.

**Manual Override (always visible below tier picker):**
- `Discount Type` — radio: None / Percentage / Fixed BDT
- `Discount Value` — number input (enabled when type is not None)
- `Discount Reason` — text input (free text, shown to student)
- `Discount Scope` — radio:
  - "All installments — discount applies to the full price, split equally"
  - "First installment only — only the first payment is discounted; remaining installments calculated from original price"

### Step 3: Live Price Preview card

Updates reactively as admin changes any value:

```
Course Fee:              BDT 20,000
Plan Discount:          −BDT 4,000   [Full Payment auto-discount: 20%]
Named Tier / Override:  −BDT 0
──────────────────────────────────
Effective Price:         BDT 16,000

Selected Plan: 2 Installments
  Installment 1:        BDT 8,000
  Installment 2:        BDT 8,000
```

For `discountScope: 'first-only'` example (same values):
```
Installment 1:          BDT 12,000   (discounted: −BDT 4,000)
Installment 2:          BDT 8,000    (original split of remainder)
```

---

## Phase 8 — Client: Bulk Enrollment Modal

**File:** `manage-batches/[id]/students/BulkEnrollmentModal.tsx`

Keep all existing columns and logic. Add per-row discount columns to the student table:

| (existing cols…) | Plan | Tier / Discount | Disc. Value | Scope | Final Price |
|---|---|---|---|---|---|
| … | dropdown | dropdown (tiers + "Custom") | number input | All / 1st only | read-only |

- **Global defaults bar** above the table: "Apply to all rows: Plan [dropdown] | Discount Tier [dropdown] | Scope [radio]" — fills all rows at once; rows remain individually editable after.
- `Final Price` column shows computed `effectivePrice` per row reactively.
- Rows where admin left discount as "No Discount" use `effectivePrice = batch.totalPrice` (no change from current).

---

## Phase 9 — Client: Student Dashboard — Installment Timeline

**On the student-facing enrollment/payment page (my-enrollments or batch detail):**

Add a **Payment Timeline** card per enrollment. Displayed only when `selectedPlan` is `2-plan` or `3-plan`, or when a discount was applied.

```
┌──────────────────────────────────────────────────────────┐
│  Course Fee:   BDT 20,000     Plan: 2 Installments       │
│  Discount:    −BDT 4,000      (Full Payment Discount)    │
│  You Pay:      BDT 16,000                                │
├──────────────────────────────────────────────────────────┤
│  Installment 1   BDT 8,000   ✓ Approved   Paid: Jan 5   │
│  Installment 2   BDT 8,000   ⚠ Overdue    Due: Feb 1    │
│                               [Pay Now →]               │
└──────────────────────────────────────────────────────────┘
```

**Status badges & messages:**

| Status | Badge | Student Message |
|---|---|---|
| Approved | ✓ Green | Paid on [date] |
| Overdue | ⚠ Red | "Your access has been suspended. Please pay to restore access." |
| Pending (proof submitted) | ⏳ Yellow | "Payment under review." |
| Locked (not yet due) | 🔒 Grey | "Available after installment N is approved. Due: [date]" |
| No due date set yet | 🔒 Grey | "Due date will be set by admin after previous payment is approved." |

If `discountScope === 'first-only'`, show a note under the timeline:
> "The discount was applied to your first installment only."

---

## Phase 10 — Client: Reusable Installment Payment Form

**File:** `LMS-CLIENT-CODE/src/components/enrollments/InstallmentPaymentForm.tsx` (new component)

Mirrors the existing first-payment / enrollment payment form. Props:
```ts
enrollmentId: string
installmentNumber: number    // 1, 2, or 3
totalInstallments: number    // from selectedPlan
amount: number               // computed installment amount (read-only display)
```

Fields (identical structure to enrollment form):
- Heading: "Installment [N] of [M]"
- Amount due — read-only display
- Payment method selector (bKash, Nagad, Bank Transfer, etc.)
- Transaction ID input
- Payment proof image upload
- Notes (optional)
- Submit button → calls existing `POST /batch-enrollments/:id/payment` endpoint with `installmentNumber: N`

**Usage locations:**
- Student enrollment detail page: "Pay Now →" button opens this form inline or in a modal.
- Admin payment panel: "Record Manual Payment" can reuse this form if desired.

---

## Phase 11 — Client: Admin Student Detail Modal — Installments Tab

**File:** `manage-batches/[id]/students/[studentId]/EditStudentModal.tsx`

Add an **Installments** tab alongside existing tabs:

- Shows a row per installment (1, 2, or 3 depending on plan):
  - Installment number, computed amount, payment status, paid date (if approved)
  - `Due Date` — date picker; saves via `PUT /batch-enrollments/:id/installments/:num/due-date`
  - `Overdue` badge (red) if `isOverdue === true`
- If `accessRevokedDueToOverdue === true`: red banner at the top of the tab + "Restore Access Manually" button (calls existing access-grant endpoint).
- Note below the table: "Due dates for installments 2 and 3 are typically set after approving the previous installment."

**Also in this modal — Discount tab / section (editable post-enrollment):**
- Shows current discount fields (type, value, reason, scope).
- Admin can edit any of these; on save, server recomputes `effectivePrice` and `discountAmount`.
- Warning banner: "Changing the discount does not retroactively change already-approved installment records. It will update the outstanding balance only."

---

## Phase 12 — Client: Admin Payment Review Panel

**File:** `manage-batches/[id]/payments/page.tsx`

Extend the pending payments table (additive columns — existing columns unchanged):

- `Due Date` — shows the installment's `dueDate` if set; "—" otherwise
- `Overdue` — red badge if `isOverdue === true`
- `Access Revoked` — red badge if `accessRevokedDueToOverdue === true`

After admin approves an installment:
- If `installmentNumber < totalInstallments` (i.e., more installments remain): show a toast/modal prompt:
  > "Set due date for installment [N+1]?" with a date picker → calls `setInstallmentDueDate`.
  > Admin can skip; they can always set it later from the student detail modal.

---

## Backward Compatibility Guarantee

| Concern | How it's handled |
|---|---|
| Existing batch documents | All new batch fields are optional with defaults (`[]` for arrays, `{ enabled: false }` for policy). Existing documents are never modified. |
| Existing enrollment documents | All new enrollment fields are optional; `discountType` defaults to `'none'`, `discountAmount` to `0`, `effectivePrice` to `batch.totalPrice`. Existing payments continue to work unchanged. |
| `getInstallmentOptions()` callers | `effectivePrice` parameter is optional; all existing callers continue to work without passing it. |
| Enrollment service methods | New discount parameters are all optional. Omitting them produces identical behaviour to today. |
| Client components | All new fields are optional on interfaces; components that don't use them are unaffected. |
| No DB migration required | MongoDB handles missing optional fields naturally. No migration scripts needed. |

---

## Verification

| Test | Expected |
|---|---|
| Enroll with no discount params at all | Behaves exactly as current system (regression check) |
| Enroll with `1-plan` + batch has 20% `planDiscount` on `1-plan`, scope `all` | `effectivePrice = totalPrice × 0.80`; 1 installment = `effectivePrice` |
| Enroll with `2-plan` + 20% discount, scope `all` | Each installment = `Math.ceil(effectivePrice / 2)` |
| Enroll with `2-plan` + 20% discount, scope `first-only`, price 20000 | Installment 1 = 12000 (after 4000 discount applied), Installment 2 = 8000 |
| Enroll with `3-plan` + fixed BDT 500 discount, scope `all` | `effectivePrice = totalPrice - 500`; 3 equal installments |
| Admin changes batch plan discount from 20% to 40% | Does not affect any existing enrollments |
| Admin sets dueDate on installment 2 | Stored on `IPaymentRecord.dueDate`; visible in student timeline |
| Cron runs past due date, revocation enabled, payment pending | `hasAccess = false`, `accessRevokedDueToOverdue = true`, student sees suspended banner |
| Student submits late payment | `accessRestoreRequestedAt` set; appears in admin review with overdue badge |
| Admin approves late payment | `hasAccess = true`, `accessRevokedDueToOverdue = false`, access restored |
| Bulk enroll 5 students with different discounts and plans | Each enrollment independent; no cross-contamination |
| Batch with `installmentRevocationPolicy.enabled = false` | Cron skips it entirely; no students affected |

---

## Key Decisions

- **No fixed amounts anywhere.** Every percentage, BDT amount, due date, and policy setting is entered by the admin. Nothing is hard-coded in the application logic.
- **`discountScope`** is the key addition over the previous plan. It gives admin full control over whether the discount reduces the total (split across all installments) or only reduces the first payment.
- **Plan discounts are defaults, not mandates.** When a plan has a `planDiscount`, that value pre-fills the discount fields in the enrollment form — but the admin can override it for any individual student.
- **Discount snapshots are immutable after enrollment confirmation** (with an explicit admin override available via the student detail modal + a warning).
- **`effectivePrice` is the single source of truth** for installment math after a discount is applied.
- **Revocation is fully opt-in.** Default is off. Batches where it is not enabled are never affected by the cron.
- **Access restoration is automatic** upon payment approval — no secondary admin action needed.
- **The legacy SSLCommerz/coupon system is not touched.**
