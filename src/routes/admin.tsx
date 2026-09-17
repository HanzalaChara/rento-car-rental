import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import type { BlockedPeriod, Booking } from "../types";
import { cars } from "../data/cars";
import { formatPKR } from "../lib/pricing";
import { addDaysISO, formatISO, todayISO, addDaysISO as addDays } from "../lib/dates";
import { carStatusOn } from "../lib/availability";
import { getRepo } from "../data/repo";
import { loadFleetData } from "../lib/fleetQuery";
import { useAsync } from "../lib/useAsync";
import { authMode, DEMO_PASSCODE, isAdminUnlocked, signIn, unlockDemo } from "../lib/auth";
import { Badge, Button, Field, Select, TextInput } from "../ui/primitives";
import clsx from "clsx";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Tab = "board" | "bookings" | "calendar" | "cars";

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  available: { label: "Available", cls: "text-jade border-jade/40 bg-jade/10", dot: "bg-jade" },
  booked: { label: "Booked", cls: "text-rose border-rose/40 bg-rose/10", dot: "bg-rose" },
  blocked: { label: "Blocked", cls: "text-amber border-amber/40 bg-amber/10", dot: "bg-amber" },
  retired: { label: "Retired", cls: "text-mist border-white/20 bg-white/5", dot: "bg-mist" },
};

const BOOKING_META: Record<string, { label: string; tone: "gold" | "green" | "amber" | "rose" | "muted" }> = {
  pending: { label: "Pending", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "gold" },
  active: { label: "On rent", tone: "gold" },
  completed: { label: "Completed", tone: "muted" },
  cancelled: { label: "Cancelled", tone: "rose" },
};

function AdminPage() {
  const [unlocked, setUnlocked] = useState(isAdminUnlocked);
  if (!unlocked) return <AdminLogin onUnlock={() => setUnlocked(true)} />;
  return <AdminDashboard onLock={() => setUnlocked(false)} />;
}

/* ──────────────────────────────── Login ─────────────────────────────────── */

function AdminLogin({ onUnlock }: { onUnlock: () => void }) {
  const mode = authMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "supabase") {
      const res = await signIn(email, password);
      if (res.ok) onUnlock();
      else setError(res.error ?? "Login failed");
    } else {
      if (unlockDemo(passcode)) onUnlock();
      else setError("Wrong passcode — demo passcode is in the README (dev passcode: rento2026).");
    }
  }

  return (
    <main className="container-x flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <div className="text-center">
        <p className="font-display text-3xl font-black text-gradient-gold">RENTO Admin</p>
        <p className="mt-2 text-sm text-mist">
          {mode === "supabase"
            ? "Sign in with your Supabase account to manage the fleet."
            : "Demo mode — enter the passcode to manage demo bookings on this device."}
        </p>
      </div>
      <form onSubmit={tryUnlock} className="card-surface mt-8 space-y-4 p-6">
        {mode === "supabase" ? (
          <>
            <Field label="Email">
              <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Password">
              <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
          </>
        ) : (
          <Field label="Passcode" hint={`Demo passcode: ${DEMO_PASSCODE} (change it in src/lib/auth.ts)`}>
            <TextInput type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} />
          </Field>
        )}
        {error && <p className="rounded-lg border border-rose/30 bg-rose/10 px-3 py-2 text-xs text-rose">{error}</p>}
        <Button type="submit" className="w-full" size="lg">
          Sign In
        </Button>
        {mode === "demo" && (
          <p className="text-center text-[11px] text-mist/70">
            Demo mode stores bookings in this browser only. Set up Supabase (README) for cross-device bookings.
          </p>
        )}
      </form>
    </main>
  );
}

/* ────────────────────────────── Dashboard ───────────────────────────────── */

