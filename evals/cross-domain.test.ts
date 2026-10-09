import { describe, expect, it, beforeAll } from "vitest";
import { matchPath } from "react-router";
import { ORG_ROUTES } from "../apps/org/src/routePaths";
import { NET_ROUTES } from "../apps/net/src/routePaths";
import { LEGAL_PATHS } from "../packages/ui/src/legal/paths";
import { buildProvenanceUrl, parseProvenanceId } from "../packages/ui/src/lib/provenance";
import { fixtureArtisans, fixtureCraftItems, fixtureWorkshops } from "../packages/ui/src/data/fixtures";
import { formatKlDateTime, KL_TIMEZONE } from "../packages/ui/src/lib/format";
import { resources, PROTECTED_TERMS } from "../packages/ui/src/i18n/resources";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("1. provenance round-trip (net → org)", () => {
  it.each(fixtureCraftItems.map((i) => [i.name, i.provenance_id]))("%s", (_name, id) => {
    const url = new URL(buildProvenanceUrl(id, "https://warisan.org"));
    expect(url.origin).toBe("https://warisan.org");
    const match = matchPath(ORG_ROUTES.provenance, url.pathname);
    expect(match?.params.provenanceId).toBe(id);
    expect(parseProvenanceId(url.toString())).toBe(id);
  });
});

describe("2. legal route parity", () => {
  it("both domains expose every legal route", () => {
    const org = Object.values(ORG_ROUTES);
    const net = Object.values(NET_ROUTES);
    for (const path of LEGAL_PATHS) {
      expect(org).toContain(path);
      expect(net).toContain(path);
    }
    expect([...LEGAL_PATHS].sort()).toEqual(["/privacy-policy", "/terms", "/vendor-agreement"]);
  });
});

describe("3. registry ⇄ marketplace referential integrity", () => {
  const verified = new Set(fixtureArtisans.filter((a) => a.is_verified).map((a) => a.id));
  it("meets seed contract counts", () => {
    expect(fixtureArtisans.length).toBeGreaterThanOrEqual(5);
    expect(fixtureCraftItems.length).toBeGreaterThanOrEqual(10);
    expect(fixtureWorkshops.length).toBeGreaterThanOrEqual(3);
  });
  it("every item and workshop belongs to a verified artisan and is published", () => {
    for (const row of [...fixtureCraftItems, ...fixtureWorkshops]) {
      expect(verified.has(row.artisan_id)).toBe(true);
      expect(row.is_published).toBe(true);
    }
  });
  it("provenance ids are unique v4 UUIDs", () => {
    const ids = fixtureCraftItems.map((i) => i.provenance_id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(UUID_V4);
  });
  it("workshop windows are valid", () => {
    for (const w of fixtureWorkshops) expect(Date.parse(w.ends_at)).toBeGreaterThan(Date.parse(w.starts_at));
  });
});

describe("4. Asia/Kuala_Lumpur determinism", () => {
  beforeAll(() => {
    process.env.TZ = "America/New_York";
  });
  it("uses the KL zone constant", () => {
    expect(KL_TIMEZONE).toBe("Asia/Kuala_Lumpur");
  });
  it("01:00Z renders as 09:00 KL in both languages", () => {
    const iso = "2026-11-01T01:00:00Z";
    expect(formatKlDateTime(iso, "en")).toMatch(/09:00/);
    expect(formatKlDateTime(iso, "ms")).toMatch(/09:00/);
    expect(formatKlDateTime(iso, "en")).toMatch(/1/);
  });
  it("crosses the date line correctly (16:30Z → next day 00:30 KL)", () => {
    expect(formatKlDateTime("2026-11-01T16:30:00Z", "en")).toMatch(/2 Nov 2026.*00:30/);
  });
});

describe("5. bilingual + protected cultural terms", () => {
  type Tree = { [k: string]: string | Tree };
  const flatten = (tree: Tree, prefix = ""): Record<string, string> =>
    Object.entries(tree).reduce<Record<string, string>>((acc, [k, v]) => {
      const key = prefix ? `${prefix}.${k}` : k;
      return typeof v === "string" ? { ...acc, [key]: v } : { ...acc, ...flatten(v, key) };
    }, {});
  const en = flatten(resources.en.translation as Tree);
  const ms = flatten(resources.ms.translation as Tree);

  it("EN and BM have identical key sets", () => {
    expect(Object.keys(ms).sort()).toEqual(Object.keys(en).sort());
  });
  it("protected terms are never translated", () => {
    expect(PROTECTED_TERMS).toEqual(expect.arrayContaining(["Adiguru Kraf", "Songket", "Canting", "Ukiran", "Labu Sayong"]));
    for (const key of Object.keys(en)) {
      for (const term of PROTECTED_TERMS) {
        expect({ key, term, inMs: ms[key].includes(term) }).toEqual({ key, term, inMs: en[key].includes(term) });
      }
    }
  });
});
