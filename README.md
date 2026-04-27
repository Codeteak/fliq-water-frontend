# WaterFlow Frontend

Production-ready Next.js frontend for a water booking platform (20L cans, bottles, subscriptions, scheduled deliveries).

## Tech Stack

- Next.js App Router + TypeScript (strict)
- Tailwind CSS + shadcn/ui + Lucide icons
- TanStack Query + Zustand
- NextAuth (credentials provider calling backend API)
- Axios API client + server fetch wrapper
- Vitest + React Testing Library
- Prettier + ESLint + Husky + lint-staged

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on [http://localhost:3001](http://localhost:3001).
Backend API is expected on `NEXT_PUBLIC_API_URL` (default: `http://localhost:3000`).

## Scripts

- `npm run dev` - Run dev server on 3001
- `npm run build` - Production build
- `npm run start` - Run production server on 3001
- `npm run lint` - ESLint checks
- `npm run typecheck` - TypeScript checks
- `npm run test` - Unit tests
- `npm run format` - Prettier formatting

## Deployment (Vercel)

1. Configure environment variables (`NEXT_PUBLIC_API_URL`, `AUTH_SECRET`, `AUTH_URL`).
2. Set `AUTH_URL` to deployed frontend domain.
3. Deploy to Vercel with standard Next.js settings.
