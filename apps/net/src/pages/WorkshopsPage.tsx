import { useTranslation } from "react-i18next";
import { Async, Container, DemoNotice, Notice, SectionHeading, api, useAsync, useSeo } from "@warisan/ui";
import { WorkshopCard } from "./WorkshopCard";

export function WorkshopsPage() {
  const { t } = useTranslation();
  useSeo({ title: `${t("net.workshops.title")} — Warisan.net`, description: t("net.workshops.subtitle"), siteName: "Warisan.net" });
  const state = useAsync(() => Promise.all([api.listWorkshops(), api.listArtisans()]), []);
  return (
    <Container className="py-16">
      <SectionHeading eyebrow="Adiguru Kraf" title={t("net.workshops.title")} subtitle={t("net.workshops.subtitle")} />
      <Async state={state}>
        {([workshops, artisans]) => {
          const nameOf = new Map(artisans.data.map((a) => [a.id, a.name]));
          return (
            <div className="space-y-6">
              <DemoNotice source={workshops.source} />
              <Notice>{t("common.kualaLumpurTime")}</Notice>
              {workshops.data.length === 0 ? (
                <p className="text-muted">{t("net.workshops.empty")}</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {workshops.data.map((w) => (
                    <WorkshopCard key={w.id} workshop={w} artisanName={nameOf.get(w.artisan_id)} />
                  ))}
                </div>
              )}
            </div>
          );
        }}
      </Async>
    </Container>
  );
}
