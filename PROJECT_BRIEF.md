# Project Brief – CreatorFlow

**Purpose**: A creator‑editor content‑rewards marketplace where creators launch campaigns, editors fulfill content, and both are compensated via a virtual wallet.

**Key Roles**
- **Creator** – launches campaigns, reviews submissions, and releases reward.
- **Editor** – applies to campaigns, creates content, publishes on social platforms, and receives reward.
- **Admin** – manages platform data, audits, and configures settings.

**Technology Stack**
- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query, Framer Motion.
- **Backend**: Node.js, Express.js, TypeScript, REST API.
- **Database**: PostgreSQL with Prisma ORM (UUID primary keys, integer minor‑unit money).
- **Auth**: Supabase Auth.
- **Uploads**: Cloudinary.
- **Monorepo**: Turborepo (pnpm).
- **Testing**: Vitest, Supertest, Playwright.

**Core Concepts**
- Virtual money only (no real‑payment integration).
- Platform fee configurable, default 15 % of the campaign reward.
- All financial operations are ledger‑based via `WalletTransaction`.

**Scope**
- No social‑media API integrations, no video editor, no real‑money payments.
- Focus on the end‑to‑end creator → editor → reward flow.
