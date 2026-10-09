import type { Artisan, CraftItem } from '@warisan/supabase-types';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export class DataError extends Error {}
async function read<T>(path: string): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new DataError('Supabase is not configured for this deployment.');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: SUPABASE_ANON_KEY, Accept: 'application/json' } });
  if (!response.ok) throw new DataError(`Registry request failed (${response.status}).`);
  return response.json() as Promise<T>;
}
export function getVerifiedArtisans() { return read<Artisan[]>('artisans?select=id,name,craft_specialty,bio,location,is_verified&is_verified=eq.true&order=name.asc'); }
export function getPublishedCrafts() { return read<CraftItem[]>('craft_items?select=id,name,description,price_myr,provenance_id,is_local_pickup_only,artisan_id&is_published=eq.true&order=name.asc'); }
export function getProvenanceItem(provenanceId: string) { return read<CraftItem[]>(`craft_items?select=id,name,description,price_myr,provenance_id,is_local_pickup_only,artisan_id&provenance_id=eq.${encodeURIComponent(provenanceId)}&is_published=eq.true`); }
export function getArtisan(artisanId: string) { return read<Artisan[]>(`artisans?select=id,name,craft_specialty,bio,location,is_verified&is_verified=eq.true&id=eq.${encodeURIComponent(artisanId)}`); }
