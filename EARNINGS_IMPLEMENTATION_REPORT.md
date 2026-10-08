# CreatorFlow Campaign Reward & Earnings System Implementation Report

## 1. Summary of Earnings Model Implementation
The CreatorFlow application has been enhanced with a robust, campaign-funded, editor-slot-based earning model. The financial workflow enforces that the platform fee (default 15%) is deducted **FIRST** from the gross campaign fund before establishing the editor reward pool (85%). The pool is divided equally across configured editor slots (`editorSlots`), establishing a strict individual earning cap (`maximumEditorEarning`). Verified views scale editor earnings at a deterministic rate per 1,000 views (`earningPer1000Views`) using integer minor units (paise). Once an editor's verified views generate earnings matching `maximumEditorEarning`, payouts are strictly capped.

Social platform options are strictly restricted across backend validators, database models, and frontend UI to **Instagram** and **YouTube** only. The marketplace presents 16:9 ratio cards with custom navy gradient dummy thumbnails when thumbnail assets are not provided, along with real-time slot counters and view rates.

---

## 2. Files Modified & Created

### Backend (`apps/api/`)
- `prisma/schema.prisma`: Added `campaignFund`, `platformFeePercentage`, `platformFee`, `editorRewardPool`, `editorSlots`, `maximumEditorEarning`, `earningPer1000Views` to `Campaign`; added `verifiedViews` to `PublishedPost`; added `verifiedViews`, `calculatedAmount` to `Reward`.
- `src/services/earnings-calculation.service.ts` (*New*): Authoritative, deterministic calculation service for financial pools, slot ceilings, and view-based earnings.
- `src/validators/campaign.validator.ts`: Restricted `PLATFORMS` strictly to `["Instagram", "YouTube"]`, added validation for `campaignFund`, `editorSlots`, `earningPer1000Views`, and decoupled update schema.
- `src/services/campaign.service.ts`: Computes campaign financials on creation; enriches `findAll` and `findById` with `approvedEditorsCount` and `remainingSlots`.
- `src/routes/campaign.routes.ts`: Added `socialPlatform` filtering to `GET /api/v1/campaigns`.
- `src/services/application.service.ts`: Implemented atomic slot concurrency lock (`SELECT ... FOR UPDATE` inside `prisma.$transaction`) to reject applications exceeding `editorSlots` with HTTP 409 Conflict.
- `src/services/published-post.service.ts`: Updated `verify` method to accept `verifiedViews` and pass to reward creation.
- `src/routes/published-post.routes.ts`: Validates `verifiedViews` in `POST /api/v1/published-posts/:id/verify`.
- `src/services/reward.service.ts`: View-based reward calculation using `earningsCalculationService`, proportional platform fee accounting, and `updateViews()` method for creators.
- `src/routes/reward.routes.ts`: Added `POST /api/v1/rewards/:id/views` to update verified views prior to approval.
- `src/__tests__/unit/earnings-calculation.test.ts` (*New*): 10 unit test cases covering all edge cases, rounding, and formulas.
- `src/__tests__/integration/slot-concurrency.test.ts` (*New*): High-concurrency race condition test for editor slots and view-based reward verification & capping.

### Frontend (`apps/web/`)
- `app/components.tsx`: Added `CampaignDummyThumbnail` (navy gradient placeholder with CF badge) and `CampaignCard` (16:9 ratio, Instagram/YouTube badges, slot metrics, earning potential).
- `app/page.tsx`: Added top featured banner, "Campaigns for you >" section, Instagram and YouTube filter buttons, and responsive 16:9 card grid.
- `app/editor/campaigns/page.tsx`: Discover campaigns page with featured banner, Instagram/YouTube filters, and `CampaignCard` grid.
- `app/editor/campaigns/[id]/page.tsx`: Real-time slot status, maximum earning cap, view rates, dummy thumbnails, and "Slots Filled" protection.
- `app/creator/campaigns/new/page.tsx`: Restricted platforms to Instagram and YouTube, added slot inputs (`campaignFund`, `editorSlots`, `earningPer1000Views`, `minimumViews`), and real-time 15/85 financial breakdown preview.
- `app/creator/campaigns/[id]/page.tsx`: Detailed slot overview, view verification input modal, view update capability, and reward release controls.

