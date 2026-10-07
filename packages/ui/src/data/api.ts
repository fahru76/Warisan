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
  const { data, error } = await sb.from("artisans").select(ARTISAN_COLS).eq("id", id).maybeSingle();
  if (error) throw error;
  return { data: data as Artisan | null, source: "live" };
}

export async function listCraftItems(filter: { artisanId?: string } = {}): Promise<Result<CraftItem[]>> {
  const sb = getSupabase();
  if (!sb) return fixture(fixtureCraftItems.filter((i) => i.is_published && (!filter.artisanId || i.artisan_id === filter.artisanId)));
  let query = sb.from("craft_items").select(ITEM_COLS).eq("is_published", true).order("created_at", { ascending: false });
  if (filter.artisanId) query = query.eq("artisan_id", filter.artisanId);
  const { data, error } = await query;
  if (error) throw error;
  warnIfEmpty("craft_items", data);
  return { data: (data as CraftItem[]).map(money), source: "live" };
}

export async function getCraftItem(id: string): Promise<Result<CraftItem | null>> {
  const sb = getSupabase();
  if (!sb) return fixture(fixtureCraftItems.find((i) => i.id === id) ?? null);
  const { data, error } = await sb.from("craft_items").select(ITEM_COLS).eq("id", id).maybeSingle();
  if (error) throw error;
  return { data: data ? money(data as CraftItem) : null, source: "live" };
}

export async function getProvenance(provenanceId: string): Promise<Result<{ item: CraftItem; artisan: Artisan | null } | null>> {
  const sb = getSupabase();
  if (!sb) {
    const item = fixtureCraftItems.find((i) => i.provenance_id === provenanceId);
    return fixture(item ? { item, artisan: fixtureArtisans.find((a) => a.id === item.artisan_id) ?? null } : null);
  }
  const { data, error } = await sb.from("craft_items").select(ITEM_COLS).eq("provenance_id", provenanceId).maybeSingle();
  if (error) throw error;
  if (!data) return { data: null, source: "live" };
  const item = money(data as CraftItem);
  const artisan = await getArtisan(item.artisan_id);
  return { data: { item, artisan: artisan.data }, source: "live" };
}

export async function listWorkshops(filter: { artisanId?: string } = {}): Promise<Result<Workshop[]>> {
  const sb = getSupabase();
  if (!sb) return fixture(fixtureWorkshops.filter((w) => w.is_published && (!filter.artisanId || w.artisan_id === filter.artisanId)));
  let query = sb.from("workshops").select(WORKSHOP_COLS).eq("is_published", true).order("starts_at");
  if (filter.artisanId) query = query.eq("artisan_id", filter.artisanId);
  const { data, error } = await query;
  if (error) throw error;
  warnIfEmpty("workshops", data);
  return { data: (data as Workshop[]).map(money), source: "live" };
}

export async function getWorkshop(id: string): Promise<Result<Workshop | null>> {
  const sb = getSupabase();
  if (!sb) return fixture(fixtureWorkshops.find((w) => w.id === id) ?? null);
  const { data, error } = await sb.from("workshops").select(WORKSHOP_COLS).eq("id", id).maybeSingle();
  if (error) throw error;
  return { data: data ? money(data as Workshop) : null, source: "live" };
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
