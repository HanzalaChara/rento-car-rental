import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDaysIcon,
  CheckIcon,
  UsersIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { cars as allCars, getCarBySlug } from "../data/cars";
import { formatPKR } from "../lib/pricing";
import { carInquiryLink } from "../lib/whatsapp";
import { loadFleetData } from "../lib/fleetQuery";
import { useAsync } from "../lib/useAsync";
import { Badge, LinkButton, Button, SectionHeading } from "../ui/primitives";
import { CarImage } from "../ui/CarImage";
import { CarCard } from "../ui/CarCard";
import { AvailabilityCalendar } from "../ui/AvailabilityCalendar";
import { ScrollReveal } from "../ui/ScrollReveal";

export const Route = createFileRoute("/cars/$slug")({
  component: CarDetailPage,
});

function CarDetailPage() {
  const { slug } = Route.useParams();
  const car = getCarBySlug(slug);
  const fleet = useAsync(loadFleetData, []);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    if (car) document.title = `${car.name} on Rent in Karachi — RENTO`;
  }, [car]);

  const similar = useMemo(() => {
    if (!car) return [];
    return allCars
      .filter((c) => c.active && c.id !== car.id && c.category === car.category)
      .slice(0, 3);
  }, [car]);

  if (!car) {
    return (
      <main className="container-x py-24 text-center">
        <p className="font-display text-4xl font-black text-gradient-gold">Car not found</p>
        <p className="mt-3 text-sm text-mist">It may have been rented out or removed from the fleet.</p>
        <LinkButton to="/fleet" className="mt-8">
          Back to Fleet
        </LinkButton>
      </main>
    );
  }

  const days =
    start && end ? Math.max(1, Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1) : 0;
  const rateType = days >= 28 ? "Monthly rate" : days >= 7 ? "Weekly rate" : "Daily rate";
  const estimated = days > 0 ? quoteFor(car, days) : null;

  return (
    <main className="container-x py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-mist">
        <Link to="/" className="hover:text-gold">
          Home
        </Link>{" "}
        / <Link to="/fleet" className="hover:text-gold">Fleet</Link> / <span className="text-cream/80">{car.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left column */}
        <div>
          <CarImage category={car.category} name={car.name} src={car.images[0]} ratio="16/9" className="shadow-card" />

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="gold">{car.category}</Badge>
              <Badge tone="muted">{car.year}</Badge>
              <Badge tone="muted">{car.color}</Badge>
            </div>
            <h1 className="font-display mt-3 text-3xl font-black text-cream sm:text-4xl">{car.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mist">
              <span className="inline-flex items-center gap-1.5">
                <UsersIcon className="h-4 w-4 text-gold" /> {car.seats} seats
              </span>
              <span>{car.transmission}</span>
              <span>{car.fuelType}</span>
              <span>{car.engineCc} cc</span>
            </div>
          </div>

          {/* Specs grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Seats", value: String(car.seats) },
              { label: "Transmission", value: car.transmission },
              { label: "Fuel", value: car.fuelType },
              { label: "Engine", value: `${car.engineCc} cc` },
            ].map((s) => (
              <div key={s.label} className="card-surface p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{s.label}</p>
                <p className="font-display mt-1 text-lg font-semibold text-cream">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="card-surface mt-8 p-6">
            <h2 className="font-display text-xl font-semibold text-cream">Features</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {car.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-cream/85">
                  <CheckIcon className="h-4 w-4 text-gold" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Rates table */}
          <div className="card-surface mt-8 p-6">
            <h2 className="font-display text-xl font-semibold text-cream">Rental Rates</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["Daily", car.rates.daily],
                    ["Weekly (7+ days)", car.rates.weekly],
                    ["Monthly (28+ days)", car.rates.monthly],
                  ].map(([label, amount], i) => (
                    <tr key={label} className={i % 2 ? "bg-white/[0.02]" : ""}>
                      <td className="px-4 py-3 text-mist">{label}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gold">{formatPKR(Number(amount))}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/10">
                    <td className="px-4 py-3 text-mist">Refundable security deposit</td>
                    <td className="px-4 py-3 text-right font-semibold text-cream">{formatPKR(car.rates.deposit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-mist/70">
              Weekly and monthly rates are per week/month and already discounted. Deposit is refunded at return
              after checks. Fuel is not included.
            </p>
          </div>

          {/* Availability calendar */}
          <div className="card-surface mt-8 p-6">
            <h2 className="font-display flex items-center gap-2 text-xl font-semibold text-cream">
              <CalendarDaysIcon className="h-5 w-5 text-gold" /> Availability
            </h2>
            {fleet.loading ? (
              <p className="mt-4 text-sm text-mist">Checking live availability…</p>
            ) : fleet.error ? (
              <p className="mt-4 text-sm text-rose">Couldn't load availability: {fleet.error}</p>
            ) : fleet.data ? (
              <div className="mt-4">
                <AvailabilityCalendar car={car} bookings={fleet.data.bookings} blocked={fleet.data.blocked} />
              </div>
            ) : null}
          </div>
        </div>

        {/* Right column — booking card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Reserve this car</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-black text-gold">{formatPKR(car.rates.daily)}</span>
              <span className="text-xs text-mist">/ day</span>
            </div>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-mist">Pickup date</span>
                <input
                  type="date"
                  value={start}
                  min={todayStr()}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-graphite px-4 py-2.5 text-sm text-cream focus:border-gold/60 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-mist">Return date</span>
                <input
                  type="date"
                  value={end}
                  min={start || todayStr()}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-graphite px-4 py-2.5 text-sm text-cream focus:border-gold/60 focus:outline-none"
                />
              </label>
            </div>

            {estimated && (
              <div className="mt-4 space-y-1.5 rounded-xl bg-graphite/70 p-4 text-xs">
                <div className="flex justify-between text-mist">
                  <span>
                    {estimated.days} day{estimated.days > 1 ? "s" : ""} · {rateType}
                  </span>
                  <span className="text-cream">{formatPKR(estimated.rentalTotal)}</span>
                </div>
                <div className="flex justify-between text-mist">
                  <span>Refundable deposit</span>
                  <span className="text-cream">{formatPKR(car.rates.deposit)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-gold">
                  <span>Estimated total</span>
                  <span>{formatPKR(estimated.rentalTotal + car.rates.deposit)}</span>
                </div>
              </div>
            )}

            <Button
              className="mt-5 w-full"
              size="lg"
              onClick={() => {
                const qs = new URLSearchParams();
                if (start) qs.set("car", car.slug);
                if (start) qs.set("start", start);
                if (end) qs.set("end", end);
                window.location.href = `/booking?${qs.toString()}`;
              }}
            >
              Continue to Booking
            </Button>
            <a
              href={carInquiryLink(car.name)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366]/15 px-5 py-3 text-sm font-semibold text-[#25D366] transition-all hover:bg-[#25D366] hover:text-night"
            >
              Ask on WhatsApp
            </a>

            <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-mist/80">
              <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold/60" />
              Free cancellation up to 24 hours before pickup. Valid driving licence required.
            </p>
          </div>
        </aside>
      </div>

      {/* Similar cars */}
      {similar.length > 0 && (
        <section className="mt-20">
          <SectionHeading align="left" eyebrow="Keep Exploring" title="Similar Cars" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((c, i) => (
              <ScrollReveal key={c.id} delay={i * 0.06}>
                <CarCard car={c} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function quoteFor(car: { rates: { daily: number; weekly: number; monthly: number } }, days: number) {
  if (days >= 28) {
    const months = Math.floor(days / 28);
    const rem = days % 28;
    const remCost = rem >= 7 ? Math.ceil(rem / 7) * car.rates.weekly : rem * car.rates.daily;
    return { days, rentalTotal: months * car.rates.monthly + remCost };
  }
  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const rem = days % 7;
    return { days, rentalTotal: weeks * car.rates.weekly + rem * car.rates.daily };
  }
  return { days, rentalTotal: days * car.rates.daily };
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
