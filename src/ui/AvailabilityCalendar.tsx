import { useMemo, useState } from "react";
import type { BlockedPeriod, Booking, Car } from "../types";
import { formatISO, todayISO, toISO } from "../lib/dates";
import { blockingBookings, blockedPeriodsFor } from "../lib/availability";
import clsx from "clsx";

interface Props {
  car: Car;
  bookings: Booking[];
  blocked: BlockedPeriod[];
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function AvailabilityCalendar({ car, bookings, blocked }: Props) {
  const today = todayISO();
  const [monthOffset, setMonthOffset] = useState(0);

  const months = useMemo(() => {
    const result: { label: string; days: (string | null)[] }[] = [];
    const now = new Date();
    for (let i = 0; i < 2; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + monthOffset + i, 1);
      const label = d.toLocaleDateString("en-PK", { month: "long", year: "numeric" });
      const firstDow = d.getDay();
      const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const cells: (string | null)[] = Array(firstDow).fill(null);
      for (let day = 1; day <= daysInMonth; day++) {
        cells.push(toISO(new Date(d.getFullYear(), d.getMonth(), day)));
      }
      result.push({ label, days: cells });
    }
    return result;
  }, [monthOffset]);

  const carBookings = blockingBookings(bookings, car.id);
  const carBlocked = blockedPeriodsFor(blocked, car.id);

  function dayKind(iso: string): "past" | "booked" | "blocked" | "free" {
    if (iso < today) return "past";
    for (const b of carBookings) {
      if (b.startDate <= iso && iso <= b.endDate) return "booked";
    }
    for (const p of carBlocked) {
      if (p.startDate <= iso && iso <= p.endDate) return "blocked";
    }
    return "free";
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
          disabled={monthOffset === 0}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-mist hover:border-gold/40 hover:text-gold disabled:opacity-30"
        >
          ← Prev
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-mist">Availability · next 2 months</p>
        <button
          onClick={() => setMonthOffset((m) => Math.min(6, m + 1))}
          disabled={monthOffset === 6}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-mist hover:border-gold/40 hover:text-gold disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {months.map((month) => (
          <div key={month.label}>
            <p className="mb-3 text-sm font-semibold text-cream">{month.label}</p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAY_LABELS.map((d, i) => (
                <span key={i} className="pb-1 text-[10px] font-semibold uppercase text-mist/60">
                  {d}
                </span>
              ))}
              {month.days.map((iso, i) => {
                if (!iso) return <span key={`x${i}`} />;
                const kind = dayKind(iso);
                return (
                  <span
                    key={iso}
                    title={
                      kind === "booked"
                        ? "Booked"
                        : kind === "blocked"
                          ? "Unavailable"
                          : kind === "past"
                            ? undefined
                            : "Available"
                    }
                    className={clsx(
                      "flex h-8 items-center justify-center rounded-md text-xs",
                      kind === "free" && "text-cream/80 hover:bg-gold/10",
                      kind === "past" && "text-mist/25",
                      kind === "booked" && "bg-rose/20 text-rose/90 font-semibold",
                      kind === "blocked" && "bg-amber/20 text-amber/90",
                    )}
                  >
                    {Number(iso.slice(8))}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-mist">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose/70" /> Booked
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber/70" /> Maintenance
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-jade/70" /> Available
        </span>
      </div>
      <p className="mt-2 text-[11px] text-mist/70">
        Live calendar — updates instantly when a booking is confirmed. Today is {formatISO(today)}.
      </p>
    </div>
  );
}
