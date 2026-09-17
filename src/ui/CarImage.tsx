import clsx from "clsx";
import type { CarCategory } from "../types";

/** Category-toned car silhouette placeholder until owner uploads real photos. */
const PALETTES: Record<CarCategory, { bg: string; body: string; glow: string }> = {
  Economy: { bg: "#1d2028", body: "#3a3f4c", glow: "#4a505e" },
  Sedan: { bg: "#181b22", body: "#2e3340", glow: "#3e4453" },
  SUV: { bg: "#161821", body: "#2a2e3a", glow: "#3a3f4c" },
  Van: { bg: "#15171e", body: "#282c37", glow: "#383d49" },
  Luxury: { bg: "#1a1608", body: "#3d3413", glow: "#57481a" },
};

export function CarImage({
  category,
  name,
  src,
  className,
  ratio = "16/9",
}: {
  category: CarCategory;
  name: string;
  src?: string;
  className?: string;
  ratio?: string;
}) {
  const p = PALETTES[category];
  return (
    <div
      className={clsx("relative w-full overflow-hidden rounded-xl", className)}
      style={{ aspectRatio: ratio, background: `linear-gradient(160deg, ${p.bg} 0%, #0b0c10 100%)` }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <svg viewBox="0 0 400 225" className="h-full w-full" role="img" aria-label={`${name} (photo coming soon)`}>
          <defs>
            <linearGradient id={`glow-${category}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={p.glow} stopOpacity="0.35" />
              <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="400" height="225" fill={`url(#glow-${category})`} />
          {/* ground line */}
          <line x1="20" y1="180" x2="380" y2="180" stroke="#ffffff10" strokeWidth="2" />
          {/* sedan/SUV silhouette */}
          <g fill={p.body}>
            <path
              d={
                category === "SUV" || category === "Van"
                  ? "M60 150 L60 118 Q60 108 74 104 L120 96 Q150 70 205 68 L268 72 Q300 76 316 98 L344 104 Q356 108 356 120 L356 150 Z"
                  : "M55 150 L55 128 Q55 120 66 117 L108 108 Q142 82 200 80 L258 84 Q292 90 310 108 L340 116 Q352 120 352 130 L352 150 Z"
              }
            />
            {/* windows */}
            <path
              d={category === "SUV" || category === "Van" ? "M150 96 Q172 78 205 77 L250 80 L250 96 Z" : "M145 105 Q170 88 200 87 L240 90 L240 105 Z"}
              fill="#0b0c10"
              opacity="0.55"
            />
            {/* wheels */}
            <circle cx="130" cy="150" r="24" fill="#0b0c10" />
            <circle cx="130" cy="150" r="10" fill={p.body} />
            <circle cx="285" cy="150" r="24" fill="#0b0c10" />
            <circle cx="285" cy="150" r="10" fill={p.body} />
          </g>
          {/* gold rim light */}
          <path
            d="M352 128 L352 150"
            stroke="#D4AF37"
            strokeOpacity="0.5"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text x="200" y="205" textAnchor="middle" fill="#9aa0ab" fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="2">
            {name.toUpperCase()}
          </text>
        </svg>
      )}
    </div>
  );
}
