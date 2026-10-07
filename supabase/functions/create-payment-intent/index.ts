import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } }, 405);
  try {
    const body = await request.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    const amountMyr = typeof body.amountMyr === 'number' ? body.amountMyr : NaN;
    const idempotencyKey = request.headers.get('idempotency-key') || '';
    if (!orderId || !Number.isFinite(amountMyr) || amountMyr <= 0 || !idempotencyKey) return json({ error: { code: 'VALIDATION_ERROR', message: 'orderId, positive amountMyr, and Idempotency-Key are required.' } }, 422);
    return json({ data: { mode: 'test', paymentIntentId: 'test_' + orderId, orderId, amountMyr, status: 'requires_confirmation' } });
  } catch { return json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } }, 400); }
});
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
