import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/50 bg-surface/70 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}

export function BentoGrid({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid auto-rows-[minmax(11rem,auto)] grid-cols-1 gap-4 md:grid-cols-4", className)} {...props} />;
}

const colSpan = { 1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4" } as const;
const rowSpan = { 1: "md:row-span-1", 2: "md:row-span-2" } as const;

const tones = {
  glass: "border border-white/50 bg-surface/70 backdrop-blur-xl",
  brand: "bg-brand text-on-brand",
  ink: "bg-ink text-canvas",
  accent: "bg-accent text-white"
} as const;

/**
 * Bento tile. Use `tone` / `flush` instead of overriding bg/padding via className:
 * conflicting utilities in one class list resolve by stylesheet order, not by position.
 */
export function BentoCell({ cols = 1, rows = 1, tone = "glass", flush = false, className, ...props }: HTMLAttributes<HTMLDivElement> & { cols?: keyof typeof colSpan; rows?: keyof typeof rowSpan; tone?: keyof typeof tones; flush?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] transition-shadow duration-300 hover:shadow-[0_20px_50px_-16px_rgba(15,23,42,0.28)]",
        tones[tone],
        !flush && "p-6",
        colSpan[cols],
        rowSpan[rows],
        className
      )}
      {...props}
    />
  );
}

export function SectionHeading({ eyebrow, title, subtitle, align = "left" }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; align?: "left" | "center" }) {
  return (
    <header className={cn("mb-10 max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>}
      <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>}
    </header>
  );
}

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand", className)} {...props} />;
}

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}
