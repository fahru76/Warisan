export type AppRole = 'customer' | 'artisan' | 'admin';

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
  pdpa_consent_date: string | null;
  marketing_opt_in: boolean;
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

// Must match bookings_status_check (migration 20261009000400).
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  workshop_id: string;
  customer_id: string;
  quantity: number;
  status: BookingStatus;
  pdpa_consent_date: string | null;
  created_at: string;
}

// Must match orders_status_check (migration 20261009000500).
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'fulfilled' | 'cancelled' | 'refunded' | 'failed';

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_myr: number;
  idempotency_key: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  craft_item_id: string;
  quantity: number;
  unit_price_myr: number;
}

// Arguments for supabase.rpc('create_order', ...) (migration 20261009000600); returns the order id.
// Prices are never sent: the database reads them from craft_items. Quantity is an integer 1-99.
export interface CreateOrderArgs {
  p_items: { craft_item_id: string; quantity: number }[];
  p_idempotency_key: string;
}

// Body for the create-payment-intent function; send the Idempotency-Key header as well.
// The amount is read server-side from the caller's pending order, so it is not part of the input.
export interface CreatePaymentIntentInput {
  orderId: string;
}

export interface TestPaymentIntent {
  mode: 'test';
  paymentIntentId: string;
  orderId: string;
  amountMyr: number;
  status: 'requires_confirmation';
}
