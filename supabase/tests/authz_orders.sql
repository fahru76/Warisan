-- Order creation and order authorization tests (requires migration 20261009000600 create_order).
-- Same contract as the other scripts: run as postgres; everything is rolled back by the final
-- QA_ROLLBACK exception; read results from its message. Contains no DROP/DELETE (MCP confirmation gate).
do $qa$
declare
  c uuid := gen_random_uuid(); c2 uuid := gen_random_uuid(); a uuid := gen_random_uuid();
  art uuid; vart uuid; item1 uuid; item2 uuid; hidden_item uuid; unverified_item uuid;
  o uuid; o_replay uuid; n int; t numeric; st text; r text[] := array[]::text[];
  key text := 'qa-key-' || gen_random_uuid();
begin
  perform set_config('request.jwt.claims', json_build_object('role','service_role')::text, true);
  insert into auth.users(id, aud, role, email) values
    (c,'authenticated','authenticated','qa-c-'||c||'@example.invalid'),
    (c2,'authenticated','authenticated','qa-c2-'||c2||'@example.invalid'),
    (a,'authenticated','authenticated','qa-a-'||a||'@example.invalid');
  update public.profiles set role='artisan' where id=a;
  insert into public.artisans(profile_id,name,craft_specialty,location,is_verified) values (a,'QA Unverified','Songket','Kelantan',false) returning id into art;
  select id into vart from public.artisans where is_verified and id<>art limit 1;
  insert into public.craft_items(artisan_id,name,price_myr,is_published) values (vart,'QA item 1',120.50,true) returning id into item1;
  insert into public.craft_items(artisan_id,name,price_myr,is_published) values (vart,'QA item 2',30,true) returning id into item2;
  insert into public.craft_items(artisan_id,name,price_myr,is_published) values (vart,'QA hidden',10,false) returning id into hidden_item;
  insert into public.craft_items(artisan_id,name,price_myr,is_published) values (art,'QA unverified',10,true) returning id into unverified_item;

  -- anon
  perform set_config('request.jwt.claims', json_build_object('role','anon')::text, true);
  perform set_config('role','anon', true);
  begin perform public.create_order(jsonb_build_array(jsonb_build_object('craft_item_id',item1,'quantity',1)), key); r := r||'O1 anon create_order: ALLOWED'::text;
  exception when others then r := r||('O1 anon create_order: DENIED '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  -- customer c
  perform set_config('request.jwt.claims', json_build_object('sub',c,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin
    o := public.create_order(jsonb_build_array(
      jsonb_build_object('craft_item_id',item1,'quantity',2),
      jsonb_build_object('craft_item_id',item2,'quantity',1),
      jsonb_build_object('craft_item_id',item2,'quantity',1),
      jsonb_build_object('craft_item_id',item1,'quantity',1,'unit_price_myr',0.01)), key);
    select total_myr, status into t, st from public.orders where id=o;
    select count(*) into n from public.order_items where order_id=o;
    r := r||('O2 customer create_order: total='||t||' (expected 421.50) status='||st||' lines='||n||' (expected 2)');
  exception when others then r := r||('O2 customer create_order: ERROR '||sqlstate||' '||sqlerrm); end;
  begin o_replay := public.create_order(jsonb_build_array(jsonb_build_object('craft_item_id',item2,'quantity',5)), key);
    select count(*) into n from public.orders where customer_id=c;
    r := r||('O3 replay same key: same order='||(o_replay = o)||' customer orders='||n);
  exception when others then r := r||('O3 replay: ERROR '||sqlstate||' '||sqlerrm); end;
  begin perform public.create_order(jsonb_build_array(jsonb_build_object('craft_item_id',hidden_item,'quantity',1)), key||'-h'); r := r||'O4 order unpublished item: ALLOWED'::text;
  exception when others then r := r||('O4 order unpublished item: DENIED '||sqlstate||' '||sqlerrm); end;
  begin perform public.create_order(jsonb_build_array(jsonb_build_object('craft_item_id',unverified_item,'quantity',1)), key||'-u'); r := r||'O5 order unverified artisan item: ALLOWED'::text;
  exception when others then r := r||('O5 order unverified artisan item: DENIED '||sqlstate||' '||sqlerrm); end;
  begin perform public.create_order(jsonb_build_array(jsonb_build_object('craft_item_id',item1,'quantity',0)), key||'-q0'); r := r||'O6 quantity 0: ALLOWED'::text;
  exception when others then r := r||('O6 quantity 0: DENIED '||sqlstate||' '||sqlerrm); end;
  begin perform public.create_order(jsonb_build_array(jsonb_build_object('craft_item_id',item1,'quantity',-3)), key||'-qn'); r := r||'O7 negative quantity: ALLOWED'::text;
  exception when others then r := r||('O7 negative quantity: DENIED '||sqlstate||' '||sqlerrm); end;
  begin perform public.create_order(jsonb_build_array(jsonb_build_object('craft_item_id',item1,'quantity','abc')), key||'-qs'); r := r||'O8 non-numeric quantity: ALLOWED'::text;
  exception when others then r := r||('O8 non-numeric quantity: DENIED '||sqlstate||' '||sqlerrm); end;
  begin perform public.create_order('[]'::jsonb, key||'-e'); r := r||'O9 empty items: ALLOWED'::text;
  exception when others then r := r||('O9 empty items: DENIED '||sqlstate||' '||sqlerrm); end;
  begin insert into public.orders(customer_id,status,total_myr) values (c,'paid',0); r := r||'O10 direct insert paid order: ALLOWED'::text;
  exception when others then r := r||('O10 direct insert paid order: DENIED '||sqlstate||' '||sqlerrm); end;
  begin insert into public.order_items(order_id,craft_item_id,quantity,unit_price_myr) values (o,item1,5,0); r := r||'O11 direct insert order_item at price 0: ALLOWED'::text;
  exception when others then r := r||('O11 direct insert order_item: DENIED '||sqlstate||' '||sqlerrm); end;
  begin update public.orders set status='paid', total_myr=0 where id=o; get diagnostics n=row_count; r := r||('O12 customer mark own order paid: rows='||n);
  exception when others then r := r||('O12 customer update own order: DENIED '||sqlstate||' '||sqlerrm); end;
  select count(*) into n from public.orders where id=o; r := r||('O13 customer sees own order: '||n);
  select count(*) into n from public.order_items where order_id=o; r := r||('O14 customer sees own order items: '||n);
  perform set_config('role','postgres', true);

  -- customer c2
  perform set_config('request.jwt.claims', json_build_object('sub',c2,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  select count(*) into n from public.orders where id=o; r := r||('O15 other customer sees order: '||n);
  select count(*) into n from public.order_items where order_id=o; r := r||('O16 other customer sees order items: '||n);
  begin o_replay := public.create_order(jsonb_build_array(jsonb_build_object('craft_item_id',item2,'quantity',1)), key); r := r||('O17 other customer reuses key: ALLOWED returned own='||(o_replay=o));
  exception when others then r := r||('O17 other customer reuses key: DENIED '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  raise exception 'QA_ROLLBACK %', array_to_string(r, E'\n');
end $qa$;
