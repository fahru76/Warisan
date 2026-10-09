import { Outlet, ScrollRestoration } from "react-router";
import { useTranslation } from "react-i18next";
import { UserRound } from "lucide-react";
import { ButtonLink, CookieBanner, NET_ORIGIN, ORG_ORIGIN, SiteFooter, SiteHeader } from "@warisan/ui";
import { NET_ROUTES } from "./routePaths";

export function Layout() {
  const { t } = useTranslation();
  const nav = [
    { to: NET_ROUTES.home, label: t("nav.marketplace") },
    { to: NET_ROUTES.workshops, label: t("nav.workshops") }
  ];
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas">
        Skip to content
      </a>
      <SiteHeader
        suffix=".net"
        nav={nav}
        action={
          <ButtonLink to={NET_ROUTES.account} variant="secondary">
            <UserRound className="size-4" aria-hidden /> {t("nav.account")}
          </ButtonLink>
        }
      />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter suffix=".net" orgOrigin={ORG_ORIGIN} netOrigin={NET_ORIGIN} />
      <CookieBanner />
      <ScrollRestoration />
    </div>
  );
}
