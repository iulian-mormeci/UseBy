# UseBy

Self-hosted service for managing your pantry, fridge and freezer: tracking
products and expiry dates, finding recipes based on what you already have at
home, and reporting missing products by email.

All the logic (product matching, recipe search) is based on database queries
and explicit rules — there is no AI/LLM integration anywhere in the project.

## Stack

- [Next.js 15](https://nextjs.org/) (TypeScript, App Router)
- [Prisma ORM](https://www.prisma.io/) + PostgreSQL
- Docker Compose for deployment (`app`, `db`, `mailhog` in dev)
- [next-intl](https://next-intl.dev/) for the UI (English by default, Italian
  available from the admin panel)

## Local development

Requirements: Node.js 22+, Docker.

```bash
cp .env.example .env   # if not already present
npm install

# start only db + mailhog in Docker
docker compose --profile dev up -d db mailhog

# apply the schema to the database and generate the Prisma client
npm run prisma:migrate:dev
npm run prisma:generate

npm run dev
```

- App: http://localhost:3000
- Mailhog (dev email catcher): http://localhost:8025

### Prisma migrations

```bash
npm run prisma:migrate:dev      # create/apply a migration while developing
npm run prisma:generate         # regenerate the Prisma client after schema changes
npm run prisma:migrate:deploy   # apply pending migrations (used automatically on container start)
```

## Deploying with Docker Compose

Full stack (app + db), with Mailhog available as an optional profile:

```bash
# production: no mailhog, real SMTP relay configured in .env
docker compose up -d --build

# dev/staging: with mailhog included
docker compose --profile dev up -d --build
```

On startup, the `app` container automatically runs `prisma migrate deploy`
before starting (see `docker-entrypoint.sh`).

## Environment variables

See `.env.example` for the full list (Postgres credentials, `DATABASE_URL`,
the app's port, SMTP configuration for missing-product report emails,
`REPORT_EMAIL_TO` as the recipient of those emails).
In production, set `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD` to a
real SMTP relay and skip the `dev` profile when starting the stack.

`SMTP_HOST` depends on how you're running the app: `localhost` for
`npm run dev` on the host (Mailhog publishes port 1025), `mailhog` if you use
docker-compose's `dev` profile (containers' internal network), the real
relay's hostname in production.

## Admin panel

The dashboard, pantry, recipes, barcode scanning and missing-product
reporting stay open to everyone (meant for everyday use by the whole
household). A login instead protects catalog/recipe/location management,
reviewing products scanned but not found elsewhere, and the default
expiry-notice configuration.

To enable it, in `.env`:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH_BASE64=  # see the command below
SESSION_SECRET=$(openssl rand -hex 32)
```

Generate the password hash (base64-encoded so the `$` characters in a bcrypt
hash don't get mangled by docker-compose's variable interpolation):

```bash
node -e "console.log(Buffer.from(require('bcryptjs').hashSync(process.argv[1], 10)).toString('base64'))" "your-password"
```

Log in at `/login`; the panel is reachable from `/admin` (an "Admin" link
appears in the navbar once authenticated).

## Tracking how much of a product is left

Each product has a `usageType` (Pack, Weight, Quantity or Volume) that
determines how its remaining amount is tracked and displayed: a continuous
level gauge for Weight/Volume, a pieces-remaining counter for Quantity, and a
Full/Partial/Nearly empty/Empty step selector for Pack items. This shows up
as an overlay on the product's image on the dashboard.

## Language

The interface defaults to English; a language selector under
`/admin/impostazioni` switches to Italian (persisted in a cookie, since this
is a single-admin app with no user accounts). This only affects the UI —
this README and any other project documentation stay in English regardless
of the selected interface language.
