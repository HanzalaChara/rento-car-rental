import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MagnifyingGlassIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import type { CarCategory } from "../types";
import { cars as allCars } from "../data/cars";
import { Badge, Field, Select, TextInput } from "../ui/primitives";
import { CarCard } from "../ui/CarCard";
import { ScrollReveal } from "../ui/ScrollReveal";
import clsx from "clsx";

export const Route = createFileRoute("/fleet")({
  component: FleetPage,
});

const CATEGORIES: (CarCategory | "All")[] = ["All", "Economy", "Sedan", "SUV", "Van", "Luxury"];

export function FleetPage() {
  const [category, setCategory] = useState<CarCategory | "All">("All");
  const [transmission, setTransmission] = useState("All");
  const [maxPrice, setMaxPrice] = useState(0); // 0 = no cap
  const [sort, setSort] = useState("recommended");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = allCars.filter((c) => c.active);
    if (category !== "All") list = list.filter((c) => c.category === category);
    if (transmission !== "All") list = list.filter((c) => c.transmission === transmission);
    if (maxPrice > 0) list = list.filter((c) => c.rates.daily <= maxPrice);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.rates.daily - b.rates.daily);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.rates.daily - a.rates.daily);
        break;
      default:
        list = [...list].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
    }
    return list;
  }, [category, transmission, maxPrice, sort, query]);

  return (
    <main className="container-x py-16">
      <div className="mb-10 text-center">
        <Badge tone="gold">The RENTO Fleet</Badge>
        <h1 className="font-display mt-4 text-4xl font-black text-cream sm:text-5xl">
          Choose Your <span className="text-gradient-gold">Drive</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-mist">
          {allCars.length} cars across economy, sedan, SUV, van and luxury — all inspected, all insured.
        </p>
      </div>

      {/* Filter bar */}
      <div className="card-surface mb-10 p-5">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={clsx(
                "rounded-full px-4 py-2 text-xs font-semibold transition-all",
                category === c ? "bg-gold text-night" : "border border-white/10 text-mist hover:border-gold/40 hover:text-gold",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Transmission">
            <Select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
              <option>All</option>
              <option>Automatic</option>
              <option>Manual</option>
            </Select>
          </Field>
          <Field label="Max daily price">
            <Select value={String(maxPrice)} onChange={(e) => setMaxPrice(Number(e.target.value))}>
              <option value="0">Any price</option>
              <option value="6000">Under PKR 6,000</option>
              <option value="10000">Under PKR 10,000</option>
              <option value="20000">Under PKR 20,000</option>
              <option value="30000">Under PKR 30,000</option>
            </Select>
          </Field>
          <Field label="Sort by">
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </Select>
          </Field>
        </div>
        <div className="relative mt-4">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <TextInput
            placeholder="Search by name or brand…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      <p className="mb-6 flex items-center gap-2 text-xs text-mist">
        <Squares2X2Icon className="h-4 w-4 text-gold/70" />
        Showing {filtered.length} of {allCars.length} cars
      </p>

      {filtered.length === 0 ? (
        <div className="card-surface p-14 text-center">
          <p className="font-display text-xl text-cream">No cars match those filters</p>
          <p className="mt-2 text-sm text-mist">Try widening your price range or clearing the search.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((car, i) => (
            <ScrollReveal key={car.id} delay={Math.min(i * 0.05, 0.3)}>
              <CarCard car={car} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </main>
  );
}
