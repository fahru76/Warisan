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

export interface CreatePaymentIntentInput {
  orderId: string;
  amountMyr: number;
}

export interface TestPaymentIntent {
  mode: 'test';
  paymentIntentId: string;
  orderId: string;
  amountMyr: number;
  status: 'requires_confirmation';
}
