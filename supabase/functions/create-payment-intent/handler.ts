type Order = { id: string; customer_id: string; status: string; total_myr: number | string };
export type Backend = { authenticate: (jwt: string) => Promise<string | null>; order: (jwt: string, id: string) => Promise<Order | null> };
// Ticket H-10: browsers may call this function only from Warisan.net origins (plus local dev/preview).
// Override with the ALLOWED_ORIGINS env var (comma-separated) once preview hosting is known.
export const DEFAULT_ALLOWED_ORIGINS = ['https://warisan.net', 'https://www.warisan.net', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:4174', 'http://127.0.0.1:4174'];
const baseCors = { 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin' };
export function corsHeaders(origin: string | null, allowed: readonly string[]): Record<string, string> {
  return origin && allowed.includes(origin) ? { ...baseCors, 'Access-Control-Allow-Origin': origin } : { ...baseCors };
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function handler(backend: Backend, allowedOrigins: readonly string[] = DEFAULT_ALLOWED_ORIGINS) { return async (req: Request) => {
  const cors = corsHeaders(req.headers.get('Origin'), allowedOrigins);
  const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers: {...cors, 'Content-Type': 'application/json'}});
  const error = (code: string, message: string, status: number) => response({error: {code, message}}, status);
  if (req.method === 'OPTIONS') return new Response('ok', {headers: cors});
  if (req.method !== 'POST') return error('METHOD_NOT_ALLOWED', 'Use POST.', 405);
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.get('Authorization') ?? '');
  if (!match) return error('UNAUTHORIZED', 'Valid authentication is required.', 401);
  try {
    const caller = await backend.authenticate(match[1]);
    if (!caller) return error('UNAUTHORIZED', 'Valid authentication is required.', 401);
    let body: unknown;
    try { body = await req.json(); } catch { return error('INVALID_JSON', 'Request body must be valid JSON.', 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return error('VALIDATION_ERROR', 'orderId must be a UUID.', 422);
    const orderId = (body as {orderId?: unknown}).orderId;
    const key = req.headers.get('idempotency-key') ?? '';
    if (typeof orderId !== 'string' || !uuid.test(orderId) || key.trim().length < 8 || key.length > 128) return error('VALIDATION_ERROR', 'UUID orderId and Idempotency-Key (8–128 characters) are required.', 422);
    const order = await backend.order(match[1], orderId);
    if (!order || order.customer_id !== caller) return error('NOT_FOUND', 'Order not found.', 404);
    if (order.status !== 'pending') return error('ORDER_NOT_PENDING', 'Only pending orders are payable.', 409);
    const amount = Number(order.total_myr);
    if (!Number.isFinite(amount) || amount <= 0) return error('INVALID_ORDER_TOTAL', 'Order total must be positive.', 422);
    return response({data: {mode: 'test', paymentIntentId: 'test_' + order.id, orderId: order.id, amountMyr: amount, status: 'requires_confirmation'}});
  } catch { return error('BACKEND_UNAVAILABLE', 'Payment preparation is unavailable.', 503); }
}; }