### Documentation
- `BUSINESS_RULES.md` (*Updated*): Complete specification of financial formulas, slot rules, and platform restrictions.
- `ARCHITECTURE.md` (*Updated*): Architecture diagrams, service design, concurrency mitigation, and ledger design.
- `WORKFLOW.md` (*Updated*): End-to-end sequence diagrams and step-by-step workflow documentation.
- `TESTING.md` (*Updated*): Testing strategy, coverage matrix, and test execution commands.
- `EARNINGS_IMPLEMENTATION_REPORT.md` (*New*): Comprehensive 21-point implementation verification report.

---

## 3. Database Changes
All changes were applied and verified via Prisma:
- **`Campaign` model**:
  - `campaignFund`: `Int` (stored in minor units / paise)
  - `platformFeePercentage`: `Int` (default: 15)
  - `platformFee`: `Int` (minor units)
  - `editorRewardPool`: `Int` (minor units, 85% of fund)
  - `editorSlots`: `Int` (default: 1)
  - `maximumEditorEarning`: `Int` (minor units)
  - `earningPer1000Views`: `Int` (minor units)
- **`PublishedPost` model**:
  - `verifiedViews`: `Int` (default: 0)
- **`Reward` model**:
  - `verifiedViews`: `Int` (default: 0)
  - `calculatedAmount`: `Int` (default: 0)
- **Index added**:
  - `@@unique([campaignId, editorId])` on `CampaignApplication` to strictly prevent duplicate editor applications.

---

## 4. Platform Fee Deduction Order
The platform fee is deducted **FIRST** from the gross campaign fund:
```
campaignFund
    ↓
15% platform fee deducted
    ↓
85% editor reward pool created
    ↓
Divided equally across editor slots
    ↓
Maximum earning per editor determined
```
Under no circumstances is the campaign fund divided among editors before deducting the platform fee.

---

## 5. Editor Slot Calculation
The editor reward pool is divided equally across the configured number of editor slots:
$$\text{maximumEditorEarning} = \lfloor \frac{\text{editorRewardPool}}{\text{editorSlots}} \rfloor$$
- Example 1: Fund = ₹1,000 (100,000 paise), Slots = 10. Platform fee = ₹150 (15,000 paise). Pool = ₹850 (85,000 paise). Max per editor = ₹85 (8,500 paise).
- Example 2: Fund = ₹10,000 (1,000,000 paise), Slots = 5. Platform fee = ₹1,500 (150,000 paise). Pool = ₹8,500 (850,000 paise). Max per editor = ₹1,700 (170,000 paise).

---

## 6. View-Based Calculation Formula
Editor earnings scale dynamically based on verified post views:
$$\text{calculatedEarning} = \lfloor \frac{\text{verifiedViews}}{1000} \times \text{earningPer1000Views} \rfloor$$
The earning rate is configurable per campaign (e.g. ₹8.50 = 850 paise per 1,000 views) and is never hard-coded.

---

## 7. Capping Logic
Once an editor reaches `maximumEditorEarning`, additional views do not increase earnings:
$$\text{finalEditorEarning} = \min(\text{calculatedEarning}, \text{maximumEditorEarning})$$
The calculation engine sets a boolean flag `capped = true` whenever `calculatedEarning >= maximumEditorEarning`.

---

## 8. Decimal & Currency Handling
All monetary values in database columns, API request/response payloads, and service calculations are stored and calculated in **integer minor currency units (paise)**.
- ₹1.00 = 100 paise
- Integer truncation (`Math.floor`) guarantees that the sum of slot allocations never exceeds the total editor reward pool.
- Eliminates floating-point IEEE 754 precision errors.

---

## 9. Race Condition Handling for Editor Slots
To prevent slot overselling under concurrent approvals:
1. `ApplicationService.approve()` operates inside a PostgreSQL transaction (`prisma.$transaction`).
2. Issues an exclusive row-level lock:
   ```sql
   SELECT id, "editorSlots" FROM "Campaign" WHERE id = $1 FOR UPDATE
   ```
