import { useTranslation } from "react-i18next";
import { Archive, QrCode, ScrollText, Users } from "lucide-react";
import { Async, BentoCell, BentoGrid, ButtonLink, Container, DemoNotice, SectionHeading, SmartImage, api, placeholderImage, useAsync, useSeo } from "@warisan/ui";
import { ORG_ROUTES } from "../routePaths";
import { ArtisanCard } from "./ArtisanCard";

export function HomePage() {
  const { t } = useTranslation();
  useSeo({ title: t("seo.orgTitle"), description: t("seo.orgDescription"), siteName: "Warisan.org", image: placeholderImage("org-hero", "hero") });
  const state = useAsync(() => Promise.all([api.listArtisans(), api.listCraftItems()]), []);

  return (
    <>
      <Container className="pt-10 sm:pt-16">
        <BentoGrid>
          <BentoCell cols={3} rows={2} flush>
            <SmartImage src={placeholderImage("org-hero", "hero")} alt="" ratio="hero" priority className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-ink/10" />
            <div className="relative mt-auto flex flex-col gap-5 p-8 sm:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">{t("org.hero.eyebrow")}</p>
              <h1 className="max-w-3xl font-display text-4xl leading-[1.05] text-white sm:text-6xl">{t("org.hero.title")}</h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">{t("org.hero.subtitle")}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink to={ORG_ROUTES.artisans} size="lg">{t("org.hero.cta")}</ButtonLink>
                <ButtonLink to={ORG_ROUTES.provenanceLookup} size="lg" variant="secondary">
                  <QrCode className="size-4" aria-hidden /> {t("org.hero.ctaSecondary")}
                </ButtonLink>
              </div>
            </div>
          </BentoCell>
          <BentoCell tone="brand" className="justify-between">
            <Users className="size-6 opacity-80" aria-hidden />
            <div>
              <p className="font-display text-5xl">{state.status === "success" ? state.value[0].data.length : "—"}</p>
              <p className="mt-1 text-sm opacity-80">{t("org.bento.statArtisans")}</p>
            </div>
          </BentoCell>
          <BentoCell className="justify-between">
            <ScrollText className="size-6 text-brand" aria-hidden />
            <div>
              <p className="font-display text-5xl text-ink">{state.status === "success" ? state.value[1].data.length : "—"}</p>
              <p className="mt-1 text-sm text-muted">{t("org.bento.statItems")}</p>
            </div>
          </BentoCell>
          <BentoCell cols={2}>
            <QrCode className="size-6 text-brand" aria-hidden />
            <h2 className="mt-4 font-display text-2xl text-ink">{t("org.bento.registryTitle")}</h2>
            <p className="mt-2 text-muted">{t("org.bento.registryBody")}</p>
          </BentoCell>
          <BentoCell cols={2}>
            <Archive className="size-6 text-brand" aria-hidden />
            <h2 className="mt-4 font-display text-2xl text-ink">{t("org.bento.archiveTitle")}</h2>
            <p className="mt-2 text-muted">{t("org.bento.archiveBody")}</p>
          </BentoCell>
        </BentoGrid>
      </Container>

      <Container className="mt-24">
        <SectionHeading eyebrow={t("nav.artisans")} title={t("org.bento.directoryTitle")} subtitle={t("org.bento.directoryBody")} />
        <Async state={state}>
          {([artisans]) => (
            <div className="space-y-6">
              <DemoNotice source={artisans.source} />
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {artisans.data.slice(0, 4).map((a) => (
                  <ArtisanCard key={a.id} artisan={a} />
                ))}
              </div>
              <ButtonLink to={ORG_ROUTES.artisans} variant="secondary">{t("common.viewAll")}</ButtonLink>
            </div>
          )}
        </Async>
      </Container>
    </>
  );
}
