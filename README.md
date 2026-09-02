# Shaibal Tours & Travels

Premium travel-agency platform for **Shaibal Tours & Travels, Bogura, Bangladesh** —
public website, tour catalogue, multi-step booking with QR tickets, customer dashboard
with live trip tracking, and a full admin console (bookings, payments, tours, departures,
trip groups, expenses & profit, reviews, support, CMS settings).

**Stack:** Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS 4 ·
Drizzle ORM · PostgreSQL · Framer Motion · Recharts

## Run locally

```bash
npm install
cp .env.example .env            # put your PostgreSQL connection string in DATABASE_URL
npx drizzle-kit push            # create tables (reads DATABASE_URL from .env)
npx tsx src/db/seed.ts          # load demo content (wipes existing data!)
npm run dev                     # http://localhost:3000
```

Demo accounts (change the password after first login — the admin panel reminds you):

| Role | Email | Password |
|---|---|---|
| Admin | admin@shaibaltours.com | shaibal123 |
| Customer | demo@shaibaltours.com | shaibal123 |

## Deploy to production

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** (বাংলা) — covers Vercel + Neon (free),
a VPS with Docker Compose or PM2/Nginx, and Railway/Render. Note that PHP-only hosts
such as InfinityFree cannot run this application (it needs Node.js + PostgreSQL).

## Project layout

```
src/app            routes (public site, /account, /admin, /api)
src/components     UI, cards, booking wizard, planner, admin widgets & charts
src/lib            auth, data access, validation (zod), content/settings, utils
src/db             Drizzle schema, connection, demo seed
public/logo.png    brand mark (also favicon / PWA icon)
Dockerfile         production image (VPS, Railway, Render)
docker-compose.yml app + PostgreSQL in one command
```

All demo tours, destinations, reviews and posts are marked as demo content and can be
edited or replaced from the admin console.
