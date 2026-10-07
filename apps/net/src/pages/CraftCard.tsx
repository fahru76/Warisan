import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { PackageCheck, Store } from "lucide-react";
import { SmartImage, formatMyr, placeholderImage, toLang, type CraftItem } from "@warisan/ui";
import { craftPath } from "../routePaths";

export function CraftCard({ item, artisanName }: { item: CraftItem; artisanName?: string }) {
  const { t, i18n } = useTranslation();
  const lang = toLang(i18n.language);
  return (
    <Link to={craftPath(item.id)} className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
      <div className="relative">
        <SmartImage src={placeholderImage(item.id, "product")} alt={item.name} ratio="product" className="rounded-3xl shadow-[0_14px_40px_-18px_rgba(42,37,34,0.45)]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
        {item.is_local_pickup_only && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-canvas backdrop-blur">
            <Store className="size-3.5" aria-hidden /> {t("net.product.pickupOnly")}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg text-ink group-hover:text-brand">{item.name}</h3>
          {artisanName && <p className="mt-0.5 text-sm text-muted">{t("net.product.by")} {artisanName}</p>}
        </div>
        <p className="shrink-0 font-semibold text-ink">{formatMyr(item.price_myr, lang)}</p>
      </div>
      <p className="mt-2 inline-flex items-center gap-1 text-xs text-brand">
        <PackageCheck className="size-3.5" aria-hidden /> {t("net.product.provenance")}
      </p>
    </Link>
  );
}
