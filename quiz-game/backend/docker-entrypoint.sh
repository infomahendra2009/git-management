#!/bin/sh
set -e
if ls prisma/migrations/*/migration.sql >/dev/null 2>&1; then
  echo "Applying database migrations..."
  npx prisma migrate deploy
else
  echo "No migrations found: syncing the schema with 'db push'."
  echo "Run 'docker compose exec api npm run migrate:baseline' once to switch to migrations."
  npx prisma db push --skip-generate
fi
node prisma/seed.js
exec node src/server.js
