import { Outlet, ScrollRestoration } from "react-router";
import { useTranslation } from "react-i18next";
import { CookieBanner, NET_ORIGIN, ORG_ORIGIN, SiteFooter, SiteHeader } from "@warisan/ui";
import { ORG_ROUTES } from "./routePaths";

export function Layout() {
  const { t } = useTranslation();
  const nav = [
    { to: ORG_ROUTES.home, label: t("nav.home") },
    { to: ORG_ROUTES.artisans, label: t("nav.artisans") },
    { to: ORG_ROUTES.provenanceLookup, label: t("nav.verify") },
    { to: ORG_ROUTES.register, label: t("nav.register") },
    { to: ORG_ROUTES.admin, label: t("nav.admin") }
  ];
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas">
        Skip to content
      </a>
      <SiteHeader suffix=".org" nav={nav} />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter suffix=".org" orgOrigin={ORG_ORIGIN} netOrigin={NET_ORIGIN} />
      <CookieBanner />
      <ScrollRestoration />
    </div>
  );
}
