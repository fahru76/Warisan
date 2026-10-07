import { getSupabase } from "../data/supabase";

/**
 * Payment service layer. v1 is TEST MODE only: the `create-payment-intent` Edge Function returns a
 * mock intent and holds no provider secrets. Real FPX providers (Billplz / ToyyibPay) plug in
 * server-side behind the same contract; the browser never sees provider keys.
 */
export type FpxProvider = "billplz" | "toyyibpay";

export interface PaymentIntent {
  mode: "test";
  paymentIntentId: string;
  orderId: string;
  amountMyr: number;
  status: "requires_confirmation";
}

export interface CreateIntentInput {
  orderId: string;
  amountMyr: number;
  idempotencyKey: string;
}

export class PaymentError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export async function createPaymentIntent(input: CreateIntentInput): Promise<PaymentIntent> {
  if (!(input.amountMyr > 0)) throw new PaymentError("VALIDATION_ERROR", "Amount must be positive.");
  const sb = getSupabase();
  if (!sb) {
    return { mode: "test", paymentIntentId: `test_${input.orderId}`, orderId: input.orderId, amountMyr: input.amountMyr, status: "requires_confirmation" };
  }
  // functions.invoke attaches apikey + the user's JWT; the function has JWT verification on (evals CORS failure mode #2).
  const { data, error } = await sb.functions.invoke<{ data?: PaymentIntent; error?: { code: string; message: string } }>("create-payment-intent", {
    body: { orderId: input.orderId, amountMyr: input.amountMyr },
    headers: { "Idempotency-Key": input.idempotencyKey }
  });
  if (error) throw new PaymentError("FUNCTION_ERROR", error.message);
  if (!data?.data) throw new PaymentError(data?.error?.code ?? "UNKNOWN", data?.error?.message ?? "No payment intent returned.");
  if (data.data.mode !== "test") throw new PaymentError("MODE_MISMATCH", "Refusing non-test payment intent in v1.");
  return data.data;
}
