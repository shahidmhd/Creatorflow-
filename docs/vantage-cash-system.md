# Vantage Cash System

This document is the implementation contract for pooled campaign funds and creator payouts.

## Money invariants

- Campaigns are prepaid. A campaign cannot pay more than `poolRemaining`.
- `ViewSnapshot` is append-only. A new poll always creates a row.
- Only snapshots older than `holdbackDays` and with no unresolved `FraudFlag` are payable.
- Settlement runs weekly and is idempotent through ledger idempotency keys.
- Gross entitlement is `min(payableViews / 1000 * ratePer1000, maxPayoutPerClip)`.
- Commission is 15% of gross; the creator receives gross minus commission.
- Wallet availability is derived from `LedgerEntry` rows. `Wallet` has no mutable balance.
- A withdrawal reserves funds by writing a negative `WITHDRAWAL` ledger row. It is only considered paid after the payout provider webhook marks it `PAID`.

## Backend endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /wallet` | Derived available and lifetime earnings |
| `GET /wallet/transactions` | Wallet transaction history |
| `POST /wallet/withdraw` | Creates a pending withdrawal and reserves funds |
| `POST /settlements/run` | Runs settlement for all active campaigns |
| `POST /settlements/run?campaignId=<uuid>` | Runs one campaign settlement |

The settlement endpoint must be protected by admin/RBAC middleware before production exposure. The current project already has throttling, validation, Helmet, CORS, and Swagger enabled in the Nest bootstrap.

## Required production jobs

1. Daily social polling creates `ViewSnapshot` rows and runs fraud checks.
2. Weekly settlement calls `SettlementService.settleActiveCampaigns()`.
3. Razorpay/Cashfree payout webhooks transition withdrawals from `PROCESSING` to `PAID` or `FAILED`.
4. Failed withdrawals must create a compensating ledger entry before funds become available again.

## Database setup

```powershell
npm run prisma:generate --workspace @contentrewards/api
npm run prisma:migrate --workspace @contentrewards/api
```

Set `DATABASE_URL` in `.env` before running migrations. Never place provider secrets in source control.

