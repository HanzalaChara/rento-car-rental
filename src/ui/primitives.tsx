import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { Link } from "@tanstack/react-router";

/* ───────────────────────────────── Buttons ───────────────────────────────── */

type Variant = "gold" | "outline" | "ghost" | "whatsapp" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  gold: "bg-gold text-night font-semibold hover:bg-gold-soft shadow-glow/40 hover:shadow-glow",
  outline: "border border-gold/50 text-gold hover:bg-gold/10",
  ghost: "text-cream/80 hover:text-gold hover:bg-white/5",
  whatsapp: "bg-[#25D366] text-night font-semibold hover:brightness-110",
  danger: "bg-rose/15 text-rose border border-rose/40 hover:bg-rose/25",
};

const SIZES: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 cursor-pointer select-none whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-gold";

export function Button({
  variant = "gold",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={clsx(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
}

export function LinkButton({
  to,
  variant = "gold",
  size = "md",
  className,
  children,
  ...rest
}: {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  href?: string;
  target?: string;
  rel?: string;
} & Record<string, unknown>) {
  const classes = clsx(BASE, VARIANTS[variant], SIZES[size], className);
  if (to.startsWith("http") || to.startsWith("tel:") || to.startsWith("mailto:")) {
    return (
      <a href={to} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
}

/* ───────────────────────────────── Badges ────────────────────────────────── */

export function Badge({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "green" | "amber" | "rose" | "muted" }) {
  const tones = {
    gold: "bg-gold/10 text-gold border-gold/30",
    green: "bg-jade/10 text-jade border-jade/30",
    amber: "bg-amber/10 text-amber border-amber/30",
    rose: "bg-rose/10 text-rose border-rose/30",
    muted: "bg-white/5 text-mist border-white/10",
  };
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

/* ─────────────────────────────── Headings ────────────────────────────────── */

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={clsx("mb-10 max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-display mt-3 text-3xl font-bold text-cream sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm leading-relaxed text-mist">{subtitle}</p>}
    </div>
  );
}

/* ──────────────────────────────── Inputs ─────────────────────────────────── */

const inputCls =
  "w-full rounded-xl border border-white/10 bg-graphite px-4 py-3 text-sm text-cream placeholder:text-mist/50 focus:border-gold/60 focus:outline-none transition-colors";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mist/70">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputCls, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(inputCls, "appearance-none", props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(inputCls, "min-h-24", props.className)} />;
}
