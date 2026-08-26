#!/bin/sh
set -e
npx prisma migrate deploy 2>/dev/null || echo Migration skipped
exec node node_modules/.bin/next start
