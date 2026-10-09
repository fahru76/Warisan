import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { Button, Container, Field, GlassCard, Notice, PdpaConsent, SectionHeading, isLive, signUp, useSeo } from "@warisan/ui";

export function RegisterPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "offline">("idle");
  const [error, setError] = useState<string | null>(null);
  useSeo({ title: `${t("org.register.title")} — Warisan.org`, description: t("org.register.subtitle"), siteName: "Warisan.org" });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("pdpa_consent") !== "yes") return setError(t("pdpa.required"));
    setError(null);
    if (!isLive()) return setStatus("offline");
    setStatus("submitting");
    try {
      await signUp(
        {
          email: String(form.get("email")),
          password: String(form.get("password")),
          displayName: String(form.get("name")),
          pdpaConsent: true,
          marketingOptIn: form.get("marketing_opt_in") === "yes",
          applyingAs: "artisan",
          craftSpecialty: String(form.get("specialty")),
          location: String(form.get("location"))
        },
        `${window.location.origin}/`
      );
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
      setStatus("idle");
    }
  };

  return (
    <Container className="max-w-2xl py-16">
      <SectionHeading eyebrow="Adiguru Kraf" title={t("org.register.title")} subtitle={t("org.register.subtitle")} />
      <GlassCard className="p-6 sm:p-8">
        {status === "done" || status === "offline" ? (
          <div role="status" className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle2 className="size-12 text-brand" aria-hidden />
            <p className="text-lg text-ink">{status === "done" ? t("org.register.success") : t("org.register.offline")}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <Field name="name" label={t("common.fullName")} required autoComplete="name" large />
            <Field name="email" type="email" label={t("common.email")} required autoComplete="email" large />
            <Field name="password" type="password" label={t("common.password")} required minLength={8} autoComplete="new-password" large />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="specialty" label={t("org.register.specialty")} required placeholder="Songket" large />
              <Field name="location" label={t("org.register.location")} required placeholder="Kuala Terengganu" large />
            </div>
            <div className="space-y-4 rounded-2xl bg-canvas p-4">
              <PdpaConsent label={t("pdpa.consent")} />
              <PdpaConsent name="marketing_opt_in" required={false} label={t("pdpa.marketing")} />
            </div>
            {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
            {!isLive() && <Notice>{t("org.register.offline")}</Notice>}
            <Button type="submit" size="xl" disabled={status === "submitting"}>{t("org.register.submit")}</Button>
          </form>
        )}
      </GlassCard>
    </Container>
  );
}
