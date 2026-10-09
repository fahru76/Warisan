-- Server-trusted PDPA consent tests (requires migration 20261009000700). Rolls back via QA_ROLLBACK.
do $qa$
declare
  u1 uuid := gen_random_uuid(); u2 uuid := gen_random_uuid(); u3 uuid := gen_random_uuid();
  u4 uuid := gen_random_uuid(); u5 uuid := gen_random_uuid(); u6 uuid := gen_random_uuid();
  vart uuid; ws uuid; n int; ts timestamptz; mk boolean; rl text; v boolean; r text[] := array[]::text[];
begin
  perform set_config('request.jwt.claims', json_build_object('role','service_role')::text, true);
  insert into auth.users(id, aud, role, email, raw_user_meta_data) values
    (u1,'authenticated','authenticated','qa-1-'||u1||'@example.invalid', '{"display_name":"QA One","pdpa_consent":true,"marketing_opt_in":true,"applying_as":"customer"}'),
    (u2,'authenticated','authenticated','qa-2-'||u2||'@example.invalid', '{"display_name":"QA Two","pdpa_consent":false,"marketing_opt_in":true}'),
    (u3,'authenticated','authenticated','qa-3-'||u3||'@example.invalid', '{"display_name":"QA Artisan","pdpa_consent":true,"applying_as":"artisan","craft_specialty":"Songket","location":"Kelantan"}'),
    (u4,'authenticated','authenticated','qa-4-'||u4||'@example.invalid', '{"display_name":"QA Admin?","pdpa_consent":true,"role":"admin","applying_as":"admin"}'),
    (u5,'authenticated','authenticated','qa-5-'||u5||'@example.invalid', '{"display_name":"QA NoLoc","pdpa_consent":true,"applying_as":"artisan","craft_specialty":"Batik"}');
  insert into auth.users(id, aud, role, email) values (u6,'authenticated','authenticated','qa-6-'||u6||'@example.invalid');

  select pdpa_consent_date, marketing_opt_in, role into ts, mk, rl from public.profiles where id=u1;
  r := r||('S1 consent+marketing: consent_set='||(ts is not null and ts >= now() - interval '1 minute')||' marketing='||mk||' role='||rl);
  select pdpa_consent_date, marketing_opt_in into ts, mk from public.profiles where id=u2;
  r := r||('S2 no consent: consent_null='||(ts is null)||' marketing='||mk||' (expected false)');
  select count(*), bool_and(not is_verified) into n, v from public.artisans where profile_id=u3;
  select role into rl from public.profiles where id=u3;
  r := r||('S3 artisan application: rows='||n||' unverified='||v||' role='||rl);
  select role into rl from public.profiles where id=u4;
  select count(*) into n from public.artisans where profile_id=u4;
  r := r||('S4 metadata role=admin injection: role='||rl||' artisan_rows='||n);
  select count(*) into n from public.artisans where profile_id=u5;
  r := r||('S5 artisan application without location: rows='||n);
  select pdpa_consent_date, marketing_opt_in into ts, mk from public.profiles where id=u6;
  r := r||('S6 no metadata at all: profile created, consent_null='||(ts is null)||' marketing='||mk);

  select id into vart from public.artisans where is_verified limit 1;
  insert into public.workshops(artisan_id,title,starts_at,ends_at,capacity,price_myr,is_published) values (vart,'QA WS',now()+interval '1 day',now()+interval '2 day',5,50,true) returning id into ws;

  perform set_config('request.jwt.claims', json_build_object('sub',u1,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin insert into public.bookings(workshop_id,customer_id,quantity,pdpa_consent_date) values (ws,u1,1,'2001-01-01T00:00:00Z');
    select pdpa_consent_date into ts from public.bookings where customer_id=u1;
    r := r||('B1 booking with client time 2001: stored_is_server_time='||(ts >= now() - interval '1 minute'));
  exception when others then r := r||('B1 booking: ERROR '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  perform set_config('request.jwt.claims', json_build_object('sub',u2,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin insert into public.bookings(workshop_id,customer_id,quantity) values (ws,u2,1); r := r||'B2 booking without consent: ALLOWED'::text;
  exception when others then r := r||('B2 booking without consent: DENIED '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  raise exception 'QA_ROLLBACK %', array_to_string(r, E'\n');
end $qa$;
