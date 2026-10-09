export const LEGAL_PATHS = ["/privacy-policy", "/terms", "/vendor-agreement"] as const;
export type LegalPath = (typeof LEGAL_PATHS)[number];
export type LegalDoc = "privacy" | "terms" | "vendor";

export const LEGAL_DOC_BY_PATH: Record<LegalPath, LegalDoc> = {
  "/privacy-policy": "privacy",
  "/terms": "terms",
  "/vendor-agreement": "vendor"
};
