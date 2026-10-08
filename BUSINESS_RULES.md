# Business Rules – CreatorFlow Campaign & Earnings System

## 1. Overview & Roles
- **Creator** – Creates, funds, and publishes campaigns; configures editor slot caps and view rates; reviews pitches and content submissions; verifies published URLs and view counts; releases calculated rewards.
- **Editor** – Discovers campaigns (strictly Instagram & YouTube); applies with pitch/portfolio; creates and uploads content; publishes on verified social channels; earns view-based rewards capped at the slot maximum.
- **Admin** – Platform stewardship: fee setting configuration (`platformFeePercentage`), user management, audit trail inspection, and dispute reconciliation.

---

## 2. Campaign Financial & Slot Model (Authoritative Formula)

### A. The 15/85 Platform Fee Rule
The platform fee is calculated **FIRST** from the gross `campaignFund`. It is **never** deducted after slot allocation.

1. **Campaign Fund (`campaignFund`)**:
   Total maximum budget allocated by creator (in integer minor units, e.g. paise).
2. **Platform Fee (`platformFee`)**:
   $$\text{platformFee} = \lfloor \text{campaignFund} \times \frac{\text{platformFeePercentage}}{100} \rfloor$$
   *Default:* `platformFeePercentage = 15%`.
3. **Editor Reward Pool (`editorRewardPool`)**:
   $$\text{editorRewardPool} = \text{campaignFund} - \text{platformFee}$$
   (Guaranteed 85% of total campaign fund under default 15% fee).
4. **Editor Slots (`editorSlots`)**:
   Positive integer ($\ge 1$) configured by the creator representing the maximum number of approved editors.
5. **Maximum Editor Earning (`maximumEditorEarning`)**:
   $$\text{maximumEditorEarning} = \lfloor \frac{\text{editorRewardPool}}{\text{editorSlots}} \rfloor$$
   This is the strict upper ceiling on what any individual editor can earn from this campaign.

---

## 3. Verified View-Based Earning Model

Editor payouts scale with verified viewership up to the editor slot ceiling:

1. **Minimum Views (`minimumViews`)**:
   Minimum verification threshold required for campaign deliverables.
2. **Earning Rate per 1,000 Views (`earningPer1000Views`)**:
   Configured in integer minor units (e.g. ₹8.50 = 850 paise).
3. **Calculated Earnings**:
   $$\text{calculatedEarning} = \lfloor \frac{\text{verifiedViews}}{1000} \times \text{earningPer1000Views} \rfloor$$
4. **Capped Final Earning**:
   $$\text{finalEditorEarning} = \min(\text{calculatedEarning}, \text{maximumEditorEarning})$$

### View Milestone Proof Matrix (Example: ₹1,000 Fund, 10 Slots, ₹8.50 / 1k views)
- **Campaign Fund**: ₹1,000 (100,000 paise)
- **15% Platform Fee**: ₹150 (15,000 paise)
- **85% Editor Pool**: ₹850 (85,000 paise)
- **Maximum Per Editor**: ₹85 (8,500 paise)

| Verified Views | Calculated Rate | Final Editor Earning | Status |
|:---|:---|:---|:---|
| 0 views | ₹0.00 | **₹0.00** | Active |
| 1,000 views | 1 × ₹8.50 = ₹8.50 | **₹8.50** | Active |
| 2,000 views | 2 × ₹8.50 = ₹17.00 | **₹17.00** | Active |
| 5,000 views | 5 × ₹8.50 = ₹42.50 | **₹42.50** | Active |
| 10,000 views | 10 × ₹8.50 = ₹85.00 | **₹85.00** | **Cap Reached** |
| 20,000 views | 20 × ₹8.50 = ₹170.00 | **₹85.00** | **Strictly Capped** |
| 50,000 views | 50 × ₹8.50 = ₹425.00 | **₹85.00** | **Strictly Capped** |
| 100,000 views | 100 × ₹8.50 = ₹850.00 | **₹85.00** | **Strictly Capped** |

---

## 4. Slot Concurrency & Capacity Management

1. **Slot Consumption**:
   - Submitting an application does **NOT** consume an editor slot.
   - Only **approving** an application (`status = APPROVED`) consumes an editor slot.
2. **Atomic Slot Lock**:
   - Application approval executes inside an isolated database transaction with a row-level lock (`SELECT id, "editorSlots" FROM "Campaign" WHERE id = ... FOR UPDATE`).
   - Counts existing approved applications within the locked context:
     $$\text{approvedCount} = \text{COUNT}(\text{applications WHERE status = 'APPROVED'}) \le \text{editorSlots}$$
   - If $\text{approvedCount} \ge \text{editorSlots}$, the approval transaction aborts immediately and returns HTTP `409 Conflict` ("Campaign editor slots are full").
3. **Double Application Prevention**:
   - Database uniqueness constraint: `@@unique([campaignId, editorId])` on `CampaignApplication`.
   - Prevents duplicate applications at both database and service layers.

---

## 5. Supported Social Platforms
- Strictly **Instagram** and **YouTube**.
- All API validators, dropdowns, marketplace filters, and UI cards reject or disallow other platforms.

---

## 6. Financial Integrity & Ledgers
1. **Integer Minor Units**: All monetary calculations use integers (paise) with deterministic `Math.floor` truncation. Floating-point currency math is prohibited.
2. **Double-Entry Ledger Protection**:
   - Approval of a reward creates two atomic transactions:
     1. `REWARD` transaction: `+netAmount` to editor's virtual wallet.
     2. `PLATFORM_FEE` transaction: platform ledger accounting.
   - Wallet balances are protected against concurrent double-approvals via status transitions (`PENDING -> CREDITED`).
