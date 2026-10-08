# Architecture Overview – CreatorFlow Application

```mermaid
flowchart TD
    subgraph Client["Next.js Frontend (apps/web)"]
        UI_CREATOR["Creator Workspace (Campaigns, Submissions, Verify)"]
        UI_EDITOR["Editor Workspace (Discover, Apply, Submit, Earnings)"]
        UI_DISCOVERY["Public Discovery / Marketplace (16:9 Cards, Filters)"]
    end

    subgraph API["Express.js API (apps/api)"]
        AUTH_MW["Auth & Role Guard (JWT / Supabase)"]
        VALIDATORS["Zod Validators (Strict Platform & Financial Validation)"]
        
        subgraph Services["Domain Services Layer"]
            CAMP_SRV["CampaignService\n(Financial derivation & slot counters)"]
            APP_SRV["ApplicationService\n(Atomic SELECT FOR UPDATE slot locking)"]
            SUB_SRV["SubmissionService\n(Revision management & workflow)"]
            POST_SRV["PublishedPostService\n(Verification & URL validation)"]
            EARN_SRV["EarningsCalculationService\n(Pure deterministic financial engine)"]
            REW_SRV["RewardService\n(IRewardProcessor abstraction)"]
            WALLET_SRV["WalletService\n(Two-legged atomic ledger entries)"]
        end
    end

    subgraph Database["PostgreSQL (Prisma ORM)"]
        DB_CAMP[("Campaign\n(campaignFund, slots, pools)")]
        DB_APP[("CampaignApplication\n(unique campaignId + editorId)")]
        DB_SUB[("ContentSubmission\n(revisions, feedback)")]
        DB_POST[("PublishedPost\n(verifiedViews, URLs)")]
        DB_REW[("Reward\n(grossAmount, fee, netAmount)")]
        DB_WALLET[("Wallet & WalletTransaction\n(Atomic ledger)")]
    end

    Client -->|REST API Requests (JWT)| AUTH_MW
    AUTH_MW --> VALIDATORS
    VALIDATORS --> Services
    Services -->|Prisma Transactions & Row Locks| Database
```

---

## 1. Core Financial Engine & Calculation Pipeline

### Dedicated Service: `EarningsCalculationService`
Located at `apps/api/src/services/earnings-calculation.service.ts`, this service is a pure, side-effect-free calculation module responsible for:
- **Campaign Financial Pool Derivation**:
  - `platformFeeMinor = Math.floor((campaignFundMinor * platformFeePercentage) / 100)`
  - `editorRewardPoolMinor = campaignFundMinor - platformFeeMinor`
  - `maximumEditorEarningMinor = Math.floor(editorRewardPoolMinor / editorSlots)`
- **View-Based Reward Computation**:
  - `calculatedEarningMinor = Math.floor((verifiedViews / 1000) * earningPer1000ViewsMinor)`
  - `finalEditorEarningMinor = Math.min(calculatedEarningMinor, maximumEditorEarningMinor)`
  - `capped = calculatedEarningMinor >= maximumEditorEarningMinor`

All monetary inputs and outputs use **integer minor units (paise)** to eliminate IEEE 754 floating-point inaccuracies.

---

## 2. Concurrency & Race-Condition Mitigation Architecture

### A. Editor Slot Approval Race Conditions
When multiple creators or asynchronous requests approve applications for a campaign nearing full capacity:
1. `ApplicationService.approve` enters an isolated `prisma.$transaction`.
2. Issues an atomic row-level exclusive lock:
   ```sql
   SELECT id, "editorSlots" FROM "Campaign" WHERE id = $1 FOR UPDATE
   ```
3. Queries existing approved applications:
   ```sql
   SELECT COUNT(id) FROM "CampaignApplication" WHERE "campaignId" = $1 AND status = 'APPROVED'
   ```
4. If `approvedCount >= editorSlots`, the transaction aborts with HTTP `409 Conflict`.
5. Only if a slot remains is the application updated to `APPROVED`.

### B. Duplicate Application Prevention
- Database-level constraint: `@@unique([campaignId, editorId])` on `CampaignApplication`.
- Service-level existence check returns HTTP `409 Conflict` with code `APPLICATION_ALREADY_EXISTS`.

---

## 3. Pluggable Reward Processor Architecture
The platform implements an interface-based processor abstraction:
```ts
export interface IRewardProcessor {
  processReward(rewardId: string, editorUserId: string, netAmount: number, platformFee: number): Promise<void>;
  reverseReward(rewardId: string, editorUserId: string): Promise<void>;
}
```
Currently powered by `VirtualWalletRewardProcessor`, which interfaces with `WalletService`. This allows seamless swapping with Razorpay, Stripe, or direct bank transfer adapters without touching core business logic.

---

## 4. Double-Entry Virtual Wallet Ledger
When `RewardService.approve` executes:
1. Updates `Reward.status` to `CREDITED`.
2. Creates a `WalletTransaction` with type `REWARD` (`+netAmount`) linked to the editor's wallet.
3. Creates a `WalletTransaction` with type `PLATFORM_FEE` (`+platformFee`) linked to the platform ledger.
4. Atomically adjusts `Wallet.balance` within the transaction.
