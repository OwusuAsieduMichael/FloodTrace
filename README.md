# FloodTrace

Camera-verified flood & drainage reporting platform for Ghanaian municipalities (Accra, Kumasi). A single responsive Next.js web app with two experiences: mobile-first citizen reporting and a desktop-first authority operations dashboard.

## Stack

- Next.js App Router + React + strict TypeScript
- Tailwind CSS + shadcn/ui + Radix + Framer Motion
- Firebase Authentication + Firestore + Storage (role-based: citizen/authority/admin)
- MapLibre GL JS for maps
- OpenWeather API for weather context
- Firebase Cloud Messaging for notifications
- React Hook Form + Zod for validation
- Zustand for client UI state, TanStack Query for server state
- Offline-first: Service Worker + IndexedDB via Dexie.js

## Getting started

```bash
npm install
cp .env.local.example .env.local  # fill in real Firebase/MapTiler/OpenWeather values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Incident lifecycle

`SUBMITTED → PENDING_REVIEW → VERIFIED → ASSIGNED → RESOLVED` (or `REJECTED`). Duplicate reports are grouped as primary + supporting reports and are never deleted.
