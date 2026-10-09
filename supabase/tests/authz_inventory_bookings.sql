-- Public inventory and booking authorization tests. Same contract as authz_negative_paths.sql:
-- run as postgres; everything is rolled back by the final QA_ROLLBACK exception; read results from it.
do $qa$
declare
  c uuid := gen_random_uuid(); c2 uuid := gen_random_uuid(); a uuid := gen_random_uuid();
  art uuid; vart uuid; ws uuid; unpub_ws uuid; n int; r text[] := array[]::text[];
begin
  perform set_config('request.jwt.claims', json_build_object('role','service_role')::text, true);
  insert into auth.users(id, aud, role, email) values
    (c,'authenticated','authenticated','qa-c-'||c||'@example.invalid'),
    (c2,'authenticated','authenticated','qa-c2-'||c2||'@example.invalid'),
    (a,'authenticated','authenticated','qa-a-'||a||'@example.invalid');
  update public.profiles set role='artisan' where id=a;
  insert into public.artisans(profile_id,name,craft_specialty,location,is_verified) values (a,'QA Unverified','Songket','Kelantan',false) returning id into art;
  select id into vart from public.artisans where is_verified and id<>art limit 1;
  insert into public.workshops(artisan_id,title,starts_at,ends_at,capacity,price_myr,is_published) values (vart,'QA WS',now()+interval '1 day',now()+interval '2 day',2,50,true) returning id into ws;
  insert into public.workshops(artisan_id,title,starts_at,ends_at,capacity,price_myr,is_published) values (vart,'QA hidden WS',now()+interval '1 day',now()+interval '2 day',2,50,false) returning id into unpub_ws;
  insert into public.craft_items(artisan_id,name,price_myr,is_published) values (vart,'QA verified item',100,true);

  -- unverified artisan owner publishes inventory
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin insert into public.craft_items(artisan_id,name,price_myr,is_published) values (art,'Unverified item',10,true); r := r||'T19 unverified artisan inserts published craft item: allowed (own draft)'::text;
  exception when others then r := r||('T19 unverified artisan inserts craft item: DENIED '||sqlstate||' '||sqlerrm); end;
  begin insert into public.workshops(artisan_id,title,starts_at,ends_at,capacity,price_myr,is_published) values (art,'Unverified WS',now()+interval '1 day',now()+interval '2 day',5,10,true); r := r||'T20 unverified artisan inserts published workshop: allowed (own draft)'::text;
  exception when others then r := r||('T20 unverified artisan inserts workshop: DENIED '||sqlstate||' '||sqlerrm); end;
  select count(*) into n from public.craft_items where artisan_id=art; r := r||('T21 owner still sees own items: '||n);
  perform set_config('role','postgres', true);

  -- anon visibility
  perform set_config('request.jwt.claims', json_build_object('role','anon')::text, true);
  perform set_config('role','anon', true);
  select count(*) into n from public.craft_items where artisan_id=art; r := r||('T23 anon sees unverified artisan items: '||n);
  select count(*) into n from public.workshops where artisan_id=art; r := r||('T24 anon sees unverified artisan workshops: '||n);
  select count(*) into n from public.workshops where id=unpub_ws; r := r||('T25 anon sees unpublished workshop: '||n);
  select count(*) into n from public.craft_items where artisan_id=vart and name='QA verified item'; r := r||('T26 anon sees verified artisan published item: '||n);
  perform set_config('role','postgres', true);

  -- customer bookings
  perform set_config('request.jwt.claims', json_build_object('sub',c,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin insert into public.bookings(workshop_id,customer_id,status,quantity) values (ws,c,'confirmed',1); r := r||'T27 customer self-confirmed booking: ALLOWED'::text;
  exception when others then r := r||('T27 customer self-confirmed booking: DENIED '||sqlstate||' '||sqlerrm); end;
  begin insert into public.bookings(workshop_id,customer_id,quantity) values (unpub_ws,c,1); r := r||'T28 customer book unpublished workshop: ALLOWED'::text;
  exception when others then r := r||('T28 customer book unpublished workshop: DENIED '||sqlstate||' '||sqlerrm); end;
  begin insert into public.bookings(workshop_id,customer_id,quantity) values (ws,c,99); r := r||'T29 customer book qty 99 on capacity 2: ALLOWED'::text;
  exception when others then r := r||('T29 customer book over capacity: DENIED '||sqlstate||' '||sqlerrm); end;
  begin insert into public.bookings(workshop_id,customer_id,quantity) values (ws,c,1); r := r||'T30 customer pending booking qty 1: allowed'::text;
  exception when others then r := r||('T30 customer pending booking qty 1: ERROR '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  perform set_config('request.jwt.claims', json_build_object('sub',c2,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin insert into public.bookings(workshop_id,customer_id,quantity) values (ws,c2,2); r := r||'T31 second customer qty 2 with 1 seat left: ALLOWED'::text;
  exception when others then r := r||('T31 second customer qty 2 with 1 seat left: DENIED '||sqlstate||' '||sqlerrm); end;
  begin insert into public.bookings(workshop_id,customer_id,quantity) values (ws,c2,1); r := r||'T32 second customer takes last seat: allowed'::text;
  exception when others then r := r||('T32 second customer takes last seat: ERROR '||sqlstate||' '||sqlerrm); end;
  begin insert into public.bookings(workshop_id,customer_id,quantity) values (ws,c,1); r := r||'T33 duplicate booking same customer: ALLOWED'::text;
  exception when others then r := r||('T33 duplicate booking same customer: DENIED '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  raise exception 'QA_ROLLBACK %', array_to_string(r, E'\n');
end $qa$;
