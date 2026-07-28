# ATC Trader Site

A landing page advertising the purchase of 1985–1986 Honda ATC 250R and TRX 250R ATVs in any condition. Sellers fill out a contact form and their information is emailed directly to the owner.

## What it does

- **Landing page** (`artifacts/atv-buyer/`) — React/Vite frontend served as a static site. Shows what ATVs are wanted, in any condition, with a seller contact form.
- **API server** (`artifacts/api-server/`) — Express 5 backend that saves leads to a PostgreSQL database and emails the owner when a seller submits the form.

## Stack

- **Runtime:** Node.js 24, TypeScript 5.9
- **Package manager:** pnpm (workspaces)
- **Frontend:** React 19, Vite 7, Tailwind CSS, shadcn/ui
- **Backend:** Express 5, Drizzle ORM, PostgreSQL
- **Email:** Nodemailer (Gmail SMTP with App Password)
- **Validation:** Zod v4, drizzle-zod

## Project layout

```
artifacts/
  atv-buyer/        # React/Vite landing page (static frontend)
  api-server/       # Express API server
lib/
  db/               # Drizzle ORM schema & database connection
  api-spec/         # OpenAPI spec (source of truth for API contract)
  api-client-react/ # Generated React Query hooks (from OpenAPI)
  api-zod/          # Generated Zod schemas (from OpenAPI)
```

## Environment variables

Copy `.env.example` to `.env` and fill in each value before running locally.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/dbname` |
| `GMAIL_ADDRESS` | ✅ | Gmail address that sends and receives lead emails |
| `GMAIL_APP_PASSWORD` | ✅ | Gmail App Password (16-char code from Google account → Security → App passwords). Requires 2-Step Verification to be on. |
| `SESSION_SECRET` | ✅ | Random secret string for session signing (any long random string) |
| `PORT` | ✅ | Port the API server listens on (e.g. `8080`) |

## Running locally

### Prerequisites

- Node.js 24+
- pnpm (`npm install -g pnpm`)
- A PostgreSQL database

### Setup

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Start the API server (in one terminal)
PORT=8080 pnpm --filter @workspace/api-server run dev

# Start the frontend dev server (in another terminal)
pnpm --filter @workspace/atv-buyer run dev
```

The frontend runs on port 5173 by default and proxies API calls to the backend.

### Regenerate API code (after changing openapi.yaml)

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Building for production

```bash
# Build the frontend (outputs to artifacts/atv-buyer/dist/)
pnpm --filter @workspace/atv-buyer run build

# Build the API server (outputs to artifacts/api-server/dist/)
pnpm --filter @workspace/api-server run build

# Run the built API server
PORT=8080 node --enable-source-maps artifacts/api-server/dist/index.mjs
```

## Gmail setup

1. Enable **2-Step Verification** on your Google account
2. Go to **Google Account → Security → App passwords**
3. Create a new App Password (name it anything, e.g. "ATV Site")
4. Copy the 16-character code and set it as `GMAIL_APP_PASSWORD`

Lead emails are sent from and to the same `GMAIL_ADDRESS`. Check your Spam folder on first use and mark as "Not Spam" to train Gmail.
