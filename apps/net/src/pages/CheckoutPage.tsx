import { useState, type FormEvent } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { CheckCircle2, FlaskConical, Landmark } from "lucide-react";
import { Async, Button, ButtonLink, Container, GlassCard, Notice, PaymentError, PdpaConsent, SmartImage, api, createOrder, createPaymentIntent, formatMyr, placeholderImage, toLang, useAsync, useSeo, useSession, type PaymentIntent } from "@warisan/ui";
import { NET_ROUTES } from "../routePaths";
import { NotFoundPage } from "./NotFoundPage";

export function CheckoutPage() {
  const { craftId = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = toLang(i18n.language);
  const state = useAsync(() => api.getCraftItem(craftId), [craftId]);
  const { user, live } = useSession();
  const needsSignIn = live && !user;
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // One key per checkout attempt so retries/double-clicks are idempotent server-side.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  useSeo({ title: `${t("net.checkout.title")} — Warisan.net`, description: t("net.checkout.testMode"), siteName: "Warisan.net" });

  return (
    <Async state={state}>
      {(res) => {
        const item = res.data;
        if (!item) return <NotFoundPage message={t("net.product.notFound")} />;
        const mode = item.is_local_pickup_only ? "pickup" : fulfilment;

        const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (new FormData(e.currentTarget).get("pdpa_consent") !== "yes") return setError(t("pdpa.required"));
          setError(null);
          setBusy(true);
          try {
            // Prices are never sent: create_order prices the line server-side and the payment
            // function reads the amount from that pending order. The same key makes retries idempotent.
            const orderId = await createOrder({ items: [{ craftItemId: item.id, quantity: 1 }], idempotencyKey });
            setIntent(await createPaymentIntent({ orderId, idempotencyKey, demoAmountMyr: item.price_myr }));
          } catch (err) {
            if (err instanceof PaymentError && err.message.includes("not available")) setError(t("net.checkout.notAvailable"));
            else setError(err instanceof Error ? err.message : t("common.error"));
          } finally {
            setBusy(false);
          }
        };

        return (
          <Container className="max-w-5xl py-12 sm:py-16">
            <h1 className="font-display text-4xl text-ink">{t("net.checkout.title")}</h1>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
              <FlaskConical className="size-4" aria-hidden /> {t("net.checkout.testMode")}
            </p>
            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <GlassCard className="h-fit overflow-hidden">
                <SmartImage src={placeholderImage(item.id, "product")} alt={item.name} ratio="product" />
                <div className="flex items-center justify-between gap-4 p-6">
                  <p className="font-display text-lg text-ink">{item.name}</p>
                  <p className="font-semibold text-ink">{formatMyr(item.price_myr, lang)}</p>
                </div>
              </GlassCard>
              <GlassCard className="p-6 sm:p-8">
                {intent ? (
                  <div role="status" className="flex flex-col items-center gap-3 py-10 text-center">
                    <CheckCircle2 className="size-12 text-brand" aria-hidden />
                    <p className="text-lg font-medium text-ink">{t("net.checkout.success")}</p>
                    <p className="text-sm text-muted">{t("net.checkout.order")}: <span className="font-mono">{intent.orderId}</span></p>
                    <p className="text-sm text-muted">{t("net.checkout.reference")}: <span className="font-mono">{intent.paymentIntentId}</span></p>
                    <p className="text-sm text-muted">{formatMyr(intent.amountMyr, lang)} · {intent.status}</p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-6">
                    <fieldset>
                      <legend className="mb-3 font-medium text-ink">{t("net.checkout.fulfilment")}</legend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(["delivery", "pickup"] as const).map((opt) => {
                          const disabled = opt === "delivery" && item.is_local_pickup_only;
                          return (
                            <label key={opt} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 ${mode === opt ? "border-brand bg-brand/5" : "border-line"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
                              <input type="radio" name="fulfilment" value={opt} checked={mode === opt} disabled={disabled} onChange={() => setFulfilment(opt)} className="size-4 accent-[var(--color-brand)]" />
                              <span className="text-ink">{t(`net.checkout.${opt}`)}</span>
                            </label>
                          );
                        })}
                      </div>
                      {item.is_local_pickup_only && <p className="mt-2 text-sm text-muted">{t("net.product.pickupOnlyHelp")}</p>}
                    </fieldset>
                    <fieldset>
                      <legend className="mb-3 font-medium text-ink">{t("net.checkout.method")}</legend>
                      <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-brand bg-brand/5 px-4">
                        <input type="radio" name="method" value="fpx" defaultChecked className="size-4 accent-[var(--color-brand)]" />
                        <Landmark className="size-5 text-brand" aria-hidden />
                        <span className="text-ink">{t("net.checkout.fpx")}</span>
                      </label>
                    </fieldset>
                    <PdpaConsent label={t("pdpa.consent")} />
                    <div className="flex items-center justify-between border-t border-line pt-5">
                      <span className="text-muted">{t("net.checkout.total")}</span>
                      <span className="text-2xl font-semibold text-ink">{formatMyr(item.price_myr, lang)}</span>
                    </div>
                    {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
                    <Notice>{t("net.checkout.testMode")}</Notice>
                    {needsSignIn && (
                      <div className="space-y-3">
                        <Notice>{t("net.checkout.signInRequired")}</Notice>
                        <ButtonLink to={NET_ROUTES.account} variant="secondary" className="w-full">{t("nav.account")}</ButtonLink>
                      </div>
                    )}
                    <Button type="submit" size="lg" className="w-full" disabled={busy || needsSignIn}>{t("net.checkout.pay")}</Button>
                  </form>
                )}
              </GlassCard>
            </div>
          </Container>
        );
      }}
    </Async>
  );
}
