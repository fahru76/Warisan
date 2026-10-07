import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ExternalLink, ShieldCheck, Store, Truck } from "lucide-react";
import { Async, ButtonLink, Container, DemoNotice, GlassCard, ORG_ORIGIN, SmartImage, api, buildProvenanceUrl, formatMyr, placeholderImage, toLang, useAsync, useSeo } from "@warisan/ui";
import { checkoutPath } from "../routePaths";
import { NotFoundPage } from "./NotFoundPage";

export function CraftPage() {
  const { craftId = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = toLang(i18n.language);
  const state = useAsync(async () => {
    const item = await api.getCraftItem(craftId);
    const artisan = item.data ? await api.getArtisan(item.data.artisan_id) : null;
    return { item, artisan: artisan?.data ?? null };
  }, [craftId]);
  const item = state.status === "success" ? state.value.item.data : null;
  useSeo({
    title: item ? `${item.name} — Warisan.net` : "Warisan.net",
    description: item ? `${item.description} ${formatMyr(item.price_myr, lang)}.` : t("seo.netDescription"),
    siteName: "Warisan.net",
    image: item ? placeholderImage(item.id, "product") : undefined
  });

  return (
    <Async state={state}>
      {({ item: res, artisan }) =>
        !res.data ? (
          <NotFoundPage message={t("net.product.notFound")} />
        ) : (
          <Container className="py-12 sm:py-16">
            <DemoNotice source={res.source} />
            <div className="mt-6 grid gap-10 lg:grid-cols-2">
              <SmartImage src={placeholderImage(res.data.id, "product")} alt={res.data.name} ratio="product" priority className="rounded-[2rem] shadow-[0_24px_60px_-24px_rgba(42,37,34,0.5)]" />
              <div className="flex flex-col gap-6">
                {artisan && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{artisan.craft_specialty} · {artisan.name}</p>}
                <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{res.data.name}</h1>
                <p className="text-3xl font-semibold text-ink">{formatMyr(res.data.price_myr, lang)}</p>
                <p className="text-lg leading-relaxed text-muted">{res.data.description}</p>
                <GlassCard className="flex items-start gap-3 p-5">
                  {res.data.is_local_pickup_only ? <Store className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /> : <Truck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />}
                  <div>
                    <p className="font-medium text-ink">{res.data.is_local_pickup_only ? t("net.product.pickupOnly") : t("net.product.ships")}</p>
                    {res.data.is_local_pickup_only && <p className="mt-1 text-sm text-muted">{t("net.product.pickupOnlyHelp")}</p>}
                  </div>
                </GlassCard>
                <a href={buildProvenanceUrl(res.data.provenance_id, ORG_ORIGIN)} className="inline-flex items-center gap-2 self-start rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/15">
                  <ShieldCheck className="size-4" aria-hidden /> {t("net.product.provenance")}: <span className="font-mono text-xs">{res.data.provenance_id.slice(0, 8)}…</span>
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
                <ButtonLink to={checkoutPath(res.data.id)} size="lg" className="self-start">{t("net.product.buy")}</ButtonLink>
              </div>
            </div>
          </Container>
        )
      }
    </Async>
  );
}
