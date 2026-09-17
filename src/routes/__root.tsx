import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "../ui/Layout";

const TITLES: Record<string, string> = {
  "/": "RENTO — Premium Car Rental in Karachi",
  "/fleet": "Our Fleet — RENTO Karachi",
  "/about": "About RENTO — Karachi Car Rental",
  "/contact": "Contact RENTO — Karachi Car Rental",
  "/terms": "Rental Terms — RENTO Karachi",
  "/admin": "RENTO Admin",
  "/booking": "Book a Car — RENTO Karachi",
};

function HeadManager() {
  const location = useLocation();
  useEffect(() => {
    const base = TITLES[location.pathname] ?? "RENTO — Premium Car Rental in Karachi";
    document.title = base;
  }, [location.pathname]);
  return null;
}

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadManager />
      <Layout />
    </>
  ),
  notFoundComponent: () => (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-black text-gradient-gold">404</p>
      <h1 className="font-display mt-4 text-2xl font-bold text-cream">This road leads nowhere</h1>
      <p className="mt-2 text-sm text-mist">The page you're looking for doesn't exist — but our cars do.</p>
      <a href="/" className="mt-6 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-night hover:bg-gold-soft">
        Back to Home
      </a>
    </section>
  ),
});

export function RouteHead({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
  }, [title, description]);
  return null;
}

// Re-export so route files can use <Outlet /> without extra imports.
export { Outlet };
