import { handler, type Backend } from './handler.ts';
const id = '11111111-1111-4111-8111-111111111111';
const backend: Backend = {authenticate: async () => 'caller', order: async () => ({id, customer_id: 'caller', status: 'pending', total_myr: '421.50'})};
function req(body: unknown = {orderId: id}, headers: Record<string,string> = {}) { return new Request('http://test', {method:'POST',headers:{Authorization:'Bearer user-jwt','Idempotency-Key':'checkout-key',...headers},body:JSON.stringify(body)}); }
function assert(actual: unknown, expected: unknown) { if (actual !== expected) throw new Error(`${actual} !== ${expected}`); }
Deno.test('P1 no authentication', async () => assert((await handler(backend)(req(undefined,{Authorization:''}))).status,401));
Deno.test('P2 invalid JWT', async () => assert((await handler({...backend,authenticate:async()=>null})(req())).status,401));
Deno.test('P3 unknown order', async () => assert((await handler({...backend,order:async()=>null})(req())).status,404));
Deno.test('P4 other customer order', async () => assert((await handler({...backend,order:async()=>({id,customer_id:'other',status:'pending',total_myr:100})})(req())).status,404));
Deno.test('P5 non-pending statuses', async () => { for(const status of ['paid','processing','fulfilled','cancelled','refunded','failed']) assert((await handler({...backend,order:async()=>({id,customer_id:'caller',status,total_myr:100})})(req())).status,409); });
Deno.test('P6 client amount ignored and server total used', async () => { const r=await handler(backend)(req({orderId:id,amountMyr:0.01}));assert(r.status,200);assert((await r.json()).data.amountMyr,421.5); });
Deno.test('P7 retry yields same mock intent', async () => { const h=handler(backend); const a=await (await h(req())).json();const b=await (await h(req())).json();assert(a.data.paymentIntentId,b.data.paymentIntentId); });
Deno.test('P8 zero total rejected', async () => assert((await handler({...backend,order:async()=>({id,customer_id:'caller',status:'pending',total_myr:0})})(req())).status,422));
Deno.test('P9 malformed UUID or key rejected', async () => {assert((await handler(backend)(req({orderId:'bad'}))).status,422);assert((await handler(backend)(req(undefined,{'Idempotency-Key':''}))).status,422);});
Deno.test('P10 backend failure closed', async () => assert((await handler({...backend,order:async()=>{throw new Error('secret');}})(req())).status,503));
