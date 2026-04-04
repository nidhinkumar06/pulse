# ☁️ NeonDB + Prisma + Cloud Run — Deployment Guide

## Architecture

```
Internet
    │
    ▼
Cloud Run  (stateless containers, auto-scaling)
    │  pulse
    │  ├── orchestratorAgent
    │  ├── taskAgent  ──┐
    │  ├── calendarAgent├── Prisma Client ──▶ NeonDB (pgBouncer pooler)
    │  └── notesAgent  ─┘                    Serverless PostgreSQL
    │
    └──── HTTPS ──▶ Gemini API
```

**Why NeonDB is perfect for Cloud Run:**
- Serverless PostgreSQL — no always-on server cost
- Built-in pgBouncer pooler — handles Cloud Run's bursty connections safely
- Connects over plain SSL — no Unix socket, no VPC peering, no proxy sidecar
- Free tier covers most dev and light production workloads

---

## Step 1 — Create a NeonDB Project

1. Go to → **https://console.neon.tech**
2. Click **New Project** → pick a region near your Cloud Run region (e.g. `us-east-1`)
3. Once created → **Connection Details** → select **Prisma** from the framework dropdown
4. Copy both connection strings:

```env
# Pooled — used by the app at runtime (goes through pgBouncer)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15

# Direct — used ONLY by `prisma migrate` (bypasses pooler)
DIRECT_DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> ⚠️ Both URLs point to the same DB but `DATABASE_URL` has `&pgbouncer=true`.
> Never swap them — Prisma migrations will fail behind pgBouncer.

---

## Step 2 — Local Setup

```bash
cp .env.example .env
# Paste both connection strings into .env

npm install           # also runs `prisma generate` via postinstall hook

npm run db:migrate    # creates tables in NeonDB (enter name e.g. "init")

npm run db:studio     # optional: visual DB browser at http://localhost:5555

npm run dev           # start the API
```

---

## Step 3 — Schema Changes Workflow (future features)

```bash
# 1. Edit prisma/schema.prisma  (add model, field, relation, etc.)

# 2. Generate + apply migration locally
npm run db:migrate
# → prompts: "Name your migration" → e.g. "add_reminders_table"
# → creates: prisma/migrations/20250615_add_reminders_table/migration.sql
# → applies it to your NeonDB dev branch

# 3. Commit the migration file
git add prisma/migrations/
git commit -m "db: add reminders table"

# 4. On Cloud Run deploy, the Dockerfile CMD runs automatically:
#      prisma migrate deploy && node dist/index.js
#    This applies pending migrations before the server starts (idempotent, safe)
```

**`migrate dev` vs `migrate deploy`:**
| Command | When | Behaviour |
|---------|------|-----------|
| `prisma migrate dev` | Local development | Creates migration files, can reset DB |
| `prisma migrate deploy` | CI/CD + Production | Applies pending files only, never destructive |

---

## Step 4 — Deploy to Cloud Run

### Store secrets in Secret Manager

```bash
echo -n "AIza..."          | gcloud secrets create google-api-key     --data-file=-
echo -n "postgresql://..." | gcloud secrets create neon-database-url  --data-file=-
echo -n "postgresql://..." | gcloud secrets create neon-direct-url    --data-file=-
```

### Build + push container

```bash
npm run build

export PROJECT_ID=$(gcloud config get-value project)

gcloud builds submit \
  --tag us-central1-docker.pkg.dev/$PROJECT_ID/adk/pulse .
```

### Deploy

```bash
gcloud run deploy pulse \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/adk/pulse \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets="GOOGLE_GENAI_API_KEY=google-api-key:latest,DATABASE_URL=neon-database-url:latest,DIRECT_DATABASE_URL=neon-direct-url:latest" \
  --set-env-vars="NODE_ENV=production" \
  --min-instances=0 \
  --max-instances=10 \
  --memory=512Mi
```

On every cold start the container runs:
```
prisma migrate deploy   ← applies any pending migrations to NeonDB (fast, idempotent)
node dist/index.js      ← starts the API
```

### Verify

```bash
SERVICE_URL=$(gcloud run services describe pulse \
  --region us-central1 --format 'value(status.url)')

curl $SERVICE_URL/api/health
# → { "status": "ok", "db": "neondb", ... }

curl -X POST $SERVICE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a high priority task: Deploy to Cloud Run"}'
```


---

## Commands Reference

```bash
npm run db:migrate          # Create + apply a migration (dev)
npm run db:migrate:deploy   # Apply pending migrations only (prod/CI)
npm run db:studio           # Visual DB browser at localhost:5555
npm run db:generate         # Regenerate Prisma client after schema edit
npm run db:reset            # ⚠️ Wipe + reapply all migrations (dev only!)
```
