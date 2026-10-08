# ContentRewards API

NestJS REST API backed by PostgreSQL and Prisma.

## Commands

Run from the repository root:

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
npm run build
npm run test
```

The Prisma CLI loads the repository root `.env` through `prisma.config.ts`.
This also applies to direct `npx prisma` commands run from `apps/api`. Explicit
environment variables take precedence over values in `.env`.

The service listens on `API_PORT` (default `4000`), Swagger is available at
`/docs`, and `/health` checks database connectivity. DTO validation is global,
unknown properties are rejected, and throttling is enabled globally.

## Integration boundaries

Clerk, Razorpay, R2, Redis, and Meilisearch are intentionally environment-gated.
The API reports whether each boundary is configured and returns an explicit
service-unavailable response when a required credential is missing. No endpoint
claims an external operation succeeded without a configured integration.
