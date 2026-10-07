import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { CalendarDays, Users } from "lucide-react";
import { GlassCard, SmartImage, formatKlDateTime, formatKlTime, formatMyr, placeholderImage, toLang, type Workshop } from "@warisan/ui";
import { workshopPath } from "../routePaths";

export function WorkshopCard({ workshop, artisanName }: { workshop: Workshop; artisanName?: string }) {
  const { t, i18n } = useTranslation();
  const lang = toLang(i18n.language);
  return (
    <Link to={workshopPath(workshop.id)} className="group block">
      <GlassCard className="overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_24px_60px_-20px_rgba(42,37,34,0.4)]">
        <SmartImage src={placeholderImage(workshop.id, "hero")} alt={workshop.title} ratio="hero" imgClassName="transition-transform duration-700 group-hover:scale-105" />
        <div className="space-y-3 p-6">
          <h3 className="font-display text-xl text-ink group-hover:text-brand">{workshop.title}</h3>
          {artisanName && <p className="text-sm text-muted">{t("net.product.by")} {artisanName} · Adiguru Kraf</p>}
          <p className="flex items-center gap-2 text-sm text-ink">
            <CalendarDays className="size-4 text-accent" aria-hidden />
            {formatKlDateTime(workshop.starts_at, lang)}–{formatKlTime(workshop.ends_at, lang)} MYT
          </p>
          <div className="flex items-center justify-between border-t border-line pt-3 text-sm">
            <span className="flex items-center gap-1.5 text-muted">
              <Users className="size-4" aria-hidden /> {workshop.capacity} {t("net.workshops.seats")}
            </span>
            <span className="font-semibold text-ink">
              {formatMyr(workshop.price_myr, lang)} <span className="font-normal text-muted">/ {t("net.workshops.perPerson")}</span>
            </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
