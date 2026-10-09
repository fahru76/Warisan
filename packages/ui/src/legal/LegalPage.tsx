import { useTranslation } from "react-i18next";
import { Container } from "../components/Surfaces";
import { Notice } from "../components/States";
import { useSeo } from "../i18n/useSeo";
import { legalContent, LEGAL_LAST_UPDATED } from "./content";
import type { LegalDoc } from "./paths";
import { toLang } from "../lib/format";

const TITLE_KEY = { privacy: "legal.privacy", terms: "legal.terms", vendor: "legal.vendor" } as const;

export function LegalPage({ doc, siteName }: { doc: LegalDoc; siteName: string }) {
  const { t, i18n } = useTranslation();
  const lang = toLang(i18n.language);
  const title = t(TITLE_KEY[doc]);
  useSeo({ title: `${title} — ${siteName}`, description: legalContent[lang][doc][0].body, siteName });

  return (
    <Container className="max-w-3xl py-16">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">
        {t("legal.lastUpdated")}: <time dateTime={LEGAL_LAST_UPDATED}>{LEGAL_LAST_UPDATED}</time>
      </p>
      <div className="mt-6">
        <Notice>{t("legal.placeholder")}</Notice>
      </div>
      <div className="mt-10 space-y-8">
        {legalContent[lang][doc].map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl text-ink">{section.heading}</h2>
            <p className="mt-2 leading-relaxed text-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </Container>
  );
}
