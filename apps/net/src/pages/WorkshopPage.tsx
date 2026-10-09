import { useState, type FormEvent } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { CalendarDays, CheckCircle2, Users } from "lucide-react";
import { Async, Button, ButtonLink, Container, DemoNotice, Field, GlassCard, Notice, PdpaConsent, SmartImage, api, formatKlDateTime, formatKlTime, formatMyr, placeholderImage, toLang, useAsync, useSeo, useSession, type Workshop } from "@warisan/ui";
import { NET_ROUTES } from "../routePaths";
import { NotFoundPage } from "./NotFoundPage";

export function WorkshopPage() {
  const { workshopId = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = toLang(i18n.language);
  const state = useAsync(async () => {
    const workshop = await api.getWorkshop(workshopId);
    const artisan = workshop.data ? await api.getArtisan(workshop.data.artisan_id) : null;
    return { workshop, artisan: artisan?.data ?? null };
  }, [workshopId]);
  const w = state.status === "success" ? state.value.workshop.data : null;
  useSeo({ title: w ? `${w.title} — Warisan.net` : "Warisan.net", description: w?.description ?? t("net.workshops.subtitle"), siteName: "Warisan.net", image: w ? placeholderImage(w.id, "hero") : undefined });

  return (
    <Async state={state}>
      {({ workshop, artisan }) =>
        !workshop.data ? (
          <NotFoundPage />
        ) : (
          <Container className="py-12 sm:py-16">
            <DemoNotice source={workshop.source} />
            <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div>
                <SmartImage src={placeholderImage(workshop.data.id, "hero")} alt={workshop.data.title} ratio="hero" priority className="rounded-[2rem]" />
                {artisan && <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-accent">{artisan.name} · Adiguru Kraf</p>}
                <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">{workshop.data.title}</h1>
                <p className="mt-4 text-lg leading-relaxed text-muted">{workshop.data.description}</p>
                <div className="mt-6 flex flex-wrap gap-6 text-ink">
                  <span className="flex items-center gap-2"><CalendarDays className="size-5 text-accent" aria-hidden /> {formatKlDateTime(workshop.data.starts_at, lang)}–{formatKlTime(workshop.data.ends_at, lang)} MYT</span>
                  <span className="flex items-center gap-2"><Users className="size-5 text-accent" aria-hidden /> {workshop.data.capacity} {t("net.workshops.seats")}</span>
                </div>
              </div>
              <BookingForm workshop={workshop.data} />
            </div>
          </Container>
        )
      }
    </Async>
  );
}

function BookingForm({ workshop }: { workshop: Workshop }) {
  const { t, i18n } = useTranslation();
  const lang = toLang(i18n.language);
  const { user, live } = useSession();
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "offline">("idle");
  const outcomeMessage = { full: t("net.booking.full"), duplicate: t("net.booking.duplicate"), unavailable: t("net.booking.unavailable"), error: t("common.error") } as const;
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("pdpa_consent") !== "yes") return setError(t("pdpa.required"));
    setError(null);
    if (!live) return setStatus("offline");
    if (!user) return setError(t("net.booking.signInRequired"));
    setStatus("busy");
    const outcome = await api.requestBooking({ workshopId: workshop.id, customerId: user.id, quantity: qty, pdpaConsent: true });
    if (outcome === "booked") return setStatus("done");
    if (outcome === "demo") return setStatus("offline");
    setError(outcomeMessage[outcome]);
    setStatus("idle");
  };

  return (
    <GlassCard className="h-fit p-6 sm:p-8 lg:sticky lg:top-24">
      <h2 className="font-display text-2xl text-ink">{t("net.booking.title")}</h2>
      <p className="mt-2 text-3xl font-semibold text-ink">
        {formatMyr(workshop.price_myr * qty, lang)}
        <span className="ml-2 text-sm font-normal text-muted">{formatMyr(workshop.price_myr, lang)} / {t("net.workshops.perPerson")}</span>
      </p>
      {status === "done" || status === "offline" ? (
        <div role="status" className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="size-10 text-brand" aria-hidden />
          <p className="text-ink">{status === "done" ? t("net.booking.success") : t("net.booking.offline")}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <Field name="quantity" type="number" label={t("net.booking.quantity")} min={1} max={workshop.capacity} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(workshop.capacity, Number(e.target.value) || 1)))} />
          <PdpaConsent label={t("pdpa.consent")} />
          <PdpaConsent name="marketing_opt_in" required={false} label={t("pdpa.marketing")} />
          {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
          {live && !user && (
            <div className="space-y-3">
              <Notice>{t("net.booking.signInRequired")}</Notice>
              <ButtonLink to={NET_ROUTES.account} variant="secondary" className="w-full">{t("nav.account")}</ButtonLink>
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={status === "busy" || (live && !user)}>{t("net.booking.submit")}</Button>
          <p className="text-xs text-muted">{t("common.kualaLumpurTime")}</p>
        </form>
      )}
    </GlassCard>
  );
}
