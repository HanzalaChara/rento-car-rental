import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { getCarById } from "../data/cars";
import { site } from "../data/site";
import { formatPKR } from "../lib/pricing";
import { formatISO } from "../lib/dates";
import { bookingDetailsLink } from "../lib/whatsapp";
import { loadFleetData } from "../lib/fleetQuery";
import { useAsync } from "../lib/useAsync";
import { Badge, LinkButton } from "../ui/primitives";
import { ScrollReveal } from "../ui/ScrollReveal";

export const Route = createFileRoute("/booking/$ref")({
  component: BookingConfirmed,
});

function BookingConfirmed() {
  const { ref } = Route.useParams();
  const fleet = useAsync(loadFleetData, []);
  const [copied, setCopied] = useState(false);

  const booking = fleet.data?.bookings.find((b) => b.ref === ref);

  if (fleet.loading) {
    return (
      <main className="container-x py-24 text-center">
        <p className="text-sm text-mist">Loading your booking…</p>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="container-x py-24 text-center">
        <p className="font-display text-3xl font-black text-cream">Booking not found</p>
        <p className="mt-2 text-sm text-mist">
          Reference "{ref}" doesn't exist on this device. (Demo mode stores bookings only in this browser.)
        </p>
        <LinkButton to="/fleet" className="mt-8">
          Browse Fleet
        </LinkButton>
      </main>
    );
  }

  const car = getCarById(booking.carId);

  return (
    <main className="container-x max-w-2xl py-14">
      <ScrollReveal>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-jade/15">
            <CheckCircleIcon className="h-9 w-9 text-jade" />
          </div>
          <h1 className="font-display mt-5 text-3xl font-black text-cream sm:text-4xl">Booking Received!</h1>
          <p className="mt-2 text-sm text-mist">
            We're holding <span className="text-cream">{car?.name}</span> for you. Our team will confirm shortly on
            WhatsApp or by call.
          </p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(booking.ref);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5 font-mono text-base font-bold tracking-wider text-gold transition-all hover:bg-gold/20"
            title="Copy reference"
          >
            {booking.ref}
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
          {copied && <p className="mt-1.5 text-[11px] text-jade">Copied!</p>}
        </div>
      </ScrollReveal>

      {/* Trip summary */}
      <div className="card-surface mt-10 p-6">
        <h2 className="font-display text-lg font-semibold text-cream">Trip Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          {[
            ["Car", car?.name ?? "—"],
            ["Pickup", `${formatISO(booking.startDate)} · ${booking.pickupArea}`],
            ["Return", `${formatISO(booking.endDate)} · ${booking.dropoffArea ?? booking.pickupArea}`],
            ["Duration", `${booking.days} day${booking.days > 1 ? "s" : ""}`],
            ["Delivery", booking.deliveryRequested ? `Requested (${formatPKR(booking.deliveryFee)})` : "Self pickup"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-mist">{k}</span>
              <span className="text-right text-cream">{v}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
            <span className="text-mist">Rental total</span>
            <span className="text-cream">{formatPKR(booking.rentalTotal)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-mist">Refundable deposit</span>
            <span className="text-cream">{formatPKR(booking.deposit)}</span>
          </div>
          <div className="flex justify-between gap-4 text-base font-bold">
            <span className="text-cream">Total due</span>
            <span className="text-gold">{formatPKR(booking.totalDue)}</span>
          </div>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="card-surface mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-cream">Pay the Deposit</h2>
          <Badge tone="amber">Reserve now, pay now</Badge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-mist">
          To lock in your dates, send the deposit ({formatPKR(booking.deposit)}) — or the full amount — using any
          option below, then tap the WhatsApp button with your receipt:
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-white/10 bg-graphite/70 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
              <span className="inline-block h-2 w-2 rounded-full bg-[#B71C1C]" /> JazzCash
            </p>
            <p className="mt-2 text-sm text-cream">{site.payments.jazzcash.accountName}</p>
            <p className="font-mono text-sm text-cream">{site.payments.jazzcash.accountNumber}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-graphite/70 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
              <span className="inline-block h-2 w-2 rounded-full bg-[#4CAF50]" /> EasyPaisa
            </p>
            <p className="mt-2 text-sm text-cream">{site.payments.easypaisa.accountName}</p>
            <p className="font-mono text-sm text-cream">{site.payments.easypaisa.accountNumber}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-graphite/70 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
              <span className="inline-block h-2 w-2 rounded-full bg-[#1976D2]" /> Bank Transfer
            </p>
            <p className="mt-2 text-sm text-cream">
              {site.payments.bank.bankName} · {site.payments.bank.accountTitle}
            </p>
            <p className="font-mono text-sm text-cream">{site.payments.bank.accountNumber}</p>
            <p className="font-mono text-xs text-mist">{site.payments.bank.iban}</p>
          </div>
        </div>
        <a
          href={car ? bookingDetailsLink(booking, car.name) : "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-night transition-all hover:brightness-110"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Send Booking on WhatsApp
        </a>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 text-center">
        <LinkButton to="/fleet" variant="outline">
          Browse More Cars
        </LinkButton>
        <Link to="/" className="px-2 py-3 text-sm text-mist hover:text-gold">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
