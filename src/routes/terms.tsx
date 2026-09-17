import { createFileRoute } from "@tanstack/react-router";
import { site } from "../data/site";
import { Badge, LinkButton } from "../ui/primitives";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

const SECTIONS: { title: string; points: string[] }[] = [
  {
    title: "1. Who can rent",
    points: [
      "Driver must be 21+ with a valid driving licence (CNIC for Pakistanis, passport + licence for foreigners).",
      "The licence must be shown at pickup; the person booking must be present at handover.",
      "Additional drivers must be registered with RENTO before driving.",
    ],
  },
  {
    title: "2. Rates & payment",
    points: [
      "Rates are in PKR and quoted per day (24-hour basis), with discounted weekly (7+) and monthly (28+) packages.",
      "A refundable security deposit is taken at handover and returned at drop-off after inspection.",
      "We accept JazzCash, EasyPaisa, bank transfer and cash. No online card payments.",
      "Fines and traffic challans during the rental period are the renter's responsibility.",
    ],
  },
  {
    title: "3. Fuel policy",
    points: [
      "Cars are given with a full/adequate tank and should be returned the same way.",
      "If returned with less fuel, refuelling is charged at market rate plus a service fee.",
      "Diesel and petrol must not be mixed up — ask us if unsure.",
    ],
  },
  {
    title: "4. Usage limits",
    points: [
      "Standard rentals include up to 150 km per day (weekly/monthly packages have different limits).",
      "Extra kilometres are charged per the rate card shared at booking.",
      "Cars may not be taken outside Karachi city limits without prior written approval.",
      "Racing, off-roading, towing and subletting are strictly prohibited.",
    ],
  },
  {
    title: "5. Damage, theft & accidents",
    points: [
      "In case of an accident, inform RENTO immediately and file a police report — do not settle privately.",
      "Damage beyond normal wear is charged per the repair estimate from the company's workshop.",
      "The deposit is adjusted against damage or missing items; the remainder is refunded.",
    ],
  },
  {
    title: "6. Cancellation & refunds",
    points: [
      "Free cancellation up to 24 hours before pickup — deposit fully refunded.",
      "Cancellations within 24 hours may forfeit one day's rent from the deposit.",
      "No-shows without notice may forfeit the full deposit.",
      "Deposit refunds are transferred the same day via the original payment channel.",
    ],
  },
  {
    title: "7. Late returns & extensions",
    points: [
      "Need the car longer? Message us — extensions are offered if the car has no next booking.",
      "Late returns beyond a 2-hour grace period are charged at the daily rate prorated per hour.",
    ],
  },
];

function TermsPage() {
  return (
    <main className="container-x max-w-3xl py-16">
      <div className="text-center">
        <Badge tone="gold">Rental Terms</Badge>
        <h1 className="font-display mt-4 text-4xl font-black text-cream">Simple, Fair Terms</h1>
        <p className="mt-3 text-sm text-mist">
          Last updated: September 2026 · Questions? WhatsApp {site.phone}
        </p>
      </div>

      <div className="mt-10 space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card-surface p-6">
            <h2 className="font-display text-lg font-semibold text-gold">{s.title}</h2>
            <ul className="mt-3 space-y-2">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-cream/85">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/60" />
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 text-center">
        <LinkButton to="/contact" variant="outline">
          Questions? Contact Us
        </LinkButton>
      </div>
    </main>
  );
}