function AdminDashboard({ onLock }: { onLock: () => void }) {
  const [tab, setTab] = useState<Tab>("board");
  const fleet = useAsync(loadFleetData, []);
  const repo = getRepo();

  const data = fleet.data ?? { bookings: [], blocked: [] };
  const today = todayISO();

  const summary = useMemo(() => {
    const active = cars.filter((c) => c.active);
    const statuses = active.map((c) => carStatusOn(c, data.bookings, data.blocked, today).status);
    return {
      total: active.length,
      available: statuses.filter((s) => s === "available").length,
      booked: statuses.filter((s) => s === "booked").length,
      blocked: statuses.filter((s) => s === "blocked").length,
      pending: data.bookings.filter((b) => b.status === "pending").length,
      pickupsThisWeek: data.bookings.filter(
        (b) => b.status !== "cancelled" && b.startDate >= today && b.startDate <= addDaysISO(today, 7),
      ).length,
    };
  }, [data, today]);

  async function act(fn: () => Promise<void>) {
    try {
      await fn();
      fleet.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
    }
  }

  return (
    <main className="container-x py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-3xl font-black text-gradient-gold">RENTO Admin</p>
          <p className="mt-1 text-xs text-mist">
            {repo.backend === "supabase" ? "Cloud synced (Supabase)" : "Demo mode (this browser)"} · Today: {formatISO(today)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fleet.reload}>
            <ArrowPathIcon className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={onLock}>
            Lock
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Available today", value: summary.available, tone: "text-jade" },
          { label: "Booked today", value: summary.booked, tone: "text-rose" },
          { label: "Blocked", value: summary.blocked, tone: "text-amber" },
          { label: "Pending requests", value: summary.pending, tone: "text-gold" },
          { label: "Pickups next 7 days", value: summary.pickupsThisWeek, tone: "text-cream" },
          { label: "Fleet size", value: summary.total, tone: "text-cream" },
        ].map((c) => (
          <div key={c.label} className="card-surface p-4">
            <p className={clsx("font-display text-3xl font-black", c.tone)}>{c.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-mist">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            ["board", "Fleet Board"],
            ["bookings", `Bookings (${data.bookings.length})`],
            ["calendar", "Calendar"],
            ["cars", "Cars"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              "rounded-full px-5 py-2 text-xs font-semibold transition-all",
              tab === id ? "bg-gold text-night" : "border border-white/10 text-mist hover:border-gold/40 hover:text-gold",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {fleet.loading && <p className="mt-10 text-sm text-mist">Loading fleet data…</p>}
      {fleet.error && (
        <p className="mt-10 rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose">{fleet.error}</p>
      )}

      {!fleet.loading && !fleet.error && (
        <div className="mt-6">
          {tab === "board" && <FleetBoard data={data} />}
          {tab === "bookings" && <BookingsTab data={data} act={act} />}
          {tab === "calendar" && <CalendarTab data={data} />}
          {tab === "cars" && <CarsTab data={data} act={act} />}
        </div>
      )}
    </main>
  );
}

/* ─────────────────────────────── Fleet Board ────────────────────────────── */

function FleetBoard({ data }: { data: { bookings: Booking[]; blocked: BlockedPeriod[] } }) {
  const today = todayISO();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cars
        .filter((c) => c.active)
        .map((car) => {
          const info = carStatusOn(car, data.bookings, data.blocked, today);
          const meta = STATUS_META[info.status];
          const activeBookings = data.bookings
            .filter((b) => b.carId === car.id && ["pending", "confirmed", "active"].includes(b.status))
            .sort((a, b) => a.startDate.localeCompare(b.startDate));
          const next = activeBookings[0];
          return (
            <div key={car.id} className="card-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-semibold text-cream">{car.name}</h3>
                  <p className="mt-0.5 text-xs text-mist">
                    {car.category} · {formatPKR(car.rates.daily)}/day
                  </p>
                </div>
                <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold", meta.cls)}>
                  <span className={clsx("h-2 w-2 rounded-full", meta.dot)} />
                  {meta.label}
                </span>
              </div>
              <div className="mt-4 space-y-1.5 text-xs">
                {info.status === "booked" && info.bookingRef && (
                  <p className="text-rose/90">
                    In use — booking {info.bookingRef}
                    {info.bookedUntil ? ` (until ${formatISO(info.bookedUntil)})` : ""}
                  </p>
                )}
                {info.status === "blocked" && (
                  <p className="text-amber/90">Blocked{info.blockedReason ? ` — ${info.blockedReason}` : " (maintenance)"}</p>
                )}
                {info.status === "available" && next && (
                  <p className="text-mist">
                    Next: {next.ref} · pickup {formatISO(next.startDate)}
                  </p>
                )}
                {info.status === "available" && !next && <p className="text-mist/60">No upcoming bookings</p>}
                {activeBookings.length > 1 && (
                  <p className="text-mist/70">+{activeBookings.length - 1} more upcoming booking(s)</p>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}

/* ─────────────────────────────── Bookings ───────────────────────────────── */

function BookingsTab({
  data,
  act,
}: {
  data: { bookings: Booking[]; blocked: BlockedPeriod[] };
  act: (fn: () => Promise<void>) => void;
}) {
  const repo = getRepo();
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? data.bookings : data.bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "pending", "confirmed", "active", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-xs",
              filter === f ? "bg-gold/15 text-gold" : "text-mist hover:text-cream",
            )}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface p-10 text-center text-sm text-mist">No bookings in this view yet.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const car = cars.find((c) => c.id === b.carId);
            const meta = BOOKING_META[b.status] ?? BOOKING_META.pending;
            return (
              <div key={b.id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gold">{b.ref}</span>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-cream">
                      {car?.name ?? b.carId}{" "}
                      <span className="font-normal text-mist">
                        · {formatISO(b.startDate)} → {formatISO(b.endDate)} ({b.days}d)
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-mist">
                      {b.customerName} · {b.phone} · {b.pickupArea}
                      {b.deliveryRequested ? " · home delivery" : ""}
                      {b.note ? ` · "${b.note}"` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-gold">{formatPKR(b.totalDue)}</p>
                    <p className="text-[11px] text-mist">incl. {formatPKR(b.deposit)} deposit</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
                  {b.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => act(() => repo.updateStatus(b.id, "confirmed"))}>
                        <CheckIcon className="h-3.5 w-3.5" /> Confirm
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => act(() => repo.updateStatus(b.id, "cancelled"))}>
                        <XMarkIcon className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </>
                  )}
                  {b.status === "confirmed" && (
                    <>
                      <Button size="sm" onClick={() => act(() => repo.updateStatus(b.id, "active"))}>
                        <TruckIcon className="h-3.5 w-3.5" /> Hand over car
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => act(() => repo.updateStatus(b.id, "cancelled"))}>
                        <XMarkIcon className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </>
                  )}
                  {b.status === "active" && (
                    <Button size="sm" onClick={() => act(() => repo.updateStatus(b.id, "completed"))}>
                      <CheckIcon className="h-3.5 w-3.5" /> Mark returned
                    </Button>
                  )}
                  <a
                    href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "").replace(/^0/, "92")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#25D366]/15 px-3.5 py-1.5 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/25"
                  >
                    WhatsApp customer
                  </a>
                </div>
              </div>
              );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── Calendar ───────────────────────────────── */

function CalendarTab({ data }: { data: { bookings: Booking[]; blocked: BlockedPeriod[] } }) {
  const days = 30;
  const gridStart = todayISO();

  return (
    <div className="card-surface overflow-x-auto p-5">
      <p className="mb-4 text-xs text-mist">Next 30 days · each row is a car · gold = booked, amber = blocked</p>
      <table className="w-full min-w-[900px] border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="sticky left-0 bg-coal px-2 py-1 text-left text-mist">Car</th>
            {Array.from({ length: days }, (_, i) => {
              const iso = addDays(gridStart, i);
              const d = Number(iso.slice(8));
              return (
                <th key={iso} className="px-0.5 py-1 font-normal text-mist/70">
                  {d}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {cars
            .filter((c) => c.active)
            .map((car) => {
              return (
                <tr key={car.id}>
                  <td className="sticky left-0 bg-coal px-2 py-1 text-left text-cream/85 whitespace-nowrap">{car.name}</td>
                  {Array.from({ length: days }, (_, i) => {
                    const iso = addDays(gridStart, i);
                    const booked = data.bookings.some(
                      (b) =>
                        b.carId === car.id &&
                        ["pending", "confirmed", "active"].includes(b.status) &&
                        b.startDate <= iso &&
                        iso <= b.endDate,
                    );
                    const blocked = data.blocked.some(
                      (p) => p.carId === car.id && p.startDate <= iso && iso <= p.endDate,
                    );
                    return (
                      <td key={iso} className="p-0">
                        <div
                          className={clsx(
                            "h-5 w-4",
                            booked ? "bg-gold/70" : blocked ? "bg-amber/50" : "bg-white/5",
                          )}
                          title={
                            booked
                              ? "Booked"
                              : blocked
                                ? "Blocked"
                                : undefined
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────── Cars ──────────────────────────────────── */

function CarsTab({
  data,
  act,
}: {
  data: { bookings: Booking[]; blocked: BlockedPeriod[] };
  act: (fn: () => Promise<void>) => void;
}) {
  const repo = getRepo();
  const [carId, setCarId] = useState(cars[0].id);
  const [bStart, setBStart] = useState(todayISO());
  const [bEnd, setBEnd] = useState(addDaysISO(todayISO(), 2));
  const [reason, setReason] = useState("");

  const carBlocked = data.blocked.filter((p) => p.carId === carId);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Block dates */}
      <div className="card-surface p-6">
        <h3 className="font-display text-lg font-semibold text-cream">Block Dates (maintenance etc.)</h3>
        <p className="mt-1 text-xs text-mist">Blocked dates cannot be booked by customers.</p>
        <div className="mt-4 space-y-4">
          <Field label="Car">
            <Select value={carId} onChange={(e) => setCarId(e.target.value)}>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From">
              <input type="date" value={bStart} onChange={(e) => setBStart(e.target.value)} className="w-full rounded-xl border border-white/10 bg-graphite px-4 py-3 text-sm text-cream focus:border-gold/60 focus:outline-none" />
            </Field>
            <Field label="To">
              <input type="date" value={bEnd} onChange={(e) => setBEnd(e.target.value)} className="w-full rounded-xl border border-white/10 bg-graphite px-4 py-3 text-sm text-cream focus:border-gold/60 focus:outline-none" />
            </Field>
          </div>
          <Field label="Reason (optional)">
            <TextInput value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Engine service" />
          </Field>
          <Button
            onClick={() =>
              act(async () => {
                if (bStart > bEnd) throw new Error("End date must be after start date");
                await repo.addBlockedPeriod(carId, bStart, bEnd, reason || undefined);
              })
            }
          >
            <PlusIcon className="h-4 w-4" /> Add block
          </Button>

          {carBlocked.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mist">Existing blocks</p>
              <div className="space-y-2">
                {carBlocked.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                    <span className="text-cream/85">
                      {formatISO(p.startDate)} → {formatISO(p.endDate)}
                      {p.reason ? ` · ${p.reason}` : ""}
                    </span>
                    <button
                      onClick={() => act(() => repo.removeBlockedPeriod(p.id))}
                      className="text-rose hover:text-rose/80"
                      title="Remove block"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fleet rates reference */}
      <div className="card-surface p-6">
        <h3 className="font-display text-lg font-semibold text-cream">Fleet & Rates</h3>
        <p className="mt-1 text-xs text-mist">
          Edit rates, cars and photos in <code className="text-gold">src/data/cars.ts</code> — changes appear
          instantly.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-mist">
                <th className="pb-2">Car</th>
                <th className="pb-2 text-right">Daily</th>
                <th className="pb-2 text-right">Weekly</th>
                <th className="pb-2 text-right">Monthly</th>
                <th className="pb-2 text-right">Deposit</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((c) => (
                <tr key={c.id} className="border-t border-white/5">
                  <td className="py-2 text-cream/85">{c.name}</td>
                  <td className="py-2 text-right text-gold">{c.rates.daily.toLocaleString()}</td>
                  <td className="py-2 text-right text-mist">{c.rates.weekly.toLocaleString()}</td>
                  <td className="py-2 text-right text-mist">{c.rates.monthly.toLocaleString()}</td>
                  <td className="py-2 text-right text-mist">{c.rates.deposit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