3. Queries existing approved applications count:
   ```sql
   SELECT COUNT(id) FROM "CampaignApplication" WHERE "campaignId" = $1 AND status = 'APPROVED'
   ```
4. If `approvedCount >= editorSlots`, the transaction aborts and returns HTTP `409 Conflict` ("Campaign editor slots are full").
5. Only if a slot remains is the application updated to `APPROVED`.
- Verified in automated concurrency test: 9 of 10 slots filled $\rightarrow$ 2 concurrent approval requests $\rightarrow$ exactly 1 succeeds (200), and the other fails safely (409). Final count strictly equals 10.

---

## 10. Race Condition Handling for Reward Payouts
1. Rewards transition through strict states: `PENDING` $\rightarrow$ `CREDITED`.
2. `RewardService.approve()` verifies that the reward status is currently `PENDING` within an atomic transaction.
3. If concurrent approval calls are sent for the same reward, the first transitions the reward to `CREDITED` and credits the wallet; the second request encounters non-PENDING status and is rejected with HTTP `400/409 Conflict`.
4. Prevents duplicate wallet credits.

---

## 11. Manual/Verified View Tracking Workflow
1. Editor submits live published post URL (`POST /api/v1/published-posts`).
2. Creator inspects the post and submits verified view count (`POST /api/v1/published-posts/:id/verify`).
3. Backend creates a `Reward` record with calculated earnings based on views and slot caps.
4. Creator can inspect post growth and update view counts prior to release via `POST /api/v1/rewards/:id/views`.
5. Creator approves the reward (`POST /api/v1/rewards/:id/approve`), which atomically credits the editor's virtual wallet.

---

## 12. Social Platform Restriction
The system strictly restricts social platforms to **Instagram** and **YouTube**:
- Backend Zod schema validator: `z.enum(["Instagram", "YouTube"])`. All other platforms are rejected with HTTP 400.
- Frontend campaign creation dropdown: Strictly "Instagram" and "YouTube".
- Discovery and browse filters: Pill buttons strictly filter between "All Platforms", "Instagram", and "YouTube".

---

## 13. Campaign Creation Validation
Campaign creation validates:
- `title` (3–200 characters), `description` (10–5000 characters), `category`.
- `socialPlatform` strictly `"Instagram"` or `"YouTube"`.
- `campaignFund`: positive integer $\ge$ 100 paise (₹1).
- `editorSlots`: positive integer $\ge$ 1.
- `earningPer1000Views`: positive integer in minor units.
- `deadline`: future ISO datetime.
- Authoritative recalculation of platform fee, editor reward pool, and maximum editor earning occurs on the backend, ensuring client-side tampering is impossible.

---

## 14. API Changes
- `POST /api/v1/campaigns`: Accepts `campaignFund`, `editorSlots`, `earningPer1000Views`, `minimumViews`; returns authoritative financial breakdown.
- `GET /api/v1/campaigns`: Enriched with `approvedEditorsCount` and `remainingSlots`; supports `socialPlatform` query filter.
- `GET /api/v1/campaigns/:id`: Returns full slot metrics and view rates.
- `POST /api/v1/applications/:id/approve`: Atomic slot capacity verification with `SELECT FOR UPDATE`.
- `POST /api/v1/published-posts/:id/verify`: Accepts `verifiedViews` and computes view-based reward.
- `POST /api/v1/rewards/:id/views`: Creator updates verified views on a pending reward.

---

## 15. Frontend Changes
- **Campaign Card Component (`CampaignCard`)**:
  - 16:9 aspect ratio thumbnail with YouTube/Instagram platform badge.
  - Custom `CampaignDummyThumbnail` with navy gradient, "CF" badge, and category pill when no thumbnail is provided.
  - Visual indicators for Max Earning, Earning Rate (e.g. `₹8.50 / 1k views`), and remaining slots badge (e.g. `8 slots left` or `Slots Filled`).
- **Landing Page (`/`)**:
  - Top featured hero banner matching the reference design.
  - "Campaigns for you >" section with Instagram and YouTube filter buttons.
  - Responsive card grid.
