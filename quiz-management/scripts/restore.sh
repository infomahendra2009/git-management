#!/bin/sh
# Restore a backup made by the backup service.
#   ./scripts/restore.sh backups/db_2026-01-01_020000.sql.gz [backups/uploads_2026-01-01_020000.tar.gz]
# WARNING: this replaces the current database contents.
set -e
[ -f "$1" ] || { echo "Usage: $0 <db_backup.sql.gz> [uploads_backup.tar.gz]"; exit 1; }
printf "This will OVERWRITE the current database. Type YES to continue: "
read ans
[ "$ans" = "YES" ] || { echo "Cancelled."; exit 1; }

docker compose stop api web
docker compose up -d db
sleep 5
gunzip -c "$1" | docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
echo "Database restored."
if [ -n "$2" ]; then
  docker compose run --rm --no-deps -T api sh -c 'tar -xzf - -C /app/uploads' < "$2"
  echo "Uploads restored."
fi
docker compose up -d
echo "Done."
