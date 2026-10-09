import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const OG_LOCALE = { en: "en_MY", ms: "ms_MY" } as const;

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

export interface SeoInput {
  title: string;
  description: string;
  image?: string;
  siteName: string;
}

/**
 * Language-aware <title>, description, and Open Graph tags. Re-runs when the language changes.
 * Note: SPA meta tags are read by Google (JS rendering) but not by most social crawlers;
 * Day-6 launch task adds prerendering for share previews.
 */
export function useSeo({ title, description, image, siteName }: SeoInput) {
  const { i18n } = useTranslation();
  const lang = i18n.language === "ms" ? "ms" : "en";

  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:site_name", siteName);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", window.location.href);
    setMeta("property", "og:locale", OG_LOCALE[lang]);
    setMeta("property", "og:locale:alternate", OG_LOCALE[lang === "en" ? "ms" : "en"]);
    if (image) setMeta("property", "og:image", image);
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
  }, [title, description, image, siteName, lang]);
}
