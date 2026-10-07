import { useTranslation } from "react-i18next";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { Button } from "./Button";
import type { AsyncState } from "../data/useAsync";
import type { ReactNode } from "react";

export function Loading() {
  const { t } = useTranslation();
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-20 text-muted">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      {t("common.loading")}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-20 text-center">
      <AlertTriangle className="size-8 text-accent" aria-hidden />
      <p className="text-ink">{t("common.error")}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>{t("common.retry")}</Button>}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-2xl border border-line bg-surface/70 px-4 py-3 text-sm text-muted">
      <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function DemoNotice({ source }: { source: "live" | "fixture" }) {
  const { t } = useTranslation();
  return source === "fixture" ? <Notice>{t("common.demoData")}</Notice> : null;
}

/** Renders loading / error, else the children with the loaded value. */
export function Async<T>({ state, children }: { state: AsyncState<T> & { reload: () => void }; children: (value: T) => ReactNode }) {
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorState onRetry={state.reload} />;
  return <>{children(state.value)}</>;
}
