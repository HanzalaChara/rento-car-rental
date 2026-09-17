# Deploy RENTO to Vercel — Step-by-Step Guide

Your repo is deploy-ready (I just pushed `vercel.json` so routes like `/fleet` and `/admin` work on refresh). Everything below is free.

---

## Part 1 — Deploy (~5 minutes)

1. **Go to [vercel.com/signup](https://vercel.com/signup)** → click **Continue with GitHub** → log in as `HanzalaChara` and authorize Vercel.

2. **On the dashboard, click "Add New… → Project".**

3. **Find `rento-car-rental` in the repository list** → click **Import**.
   (If it's not listed, click "Adjust GitHub App Permissions" and grant Vercel access to that repo.)

4. **Configure the project — Vercel auto-fills almost everything:**

   | Setting | Value |
   |---|---|
   | Framework Preset | **Vite** (auto-detected) |
   | Root Directory | `./` (leave default) |
   | Build Command | `npm run build` (auto-filled) |
   | Output Directory | `dist` (auto-filled) |
   | Install Command | `npm install` (auto-filled) |

   ⚠️ **Do NOT add any environment variables yet.** No keys = demo mode (bookings stored in the visitor's browser). The site works and looks complete; you add Supabase later.

5. **Click "Deploy".** First build takes 1–2 minutes. You'll get a celebration screen and a URL like:
   `https://rento-car-rental.vercel.app`

6. **Open it on your phone and test:** Home → Fleet → open a car → try the booking wizard → check `/admin` (passcode `rento2026`).

---

## Part 2 — HTTPS

**Nothing to do.** Every `*.vercel.app` URL ships with a valid SSL certificate automatically. Your site is `https://` from the first minute.

---

## Part 3 — Custom domain (`rento.pk` or similar)

1. **Buy the domain** if you haven't: Namecheap, Porkbun, or a PKNIC-registered `.pk` reseller (~PKR 3,500–5,000/year).

2. **In Vercel:** open your project → **Settings → Domains** → type `rento.pk` → **Add**.

3. **Vercel shows you DNS records.** In your domain registrar's DNS settings, add what Vercel asks for:
   - Apex domain (`rento.pk`): an **A record** → `76.76.21.21`
   - Or `www.rento.pk`: a **CNAME record** → `cname.vercel-dns.com`

4. **Wait for DNS to propagate** (5 min–24 h; usually under an hour). Vercel shows a green check when done, and the SSL certificate for your domain is issued automatically.

5. **Set the primary domain:** in Settings → Domains, make `rento.pk` (or `www`) the default so all other domains redirect to it.

---

## Part 4 — Going live for real customers (Supabase)

Demo mode only stores bookings in each visitor's browser — you'd never see them. When you're ready for real bookings:

1. **Create the Supabase project** (free): [supabase.com](https://supabase.com) → New project → name it `rento`, region Singapore/Mumbai (closest to Pakistan).
2. **Run the SQL** from the README's "Database SQL" section in the Supabase SQL Editor.
3. **Create your admin login**: Authentication → Users → Add user (your email + password).
4. **Copy Project URL + anon key** from Settings → API.
5. **In Vercel:** Project → Settings → Environment Variables → add:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
6. **Redeploy:** Deployments tab → ⋯ menu on the latest → **Redeploy**. (Env vars only apply to new builds.)
7. **Test:** make a booking on your phone → open `/admin` on your computer → log in with the Supabase email/password → the booking should be there.

---

## Part 5 — Every future update

Just push code — Vercel auto-deploys:

```bash
git add .
git commit -m "Update fleet rates"
git push
```

Live in ~1 minute. Every deployment also gets a unique preview URL, so you can test changes before they go live.

---

## Quick troubleshooting

| Problem | Fix |
|---|---|
| Build fails on Vercel | Check the build log — most common: a TypeScript error. Run `npm run build` locally first; if it passes locally, the same code passes on Vercel. |
| `/fleet` 404s after refresh | The `vercel.json` rewrite should prevent this. If it happens, confirm the file is in the repo root. |
| Bookings not syncing across devices | You're in demo mode — complete Part 4. |
| Admin login rejects email/password | You're in demo mode (passcode `rento2026`). Supabase login only activates after env vars + redeploy. |
| Domain shows "Invalid configuration" | DNS not propagated yet, or a conflicting record at your registrar. Delete old A/CNAME records pointing elsewhere. |

---

## Monthly cost summary

| Item | Cost |
|---|---|
| Vercel hosting (Hobby plan) | **Free** |
| SSL certificate | **Free** |
| Supabase (free tier) | **Free** — 500 MB database, plenty for bookings |
| Domain | ~PKR 3,500–5,000/year (only real expense) |
