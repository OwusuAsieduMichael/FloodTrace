# FloodTrace

Camera-verified flood and drainage reporting system for citizens and municipal authorities.

FloodTrace enables structured incident reporting with live camera evidence, automatic GPS capture, role-based dashboards, Supabase-backed data, and a full incident lifecycle from submission through verification, assignment, and resolution.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **Supabase** (Auth, PostgreSQL, Storage, Realtime)

## Getting started

```bash
npm install
cp .env.example .env.local
# Fill in Supabase and API keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database migrations

```bash
npm run db:push
```

### Health checks

- `GET /api/health/supabase` — Supabase connection
- `GET /api/health/schema` — Database schema readiness

## Development status

Phases 1–5 complete: project setup, Supabase config, database schema + RLS, authentication + roles, design system + app shells.

## Environment variables

Copy `.env.example` to `.env.local`. Never commit real secrets — use placeholders in `.env.example` only.

## License

Private — OwusuAsieduMichael/FloodTrace
