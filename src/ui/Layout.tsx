import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Bars3Icon, PhoneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { site, waLink } from "../data/site";
import { generalInquiryLink } from "../lib/whatsapp";
import clsx from "clsx";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/fleet", label: "Fleet" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={clsx("font-display text-2xl font-black tracking-wide", className)}>
      <span className="text-cream">REN</span>
      <span className="text-gradient-gold">TO</span>
    </Link>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <div className="min-h-screen">
      <header
        className={clsx(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled ? "border-white/10 bg-night/85 backdrop-blur-xl" : "border-transparent bg-transparent",
        )}
      >
        <div className="container-x flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5 hover:text-gold"
                activeProps={{ className: "text-gold bg-gold/10" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/terms"
              className="rounded-full px-4 py-2 text-sm text-cream/80 transition-colors hover:bg-white/5 hover:text-gold"
              activeProps={{ className: "text-gold bg-gold/10" }}
            >
              Terms
            </Link>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <a
              href={`tel:+${site.phone}`}
              className="inline-flex items-center gap-1.5 text-sm text-cream/80 hover:text-gold"
            >
              <PhoneIcon className="h-4 w-4" /> {site.phone}
            </a>
            <Link
              to="/admin"
              className="rounded-full px-3 py-1.5 text-xs text-mist transition-colors hover:text-gold"
              title="Owner login"
            >
              Admin
            </Link>
          </div>
          <button className="rounded-lg p-2 text-cream md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-white/10 bg-night/95 px-5 pb-4 pt-2 backdrop-blur-xl md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block rounded-lg px-3 py-2.5 text-sm text-cream/90 hover:bg-white/5"
                activeProps={{ className: "text-gold" }}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/terms" className="block rounded-lg px-3 py-2.5 text-sm text-cream/90 hover:bg-white/5">
              Terms
            </Link>
            <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
              <a href={`tel:+${site.phone}`} className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-center text-sm text-cream">
                Call
              </a>
              <a
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-full bg-[#25D366] px-4 py-2.5 text-center text-sm font-semibold text-night"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      <Outlet />

      <footer className="mt-24 border-t border-white/10 bg-coal/60">
        <div className="container-x grid gap-10 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist">
              {site.tagline}. Premium vehicles, transparent PKR pricing, free delivery across {site.city.split(",")[0]}.
            </p>
            <div className="mt-4 flex gap-3">
              {site.socials.facebook && (
                <a href={site.socials.facebook} target="_blank" rel="noreferrer" className="text-mist hover:text-gold">
                  Facebook
                </a>
              )}
              {site.socials.instagram && (
                <a href={site.socials.instagram} target="_blank" rel="noreferrer" className="text-mist hover:text-gold">
                  Instagram
                </a>
              )}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Explore</p>
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="block py-1 text-sm text-mist hover:text-gold">
                {item.label}
              </Link>
            ))}
            <Link to="/terms" className="block py-1 text-sm text-mist hover:text-gold">
              Rental Terms
            </Link>
            <Link to="/admin" className="block py-1 text-sm text-mist hover:text-gold">
              Admin Login
            </Link>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Contact</p>
            <p className="py-1 text-sm text-mist">{site.address}</p>
            <a href={`tel:+${site.phone}`} className="block py-1 text-sm text-mist hover:text-gold">
              {site.phone}
            </a>
            <a href={waLink()} target="_blank" rel="noreferrer" className="block py-1 text-sm text-mist hover:text-gold">
              WhatsApp us
            </a>
            <a href={`mailto:${site.email}`} className="block py-1 text-sm text-mist hover:text-gold">
              {site.email}
            </a>
            <p className="pt-1 text-xs text-mist/70">{site.hours}</p>
          </div>
        </div>
        <div className="border-t border-white/5 py-5">
          <div className="container-x flex flex-col items-center justify-between gap-2 text-xs text-mist/60 sm:flex-row">
            <p>© {new Date().getFullYear()} RENTO · Karachi, Pakistan</p>
            <p>We accept JazzCash · EasyPaisa · Bank transfer · Cash</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <a
        href={generalInquiryLink()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-night shadow-glow/30 transition-transform hover:scale-105 animate-floaty"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
}
