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

/** Must match bookings_status_check (migration 20261009000400). */
export const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Must match orders_status_check (migration 20261009000500). */
export const ORDER_STATUSES = ["pending", "paid", "processing", "fulfilled", "cancelled", "refunded", "failed"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderLine {
  craft_item_id: string;
  quantity: number;
  /** Price captured server-side by create_order; never supplied by the client. */
  unit_price_myr: number;
  /** Null when the piece is no longer publicly listed. */
  name: string | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total_myr: number;
  created_at: string;
  lines: OrderLine[];
}

export type DataSource = "live" | "fixture";

export interface Result<T> {
  data: T;
  source: DataSource;
}
