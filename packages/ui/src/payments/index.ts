import { getSupabase } from "../data/supabase";

/**
 * Payment service layer. v1 is TEST MODE only: the `create-payment-intent` Edge Function returns a
 * mock intent and holds no provider secrets. Real FPX providers (Billplz / ToyyibPay) plug in
 * server-side behind the same contract; the browser never sees provider keys.
 *
 * Checkout is two calls, and the browser never sends a price:
 *   1. createOrder → `create_order` RPC prices the lines from craft_items and returns a pending order id.
 *   2. createPaymentIntent → the Edge Function reads the amount from the caller's own pending order.
 */
export type FpxProvider = "billplz" | "toyyibpay";

export interface PaymentIntent {
  mode: "test";
  paymentIntentId: string;
  orderId: string;
  amountMyr: number;
  status: "requires_confirmation";
}

export interface CreateOrderInput {
  items: { craftItemId: string; quantity: number }[];
  /** One key per checkout attempt; reusing it returns the same order instead of a duplicate. */
  idempotencyKey: string;
}

export interface CreateIntentInput {
  orderId: string;
  idempotencyKey: string;
  /** Demo (fixture) mode only, to render a total without a backend. Never sent to the server. */
  demoAmountMyr?: number;
}

export class PaymentError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  if (input.items.length === 0) throw new PaymentError("VALIDATION_ERROR", "The order has no items.");
  if (input.items.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 99)) throw new PaymentError("VALIDATION_ERROR", "Quantity must be a whole number from 1 to 99.");
  const sb = getSupabase();
  if (!sb) return input.idempotencyKey;
  const { data, error } = await sb.rpc("create_order", {
    p_items: input.items.map((i) => ({ craft_item_id: i.craftItemId, quantity: i.quantity })),
    p_idempotency_key: input.idempotencyKey
  });
  if (error) throw new PaymentError(error.code === "42501" ? "UNAUTHORIZED" : "ORDER_FAILED", error.message);
  if (typeof data !== "string") throw new PaymentError("ORDER_FAILED", "No order id returned.");
  return data;
}

/** functions.invoke reports non-2xx as an error whose `context` is the Response; surface the function's error code. */
async function functionError(error: { message: string; context?: unknown }): Promise<PaymentError> {
  const response = error.context;
  if (response instanceof Response) {
    try {
      const body = (await response.clone().json()) as { error?: { code?: string; message?: string } };
      if (body.error?.code) return new PaymentError(body.error.code, body.error.message ?? error.message);
    } catch {
      // Body was not JSON; fall through to the generic error.
    }
  }
  return new PaymentError("FUNCTION_ERROR", error.message);
}

export async function createPaymentIntent(input: CreateIntentInput): Promise<PaymentIntent> {
  const sb = getSupabase();
  if (!sb) {
    return { mode: "test", paymentIntentId: `test_${input.orderId}`, orderId: input.orderId, amountMyr: input.demoAmountMyr ?? 0, status: "requires_confirmation" };
  }
  // functions.invoke attaches apikey + the user's JWT; the function has JWT verification on (evals CORS failure mode #2).
  const { data, error } = await sb.functions.invoke<{ data?: PaymentIntent; error?: { code: string; message: string } }>("create-payment-intent", {
    body: { orderId: input.orderId },
    headers: { "Idempotency-Key": input.idempotencyKey }
  });
  if (error) throw await functionError(error as { message: string; context?: unknown });
  if (!data?.data) throw new PaymentError(data?.error?.code ?? "UNKNOWN", data?.error?.message ?? "No payment intent returned.");
  if (data.data.mode !== "test") throw new PaymentError("MODE_MISMATCH", "Refusing non-test payment intent in v1.");
  return data.data;
}
