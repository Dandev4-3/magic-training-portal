# Deploying Magic Training Portal

## Why Vercel?

Vercel is the company that makes Next.js, so it's the best-supported host for it.
On the **free tier** you get:
- Zero config deploys (push to GitHub → live in ~2 minutes)
- Automatic HTTPS on your custom domain
- Edge CDN, preview deployments for every branch
- Generous limits (100 GB bandwidth/month, unlimited deployments)

The only limitation for the free tier: **SQLite runs in-memory on Vercel's serverless functions** — the database file is wiped between deployments. For production data you need a persistent database (see "Upgrading the database" below). For now, the portal is fully usable for testing and can be migrated to Vercel Postgres or a VPS when you're ready.

---

## Step 1 — Push to GitHub

```bash
cd /path/to/magic-training-portal
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on github.com (private), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/magic-training-portal.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up** (free, use your GitHub account)
2. Click **Add New → Project**
3. Import your `magic-training-portal` repo
4. Vercel auto-detects Next.js — click **Deploy**

Your portal will be live at `magic-training-portal.vercel.app` in about 2 minutes.

---

## Step 3 — Add Environment Variables

In Vercel dashboard → your project → **Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` and paste the result |
| `NEXTAUTH_URL` | `https://portal.magic-training.co.uk` |
| `SMTP_HOST` | Your SMTP server (see `.env.example`) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your email address |
| `SMTP_PASS` | Your email password / app password |
| `SMTP_FROM` | `Magic Training <invoices@magic-training.co.uk>` |

After adding variables, click **Redeploy** (Deployments tab → ⋯ → Redeploy).

---

## Step 4 — Connect your GoDaddy domain

### In Vercel:
1. Project → **Settings → Domains**
2. Click **Add Domain** → type `portal.magic-training.co.uk` → **Add**
3. Vercel shows you a CNAME record to add

### In GoDaddy:
1. Log into GoDaddy → **My Products → DNS** for `magic-training.co.uk`
2. Click **Add New Record**
   - **Type**: CNAME
   - **Name**: `portal`
   - **Value**: the value Vercel gave you (looks like `cname.vercel-dns.com`)
   - **TTL**: 600 (or leave default)
3. Save

DNS propagates in 5–30 minutes. Vercel auto-provisions an SSL certificate once it verifies the record.

---

## Step 5 — Create the first staff account

Once deployed, open a terminal and run the seed script once:

```bash
# Locally (connects to the deployed DB via env vars):
npm run seed

# Or use Vercel CLI:
npx vercel env pull .env.local
npm run seed
```

Default login: `admin@magic-training.co.uk` / `Admin1234!`  
**Change this immediately** after first login (Settings → Staff).

---

## Upgrading the database (when ready for production)

The free SQLite setup is perfect for getting started. When you need persistent storage:

### Option A — Vercel Postgres (easiest)
1. Vercel dashboard → **Storage → Create Database → Postgres**
2. It auto-injects `POSTGRES_URL` etc. into your env vars
3. Swap `better-sqlite3` for `@vercel/postgres` in `lib/db.ts`

### Option B — Self-hosted VPS (most control)
Run the portal on a £5/month DigitalOcean or Hetzner droplet:
```bash
# On the VPS:
git clone https://github.com/YOUR_USERNAME/magic-training-portal.git
cd magic-training-portal
npm install
npm run build
# Use PM2 to keep it running:
npm install -g pm2
pm2 start npm --name portal -- start
pm2 save
```
Point your GoDaddy CNAME to the VPS IP instead, and add Nginx + Certbot for HTTPS.

The SQLite file persists on disk with no extra setup — this is the most straightforward production path.

---

## Quick reference

| Task | Where |
|------|-------|
| Redeploy after a code push | Automatic (Vercel watches GitHub main branch) |
| Check deployment logs | Vercel → Deployments → click any build |
| Update env vars | Vercel → Settings → Environment Variables → Redeploy |
| Backup the database | Download `portal.db` from your server (VPS option) |
| Add a staff member | Portal → Staff → Add Staff |
