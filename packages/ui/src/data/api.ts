import { getSupabase } from "./supabase";
import { fixtureArtisans, fixtureCraftItems, fixtureWorkshops } from "./fixtures";
import type { Artisan, CraftItem, Result, Workshop } from "./types";

const ARTISAN_COLS = "id,profile_id,name,craft_specialty,bio,location,is_verified";
const ITEM_COLS = "id,artisan_id,name,description,price_myr,provenance_id,is_local_pickup_only,is_published,created_at";
const WORKSHOP_COLS = "id,artisan_id,title,description,starts_at,ends_at,capacity,price_myr,is_published";

function fixture<T>(data: T): Result<T> {
  return { data, source: "fixture" };
}

/** numeric(12,2) arrives from PostgREST as a string; normalise to number. */
function money<T extends { price_myr: number | string }>(row: T): T {
  return { ...row, price_myr: Number(row.price_myr) };
}

function warnIfEmpty(table: string, rows: unknown[]) {
  if (rows.length === 0) console.warn(`[warisan] ${table} returned 0 rows. If data exists, check is_published / is_verified and RLS (evals failure mode #1).`);
}

export async function listArtisans(): Promise<Result<Artisan[]>> {
  const sb = getSupabase();
  if (!sb) return fixture(fixtureArtisans.filter((a) => a.is_verified));
  const { data, error } = await sb.from("artisans").select(ARTISAN_COLS).eq("is_verified", true).order("name");
  if (error) throw error;
  warnIfEmpty("artisans", data);
  return { data: data as Artisan[], source: "live" };
}

export async function getArtisan(id: string): Promise<Result<Artisan | null>> {
  const sb = getSupabase();
  if (!sb) return fixture(fixtureArtisans.find((a) => a.id === id && a.is_verified) ?? null);
  // Public lookup: verified only (RLS would also return the caller's own unverified row).
  const { data, error } = await sb.from("artisans").select(ARTISAN_COLS).eq("id", id).eq("is_verified", true).maybeSingle();
  if (error) throw error;
  return { data: data as Artisan | null, source: "live" };
}

/**
 * Trust gate (ticket H-12): RLS currently exposes any `is_published` row, including rows owned by
 * unverified artisans. Public surfaces only ever show pieces/workshops whose maker is verified.
 * Live queries enforce this with an inner join on artisans; fixtures with the same rule.
 */
const VERIFIED_JOIN = "artisans!inner(is_verified)";
const verifiedIds = () => new Set(fixtureArtisans.filter((a) => a.is_verified).map((a) => a.id));

function stripJoin<T>(row: T & { artisans?: unknown }): T {
  const { artisans: _joined, ...rest } = row;
  return rest as T;
}

export async function listCraftItems(filter: { artisanId?: string } = {}): Promise<Result<CraftItem[]>> {
  const sb = getSupabase();
  if (!sb) {
    const ok = verifiedIds();
    return fixture(fixtureCraftItems.filter((i) => i.is_published && ok.has(i.artisan_id) && (!filter.artisanId || i.artisan_id === filter.artisanId)));
  }
  let query = sb.from("craft_items").select(`${ITEM_COLS},${VERIFIED_JOIN}`).eq("is_published", true).eq("artisans.is_verified", true).order("created_at", { ascending: false });
  if (filter.artisanId) query = query.eq("artisan_id", filter.artisanId);
  const { data, error } = await query;
  if (error) throw error;
  warnIfEmpty("craft_items", data);
  return { data: (data as unknown as CraftItem[]).map((r) => money(stripJoin(r))), source: "live" };
}

export async function getCraftItem(id: string): Promise<Result<CraftItem | null>> {
  const sb = getSupabase();
  if (!sb) return fixture(fixtureCraftItems.find((i) => i.id === id && i.is_published && verifiedIds().has(i.artisan_id)) ?? null);
  const { data, error } = await sb.from("craft_items").select(`${ITEM_COLS},${VERIFIED_JOIN}`).eq("id", id).eq("is_published", true).eq("artisans.is_verified", true).maybeSingle();
  if (error) throw error;
  return { data: data ? money(stripJoin(data as unknown as CraftItem)) : null, source: "live" };
}

export interface ProvenanceRecord {
  item: CraftItem;
  artisan: Artisan | null;
  /** True only when the maker exists and is verified. Never label a piece "authentic" otherwise. */
  verified: boolean;
}

export async function getProvenance(provenanceId: string): Promise<Result<ProvenanceRecord | null>> {
  const sb = getSupabase();
  if (!sb) {
    const item = fixtureCraftItems.find((i) => i.provenance_id === provenanceId && i.is_published);
    if (!item) return fixture(null);
    const artisan = fixtureArtisans.find((a) => a.id === item.artisan_id) ?? null;
    return fixture({ item, artisan: artisan?.is_verified ? artisan : null, verified: artisan?.is_verified === true });
  }
  const { data, error } = await sb.from("craft_items").select(ITEM_COLS).eq("provenance_id", provenanceId).maybeSingle();
  if (error) throw error;
  if (!data) return { data: null, source: "live" };
  const item = money(data as CraftItem);
  const { data: artisan } = await getArtisan(item.artisan_id);
  const verified = artisan?.is_verified === true;
  return { data: { item, artisan: verified ? artisan : null, verified }, source: "live" };
}

export async function listWorkshops(filter: { artisanId?: string } = {}): Promise<Result<Workshop[]>> {
  const sb = getSupabase();
  if (!sb) {
    const ok = verifiedIds();
    return fixture(fixtureWorkshops.filter((w) => w.is_published && ok.has(w.artisan_id) && (!filter.artisanId || w.artisan_id === filter.artisanId)));
  }
  let query = sb.from("workshops").select(`${WORKSHOP_COLS},${VERIFIED_JOIN}`).eq("is_published", true).eq("artisans.is_verified", true).order("starts_at");
  if (filter.artisanId) query = query.eq("artisan_id", filter.artisanId);
  const { data, error } = await query;
  if (error) throw error;
  warnIfEmpty("workshops", data);
  return { data: (data as unknown as Workshop[]).map((r) => money(stripJoin(r))), source: "live" };
}

export async function getWorkshop(id: string): Promise<Result<Workshop | null>> {
  const sb = getSupabase();
  if (!sb) return fixture(fixtureWorkshops.find((w) => w.id === id && w.is_published && verifiedIds().has(w.artisan_id)) ?? null);
  const { data, error } = await sb.from("workshops").select(`${WORKSHOP_COLS},${VERIFIED_JOIN}`).eq("id", id).eq("is_published", true).eq("artisans.is_verified", true).maybeSingle();
  if (error) throw error;
  return { data: data ? money(stripJoin(data as unknown as Workshop)) : null, source: "live" };
}

/** Admin-only: RLS returns unverified rows only to admins (artisans_manage_owner_or_admin). */
export async function listPendingArtisans(): Promise<Result<Artisan[]>> {
  const sb = getSupabase();
  if (!sb) return fixture(fixtureArtisans.filter((a) => !a.is_verified));
  const { data, error } = await sb.from("artisans").select(ARTISAN_COLS).eq("is_verified", false).order("name");
  if (error) throw error;
  return { data: data as Artisan[], source: "live" };
}

export async function verifyArtisan(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("artisans").update({ is_verified: true }).eq("id", id);
  if (error) throw error;
}
