import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, LogOut } from "lucide-react";
import { Async, Button, Container, Field, GlassCard, Notice, PdpaConsent, SectionHeading, api, cn, formatKlDateTime, formatMyr, signInWithPassword, signOut, signUp, toLang, useAsync, useSeo, useSession } from "@warisan/ui";

export function AccountPage() {
  const { t } = useTranslation();
  const { user, live, loading } = useSession();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  useSeo({ title: `${t("net.account.title")} — Warisan.net`, description: t("seo.netDescription"), siteName: "Warisan.net" });

  return (
    <Container className="max-w-lg py-16">
      <SectionHeading as="h1" title={t("net.account.title")} />
      <GlassCard className="p-6 sm:p-8">
        {!live ? (
          <Notice>{t("net.account.offline")}</Notice>
        ) : loading ? null : user ? (
          <div className="space-y-5">
            <p className="text-ink">{t("net.account.signedInAs")} <strong>{user.email}</strong></p>
            <Button variant="secondary" onClick={() => void signOut()}><LogOut className="size-4" aria-hidden /> {t("common.signOut")}</Button>
            <OrderHistory userId={user.id} />
          </div>
        ) : (
          <>
            <div role="tablist" className="mb-6 grid grid-cols-2 rounded-full border border-line p-1">
              {(["signin", "register"] as const).map((id) => (
                <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)} className={cn("min-h-11 rounded-full text-sm font-semibold", tab === id ? "bg-ink text-canvas" : "text-muted")}>
                  {t(id === "signin" ? "net.account.signInTab" : "net.account.registerTab")}
                </button>
              ))}
            </div>
            {tab === "signin" ? <SignInForm /> : <RegisterForm />}
          </>
        )}
      </GlassCard>
    </Container>
  );
}

function OrderHistory({ userId }: { userId: string }) {
  const { t, i18n } = useTranslation();
  const lang = toLang(i18n.language);
  const state = useAsync(() => api.listMyOrders(), [userId]);
  return (
    <section aria-labelledby="orders-heading" className="border-t border-line pt-5">
      <h2 id="orders-heading" className="font-display text-xl text-ink">{t("net.account.orders")}</h2>
      <Async state={state}>
        {({ data }) =>
          data.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t("net.account.ordersEmpty")}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {data.map((order) => (
                <li key={order.id} className="rounded-2xl border border-line p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm text-muted">{formatKlDateTime(order.created_at, lang)} MYT</span>
                    <span className="text-sm font-semibold text-ink">{t(`net.orderStatus.${order.status}`)}</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-ink">
                    {order.lines.map((line) => (
                      <li key={line.craft_item_id} className="flex justify-between gap-3">
                        <span>{line.name ?? t("net.account.unlisted")} × {line.quantity}</span>
                        <span>{formatMyr(line.unit_price_myr * line.quantity, lang)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-ink">
                    <span>{t("net.checkout.total")}</span>
                    <span>{formatMyr(order.total_myr, lang)}</span>
                  </p>
                </li>
              ))}
            </ul>
          )
        }
      </Async>
    </section>
  );
}

function SignInForm() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      setError(null);
      await signInWithPassword(String(form.get("email")), String(form.get("password")));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field name="email" type="email" label={t("common.email")} required autoComplete="email" />
      <Field name="password" type="password" label={t("common.password")} required autoComplete="current-password" />
      {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
      <Button type="submit" size="lg" className="w-full">{t("common.signIn")}</Button>
    </form>
  );
}

function RegisterForm() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("pdpa_consent") !== "yes") return setError(t("pdpa.required"));
    try {
      setError(null);
      await signUp(
        {
          email: String(form.get("email")),
          password: String(form.get("password")),
          displayName: String(form.get("name")),
          pdpaConsent: true,
          marketingOptIn: form.get("marketing_opt_in") === "yes",
          applyingAs: "customer"
        },
        `${window.location.origin}/account`
      );
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };
  if (done)
    return (
      <p role="status" className="flex items-center gap-3 text-ink">
        <CheckCircle2 className="size-6 text-brand" aria-hidden /> {t("net.account.registered")}
      </p>
    );
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field name="name" label={t("common.fullName")} required autoComplete="name" />
      <Field name="email" type="email" label={t("common.email")} required autoComplete="email" />
      <Field name="password" type="password" label={t("common.password")} required minLength={8} autoComplete="new-password" />
      <PdpaConsent label={t("pdpa.consent")} />
      <PdpaConsent name="marketing_opt_in" required={false} label={t("pdpa.marketing")} />
      {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
      <Button type="submit" size="lg" className="w-full">{t("net.account.register")}</Button>
    </form>
  );
}
