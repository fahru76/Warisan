export const NET_ROUTES = {
  home: "/",
  craft: "/crafts/:craftId",
  workshops: "/workshops",
  workshop: "/workshops/:workshopId",
  checkout: "/checkout/:craftId",
  account: "/account",
  privacy: "/privacy-policy",
  terms: "/terms",
  vendor: "/vendor-agreement"
} as const;

export const craftPath = (id: string) => `/crafts/${id}`;
export const workshopPath = (id: string) => `/workshops/${id}`;
export const checkoutPath = (id: string) => `/checkout/${id}`;
