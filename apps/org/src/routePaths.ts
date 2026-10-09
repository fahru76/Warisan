/** Warisan.org route table. `provenance` is the QR code target — do not change without a redirect. */
export const ORG_ROUTES = {
  home: "/",
  artisans: "/artisans",
  artisan: "/artisans/:artisanId",
  provenanceLookup: "/provenance",
  provenance: "/provenance/:provenanceId",
  register: "/register",
  admin: "/admin",
  privacy: "/privacy-policy",
  terms: "/terms",
  vendor: "/vendor-agreement"
} as const;

export const artisanPath = (id: string) => `/artisans/${id}`;
export const provenancePath = (id: string) => `/provenance/${id}`;
