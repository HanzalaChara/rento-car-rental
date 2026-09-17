# RENTO — Premium Car Rental (Karachi)

A luxury dark + gold, multi-page car rental website for a Karachi-based dealer:
online booking, live availability calendars, JazzCash/EasyPaisa/bank payment
instructions, and the **RENTO Admin** dashboard (Fleet Board · Bookings ·
Calendar · Cars).

Built with **React 19 + Vite + TypeScript + Tailwind CSS v4 + TanStack Router**,
with **Supabase** (optional, free) for cross-device bookings.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5175
```

The site runs **without any accounts** in *demo mode*: bookings are saved to
browser localStorage, and `/admin` opens with the passcode `rento2026`.

> Demo mode is for previewing. For real business use, do the 15-minute Supabase
> setup below so bookings from customers' phones reach your admin dashboard.

---

## Make it yours (one file)

Edit **`src/data/site.ts`**:

- `phone` / `whatsapp` — your real numbers (format: `923001234567`)
- `payments` — JazzCash / EasyPaisa / bank account details
- `deliveryFee`, `areas`, `address`, `hours`, `socials`, `email`

Edit **`src/data/cars.ts`** — add/remove cars, change PKR rates, features.
Set `images: ["/cars/my-car-1.jpg"]` after dropping photos into
`public/cars/`. With no image, a clean placeholder renders
automatically.

Admin passcode (demo mode) lives in **`src/lib/auth.ts`** → `DEMO_PASSCODE`.

---

## Supabase setup (recommended, ~15 minutes, free)

This makes bookings **cloud-synced**: a customer books on their phone → you see
it in `/admin` on yours, and two customers can't grab the same dates.

1. Create a free account at [supabase.com](https://supabase.com) → **New project**
   (name it `rento`, pick a region near Pakistan, set a DB password).
2. Open **SQL Editor** → paste the SQL below → **Run**.
3. Open **Authentication → Users → Add user** → create your own account
   (email + password). This becomes your admin login.
4. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
5. Create a file named **`.env`** in the project root:

   ```bash
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_ADMIN_EMAIL=your-admin-email@example.com
   ```

6. Restart `npm run dev`. The admin login now uses your Supabase email/password,
   and `/booking` writes to the cloud. No other code changes needed.

### Database SQL (paste into Supabase SQL Editor)

```sql
-- ───────────────────────── RENTO schema ─────────────────────────
create table if not exists public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  ref                text unique not null,
  car_id             text not null,
  customer_name      text not null,
  phone              text not null,
  pickup_area        text not null,
  dropoff_area       text,
  delivery_requested boolean not null default false,
  start_date         date not null,
  end_date           date not null,
  days               int  not null check (days >= 1),
  rental_total       numeric(12,2) not null,
  delivery_fee       numeric(12,2) not null default 0,
  deposit            numeric(12,2) not null default 0,
  total_due          numeric(12,2) not null,
  status             text not null default 'pending'
                     check (status in ('pending','confirmed','active','completed','cancelled')),
  note               text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.blocked_periods (
  id         uuid primary key default gen_random_uuid(),
  car_id     text not null,
  start_date date not null,
  end_date   date not null,
  reason     text,
  created_at timestamptz not null default now()
);

-- Prevent overlapping active bookings at the database level (btree_gist)
create extension if not exists btree_gist;
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    car_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status in ('pending','confirmed','active'));

-- Anyone may create a booking (public booking form)…
create policy "public can create bookings"
  on public.bookings for insert to anon with check (true);

-- …but only signed-in admin can read or update them.
create policy "admin can read bookings"
  on public.bookings for select to authenticated using (true);
create policy "admin can update bookings"
  on public.bookings for update to authenticated using (true) with check (true);

create policy "admin manages blocked periods"
  on public.blocked_periods for all to authenticated using (true) with check (true);

-- Public availability calendars need read access to blocking data only.
create policy "public can read blocked periods"
  on public.blocked_periods for select to anon using (true);
```

> **Privacy note:** the SQL above lets anonymous users *read* bookings (needed
> for the public availability calendar to show booked dates). Customer names,
> phones, and notes are in those rows. If that's a concern, either (a) keep
> demo/local mode for calendars and use Supabase only for admin, or (b) later
> replace direct reads with a Postgres function that returns only
> car/date/status columns. Fine for launch; noted here for transparency.
> Keep the project URL private and rotate keys if ever exposed.

---

## Admin dashboard (`/admin`)

- **Fleet Board** — every car with a live pill: 🟢 Available · 🔴 Booked (ref +
  return date) · 🟡 Blocked. Counters: available/booked/blocked today, pending
  requests, pickups next 7 days.
- **Bookings** — filter by status; Confirm → Hand over → Mark returned;
  cancel anytime; one-tap WhatsApp to the customer.
- **Calendar** — 30-day grid: gold = booked, amber = blocked, per car.
- **Cars** — block maintenance dates per car; rate reference table.
- Demo-mode passcode: `rento2026` (change in `src/lib/auth.ts`).
  With Supabase: log in with the user you created in step 3.

---

## Booking flow (what customers see)

1. Car page → pick dates (live estimate incl. weekly/monthly discount).
2. `/booking` wizard → dates + area + delivery → name + phone (+92 validated) →
   review → **Confirm** (no payment online).
3. `/booking/KR-2026-XXXX` confirmation → copy reference, see JazzCash /
   EasyPaisa / bank details, send receipt via pre-filled WhatsApp message.
4. You confirm in `/admin` (or by WhatsApp) and hand over the car.

Double-booking is prevented in three layers: UI re-check on submit, repo-layer
`assertNoOverlap`, and (with Supabase) a database-level exclusion constraint.

---

## Scripts

| Command         | What it does                    |
| --------------- | ------------------------------- |
| `npm run dev`   | Dev server (http://localhost:5175) |
| `npm run build` | Type-check + production build   |
| `npm test`      | Unit tests (pricing & availability) |
| `npm run preview` | Serve the production build    |

## Deploy (free)

Works as a static site on **Vercel, Netlify, or Cloudflare Pages**:

- Build command: `npm run build` · Output directory: `dist`
- Add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as environment variables.

## Tech notes

- Dates are handled as local `yyyy-mm-dd` strings — no timezone drift.
- PKR amounts use `en-PK` grouping via `formatPKR()`.
- The repo layer (`src/data/repo.ts`) is the only place that touches storage —
  swap backends without touching UI.
