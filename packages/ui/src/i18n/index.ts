import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";
import type { Lang } from "../lib/format";

const STORAGE_KEY = "warisan.lang";

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ms") return stored;
  } catch {
    // storage blocked: fall through to browser language
  }
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("ms")) return "ms";
  return "en";
}

export function initI18n() {
  if (i18n.isInitialized) return i18n;
  void i18n.use(initReactI18next).init({
    resources,
    lng: initialLang(),
    fallbackLng: "en",
    supportedLngs: ["en", "ms"],
    interpolation: { escapeValue: false },
    returnNull: false
  });
  i18n.on("languageChanged", (lng) => {
    document.documentElement.lang = lng;
    try {
      localStorage.setItem(STORAGE_KEY, lng);
    } catch {
      // ignore
    }
  });
  document.documentElement.lang = i18n.language;
  return i18n;
}

export { PROTECTED_TERMS, resources } from "./resources";
