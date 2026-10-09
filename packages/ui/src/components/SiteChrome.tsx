import { useState, type ReactNode } from "react";
import { NavLink, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Container } from "./Surfaces";
import { cn } from "../lib/cn";

export interface NavItem {
  to: string;
  label: string;
}

export function SiteHeader({ suffix, nav, action }: { suffix: ".org" | ".net"; nav: NavItem[]; action?: ReactNode }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn("rounded-full px-4 py-2 text-sm font-medium transition", isActive ? "bg-brand/10 text-brand" : "text-muted hover:text-ink");

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-canvas/75 backdrop-blur-xl">
      <Container className="flex h-18 items-center justify-between gap-4">
        <BrandMark suffix={suffix} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="hidden lg:block">{action}</div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-line lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={t("nav.menu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </Container>
      {open && (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-line/60 lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => cn("flex min-h-12 items-center rounded-xl px-4 text-base font-medium", isActive ? "bg-brand/10 text-brand" : "text-ink")}>
                {item.label}
              </NavLink>
            ))}
            {action && <div className="pt-2">{action}</div>}
          </Container>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter({ suffix, orgOrigin, netOrigin }: { suffix: ".org" | ".net"; orgOrigin: string; netOrigin: string }) {
  const { t } = useTranslation();
  return (
    <footer className="mt-24 border-t border-line/70 bg-surface/50">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div className="space-y-3">
          <BrandMark suffix={suffix} />
          <p className="max-w-xs text-sm text-muted">{t(suffix === ".org" ? "org.tagline" : "net.tagline")}</p>
        </div>
        <div className="space-y-2 text-sm">
          <a className="block text-ink hover:text-brand" href={orgOrigin}>{t("footer.trustLayer")}</a>
          <a className="block text-ink hover:text-brand" href={netOrigin}>{t("footer.commerceLayer")}</a>
        </div>
        <nav aria-label={t("footer.legal")} className="space-y-2 text-sm">
          <p className="font-semibold text-ink">{t("footer.legal")}</p>
          <Link className="block text-muted hover:text-brand" to="/privacy-policy">{t("legal.privacy")}</Link>
          <Link className="block text-muted hover:text-brand" to="/terms">{t("legal.terms")}</Link>
          <Link className="block text-muted hover:text-brand" to="/vendor-agreement">{t("legal.vendor")}</Link>
        </nav>
      </Container>
      <Container className="border-t border-line/60 py-6 text-xs text-muted">
        © {new Date().getFullYear()} Warisan. {t("footer.rights")}
      </Container>
    </footer>
  );
}
