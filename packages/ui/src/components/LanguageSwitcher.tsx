import { useTranslation } from "react-i18next";
import { cn } from "../lib/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const current = i18n.language === "ms" ? "ms" : "en";
  return (
    <div role="group" aria-label={t("language.label")} className={cn("inline-flex rounded-full border border-line bg-surface/70 p-1 backdrop-blur", className)}>
      {(["en", "ms"] as const).map((lng) => (
        <button
          key={lng}
          type="button"
          lang={lng}
          aria-pressed={current === lng}
          title={t(`language.${lng}`)}
          onClick={() => void i18n.changeLanguage(lng)}
          className={cn(
            "min-h-9 min-w-11 rounded-full px-3 text-xs font-semibold uppercase tracking-wider transition",
            current === lng ? "bg-ink text-canvas" : "text-muted hover:text-ink"
          )}
        >
          {lng === "en" ? "EN" : "BM"}
        </button>
      ))}
    </div>
  );
}
