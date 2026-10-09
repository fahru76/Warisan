import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as api from "../packages/ui/src/data/api";
import { fixtureArtisans, fixtureCraftItems, fixtureWorkshops } from "../packages/ui/src/data/fixtures";
import type { CraftItem, Workshop } from "../packages/ui/src/data/types";

/**
 * H-12 defence in depth: an unverified artisan can currently publish rows that RLS exposes publicly.
 * The frontend must never list them, sell them, or call them "authentic".
 */
const pending = fixtureArtisans.find((a) => !a.is_verified)!;
const rogueItem: CraftItem = {
  id: "dead0000-0000-4000-8000-000000000001",
  artisan_id: pending.id,
  name: "Counterfeit Songket",
  description: "Published by an unverified account.",
  price_myr: 99,
  provenance_id: "dead0000-0000-4000-8000-0000000000aa",
  is_local_pickup_only: false,
  is_published: true,
  created_at: "2026-10-07T00:00:00Z"
};
const rogueWorkshop: Workshop = {
  id: "dead0000-0000-4000-8000-000000000002",
  artisan_id: pending.id,
  title: "Fake workshop",
  description: "Published by an unverified account.",
  starts_at: "2026-12-01T01:00:00Z",
  ends_at: "2026-12-01T03:00:00Z",
  capacity: 5,
  price_myr: 50,
  is_published: true
};

beforeAll(() => {
  fixtureCraftItems.push(rogueItem);
  fixtureWorkshops.push(rogueWorkshop);
});
afterAll(() => {
  fixtureCraftItems.splice(fixtureCraftItems.indexOf(rogueItem), 1);
  fixtureWorkshops.splice(fixtureWorkshops.indexOf(rogueWorkshop), 1);
});

describe("only verified makers reach public surfaces (H-12)", () => {
  it("precondition: the pending artisan exists and is unverified", () => {
    expect(pending.is_verified).toBe(false);
  });
  it("marketplace grid excludes items from unverified artisans", async () => {
    const { data } = await api.listCraftItems();
    expect(data.map((i) => i.id)).not.toContain(rogueItem.id);
    expect(data.length).toBeGreaterThanOrEqual(10);
  });
  it("artisan-filtered listing for the unverified artisan is empty", async () => {
    expect((await api.listCraftItems({ artisanId: pending.id })).data).toEqual([]);
  });
  it("craft detail / checkout lookup returns null for an unverified maker", async () => {
    expect((await api.getCraftItem(rogueItem.id)).data).toBeNull();
  });
  it("workshop list and detail exclude unverified makers", async () => {
    expect((await api.listWorkshops()).data.map((w) => w.id)).not.toContain(rogueWorkshop.id);
    expect((await api.getWorkshop(rogueWorkshop.id)).data).toBeNull();
  });
  it("provenance lookup marks an unverified maker's piece as NOT verified", async () => {
    const res = await api.getProvenance(rogueItem.provenance_id);
    expect(res.data?.verified).toBe(false);
  });
  it("provenance lookup marks a verified maker's piece as verified", async () => {
    const res = await api.getProvenance(fixtureCraftItems[0].provenance_id);
    expect(res.data?.verified).toBe(true);
    expect(res.data?.artisan?.is_verified).toBe(true);
  });
});
