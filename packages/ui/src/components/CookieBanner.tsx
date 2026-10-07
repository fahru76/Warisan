import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Cookie } from "lucide-react";
import { Button } from "./Button";

const KEY = "warisan.cookieConsent";
export type CookieConsent = "all" | "essential";

export function readCookieConsent(): CookieConsent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

/** Persistent until the visitor chooses. Analytics must check readCookieConsent() === "all" before loading. */
export function CookieBanner() {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<CookieConsent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChoice(readCookieConsent());
    setReady(true);
  }, []);

  if (!ready || choice) return null;

  const save = (value: CookieConsent) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // storage blocked: hide for this page view only
    }
    setChoice(value);
  };

  return (
    <div role="region" aria-label="Cookie consent" className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-3xl border border-white/50 bg-surface/90 p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:items-center">
        <Cookie className="hidden size-8 shrink-0 text-accent sm:block" aria-hidden />
        <p className="flex-1 text-sm leading-relaxed text-ink">
          {t("cookie.message")}{" "}
          <Link to="/privacy-policy" className="font-medium text-brand underline underline-offset-4">
            {t("cookie.learnMore")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => save("essential")}>
            {t("cookie.essential")}
          </Button>
          <Button onClick={() => save("all")}>{t("cookie.accept")}</Button>
        </div>
      </div>
    </div>
  );
}
