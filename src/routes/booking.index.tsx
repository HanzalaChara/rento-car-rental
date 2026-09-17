import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { cars } from "../data/cars";
import { site } from "../data/site";
import { quote, formatPKR } from "../lib/pricing";
import { rentalDays, todayISO, formatISO, isValidISO } from "../lib/dates";
import { getRepo } from "../data/repo";
import { loadFleetData } from "../lib/fleetQuery";
import { useAsync } from "../lib/useAsync";
import { Badge, Button, Field, Select, TextArea, TextInput } from "../ui/primitives";

export const Route = createFileRoute("/booking/")({
  component: BookingPage,
  validateSearch: (search: Record<string, unknown>) => ({
    car: typeof search.car === "string" ? search.car : undefined,
    start: typeof search.start === "string" ? search.start : undefined,
    end: typeof search.end === "string" ? search.end : undefined,
  }),
});

const PHONE_RE = /^(\+?92|0)?3\d{2}[- ]?\d{7}$/;

function BookingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const fleet = useAsync(loadFleetData, []);
  const repo = getRepo();

  const [step, setStep] = useState(1);
  const [carSlug, setCarSlug] = useState(search.car ?? "");
  const [start, setStart] = useState(search.start ?? "");
  const [end, setEnd] = useState(search.end ?? "");
  const [pickupArea, setPickupArea] = useState(site.areas[0]);
  const [dropoffArea, setDropoffArea] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const car = cars.find((c) => c.slug === carSlug);
  const days = start && end && isValidISO(start) && isValidISO(end) ? rentalDays(start, end) : 0;
  const estimate = useMemo(
    () =>
      car && days > 0
        ? quote({ rates: car.rates, days, deliveryFee: site.deliveryFee, withDelivery: delivery })
        : null,
    [car, days, delivery],
  );

  // Availability of the chosen range for the chosen car
  const rangeCheck = useMemo(() => {
    if (!car || !fleet.data || !start || !end || days <= 0) return null;
    const { bookings, blocked } = fleet.data;
    const clashes = [
      ...bookings.filter(
        (b) =>
          b.carId === car.id &&
          ["pending", "confirmed", "active"].includes(b.status) &&
          b.startDate <= end &&
          start <= b.endDate,
      ),
      ...blocked.filter((p) => p.carId === car.id && p.startDate <= end && start <= p.endDate),
    ];
    return clashes.length === 0;
  }, [car, fleet.data, start, end, days]);

  function step1Valid(): boolean {
    return Boolean(car && start && end && days > 0 && start <= end && start >= todayISO() && rangeCheck !== false);
  }
  function step2Valid(): boolean {
    return name.trim().length >= 3 && PHONE_RE.test(phone.trim());
  }

  async function submit() {
    if (!car || !estimate) return;
    setSubmitting(true);
    setError(null);
    try {
      const booking = await repo.createBooking({
        carId: car.id,
        customerName: name.trim(),
        phone: phone.trim(),
        pickupArea,
        dropoffArea: dropoffArea || undefined,
        deliveryRequested: delivery,
        startDate: start,
        endDate: end,
        days: estimate.days,
        rentalTotal: estimate.rentalTotal,
        deliveryFee: estimate.deliveryFee,
        deposit: estimate.deposit,
        totalDue: estimate.totalDue,
        note: note.trim() || undefined,
      });
      await navigate({ to: "/booking/$ref", params: { ref: booking.ref } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again or WhatsApp us.");
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  }

  const stepTitles = ["Trip details", "Your details", "Review & confirm"];

  return (
    <main className="container-x max-w-3xl py-14">
      <div className="text-center">
        <Badge tone="gold">Online Booking</Badge>
        <h1 className="font-display mt-4 text-4xl font-black text-cream">Reserve Your Car</h1>
        <p className="mt-2 text-sm text-mist">No payment now — pay after we confirm on WhatsApp or call.</p>
      </div>

      {/* Stepper */}
      <div className="mt-10 flex items-center justify-center gap-2">
        {stepTitles.map((t, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={t} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  active ? "bg-gold text-night" : done ? "bg-jade/20 text-jade" : "bg-white/5 text-mist"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span className={`hidden text-xs sm:inline ${active ? "text-cream" : "text-mist"}`}>{t}</span>
              {n < 3 && <span className="mx-1 h-px w-8 bg-white/10" />}
            </div>
          );
        })}
      </div>

      <div className="card-surface mt-8 p-6 sm:p-8">
        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-5">
            <Field label="Choose your car">
              <Select value={carSlug} onChange={(e) => setCarSlug(e.target.value)}>
                <option value="">— Select a car —</option>
                {cars
                  .filter((c) => c.active)
                  .map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} · {formatPKR(c.rates.daily)}/day
                    </option>
                  ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pickup date">
                <input
                  type="date"
                  min={todayISO()}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-graphite px-4 py-3 text-sm text-cream focus:border-gold/60 focus:outline-none"
                />
              </Field>
              <Field label="Return date">
                <input
                  type="date"
                  min={start || todayISO()}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-graphite px-4 py-3 text-sm text-cream focus:border-gold/60 focus:outline-none"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pickup area">
                <Select value={pickupArea} onChange={(e) => setPickupArea(e.target.value)}>
                  {site.areas.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                  <option>Other (mention in note)</option>
                </Select>
              </Field>
              <Field label="Drop-off area (optional)">
                <Select value={dropoffArea} onChange={(e) => setDropoffArea(e.target.value)}>
                  <option value="">Same as pickup</option>
                  {site.areas.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-graphite/60 p-4">
              <input
                type="checkbox"
                checked={delivery}
                onChange={(e) => setDelivery(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#D4AF37]"
              />
              <span className="text-sm">
                <span className="font-semibold text-cream">Deliver the car to me</span>
                <span className="block text-xs text-mist">
                  Doorstep delivery anywhere in Karachi — flat {formatPKR(site.deliveryFee)}
                </span>
              </span>
            </label>

            {start && end && days > 0 && car && rangeCheck === false && (
              <p className="rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose">
                Those dates clash with an existing booking for this car. Please pick different dates or another car.
              </p>
            )}
            {start && end && start > end && (
              <p className="rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose">
                Return date must be after pickup date.
              </p>
            )}
            {car && days >= 7 && (
              <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
                {days >= 28 ? "Monthly" : "Weekly"} discount applied automatically — you save with longer rentals.
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button size="lg" disabled={!step1Valid()} onClick={() => setStep(2)}>
                Continue <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <Field label="Full name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ahmed Khan" />
            </Field>
            <Field label="WhatsApp / phone number" hint="Format: 03XX-XXXXXXX or +92 3XX XXXXXXX">
              <TextInput
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                inputMode="tel"
              />
            </Field>
            <Field label="Note for RENTO (optional)">
              <TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Flight number, hotel name, delivery timing…"
              />
            </Field>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeftIcon className="h-4 w-4" /> Back
              </Button>
              <Button size="lg" disabled={!step2Valid()} onClick={() => setStep(3)}>
                Review <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && estimate && car && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-graphite/60 p-5">
              <h3 className="font-display text-lg font-semibold text-cream">{car.name}</h3>
              <p className="mt-1 text-sm text-mist">
                {formatISO(start)} → {formatISO(end)} · {days} day{days > 1 ? "s" : ""} · Pickup: {pickupArea}
                {delivery ? " · Home delivery" : ""}
              </p>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-mist">
                  <span>
                    Rental ({days} day{days > 1 ? "s" : ""} · {estimate.rateType} rate)
                  </span>
                  <span className="text-cream">{formatPKR(estimate.rentalTotal)}</span>
                </div>
                {delivery && (
                  <div className="flex justify-between text-mist">
                    <span>Doorstep delivery</span>
                    <span className="text-cream">{formatPKR(estimate.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-mist">
                  <span>Refundable security deposit</span>
                  <span className="text-cream">{formatPKR(estimate.deposit)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2.5 text-base font-bold text-gold">
                  <span>Total due at pickup</span>
                  <span>{formatPKR(estimate.totalDue)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-graphite/60 p-5 text-sm">
              <p className="font-semibold text-cream">{name}</p>
              <p className="mt-0.5 text-mist">{phone}</p>
            </div>

            {error && (
              <p className="rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>
            )}

            <p className="flex items-center gap-2 text-xs text-mist">
              <LockClosedIcon className="h-4 w-4 text-gold/70" />
              No online payment required. We hold your car and confirm on WhatsApp/call.
            </p>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(2)} disabled={submitting}>
                <ArrowLeftIcon className="h-4 w-4" /> Back
              </Button>
              <Button size="lg" onClick={submit} disabled={submitting}>
                {submitting ? "Reserving…" : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
