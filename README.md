# Reach Your Peak — Colorado Springs Wellness Portal

This is the wellness portal for the City of Colorado Springs. It is being rebuilt as a modern, personalized platform built around three things: content tailored to each member's interests, challenges, and participation-based rewards.

- **Plan and roadmap:** [docs/redesign-plan.md](docs/redesign-plan.md)
- **Market research** (Wellable and similar platforms): [docs/research/2026-11-market-scan.md](docs/research/2026-11-market-scan.md)

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Server Components). Route protection lives in `src/proxy.ts`; Next 16 renamed middleware to proxy |
| Database | Microsoft SQL Server 2022 (`WellnessPortal`), accessed through Prisma 7 and the `@prisma/adapter-mssql` driver. Migrations are in `prisma/migrations/` |
| Auth | Better Auth with email and password. Microsoft Entra ID single sign-on turns on when the `MICROSOFT_*` variables are set |
| UI | Tailwind CSS v4 with Reach Your Peak design tokens (`src/app/globals.css`), lucide icons, Plus Jakarta Sans. Light and dark mode both work |
| Hosting | Azure Container Apps (subscription "Wellness Portal", resource group `rg-wellness-portal`, Central US). Images are built in Azure Container Registry; secrets live in Key Vault. See `infra/` |

> Next.js 16 changed some APIs. Check `node_modules/next/dist/docs/` before relying on older patterns (see [AGENTS.md](AGENTS.md)).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`, then fill in:
   - `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: the SQL Server connection. Set `DB_TRUST_SERVER_CERTIFICATE=true` for a self-signed certificate
   - `BETTER_AUTH_SECRET`: generate one with `openssl rand -base64 32`
   - `BETTER_AUTH_URL`: the app's URL

3. Set up the database and start the app:

   ```bash
   npm run db:migrate    # apply prisma/migrations to the database
   npm run db:seed       # load tags, habits, points rules, reward tiers, challenges and starter content
   npm run dev           # http://localhost:3000
   ```

4. Sign up through the app, then give your account admin access:

   ```bash
   npm run make-admin -- you@example.com
   ```

## Scripts

| Script | Purpose |
|---|---|
| `dev` / `build` / `start` | Next.js |
| `lint` / `typecheck` | ESLint and TypeScript checks |
| `db:generate` | Regenerate the Prisma client (also runs after `npm install`) |
| `db:migrate:dev` | Create a new migration after changing `prisma/schema.prisma` (needs a scratch database; see below) |
| `db:migrate` | Apply pending migrations (`prisma migrate deploy`) |
| `db:studio` | Prisma Studio, a database browser |
| `db:seed` | Load reference data. Safe to run more than once |
| `make-admin` | Give a user the admin role |

## Project layout

```
src/
  app/
    (auth)/        sign-in, sign-up
    (app)/         member area: Today, Explore, Challenges, Progress, Rewards, Profile, Admin
    legacy/        the original May 2026 UI, kept as a feature reference until each area is rebuilt
    api/auth/      Better Auth handler
  components/
    ui/            Button, Card, Badge, ProgressRing, EmptyState, PageHeader
    shell/         app shell (desktop sidebar, mobile bottom tabs)
    brand/         Logo
  db/             Prisma client (lazy, SQL Server adapter)
  generated/      generated Prisma client (git-ignored)
  lib/             auth, auth client, session helpers, utilities
  server/          server-only data access
  proxy.ts         redirects signed-out visitors to the sign-in page
scripts/           seed and admin command-line scripts
prisma/           schema.prisma and SQL migrations
```

## Conventions

- **Colors:** Components use the semantic color names (`bg-surface`, `text-ink-muted`, `bg-primary`, `text-path-body`, and so on), never raw hex values. This keeps the brand and dark mode consistent.
- **Auth checks:** Every page and server action must call `requireUser()` or `requireAdmin()`. `proxy.ts` only checks for a session cookie, so it can't confirm the user is real.
- **Points:** `points_ledger` is append-only, and each award is unique per `(user, source_type, source_id)`. To correct a mistake, add a new row with the `adjustment` category.

## SQL Server notes

- **Enum-like columns:** Prisma's SQL Server connector has no enums or JSON columns. Enum-like columns are short strings, and their allowed values live in [src/lib/domain.ts](src/lib/domain.ts); validate input with `z.enum(...)`. JSON is stored as `NVARCHAR(MAX)` text.
- **Delete rules:** SQL Server rejects tables that a delete can reach by more than one cascade path. Every relation therefore states its `onDelete` and `onUpdate` rules, and only rows owned by a user cascade when that user is deleted. Before deleting a user, clear `teams.captain_id` in app code.
- **Filtered index:** The init migration includes a hand-written filtered unique index on `activity_entries`. It makes device re-syncs idempotent while still allowing any number of manual entries.
- **New migrations:** `prisma migrate dev` needs a disposable "shadow" database. Point `shadowDatabaseUrl` in `prisma.config.ts` at a scratch database before running it, or generate the SQL with `prisma migrate diff` and review it by hand.
- **Firewall:** All traffic from the app leaves through one fixed IP address, the NAT gateway's **74.249.207.99**. Allow only that address (plus your admin workstation) through the SQL Server firewall on port 1433. Check it at any time with `infra/deploy.sh egress`.

## Deploying to Azure

All infrastructure is defined in [infra/main.bicep](infra/main.bicep), and [infra/deploy.sh](infra/deploy.sh) drives the deployment. Run the script from Git Bash with the Azure CLI signed in. It never changes your default subscription.

```bash
infra/deploy.sh            # create or update infrastructure, build images in ACR, roll out a new revision
infra/deploy.sh migrate    # run `prisma migrate deploy` as a Container Apps job
infra/deploy.sh seed       # load reference data as a job
infra/deploy.sh admin you@example.com   # make a signed-up user an admin
infra/deploy.sh egress     # print the outbound IP the app uses
```

The script reads `DB_*` and `PROD_BETTER_AUTH_SECRET` from `.env.local` and stores the two secrets in Key Vault. The container app reads those secrets through its managed identity. Images are built in the cloud (`az acr build`), so you don't need Docker locally.

| Resource | Name |
|---|---|
| Resource group | `rg-wellness-portal` |
| Container app (web) | `wellness-portal` |
| Migration job | `job-wellness-portal-migrate` |
| Environment | `cae-wellness-portal` |
| Registry / Key Vault | `acrwp…` / `kvwp…` (unique suffix) |
| Logs | `log-wellness-portal` (Log Analytics) |
| Network | `vnet-wellness-portal` (10.40.0.0/16). Apps run in `snet-apps` |
| Fixed outbound IP | NAT gateway `ng-wellness-portal` with public IP `pip-wellness-portal-nat` (**74.249.207.99**) |
