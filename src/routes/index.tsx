import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CheckBadgeIcon,
  ChevronDoubleDownIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TruckIcon,
  CurrencyDollarIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { cars } from "../data/cars";
import { site } from "../data/site";
import { generalInquiryLink } from "../lib/whatsapp";
import { Badge, Eyebrow, LinkButton, SectionHeading } from "../ui/primitives";
import { CarCard } from "../ui/CarCard";
import { ScrollReveal } from "../ui/ScrollReveal";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const WHY = [
  {
    icon: CheckBadgeIcon,
    title: "Fully Inspected Cars",
    text: "Every car passes a 40-point safety and comfort inspection before it reaches you.",
  },
  {
    icon: CurrencyDollarIcon,
    title: "Transparent PKR Pricing",
    text: "Clear daily, weekly and monthly rates. What you see is what you pay — no hidden charges.",
  },
  {
    icon: TruckIcon,
    title: "Free Doorstep Delivery",
    text: "We deliver to your home, hotel or the airport anywhere in Karachi. Free within main areas.",
  },
  {
    icon: ClockIcon,
    title: "24/7 Support",
    text: "Call or WhatsApp us any time — our team answers around the clock, even on Eid.",
  },
];

const STEPS = [
  { n: "01", title: "Pick Your Car", text: "Browse the fleet and choose the car that fits your trip and budget." },
  { n: "02", title: "Book Online", text: "Select your dates, add pickup details and confirm in under two minutes." },
  { n: "03", title: "Drive Away", text: "We deliver the car or you pick it up. Pay via JazzCash, EasyPaisa or cash." },
];

const TESTIMONIALS = [
  {
    name: "Ayesha K.",
    area: "DHA Phase 5",
    text: "Booked a Corolla for a week — the car was spotless and delivery was on time. Best rental experience in Karachi.",
  },
  {
    name: "Bilal M.",
    area: "Gulshan-e-Iqbal",
    text: "Transparent pricing and zero hidden charges. The Altis was exactly as shown on the website.",
  },
  {
    name: "Sara R.",
    area: "Clifton",
    text: "Rented a Sportage for a family wedding — smooth process from booking to return. Highly recommended!",
  },
];

function HomePage() {
  const featured = cars.filter((c) => c.featured && c.active).slice(0, 6);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 500px at 70% -10%, rgba(212,175,55,0.14), transparent 60%), radial-gradient(900px 420px at 10% 110%, rgba(212,175,55,0.07), transparent 55%)",
          }}
        />
        <div className="container-x relative flex min-h-[88vh] flex-col items-center justify-center py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge tone="gold">Karachi's Premium Car Rental</Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display mt-6 max-w-4xl text-5xl font-black leading-[1.05] text-cream sm:text-6xl md:text-7xl"
          >
            Drive Karachi in <span className="text-gradient-gold">Timeless Style</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg"
          >
            From the fuel-saving Alto to the commanding Fortuner — rent from a fleet that's inspected,
            insured and delivered to your door. Transparent PKR rates, zero hidden charges.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <LinkButton to="/fleet" size="lg">
              View Our Fleet
            </LinkButton>
            <a
              href={generalInquiryLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-base text-cream transition-all hover:border-gold/50 hover:text-gold"
            >
              WhatsApp Us
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-mist"
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-gold" /> Insured & inspected fleet
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gold" /> Free delivery across Karachi
            </span>
            <span className="inline-flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gold" /> 24/7 support
            </span>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute bottom-8 text-gold/50"
          >
            <ChevronDoubleDownIcon className="h-6 w-6" />
          </motion.div>
        </div>
      </section>

      {/* ── Featured fleet ──────────────────────────────────────────────── */}
      <section className="container-x py-20">
        <ScrollReveal>
          <SectionHeading
            eyebrow="The Fleet"
            title={
              <>
                Featured <span className="text-gradient-gold">Vehicles</span>
              </>
            }
            subtitle="Hand-picked cars, serviced after every rental and detailed before delivery."
          />
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((car, i) => (
            <ScrollReveal key={car.id} delay={i * 0.06}>
              <CarCard car={car} />
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <LinkButton to="/fleet" variant="outline" size="lg">
            Browse All {cars.length} Cars
          </LinkButton>
        </div>
      </section>

      {/* ── Why RENTO ───────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-coal/40 py-20">
        <div className="container-x">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Why RENTO"
              title={
                <>
                  Built on <span className="text-gradient-gold">Trust</span>
                </>
              }
            />
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.07}>
                <div className="card-surface h-full p-6">
                  <item.icon className="h-8 w-8 text-gold" />
                  <h3 className="font-display mt-4 text-lg font-semibold text-cream">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="container-x py-20">
        <ScrollReveal>
          <SectionHeading
            eyebrow="How It Works"
            title={
              <>
                Booked in <span className="text-gradient-gold">3 Steps</span>
              </>
            }
          />
        </ScrollReveal>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <ScrollReveal key={s.n} delay={i * 0.1}>
              <div className="relative card-surface h-full p-7">
                <span className="font-display text-5xl font-black text-gold/20">{s.n}</span>
                <h3 className="font-display mt-3 text-xl font-semibold text-cream">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{s.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-coal/40 py-20">
        <div className="container-x">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Testimonials"
              title={
                <>
                  Karachi <span className="text-gradient-gold">Trusts RENTO</span>
                </>
              }
            />
          </ScrollReveal>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.08}>
                <figure className="card-surface h-full p-6">
                  <div className="text-gold">★★★★★</div>
                  <blockquote className="mt-3 text-sm leading-relaxed text-cream/90">"{t.text}"</blockquote>
                  <figcaption className="mt-4 text-xs text-mist">
                    <span className="font-semibold text-cream">{t.name}</span> · {t.area}
                  </figcaption>
                </figure>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Areas we serve ──────────────────────────────────────────────── */}
      <section className="container-x py-20">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Coverage"
            title={
              <>
                We Deliver <span className="text-gradient-gold">Karachi-Wide</span>
              </>
            }
            subtitle="Free delivery in main areas — nominal charges apply farther out. Airport pickup available."
          />
        </ScrollReveal>
        <div className="flex flex-wrap justify-center gap-3">
          {site.areas.map((area, i) => (
            <ScrollReveal key={area} delay={i * 0.04}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-graphite px-4 py-2 text-sm text-cream/85">
                <MapPinIcon className="h-3.5 w-3.5 text-gold" /> {area}
              </span>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── CTA band ────────────────────────────────────────────────────── */}
      <section className="container-x pb-8">
        <ScrollReveal>
          <div
            className="card-surface relative overflow-hidden p-10 text-center sm:p-14"
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(20,22,28,1) 55%), radial-gradient(600px 200px at 80% 20%, rgba(212,175,55,0.15), transparent)",
            }}
          >
            <Eyebrow>Ready When You Are</Eyebrow>
            <h2 className="font-display mx-auto mt-3 max-w-2xl text-3xl font-bold text-cream sm:text-4xl">
              Your next car is one tap away
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-mist">
              Reserve online in minutes — or talk to a human on WhatsApp right now.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <LinkButton to="/fleet" size="lg">
                Book a Car Now
              </LinkButton>
              <a
                href={`tel:+${site.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 px-7 py-3.5 text-base text-gold transition-all hover:bg-gold/10"
              >
                <PhoneIcon className="h-5 w-5" /> {site.phone}
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
