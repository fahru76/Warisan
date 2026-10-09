import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { BadgeCheck, LogOut, MapPin } from "lucide-react";
import { Async, Button, Container, Field, Notice, api, fetchProfile, signInWithPassword, signOut, useAsync, useSeo, useSession, type AppRole } from "@warisan/ui";

/** Hyper-accessible admin: single column, ≥56px tap targets, large high-contrast text. */
export function AdminPage() {
  const { t } = useTranslation();
  const { user, live, loading } = useSession();
  const [role, setRole] = useState<AppRole | null | "checking">("checking");
  useSeo({ title: `${t("org.admin.title")} — Warisan.org`, description: t("org.admin.subtitle"), siteName: "Warisan.org" });

  useEffect(() => {
    if (!user) return setRole(null);
    setRole("checking");
    fetchProfile(user.id).then((p) => setRole(p?.role ?? null), () => setRole(null));
  }, [user]);

  return (
    <Container className="max-w-xl py-10 sm:py-16">
      <h1 className="font-display text-4xl text-ink">{t("org.admin.title")}</h1>
      <p className="mt-2 text-lg text-muted">{t("org.admin.subtitle")}</p>
      <div className="mt-8">
        {!live ? (
          <>
            <Notice>{t("org.admin.offline")}</Notice>
            <div className="mt-6"><Queue /></div>
          </>
        ) : loading ? null : !user ? (
          <SignIn />
        ) : role === "checking" ? null : role === "admin" ? (
          <>
            <Button variant="secondary" size="xl" onClick={() => void signOut()}><LogOut className="size-5" aria-hidden /> {t("common.signOut")}</Button>
            <div className="mt-8"><Queue /></div>
          </>
        ) : (
          <div className="space-y-4">
            <p role="alert" className="rounded-2xl bg-red-50 p-5 text-lg font-medium text-red-800">{t("org.admin.notAdmin")}</p>
            <Button variant="secondary" size="xl" onClick={() => void signOut()}>{t("common.signOut")}</Button>
          </div>
        )}
      </div>
    </Container>
  );
}

function SignIn() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await signInWithPassword(String(form.get("email")), String(form.get("password")));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field name="email" type="email" label={t("common.email")} required autoComplete="email" large />
      <Field name="password" type="password" label={t("common.password")} required autoComplete="current-password" large />
      {error && <p role="alert" className="text-lg font-medium text-red-700">{error}</p>}
      <Button type="submit" size="xl" disabled={busy}>{t("common.signIn")}</Button>
    </form>
  );
}

function Queue() {
  const { t } = useTranslation();
  const state = useAsync(() => api.listPendingArtisans(), []);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const verify = async (id: string) => {
    setError(null);
    try {
      await api.verifyArtisan(id);
      setDone((prev) => new Set(prev).add(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  return (
    <section aria-labelledby="queue-title">
      <h2 id="queue-title" className="text-2xl font-semibold text-ink">{t("org.admin.pending")}</h2>
      {error && <p role="alert" className="mt-4 text-lg font-medium text-red-700">{error}</p>}
      <Async state={state}>
        {(res) =>
          res.data.length === 0 ? (
            <p className="mt-4 text-lg text-muted">{t("org.admin.empty")}</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {res.data.map((a) => (
                <li key={a.id} className="rounded-2xl border-2 border-line bg-surface p-5">
                  <p className="text-xl font-semibold text-ink">{a.name}</p>
                  <p className="mt-1 text-lg text-muted">{a.craft_specialty}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-lg text-muted"><MapPin className="size-5" aria-hidden /> {a.location}</p>
                  <div className="mt-4">
                    {done.has(a.id) ? (
                      <p role="status" className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-brand/10 text-lg font-semibold text-brand">
                        <BadgeCheck className="size-6" aria-hidden /> {t("org.admin.verified")}
                      </p>
                    ) : (
                      <Button size="xl" onClick={() => void verify(a.id)}>{t("org.admin.verify")}</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </Async>
    </section>
  );
}
