import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import { Async, Badge, Container, DemoNotice, GlassCard, NET_ORIGIN, SmartImage, api, formatKlDateTime, placeholderImage, toLang, useAsync, useSeo } from "@warisan/ui";
import { provenancePath } from "../routePaths";
import { NotFoundPage } from "./NotFoundPage";

export function ArtisanPage() {
  const { artisanId = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = toLang(i18n.language);
  const state = useAsync(
    () => Promise.all([api.getArtisan(artisanId), api.listCraftItems({ artisanId }), api.listWorkshops({ artisanId })]),
    [artisanId]
  );
  const artisan = state.status === "success" ? state.value[0].data : null;
  useSeo({
    title: artisan ? `${artisan.name} · ${artisan.craft_specialty} — Warisan.org` : "Warisan.org",
    description: artisan ? `${artisan.name}, Adiguru Kraf — ${artisan.craft_specialty}, ${artisan.location}.` : t("seo.orgDescription"),
    siteName: "Warisan.org",
    image: artisan ? placeholderImage(artisan.id, "portrait") : undefined
  });

  return (
    <Async state={state}>
      {([a, items, workshops]) =>
        !a.data ? (
          <NotFoundPage message={t("org.artisan.notFound")} />
        ) : (
          <Container className="py-12 sm:py-16">
            <DemoNotice source={a.source} />
            <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <SmartImage src={placeholderImage(a.data.id, "portrait")} alt={a.data.name} ratio="portraitTall" priority className="rounded-[2rem] shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]" />
              <div className="flex flex-col justify-center">
                <Badge className="self-start">
                  <BadgeCheck className="size-4" aria-hidden /> {t("org.artisan.verified")} · Adiguru Kraf
                </Badge>
                <h1 className="mt-4 font-display text-4xl text-ink sm:text-6xl">{a.data.name}</h1>
                <dl className="mt-6 grid grid-cols-2 gap-4">
                  <GlassCard className="p-5">
                    <dt className="text-xs uppercase tracking-widest text-muted">{t("org.artisan.specialty")}</dt>
                    <dd className="mt-1 font-display text-2xl text-brand">{a.data.craft_specialty}</dd>
                  </GlassCard>
                  <GlassCard className="p-5">
                    <dt className="text-xs uppercase tracking-widest text-muted">{t("org.artisan.location")}</dt>
                    <dd className="mt-1 flex items-center gap-1.5 font-display text-2xl text-ink">
                      <MapPin className="size-5 text-brand" aria-hidden /> {a.data.location}
                    </dd>
                  </GlassCard>
                </dl>
                <p className="mt-6 text-lg leading-relaxed text-muted">{a.data.bio}</p>
              </div>
            </div>

            <section className="mt-20">
              <h2 className="font-display text-3xl text-ink">{t("org.artisan.works")}</h2>
              <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {items.data.map((item) => (
                  <Link key={item.id} to={provenancePath(item.provenance_id)} className="group">
                    <SmartImage src={placeholderImage(item.id, "product")} alt={item.name} ratio="product" className="rounded-2xl" imgClassName="transition-transform duration-500 group-hover:scale-105" />
                    <p className="mt-3 font-medium text-ink group-hover:text-brand">{item.name}</p>
                    <p className="font-mono text-xs text-muted">{item.provenance_id.slice(0, 8)}…</p>
                  </Link>
                ))}
              </div>
            </section>

            {workshops.data.length > 0 && (
              <section className="mt-20">
                <h2 className="font-display text-3xl text-ink">{t("org.artisan.workshops")}</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {workshops.data.map((w) => (
                    <GlassCard key={w.id} className="flex items-center justify-between gap-4 p-5">
                      <div>
                        <p className="font-medium text-ink">{w.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                          <CalendarDays className="size-4" aria-hidden /> {formatKlDateTime(w.starts_at, lang)} MYT
                        </p>
                      </div>
                      <a href={`${NET_ORIGIN}/workshops/${w.id}`} className="shrink-0 text-sm font-semibold text-brand underline underline-offset-4">
                        {t("org.artisan.bookOnNet")}
                      </a>
                    </GlassCard>
                  ))}
                </div>
              </section>
            )}
          </Container>
        )
      }
    </Async>
  );
}
