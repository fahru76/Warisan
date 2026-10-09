import { useTranslation } from "react-i18next";
import { Async, Container, DemoNotice, SectionHeading, api, useAsync, useSeo } from "@warisan/ui";
import { ArtisanCard } from "./ArtisanCard";

export function DirectoryPage() {
  const { t } = useTranslation();
  useSeo({ title: `${t("org.directory.title")} — Warisan.org`, description: t("org.directory.subtitle"), siteName: "Warisan.org" });
  const state = useAsync(() => api.listArtisans(), []);
  return (
    <Container className="py-16">
      <SectionHeading as="h1" eyebrow="Warisan.org" title={t("org.directory.title")} subtitle={t("org.directory.subtitle")} />
      <Async state={state}>
        {(res) => (
          <div className="space-y-6">
            <DemoNotice source={res.source} />
            {res.data.length === 0 ? (
              <p className="text-muted">{t("org.directory.empty")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {res.data.map((a) => (
                  <ArtisanCard key={a.id} artisan={a} />
                ))}
              </div>
            )}
          </div>
        )}
      </Async>
    </Container>
  );
}
