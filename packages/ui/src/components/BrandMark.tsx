import { Hexagon } from "lucide-react";
import { Link } from "react-router";
import { cn } from "../lib/cn";

/** Placeholder mark until the final SVG logo lands: a hexagon nods to the Songket Pucuk Rebung motif. */
export function BrandMark({ suffix, to = "/", className }: { suffix: ".org" | ".net"; to?: string; className?: string }) {
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand", className)} aria-label={`Warisan${suffix} home`}>
      <span className="relative grid size-9 place-items-center">
        <Hexagon className="absolute size-9 text-brand transition-transform duration-500 group-hover:rotate-30" strokeWidth={1.25} aria-hidden />
        <Hexagon className="size-4 fill-accent text-accent" strokeWidth={1.5} aria-hidden />
      </span>
      <span className="font-display text-xl font-semibold tracking-[0.28em] text-ink">
        WARISAN<span className="ml-0.5 font-sans text-xs font-medium tracking-normal text-muted">{suffix}</span>
      </span>
    </Link>
  );
}
