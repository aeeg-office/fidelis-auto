# Fidelis Auto — Operations Guide

## Deploy (production - VPS 191.218.165.228, service `fidelis-auto`, :3006)

**Critical:** the production Dockerfile is a *runner* stage that only `COPY`s a prebuilt host `.next`.
`npm run build` MUST run on the host before `docker compose build`, or the image is stale.

```bash
cd /opt/fidelis-auto            # app source
npm run build                   # host build (required first)
cd /opt/docker/fidelis-auto     # compose project dir
docker compose build fidelis-auto
docker compose up -d --force-recreate --no-build fidelis-auto
docker ps --filter name=fidelis-auto   # expect healthy
```

For long detached deploys use a systemd transient unit:
```bash
systemd-run --unit=redeploy-fidelis --collect bash /tmp/redeploy.sh
```

## Backup (production DB — before ANY mutating change)
```bash
sudo -u postgres pg_dump hermes_car > /tmp/fidelis_<phase>_pre_$(date +%Y%m%d_%H%M%S).sql
```
Persistent backups also kept in `backups/`. Media lives on the named volume `fidelis-auto-data`
(persisted independently of the container).

## Migrations (manual)
```bash
sudo -u postgres psql -d hermes_car -v ON_ERROR_STOP=1 -f prisma/migrations/<name>/migration.sql
npx prisma generate          # regenerate client after schema change (host)
npm run build
```

## SSH / fleet
- SSH pattern: `timeout 40-540 ssh -o BatchMode=yes -o ConnectTimeout=12 vps '<cmd>'`
- Tunnel: `ssh -N -L 13006:localhost:3006 vps` → browse http://localhost:13006
- `vps` = 191.218.165.228; DB via `sudo -u postgres psql -d hermes_car`

## Health checks
- `docker ps` → healthy via `curl -f http://localhost:3006`
- Logs: `docker logs --tail <n> fidelis-auto`
- Verify public / gated / admin APIs: see Phase 9 sweep in `FIDELIS_AUTO_DEFECT_LEDGER.md`

## Safety rails
- No VPS mutation / deploy / schema change without (a) verified backup, (b) feature branch, (c) owner approval.
- Verify through **both automated testing and real browser interaction**.