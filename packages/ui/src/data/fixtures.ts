import type { Artisan, CraftItem, Workshop } from "./types";

/**
 * Demo data used when VITE_SUPABASE_* is not configured.
 * Artisan ids/names match supabase/seed.sql. Items and workshops are illustrative fixtures,
 * not the live seed (repo seed is incomplete — ticket H-4).
 */
export const fixtureArtisans: Artisan[] = [
  { id: "11111111-1111-4111-8111-111111111111", profile_id: null, name: "Aisyah Rahman", craft_specialty: "Songket", bio: "Third-generation Songket weaver.", location: "Kuala Terengganu", is_verified: true },
  { id: "22222222-2222-4222-8222-222222222222", profile_id: null, name: "Hassan Ismail", craft_specialty: "Ukiran", bio: "Traditional woodcarver.", location: "Kota Bharu", is_verified: true },
  { id: "33333333-3333-4333-8333-333333333333", profile_id: null, name: "Siti Mariam", craft_specialty: "Canting", bio: "Batik artist.", location: "Kuantan", is_verified: true },
  { id: "44444444-4444-4444-8444-444444444444", profile_id: null, name: "Rahim Salleh", craft_specialty: "Labu Sayong", bio: "Perak potter.", location: "Kuala Kangsar", is_verified: true },
  { id: "55555555-5555-4555-8555-555555555555", profile_id: null, name: "Noraini Yusof", craft_specialty: "Anyaman", bio: "Pandan weaving specialist.", location: "Kuching", is_verified: true },
  { id: "66666666-6666-4666-8666-666666666666", profile_id: null, name: "Zulkifli Omar", craft_specialty: "Tekat", bio: "Pending registry review.", location: "Ipoh", is_verified: false }
];

const A = fixtureArtisans;
const created = "2026-10-01T02:00:00Z";

export const fixtureCraftItems: CraftItem[] = [
  { id: "a0000001-0000-4000-8000-000000000001", artisan_id: A[0].id, name: "Songket Tenun Benang Emas", description: "Hand-woven Songket with gold thread, Pucuk Rebung border.", price_myr: 2800, provenance_id: "b0f1c2d3-1111-4a01-8a01-000000000001", is_local_pickup_only: false, is_published: true, created_at: created },
  { id: "a0000001-0000-4000-8000-000000000002", artisan_id: A[0].id, name: "Songket Selendang", description: "Lightweight Songket shawl.", price_myr: 950, provenance_id: "b0f1c2d3-1111-4a01-8a01-000000000002", is_local_pickup_only: false, is_published: true, created_at: created },
  { id: "a0000001-0000-4000-8000-000000000003", artisan_id: A[1].id, name: "Ukiran Panel Bunga Ketumbit", description: "Carved chengal panel, floral motif.", price_myr: 4200, provenance_id: "b0f1c2d3-1111-4a01-8a01-000000000003", is_local_pickup_only: true, is_published: true, created_at: created },
  { id: "a0000001-0000-4000-8000-000000000004", artisan_id: A[1].id, name: "Ukiran Kotak Sirih", description: "Carved betel box.", price_myr: 680, provenance_id: "b0f1c2d3-1111-4a01-8a01-000000000004", is_local_pickup_only: false, is_published: true, created_at: created },
  { id: "a0000001-0000-4000-8000-000000000005", artisan_id: A[2].id, name: "Batik Canting Sutera", description: "Hand-drawn Canting batik on silk.", price_myr: 520, provenance_id: "b0f1c2d3-1111-4a01-8a01-000000000005", is_local_pickup_only: false, is_published: true, created_at: created },
  { id: "a0000001-0000-4000-8000-000000000006", artisan_id: A[2].id, name: "Batik Canting Sarung", description: "Cotton sarong, Canting technique.", price_myr: 260, provenance_id: "b0f1c2d3-1111-4a01-8a01-000000000006", is_local_pickup_only: false, is_published: true, created_at: created },
  { id: "a0000001-0000-4000-8000-000000000007", artisan_id: A[3].id, name: "Labu Sayong Klasik", description: "Black-fired Labu Sayong water vessel.", price_myr: 180, provenance_id: "b0f1c2d3-1111-4a01-8a01-000000000007", is_local_pickup_only: true, is_published: true, created_at: created },
  { id: "a0000001-0000-4000-8000-000000000008", artisan_id: A[3].id, name: "Labu Sayong Hiasan Besar", description: "Large ornamental Labu Sayong.", price_myr: 640, provenance_id: "b0f1c2d3-1111-4a01-8a01-000000000008", is_local_pickup_only: true, is_published: true, created_at: created },
  { id: "a0000001-0000-4000-8000-000000000009", artisan_id: A[4].id, name: "Tikar Anyaman Pandan", description: "Woven pandan mat.", price_myr: 320, provenance_id: "b0f1c2d3-1111-4a01-8a01-000000000009", is_local_pickup_only: false, is_published: true, created_at: created },
  { id: "a0000001-0000-4000-8000-000000000010", artisan_id: A[4].id, name: "Bakul Anyaman", description: "Woven storage basket.", price_myr: 140, provenance_id: "b0f1c2d3-1111-4a01-8a01-000000000010", is_local_pickup_only: false, is_published: true, created_at: created }
];

export const fixtureWorkshops: Workshop[] = [
  { id: "c0000001-0000-4000-8000-000000000001", artisan_id: A[0].id, title: "Songket Weaving Foundations", description: "Half-day loom introduction.", starts_at: "2026-11-14T01:00:00Z", ends_at: "2026-11-14T05:00:00Z", capacity: 8, price_myr: 280, is_published: true },
  { id: "c0000001-0000-4000-8000-000000000002", artisan_id: A[2].id, title: "Canting Batik Studio", description: "Draw and dye your own panel.", starts_at: "2026-11-21T02:00:00Z", ends_at: "2026-11-21T06:00:00Z", capacity: 12, price_myr: 180, is_published: true },
  { id: "c0000001-0000-4000-8000-000000000003", artisan_id: A[3].id, title: "Labu Sayong Clay Session", description: "Shape and burnish a Labu Sayong.", starts_at: "2026-11-28T01:30:00Z", ends_at: "2026-11-28T04:30:00Z", capacity: 6, price_myr: 220, is_published: true }
];
