import { useId, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function Field({ label, large = false, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; large?: boolean }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className={cn("mb-1.5 block font-medium text-ink", large ? "text-lg" : "text-sm")}>
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "w-full rounded-xl border border-line bg-surface px-4 text-ink shadow-inner shadow-black/[0.02] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15",
          large ? "min-h-14 text-lg" : "min-h-12 text-base"
        )}
        {...props}
      />
    </div>
  );
}
