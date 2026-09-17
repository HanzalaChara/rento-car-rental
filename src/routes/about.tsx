import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheckIcon, UsersIcon, TruckIcon, ClockIcon } from "@heroicons/react/24/outline";
import { site } from "../data/site";
import { Badge, LinkButton } from "../ui/primitives";
import { ScrollReveal } from "../ui/ScrollReveal";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const STATS = [
  { value: "12+", label: "Cars in fleet" },
  { value: "900+", label: "Happy customers" },
  { value: "5 yrs", label: "Serving Karachi" },
  { value: "4.9★", label: "Average rating" },
];

export function AboutPage() {
  return (
    <main className="container-x py-16">
      <div className="mx-auto max-w-3xl text-center">
        <Badge tone="gold">About RENTO</Badge>
        <h1 className="font-display mt-4 text-4xl font-black text-cream sm:text-5xl">
          Karachi's Trusted <span className="text-gradient-gold">Car Rental</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-mist sm:text-base">
          RENTO started with one car and a simple promise: rent a car the honest way. Five years later we run a
          fleet of inspected, insured vehicles serving families, businesses and travellers across Karachi — with
          the same promise, and the same owner you can call directly.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <ScrollReveal key={s.label} delay={i * 0.06}>
            <div className="card-surface p-6 text-center">
              <p className="font-display text-3xl font-black text-gold">{s.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-mist">{s.label}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
        {[
          {
            icon: ShieldCheckIcon,
            title: "Safety first, always",
            text: "Every car is serviced on schedule and inspected on a 40-point checklist before each rental. Tyres, brakes, AC, fluids — checked, every time.",
          },
          {
            icon: UsersIcon,
            title: "Customers for years",
            text: "Most of our bookings come from repeat customers and their referrals. We'd rather keep you than upsell you.",
          },
          {
            icon: TruckIcon,
            title: "Delivery that shows up",
            text: "We deliver on time to homes, offices, hotels and the airport — and we pick the car up when you're done.",
          },
          {
            icon: ClockIcon,
            title: "One call away",
            text: `No call centers. You talk directly to the RENTO team — ${site.hours.toLowerCase()}.`,
          },
        ].map((item, i) => (
          <ScrollReveal key={item.title} delay={i * 0.06}>
            <div className="card-surface h-full p-7">
              <item.icon className="h-7 w-7 text-gold" />
              <h2 className="font-display mt-3 text-lg font-semibold text-cream">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mist">{item.text}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-16 text-center">
        <LinkButton to="/fleet" size="lg">
          Explore Our Fleet
        </LinkButton>
      </div>
    </main>
  );
}
