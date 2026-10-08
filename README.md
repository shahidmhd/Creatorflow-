# Vantage

Vantage is a marketplace for brands, creators, and admins. It covers the paid campaign lifecycle: briefs, asset delivery, creator submissions, editorial review, fraud signals, escrow transactions, and UPI withdrawals.

## Stack

- **Web:** Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **API:** NestJS, TypeScript, Prisma, PostgreSQL
- **Identity:** Clerk-ready server boundaries with role-based permissions
- **Payments:** Razorpay Route-ready wallet and transfer boundaries
- **Infrastructure:** Cloudflare R2, Redis, Meilisearch

## Quick start

1. Copy `.env.example` to `.env` and fill production credentials when needed.
2. Start local infrastructure:

   ```bash
   docker compose up -d
   ```

3. Install dependencies and generate Prisma client:

   ```bash
   npm install
   npm run db:generate
   npm run db:migrate
   ```

### Database and current login demo

The real backend database is PostgreSQL. Its schema is in
[`apps/api/prisma/schema.prisma`](./apps/api/prisma/schema.prisma), and the local
connection is configured by `DATABASE_URL` in `.env`. PostgreSQL is provided by
the `postgres` service in [`docker-compose.yml`](./docker-compose.yml). Docker
must be installed and running before `docker compose up -d` can start it. On
Windows, a local PostgreSQL installation also works; keep the
`postgresql-x64-16` service running and use the database credentials in `.env`.

The Vantage login form now calls the API endpoints
`POST /auth/signup`, `POST /auth/verify-otp`, `POST /auth/login`, and
`POST /auth/logout`; the browser only retains the returned session token. In
development the API returns the OTP in its response as `demoOtp`. Production
must deliver that OTP through an email provider and must use HTTPS.

Brand campaign funding is handled by `POST /campaigns`, `POST
/campaigns/:id/fund`, and `POST /campaigns/:id/settle`. Funding must equal the
campaign pool budget before the campaign becomes `LIVE`. Settlement writes
separate brand `SPEND`, creator `EARNING`, and Vantage `COMMISSION` ledger rows,
only includes snapshots older than the holdback period, and caps payouts at the
remaining pool and per-clip limit. Brand is the only public signup type. Admin
is owner-configured through `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the root
`.env` file and can only use the Login form; Admin cannot sign up publicly.

After PostgreSQL is running, apply the schema before starting the API:

The Prisma CLI loads the root `.env` through `apps/api/prisma.config.ts`, including
when npm runs commands from the API workspace. An existing `DATABASE_URL` in your
terminal takes precedence; remove a stale override with
`Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue` to use `.env`.

```powershell
npm run db:validate
npm run db:generate
npm run db:migrate -- --name add-local-auth
```

If Docker is not installed, install Docker Desktop first and run
`docker compose up -d postgres`. Without PostgreSQL listening on port 5432,
the API can build but signup/login cannot persist users.

Check `http://localhost:4000/health` before testing authentication; it must
report `"database":"connected"`. The local API allows both `localhost:3000`
and `127.0.0.1:3000` as browser origins.

4. Start web and API:

   ```bash
   npm run dev
   ```

   Web runs on `http://localhost:3000`; API and Swagger run on `http://localhost:4000` and `/docs`.

### Windows / PowerShell troubleshooting

If Prisma reports authentication failure for `contentrewards` with a native
Windows PostgreSQL installation, the account from `docker-compose.yml` may not
exist in that installation. The Docker configuration only provisions accounts
inside its own container. From the project directory, run:

```powershell
npm.cmd run db:setup:local
```

Enter the PostgreSQL `postgres` administrator password chosen during installation
when prompted. This command reads `DATABASE_URL` from the root `.env` (an existing
terminal environment variable takes precedence, as it does for the API), creates
the missing application login and database, verifies the application connection,
and applies the committed migrations with `prisma migrate deploy`. It only accepts
local database addresses. Existing roles, passwords, and databases are preserved.
The application login is not granted superuser or database-creation privileges;
creating new migrations with `migrate dev` needs a separately configured shadow
database or appropriate development privileges.

PostgreSQL installations under `C:\Program Files\PostgreSQL` are detected
automatically. For another location, set `PSQL_PATH` to the `psql` executable
(version 15 or newer); set `PGUSER` if your administrator login is not `postgres`.
Then restart the API and check `http://localhost:4000/health` for
`"database":"connected"`.

Start only the web app when you are checking `http://localhost:3000`:

```powershell
Set-Location "C:\Users\user\Downloads\New Work"
npm.cmd run dev --workspace @contentrewards/web
```

If port 3000 was left occupied by a stale Next process, close that terminal or
stop only the process shown by `Get-NetTCPConnection -LocalPort 3000`, then run
the command again. The first request can take a few seconds while Next compiles
the homepage; wait for `✓ Ready` before refreshing the browser.

Run npm from the project directory, not from `C:\Windows`:

```powershell
Set-Location "C:\Users\user\Downloads\New Work"
npm.cmd install
```

If PowerShell reports that `npm.ps1` cannot be loaded because script execution is
disabled, use `npm.cmd` as shown above. Alternatively, enable locally-created
scripts for your Windows user (no administrator terminal required):

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Close and reopen the terminal after changing the policy, then run:

```powershell
Set-Location "C:\Users\user\Downloads\New Work"
npm install
```

The `EPERM ... C:\Windows\package-lock.json` error happens when `npm install` is
run while the current directory is `C:\Windows`; it is not caused by the project
dependencies. Do not run the install as Administrator and do not create or edit a
lockfile under `C:\Windows`.

To start the complete local application without PowerShell execution-policy or
PATH issues, double-click `start-dev.cmd` from this project folder. It starts
both services after installing dependencies and generating the Prisma client.

## Project structure

```text
apps/
  api/   NestJS REST API, Prisma schema, modules and tests
  web/   Next.js public site and role-based application shell
```

## Security and integrations

All external integrations are environment-gated. The API validates request bodies with DTOs, applies global throttling and security headers, documents endpoints with Swagger, and records audit events for state-changing operations. Configure Clerk, Razorpay, R2, Redis, and Meilisearch credentials before enabling those flows in production; missing credentials fail explicitly rather than presenting simulated success.

## Deployment

The web app can be deployed to Vercel. The API is container-ready for Railway or any Node-compatible service. Set the same environment variables from `.env.example` in the target environment, run `npm run db:migrate`, and configure the Razorpay webhook endpoint as:

```text
https://<api-domain>/webhooks/razorpay
```

Use a managed PostgreSQL/Redis instance in production and configure object storage lifecycle rules for uploaded media.
