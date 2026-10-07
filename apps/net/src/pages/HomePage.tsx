import { useTranslation } from "react-i18next";
import { Hammer, ShieldCheck, Sparkles } from "lucide-react";
import { Async, BentoCell, BentoGrid, ButtonLink, Container, DemoNotice, SectionHeading, SmartImage, api, placeholderImage, useAsync, useSeo } from "@warisan/ui";
import { NET_ROUTES } from "../routePaths";
import { CraftCard } from "./CraftCard";
import { WorkshopCard } from "./WorkshopCard";

export function HomePage() {
  const { t } = useTranslation();
  useSeo({ title: t("seo.netTitle"), description: t("seo.netDescription"), siteName: "Warisan.net", image: placeholderImage("net-hero", "hero") });
  const state = useAsync(() => Promise.all([api.listCraftItems(), api.listWorkshops(), api.listArtisans()]), []);

  return (
    <>
      <Container className="pt-10 sm:pt-16">
        <BentoGrid>
          <BentoCell cols={4} flush>
            <SmartImage src={placeholderImage("net-hero", "hero")} alt="" ratio="heroWide" priority className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-transparent" />
            <div className="relative flex min-h-[28rem] flex-col justify-center gap-5 p-8 sm:p-14">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-soft">{t("net.hero.eyebrow")}</p>
              <h1 className="max-w-2xl font-display text-4xl leading-[1.05] text-white sm:text-6xl">{t("net.hero.title")}</h1>
              <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{t("net.hero.subtitle")}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink to="#collection" size="lg">{t("net.hero.cta")}</ButtonLink>
                <ButtonLink to={NET_ROUTES.workshops} size="lg" variant="secondary">{t("net.hero.ctaSecondary")}</ButtonLink>
              </div>
            </div>
          </BentoCell>
          <BentoCell cols={2} tone="ink">
            <ShieldCheck className="size-6 text-gold-soft" aria-hidden />
            <h2 className="mt-4 font-display text-2xl">{t("org.bento.registryTitle")}</h2>
            <p className="mt-2 text-canvas/75">{t("org.bento.registryBody")}</p>
          </BentoCell>
          <BentoCell>
            <Sparkles className="size-6 text-brand" aria-hidden />
            <h2 className="mt-4 font-display text-xl text-ink">{t("org.bento.directoryTitle")}</h2>
          </BentoCell>
          <BentoCell tone="accent">
            <Hammer className="size-6" aria-hidden />
            <h2 className="mt-4 font-display text-xl">{t("net.workshops.title")}</h2>
            <p className="mt-1 text-sm text-white/85">{t("net.workshops.subtitle")}</p>
          </BentoCell>
        </BentoGrid>
      </Container>

      <Async state={state}>
        {([items, workshops, artisans]) => {
          const nameOf = new Map(artisans.data.map((a) => [a.id, a.name]));
          return (
            <>
              <Container id="collection" className="mt-24 scroll-mt-24">
                <SectionHeading eyebrow="Warisan.net" title={t("net.grid.title")} subtitle={t("net.grid.subtitle")} />
                <DemoNotice source={items.source} />
                {items.data.length === 0 ? (
                  <p className="mt-6 text-muted">{t("net.grid.empty")}</p>
                ) : (
                  <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                    {items.data.map((item) => (
                      <CraftCard key={item.id} item={item} artisanName={nameOf.get(item.artisan_id)} />
                    ))}
                  </div>
                )}
              </Container>
              <Container className="mt-24">
                <SectionHeading eyebrow="Adiguru Kraf" title={t("net.workshops.title")} subtitle={t("net.workshops.subtitle")} />
                <div className="grid gap-6 md:grid-cols-3">
                  {workshops.data.slice(0, 3).map((w) => (
                    <WorkshopCard key={w.id} workshop={w} artisanName={nameOf.get(w.artisan_id)} />
                  ))}
                </div>
              </Container>
            </>
          );
        }}
      </Async>
    </>
  );
}
