export const KL_TIMEZONE = "Asia/Kuala_Lumpur";

export type Lang = "en" | "ms";

const LOCALE: Record<Lang, string> = { en: "en-MY", ms: "ms-MY" };

/** Always renders wall-clock time in Asia/Kuala_Lumpur, regardless of the viewer's device timezone. */
export function formatKlDateTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    timeZone: KL_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(new Date(iso));
}

export function formatKlTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    timeZone: KL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(new Date(iso));
}

export function formatMyr(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang], { style: "currency", currency: "MYR" }).format(amount);
}

export function toLang(value: string | undefined): Lang {
  return value?.startsWith("ms") ? "ms" : "en";
}
