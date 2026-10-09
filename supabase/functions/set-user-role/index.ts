import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } }, 405);
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return json({ error: { code: 'UNAUTHORIZED', message: 'Authorization is required.' } }, 401);
  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const callerClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userError } = await callerClient.auth.getUser();
  if (userError || !user) return json({ error: { code: 'UNAUTHORIZED', message: 'Valid authentication is required.' } }, 401);
  const adminClient = createClient(url, serviceRole);
  const { data: caller, error: callerError } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (callerError || caller?.role !== 'admin') return json({ error: { code: 'FORBIDDEN', message: 'Admin role is required.' } }, 403);
  let body: { userId?: string; role?: 'customer' | 'artisan' };
  try { body = await request.json(); } catch { return json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } }, 400); }
  if (!body.userId || !body.role) return json({ error: { code: 'VALIDATION_ERROR', message: 'userId and role are required.' } }, 422);
  const { error } = await adminClient.from('profiles').update({ role: body.role }).eq('id', body.userId);
  if (error) return json({ error: { code: 'ROLE_UPDATE_FAILED', message: 'Role update failed.' } }, 400);
  return json({ data: { userId: body.userId, role: body.role } });
});
