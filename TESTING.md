# Testing Strategy & Test Suite – CreatorFlow Application

## 1. Testing Architecture

| Suite Level | Tool | Coverage Scope | Location |
|:---|:---|:---|:---|
| **Unit Tests** | Vitest | Deterministic math, financial pools, view calculations, validations | `apps/api/src/__tests__/unit/` |
| **Integration Tests** | Vitest + Supertest | End-to-end API workflows, database transactions, auth | `apps/api/src/__tests__/integration/` |
| **Concurrency Tests** | Vitest + Promise.all | Race conditions on slots (`FOR UPDATE`) & reward payouts | `apps/api/src/__tests__/integration/` |
| **Type & Build Verification** | TypeScript, Next.js | Compile-time soundness, no-emit typechecks | `@creatorflow/api`, `@contentrewards/web` |

---

## 2. Test Suites Overview

### A. Unit Tests (`apps/api/src/__tests__/unit/`)

#### 1. `earnings-calculation.test.ts` (10 Test Cases)
- **Case 1: Standard Campaign Fund Calculation**
  - Fund: ₹1,000 (100,000 paise), 10 slots, 15% fee.
  - Verifies: Fee = ₹150 (15,000 paise), Pool = ₹850 (85,000 paise), Max per editor = ₹85 (8,500 paise).
- **Case 2: View Milestones & Cap Verification**
  - Rate: ₹8.50 per 1,000 views, Max: ₹85.00.
  - 1,000 views $\rightarrow$ ₹8.50 (uncapped).
  - 2,000 views $\rightarrow$ ₹17.00 (uncapped).
  - 5,000 views $\rightarrow$ ₹42.50 (uncapped).
  - 10,000 views $\rightarrow$ ₹85.00 (reaches cap).
  - 20,000 views $\rightarrow$ ₹85.00 (strictly capped).
  - 50,000 views $\rightarrow$ ₹85.00 (strictly capped).
  - 100,000 views $\rightarrow$ ₹85.00 (strictly capped).
- **Case 3: Scaled Campaign**
  - Fund: ₹10,000 (1,000,000 paise), 5 slots, 15% fee.
  - Verifies: Fee = ₹1,500, Pool = ₹8,500, Max per editor = ₹1,700.
- **Case 4: Truncation & Rounding Edge Case**
  - Fund: ₹100 (10,000 paise), 3 slots, 15% fee.
  - Verifies: Fee = ₹15, Pool = ₹85, Max per editor = Math.floor(8500 / 3) = 2,833 paise (₹28.33). Sum of 3 slots ($2833 \times 3 = 8499 \le 8500$) never exceeds pool.
- **Case 5: Zero Views**
  - 0 verified views yields 0 earning.
- **Case 6: Negative Inputs**
  - Rejects negative views or negative rates with `ValidationError`.
- **Case 7: Zero or Negative Slots**
  - Rejects `editorSlots <= 0` with `ValidationError`.
- **Case 8: Invalid Fee Percentage**
  - Rejects fees $\ge 100\%$ or $< 0\%$ with `ValidationError`.
- **Case 9: Large Values**
  - Correctly calculates large values (₹10,000,000 fund = 1,000,000,000 paise).
- **Case 10: Non-Integer Inputs**
  - Rejects non-integer minor units and non-positive funds.

#### 2. `money.test.ts` (14 Tests)
- Verifies platform fee calculation, paise to INR string formatting, and currency edge cases.

---

### B. Integration & Concurrency Tests (`apps/api/src/__tests__/integration/`)

#### 1. `slot-concurrency.test.ts`
- **Slot Capacity Race Condition**:
  - Sets up campaign with `editorSlots = 10` and 11 distinct editor accounts.
  - Approves first 9 applications sequentially (9 slots filled, 1 remaining).
  - Fires two concurrent approvals using `Promise.all` for Editor 10 and Editor 11.
  - **Result**: Exactly one request succeeds with HTTP `200`, and the other fails with HTTP `409 Conflict`.
  - Database verification confirms strictly 10 applications have `status = 'APPROVED'`.
- **View-Based Reward Capping & Wallet Credit**:
  - Editor submits live post URL.
  - Creator verifies post at 5,000 views $\rightarrow$ net amount: 4,250 paise (₹42.50).
  - Creator updates views to 50,000 views $\rightarrow$ net amount capped at 8,500 paise (₹85.00).
  - Creator approves reward $\rightarrow$ editor wallet credited with exactly 8,500 paise.
  - Double-approval prevention: firing a second approval returns HTTP `400/409 Conflict`.

#### 2. `application-duplicate.test.ts`
- Sequential double application attempt $\rightarrow$ HTTP `409` (`APPLICATION_ALREADY_EXISTS`).
- Concurrent `Promise.all` double application attempt $\rightarrow$ exactly 1 succeeds, 1 gets `409`.
- Cross-editor applications $\rightarrow$ both succeed independently.

#### 3. `submission-lifecycle.test.ts`
- Full submission lifecycle: Draft $\rightarrow$ Submitted $\rightarrow$ Changes Requested $\rightarrow$ Resubmitted $\rightarrow$ Approved $\rightarrow$ Published $\rightarrow$ Verified $\rightarrow$ Credited.
- Submissions blocked for unapproved applications.

#### 4. `auth-authorization.test.ts`
- Unauthenticated requests rejected with HTTP `401`.
- Role-based authorization enforcement (Editor accessing Creator endpoints returns `403 Forbidden`).

---

## 3. How to Run Tests

```bash
# Run entire backend test suite
pnpm --filter @creatorflow/api test -- --run

# Run typecheck
pnpm --filter @creatorflow/api typecheck
pnpm --filter @contentrewards/web lint

# Run production builds
pnpm --filter @creatorflow/api build
pnpm --filter @contentrewards/web build
```
