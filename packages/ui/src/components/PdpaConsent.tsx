import { useId } from "react";
import { cn } from "../lib/cn";

/**
 * PDPA 2010 consent checkbox. Always unchecked by default; never pre-tick.
 * Read the value from FormData (`name`), so there is no state to accidentally default to true.
 */
export function PdpaConsent({ label, name = "pdpa_consent", required = true, className }: { label: string; name?: string; required?: boolean; className?: string }) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        name={name}
        type="checkbox"
        value="yes"
        required={required}
        className="mt-1 size-5 shrink-0 cursor-pointer rounded border-line accent-[var(--color-brand)]"
      />
      <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-muted">
        {label}
        {required && <span className="text-accent" aria-hidden> *</span>}
      </label>
    </div>
  );
}
