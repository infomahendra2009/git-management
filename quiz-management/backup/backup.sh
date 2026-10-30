#!/bin/sh
# Scheduled backups: a database dump and a copy of uploaded images, kept for BACKUP_KEEP_DAYS days.
INTERVAL=$(( ${BACKUP_INTERVAL_HOURS:-24} * 3600 ))
KEEP=${BACKUP_KEEP_DAYS:-14}
mkdir -p /backups

while true; do
  TS=$(date +%Y-%m-%d_%H%M%S)
  echo "[backup] $TS starting"

  if MYSQL_PWD="$DB_PASSWORD" mysqldump -h "${MYSQL_HOST:-db}" -u "$DB_USER" \
       --single-transaction --routines --no-tablespaces --set-gtid-purged=OFF "$DB_NAME" > "/backups/db_$TS.sql" \
     && gzip -f "/backups/db_$TS.sql"; then
    echo "[backup] database saved: db_$TS.sql.gz"
  else
    echo "[backup] DATABASE BACKUP FAILED"
    rm -f "/backups/db_$TS.sql" "/backups/db_$TS.sql.gz"
  fi

  if [ -d /uploads ] && tar -czf "/backups/uploads_$TS.tar.gz" -C /uploads . 2>/dev/null; then
    echo "[backup] uploads saved: uploads_$TS.tar.gz"
  else
    echo "[backup] uploads backup skipped or failed"
    rm -f "/backups/uploads_$TS.tar.gz"
  fi

  find /backups -type f \( -name 'db_*' -o -name 'uploads_*' \) -mtime +"$KEEP" -delete
  sleep "$INTERVAL"
done
