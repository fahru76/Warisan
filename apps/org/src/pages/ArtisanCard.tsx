import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { BadgeCheck, MapPin } from "lucide-react";
import { Badge, SmartImage, placeholderImage, type Artisan } from "@warisan/ui";
import { artisanPath } from "../routePaths";

export function ArtisanCard({ artisan }: { artisan: Artisan }) {
  const { t } = useTranslation();
  return (
    <Link to={artisanPath(artisan.id)} className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
      <SmartImage src={placeholderImage(artisan.id, "portrait")} alt={artisan.name} ratio="portrait" className="rounded-3xl shadow-[0_12px_40px_-16px_rgba(15,23,42,0.35)]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-ink group-hover:text-brand">{artisan.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" aria-hidden /> {artisan.location}
          </p>
        </div>
        <Badge>
          <BadgeCheck className="size-3.5" aria-hidden /> {artisan.craft_specialty}
        </Badge>
      </div>
      <span className="sr-only">{t("org.artisan.verified")}</span>
    </Link>
  );
}
