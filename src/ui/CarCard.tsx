import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, UsersIcon } from "@heroicons/react/24/outline";
import type { Car } from "../types";
import { formatPKR } from "../lib/pricing";
import { Badge } from "./primitives";
import { CarImage } from "./CarImage";

export function CarCard({ car }: { car: Car }) {
  return (
    <div className="card-surface group overflow-hidden transition-all duration-300 hover:border-gold/40 hover:shadow-card">
      <CarImage category={car.category} name={car.name} src={car.images[0]} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{car.category}</p>
            <h3 className="font-display mt-1 text-lg font-semibold text-cream">{car.name}</h3>
          </div>
          <Badge tone="muted">{car.year}</Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist">
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="h-4 w-4 text-gold/70" /> {car.seats} seats
          </span>
          <span>{car.transmission}</span>
          <span>{car.fuelType}</span>
          <span>{car.engineCc} cc</span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-white/5 pt-4">
          <div>
            <p className="text-lg font-bold text-gold">{formatPKR(car.rates.daily)}</p>
            <p className="text-[11px] text-mist">per day · weekly & monthly rates lower</p>
          </div>
          <Link
            to="/cars/$slug"
            params={{ slug: car.slug }}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-4 py-2 text-xs font-semibold text-gold transition-all hover:bg-gold hover:text-night"
          >
            Book Now <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
