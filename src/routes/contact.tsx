import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClockIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { site, waLink } from "../data/site";
import { Badge, Button, Field, TextArea, TextInput } from "../ui/primitives";
import { ScrollReveal } from "../ui/ScrollReveal";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function sendOnWhatsApp() {
    const text = `Hello RENTO!\n\nName: ${name || "-"}\nPhone: ${phone || "-"}\n\n${message}`;
    window.open(waLink(text), "_blank");
  }

  return (
    <main className="container-x py-16">
      <div className="text-center">
        <Badge tone="gold">Contact</Badge>
        <h1 className="font-display mt-4 text-4xl font-black text-cream sm:text-5xl">
          Talk to a <span className="text-gradient-gold">Human</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-mist">
          Call, WhatsApp or visit us — we reply fast during business hours and answer emergencies 24/7 for
          customers on rent.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
        {[
          {
            icon: PhoneIcon,
            title: "Call us",
            lines: [site.phone, site.hours],
            href: `tel:+${site.phone}`,
            cta: "Call now",
          },
          {
            icon: MapPinIcon,
            title: "Visit us",
            lines: [site.address],
            href: "https://maps.google.com/?q=DHA+Phase+6+Karachi",
            cta: "Open in Maps",
          },
          {
            icon: ClockIcon,
            title: "WhatsApp",
            lines: ["Fastest response", "Send your dates & area"],
            href: waLink(),
            cta: "Open WhatsApp",
          },
        ].map((c, i) => (
          <ScrollReveal key={c.title} delay={i * 0.06}>
            <a href={c.href} target="_blank" rel="noreferrer" className="card-surface block h-full p-6 transition-all hover:border-gold/40">
              <c.icon className="h-7 w-7 text-gold" />
              <h2 className="font-display mt-3 text-lg font-semibold text-cream">{c.title}</h2>
              {c.lines.map((l) => (
                <p key={l} className="mt-1 text-sm text-mist">
                  {l}
                </p>
              ))}
              <p className="mt-3 text-xs font-semibold text-gold">{c.cta} →</p>
            </a>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <div className="card-surface mx-auto mt-10 max-w-2xl p-7">
          <h2 className="font-display text-xl font-semibold text-cream">Send a quick message</h2>
          <p className="mt-1 text-xs text-mist">
            This opens WhatsApp with your message ready — no forms lost in spam folders.
          </p>
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed Khan" />
              </Field>
              <Field label="Phone">
                <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300 1234567" />
              </Field>
            </div>
            <Field label="Message">
              <TextArea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I need a Corolla from 20 to 25 March, pickup in Gulshan…"
              />
            </Field>
            <Button size="lg" className="w-full" onClick={sendOnWhatsApp} disabled={!message.trim()}>
              Send via WhatsApp
            </Button>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="card-surface mx-auto mt-10 max-w-4xl overflow-hidden">
          <iframe
            title="RENTO location"
            src="https://www.google.com/maps?q=DHA%20Phase%206%20Karachi&output=embed"
            className="h-80 w-full border-0 opacity-80"
            loading="lazy"
          />
        </div>
      </ScrollReveal>
    </main>
  );
}
