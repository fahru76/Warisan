/** Mirrors supabase/migrations/20261007000100_initial_schema.sql. Keep in sync; replace with generated types once Hermes publishes them. */
export type AppRole = "customer" | "artisan" | "admin";

export interface Profile {
  id: string;
  role: AppRole;
  display_name: string;
  pdpa_consent_date: string | null;
  marketing_opt_in: boolean;
}

export interface Artisan {
  id: string;
  profile_id: string | null;
  name: string;
  craft_specialty: string;
  bio: string;
  location: string;
  is_verified: boolean;
}

export interface CraftItem {
  id: string;
  artisan_id: string;
  name: string;
  description: string;
  price_myr: number;
  provenance_id: string;
  is_local_pickup_only: boolean;
  is_published: boolean;
  created_at: string;
}

export interface Workshop {
  id: string;
  artisan_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  price_myr: number;
  is_published: boolean;
}

export type DataSource = "live" | "fixture";

export interface Result<T> {
  data: T;
  source: DataSource;
}
