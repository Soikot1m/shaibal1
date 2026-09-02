#!/bin/sh
# Container start-up: apply the database schema, optionally seed demo data,
# then start the production server.
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

echo "==> Applying database schema"
npx drizzle-kit push --dialect=postgresql --schema=./src/db/schema.ts --url="$DATABASE_URL" --force

# Set SEED_DEMO=true for the very first start only. The seed script wipes and
# recreates all demo content, so never enable it on a live database.
if [ "$SEED_DEMO" = "true" ]; then
  echo "==> Seeding demo data"
  npx tsx src/db/seed.ts
fi

echo "==> Starting Shaibal Tours & Travels on port ${PORT:-3000}"
exec npm start
