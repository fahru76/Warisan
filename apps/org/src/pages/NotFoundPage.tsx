import { useTranslation } from "react-i18next";
import { ButtonLink, Container } from "@warisan/ui";

export function NotFoundPage({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <Container className="flex flex-col items-center gap-6 py-28 text-center">
      <p className="font-display text-7xl text-brand/30">404</p>
      <p className="text-lg text-ink">{message ?? t("common.notFound")}</p>
      <ButtonLink to="/" variant="secondary">{t("common.backHome")}</ButtonLink>
    </Container>
  );
}
