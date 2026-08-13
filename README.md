# Freeport

Freeport is a curated directory of useful free software, services, media,
learning resources, and other corners of the web. It is built from the
Markdown content of [upstream `fmhy/edit`](https://github.com/fmhy/edit), then
published as a static VitePress site with same-origin Cloudflare Pages
Functions for accounts, feedback, and newsletter registration.

The upstream repository's source files carry Apache-2.0 notices attributed to
taskylizard. Freeport retains those notices and documents its changes in
[`NOTICE`](./NOTICE). The public site applies a build-time transformation so
upstream identity-heavy content is rewritten or excluded.

Repository: <https://github.com/bytepassperks/freeport>

## Branding

All site identity lives in [`brand.config.ts`](./brand.config.ts). Change the
name, tagline, hostname, repository URL, assets, and rewrite aliases there.
The next build updates the site chrome, metadata, manifest, RSS, OG cards, and
content transformation automatically.

## Development and deployment

This repository uses Node 22 and pnpm 10.12.2:

```sh
corepack pnpm install
corepack pnpm docs:dev
corepack pnpm docs:build
corepack pnpm lint
```

The `Deploy Freeport` workflow runs on pushes to `main` and manual dispatch. It
applies pending remote D1 migrations, builds the site, and deploys
`docs/.vitepress/dist` to the `freeport` Cloudflare Pages project. It requires
the GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`.

The `Sync upstream content` workflow runs weekly or manually. It imports
upstream Markdown into a review branch, builds it, checks the generated output
for user-visible upstream branding, and opens a pull request only when those
checks pass. It never auto-merges.

## Data and administration

Cloudflare D1 migrations in [`migrations/`](./migrations) define leads,
accounts, sessions, feedback, and rate-limit tables. Pages Functions provide:

- `POST /api/register` — idempotent newsletter lead capture.
- `POST /api/auth/register` — account creation and session login.
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- `POST /api/feedback` — same-origin feedback submission.
- `GET /api/admin/leads?format=json|csv`.
- `GET /api/admin/users?format=json|csv`.
- `GET /api/admin/feedback?format=json|csv`.

Admin exports require `Authorization: Bearer <ADMIN_TOKEN>`. Rotate
`ADMIN_TOKEN` by generating a new value, uploading it as a production secret
on the Freeport Pages project, and updating the matching operational secret if
one is used for administration. Never place it in repository files or
client-side code.

Email verification is intentionally disabled until an email provider is
configured. Passwords use PBKDF2-SHA256 with per-user salts, and sessions store
only hashed opaque tokens.