- **Editor Campaign Discovery (`/editor/campaigns`)**:
  - Search and filter bar for Instagram & YouTube.
  - Remaining slot counters on each card.
- **Editor Campaign Detail (`/editor/campaigns/[id]`)**:
  - Full transparent financial breakdown (Max Earning, Earning Rate, Slots Left).
  - "Slots Filled" badge and disabled application form if slots are exhausted.
- **Creator Campaign Detail (`/creator/campaigns/[id]`)**:
  - Slot utilization metrics in header (Approved / Total / Remaining).
  - View-based verification prompt and live view update control.
  - Transparent 15% platform fee and 85% editor earning summary.

---

## 16. Test Results
All 38 automated test cases passed with zero errors:

| Test Suite | Tests | Result | Execution Time |
|:---|:---:|:---:|:---:|
| `earnings-calculation.test.ts` (Unit) | 10 | **Passed** | 15ms |
| `money.test.ts` (Unit) | 14 | **Passed** | 44ms |
| `slot-concurrency.test.ts` (Integration & Concurrency) | 2 | **Passed** | 1040ms |
| `application-duplicate.test.ts` (Integration) | 4 | **Passed** | 679ms |
| `submission-lifecycle.test.ts` (Integration) | 3 | **Passed** | 806ms |
| `auth-authorization.test.ts` (Integration) | 5 | **Passed** | 391ms |
| **Total** | **38** | **All Passed** | **3.50s** |

---

## 17. Remaining Risks & Mitigations
- **Risk**: Creator fails to update views before approving reward.
  - *Mitigation*: Creator can update views at any time while the reward is in `PENDING` status. Once approved, the status is permanently `CREDITED` to protect ledger integrity.
- **Risk**: Database connection spikes during high-concurrency slot approvals.
  - *Mitigation*: Row-level locks (`SELECT FOR UPDATE`) are held only for the duration of the short transaction and index-lookup on primary key `id`.

---

## 18. Edge Cases Handled
1. **Odd Division of Pools**: E.g. ₹100 fund, 3 editors $\rightarrow$ 8,500 paise pool divided by 3 slots = 2,833 paise per editor. Integer truncation guarantees sum ($2,833 \times 3 = 8,499 \le 8,500$) never exceeds the pool.
2. **Zero Views**: Yields exactly 0 earnings; does not crash or create invalid rewards.
3. **Huge View Counts**: View counts in excess of the cap are strictly capped at `maximumEditorEarning`.
4. **Platform Fee Edge Cases**: Fee percentages $< 0$ or $\ge 100$ are rejected by validators.
5. **Simultaneous Final Slot Claim**: Concurrency test proves that two simultaneous approvals on the last remaining slot result in strictly 1 approval and 1 rejection (HTTP 409).

---

## 19. Performance Considerations
- All campaign slot counts are maintained via efficient indexed SQL queries (`@@index([campaignId, status])`).
- Pure financial math is isolated in `EarningsCalculationService` with zero database round-trips for maximum execution speed.
- Next.js production build is optimized with static page generation and server-side components.

---

## 20. Verification Steps Performed
1. `pnpm --filter @creatorflow/api test -- --run`: All 38 tests passed.
2. `pnpm --filter @creatorflow/api typecheck`: Passed with zero TypeScript errors.
3. `pnpm --filter @creatorflow/api build`: Built production server distribution cleanly.
4. `pnpm --filter @contentrewards/web lint`: Passed with zero TypeScript errors.
5. `pnpm --filter @contentrewards/web build`: Generated optimized Next.js production output across all 25 routes.

---

## 21. Business Rules Compliance Confirmation
All business requirements are **100% satisfied**:
- Platform fee is calculated first (15%).
- Editor pool is 85%.
- Editor slots divide the pool equally to produce the maximum earning per editor.
- View-based earnings scale at the specified rate per 1,000 views.
- Earnings are capped at the slot maximum.
- All monetary operations use integer minor units (paise).
- Slot concurrency is protected with atomic transactions and row locks.
- Social platforms are strictly Instagram and YouTube.
- Theme, card styling, and dummy image placeholders match the required navy design.
