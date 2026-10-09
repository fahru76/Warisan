export const DEFAULT_ORG_ORIGIN = "https://warisan.org";
export const PROVENANCE_PATH_PREFIX = "/provenance/";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

/** Canonical Warisan.org registry URL for a craft item's provenance_id. This is the QR code payload. */
export function buildProvenanceUrl(provenanceId: string, orgOrigin: string = DEFAULT_ORG_ORIGIN): string {
  if (!isUuid(provenanceId)) throw new Error(`Invalid provenance_id: ${provenanceId}`);
  return new URL(`${PROVENANCE_PATH_PREFIX}${provenanceId.toLowerCase()}`, orgOrigin).toString();
}

/** Accepts a full registry URL, a path, or a bare UUID (e.g. typed from a printed tag). */
export function parseProvenanceId(input: string): string | null {
  const trimmed = input.trim();
  if (isUuid(trimmed)) return trimmed.toLowerCase();
  try {
    const { pathname } = new URL(trimmed, DEFAULT_ORG_ORIGIN);
    if (!pathname.startsWith(PROVENANCE_PATH_PREFIX)) return null;
    const id = pathname.slice(PROVENANCE_PATH_PREFIX.length).replace(/\/$/, "");
    return isUuid(id) ? id.toLowerCase() : null;
  } catch {
    return null;
  }
}
