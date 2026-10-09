import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { handler } from './handler.ts';
const url = Deno.env.get('SUPABASE_URL')!;
const key = Deno.env.get('SUPABASE_ANON_KEY')!;
function client(jwt: string) { return createClient(url, key, {global: {headers: {Authorization: 'Bearer ' + jwt}}, auth: {persistSession: false, autoRefreshToken: false}}); }
Deno.serve(handler({
  async authenticate(jwt) { const {data, error} = await client(jwt).auth.getUser(jwt); return error ? null : data.user?.id ?? null; },
  async order(jwt, id) {
    const {data, error} = await client(jwt).from('orders').select('id,customer_id,status,total_myr').eq('id', id).maybeSingle();
    if (error) throw new Error('Order lookup failed');
    return data;
  }
}));
