import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import { cn } from "../lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "bg-brand text-on-brand shadow-[0_8px_24px_-8px_var(--color-brand)] hover:bg-brand-strong",
  secondary: "border border-line bg-surface/70 text-ink backdrop-blur hover:border-brand hover:text-brand",
  ghost: "text-ink hover:bg-ink/5"
};
const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-7 text-base",
  /** Admin / accessibility size: ≥56px tap target, large text. */
  xl: "min-h-14 w-full px-8 text-lg"
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({ variant, size, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, children, ...props }: LinkProps & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
