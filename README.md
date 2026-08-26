# FloodTrace

Camera-verified flood and drainage reporting for citizens and municipal authorities.

Citizens submit live camera evidence with automatic GPS and timestamps. Authorities verify, assign, and resolve incidents. The public map shows only verified work, never unverified submissions or private reporter details.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **Supabase** (Auth, PostgreSQL, Storage, Realtime)
- **OpenWeatherMap** (optional; weather is omitted when the key is missing)

## Getting started

```bash
npm install
cp .env.example .env.local
# Fill in Supabase keys (and OpenWeatherMap if you want weather)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database migrations

```bash
npm run db:push
```

Apply the SQL files in `supabase/migrations/` to your Supabase project. Seed data in `supabase/seed.sql` is development-only and labeled `[DEV SEED]`. Never treat it as live statistics.

### Health checks

- `GET /api/health`: public liveness (`{ "ok": true }`)
- `GET /api/health/supabase`, `/schema`, `/storage`: admin session required

## Tests

```bash
npm test              # unit tests (Vitest)
npm run test:e2e      # public-page smoke tests (Playwright)
npm run typecheck
npm run lint
npm run build
```

The first Playwright run needs Chromium:

```bash
npx playwright install chromium
```

Unit tests cover authentication redirects, duplicate matching, report/GPS validation, authority workflow, weather query rules, analytics empty states, offline queue counts, and rate limits. They do not fabricate GPS, weather, or incident statistics.

Camera capture, GPS permission prompts, and signed-in authority flows still need a manual pass on a device with a camera (see the checklist below).

## Deploy (Vercel)

FloodTrace is a Next.js app with server actions, proxy session handling, and signed storage URLs. Deploy it as a Node.js server (Vercel is the intended host).

1. Import `OwusuAsieduMichael/FloodTrace` into Vercel.
2. Set **Production** environment variables (same names as `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (the live `https://…` origin, not localhost)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose to the browser)
   - `OPENWEATHER_API_KEY` (optional)
3. Confirm Supabase Auth redirect URLs include `{NEXT_PUBLIC_APP_URL}/auth/callback`.
4. Redeploy after changing env vars.

Do not commit `.env.local`, service-role keys, or API secrets.

GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, production build, and Playwright smoke tests on `main` and pull requests.

## Manual test checklist

- [ ] Citizen signup / login / password reset
- [ ] Live camera capture (gallery uploads rejected)
- [ ] GPS capture with visible accuracy; submission blocked without a fix
- [ ] Online incident submit
- [ ] Offline queue + sync when back online
- [ ] Nearby duplicate becomes a supporting report
- [ ] Public map shows verified/assigned/resolved only
- [ ] Weather appears only when OpenWeatherMap is configured
- [ ] Notifications for submit / verify / assign / resolve / reject
- [ ] Authority verify, reject, assign, resolve with before/after evidence
- [ ] Analytics empty values stay empty (`None`), not estimates
- [ ] Unauthenticated `/citizen`, `/authority`, and `/admin` redirect to login
- [ ] Layouts work on a phone and a desktop

## Product rules

Never fabricate GPS coordinates, weather, incident statistics, authority responses, or verification status. An incident is verified only after an authority action.

## License

Private: OwusuAsieduMichael/FloodTrace
