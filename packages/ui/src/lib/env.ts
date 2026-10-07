import { DEFAULT_ORG_ORIGIN } from "./provenance";

const env = import.meta.env ?? {};

export const ORG_ORIGIN: string = env.VITE_ORG_ORIGIN || DEFAULT_ORG_ORIGIN;
export const NET_ORIGIN: string = env.VITE_NET_ORIGIN || "https://warisan.net";
