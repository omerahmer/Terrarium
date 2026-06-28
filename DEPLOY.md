# Deploying Terrarium

Terrarium is four pieces:

| Piece | Hosts on | What it is |
|-------|----------|------------|
| Frontend (React/Vite static) | **Vercel** | the canvas UI |
| Go API | **Railway** | thin proxy → AI service |
| Python AI | **Railway** | Terraform generation + review (Anthropic + Terraform CLI) |
| Auth + project storage | **Supabase** | Postgres + auth, talked to directly by the frontend |

You run these steps — they require creating accounts and entering secrets, which can't be automated for you. All three platforms have free tiers sufficient to start.

Order matters: **Supabase → Railway → Vercel → wire CORS back**.

---

## 1. Supabase (auth + database)

1. Create a project at <https://supabase.com> (free tier).
2. **SQL Editor → New query** → paste the contents of [`supabase/migrations/0001_projects.sql`](supabase/migrations/0001_projects.sql) → **Run**. This creates the `projects` table and per-user row-level security.
3. **Project Settings → API** → copy:
   - **Project URL** → this is `VITE_SUPABASE_URL`
   - **anon / public** key → this is `VITE_SUPABASE_ANON_KEY` (public-safe; RLS protects the data)
4. (Optional, for easy testing) **Authentication → Providers → Email** → turn **off "Confirm email"** so sign-up logs in immediately. Leave it on for real use.

---

## 2. Railway (Go API + Python AI)

Create a project at <https://railway.app> from your GitHub repo, then add **two services** pointing at the same repo with different root directories.

### Service: `ai` (Python)
- **Root directory:** `ai`
- Build: uses `ai/Dockerfile` automatically. (It bakes in the Terraform CLI + AWS provider; first build is a few minutes.)
- **Variables:**
  - `ANTHROPIC_API_KEY` = your key from <https://console.anthropic.com/>
- Railway injects `$PORT`; the Dockerfile already binds it. Once deployed, note its **private** URL (e.g. `ai.railway.internal`) and its public URL.

### Service: `api` (Go)
- **Root directory:** `api`
- Build: uses `api/Dockerfile` automatically.
- **Variables:**
  - `AI_SERVICE_URL` = the **private** URL of the `ai` service, e.g. `http://ai.railway.internal:8000`
    (private networking keeps the AI service off the public internet; if you prefer, use its public `https://…` URL instead)
  - `ALLOWED_ORIGINS` = leave unset for now; you'll set it to the Vercel URL in step 4.
- Generate a public domain for this service (Settings → Networking). This URL is your `VITE_API_URL`.

> The Go service honors `$PORT`; the AI service listens on `$PORT` too. No code changes needed per service.

---

## 3. Vercel (frontend)

1. Import the repo at <https://vercel.com>.
2. **Root directory:** `frontend`. Framework auto-detects as Vite; [`frontend/vercel.json`](frontend/vercel.json) sets the build + SPA rewrites (so `/app`, `/login`, `/account` work on refresh).
3. **Environment Variables:**
   - `VITE_API_URL` = the Go `api` public URL from step 2
   - `VITE_SUPABASE_URL` = from step 1
   - `VITE_SUPABASE_ANON_KEY` = from step 1
4. Deploy. Note the resulting URL, e.g. `https://terrarium-xyz.vercel.app`.

> Vite env vars are baked at **build time**, so after changing any `VITE_*` value you must redeploy.

---

## 4. Wire CORS back to the frontend

1. In Railway → `api` service → Variables, set:
   - `ALLOWED_ORIGINS` = your Vercel URL (e.g. `https://terrarium-xyz.vercel.app`). Comma-separate if you have multiple (e.g. a preview domain).
2. Redeploy the `api` service.

---

## 5. Smoke test the live app

1. Open the Vercel URL → **Sign in** → create an account (confirm email if enabled).
2. Build a small canvas → **Projects → Save** → reload → reopen it.
3. **Generate Terraform** → it should round-trip through `api` → `ai` and return validated HCL. (If you get a CORS error, recheck `ALLOWED_ORIGINS`; if a 502, recheck `AI_SERVICE_URL`.)

---

## Notes & costs

- **Every Generate/Review is a real Anthropic API charge.** Auth is in place, but if you make the app public, add rate limiting before sharing widely.
- **Free-tier behavior:** Supabase pauses inactive projects after ~1 week (resume from the dashboard). Railway's free usage is limited; the `ai` image is large, so watch build minutes.
- **Local dev still works unchanged:** `cp .env.example .env`, set `ANTHROPIC_API_KEY`, `docker compose up --build`. Set `frontend/.env.local` with your Supabase vars to exercise auth locally (see `frontend/.env.example`).
- **Custom domain:** add it in Vercel, then add that origin to `ALLOWED_ORIGINS` on the Go service.
