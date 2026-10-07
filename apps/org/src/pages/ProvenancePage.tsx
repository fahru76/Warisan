import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Async, Button, Container, DemoNotice, Field, GlassCard, NET_ORIGIN, SectionHeading, SmartImage, api, formatKlDateTime, parseProvenanceId, placeholderImage, toLang, useAsync, useSeo } from "@warisan/ui";
import { artisanPath, provenancePath } from "../routePaths";

export function ProvenanceLookupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [invalid, setInvalid] = useState(false);
  useSeo({ title: `${t("org.provenance.title")} — Warisan.org`, description: t("org.provenance.subtitle"), siteName: "Warisan.org" });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = parseProvenanceId(String(new FormData(e.currentTarget).get("q") ?? ""));
    setInvalid(!id);
    if (id) navigate(provenancePath(id));
  };

  return (
    <Container className="max-w-2xl py-16">
      <SectionHeading eyebrow="Warisan.org" title={t("org.provenance.title")} subtitle={t("org.provenance.subtitle")} />
      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Field name="q" label={t("org.provenance.inputLabel")} large autoComplete="off" spellCheck={false} placeholder="b0f1c2d3-…" aria-invalid={invalid} />
          {invalid && <p role="alert" className="text-sm font-medium text-red-700">{t("org.provenance.invalid")}</p>}
          <Button type="submit" size="xl">{t("org.provenance.lookup")}</Button>
        </form>
      </GlassCard>
    </Container>
  );
}

export function ProvenancePage() {
  const { provenanceId = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = toLang(i18n.language);
  const id = parseProvenanceId(provenanceId);
  const state = useAsync(() => (id ? api.getProvenance(id) : Promise.resolve({ data: null, source: "fixture" as const })), [id]);
  const record = state.status === "success" ? state.value.data : null;
  useSeo({
    title: record ? `${record.item.name} — ${t("org.provenance.authentic")} · Warisan.org` : `${t("org.provenance.title")} — Warisan.org`,
    description: record ? `${record.item.name} by ${record.artisan?.name ?? "—"}. ${t("org.provenance.provenanceId")}: ${record.item.provenance_id}` : t("org.provenance.subtitle"),
    siteName: "Warisan.org",
    image: record ? placeholderImage(record.item.id, "product") : undefined
  });

  return (
    <Container className="max-w-4xl py-16">
      <Async state={state}>
        {(res) =>
          !res.data ? (
            <GlassCard className="flex flex-col items-center gap-4 p-10 text-center">
              <ShieldAlert className="size-12 text-red-700" aria-hidden />
              <h1 className="font-display text-3xl text-ink">{t("org.provenance.title")}</h1>
              <p role="alert" className="max-w-md text-muted">{id ? t("org.provenance.notFound") : t("org.provenance.invalid")}</p>
              <Link to="/provenance" className="font-semibold text-brand underline underline-offset-4">{t("org.provenance.lookup")}</Link>
            </GlassCard>
          ) : (
            <div className="space-y-6">
              <DemoNotice source={res.source} />
              <GlassCard className="grid overflow-hidden md:grid-cols-2">
                <SmartImage src={placeholderImage(res.data.item.id, "product")} alt={res.data.item.name} ratio="product" priority />
                <div className="flex flex-col gap-5 p-8">
                  <p className="inline-flex items-center gap-2 self-start rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand">
                    <ShieldCheck className="size-4" aria-hidden /> {t("org.provenance.authentic")}
                  </p>
                  <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">{res.data.item.name}</h1>
                  <p className="text-muted">{res.data.item.description}</p>
                  <dl className="space-y-3 border-t border-line pt-5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">{t("org.provenance.maker")}</dt>
                      <dd className="text-right font-medium text-ink">
                        {res.data.artisan ? <Link to={artisanPath(res.data.artisan.id)} className="text-brand underline underline-offset-4">{res.data.artisan.name}</Link> : "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">{t("org.provenance.registeredOn")}</dt>
                      <dd className="text-right text-ink">{formatKlDateTime(res.data.item.created_at, lang)} MYT</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-muted">{t("org.provenance.provenanceId")}</dt>
                      <dd className="break-all font-mono text-xs text-ink">{res.data.item.provenance_id}</dd>
                    </div>
                  </dl>
                  <a href={`${NET_ORIGIN}/crafts/${res.data.item.id}`} className="mt-auto text-sm font-semibold text-brand underline underline-offset-4">
                    {t("org.provenance.shop")}
                  </a>
                </div>
              </GlassCard>
            </div>
          )
        }
      </Async>
    </Container>
  );
}
