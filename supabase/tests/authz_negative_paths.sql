-- Authenticated negative-path authorization tests (customer, artisan, admin, anon).
-- Safe to run against the live project: creates temporary auth users, runs every case, then raises
-- QA_ROLLBACK so the whole transaction (users, profiles, artisan rows) is rolled back.
-- Read the results from the QA_ROLLBACK error message. Must run as postgres (e.g. SQL editor / MCP).
do $qa$
declare
  c uuid := gen_random_uuid(); a uuid := gen_random_uuid(); d uuid := gen_random_uuid();
  art uuid; seeded uuid; n int; m int; r text[] := array[]::text[]; v text;
begin
  perform set_config('request.jwt.claims', json_build_object('role','service_role')::text, true);
  insert into auth.users(id, aud, role, email) values
    (c,'authenticated','authenticated','qa-customer-'||c||'@example.invalid'),
    (a,'authenticated','authenticated','qa-artisan-'||a||'@example.invalid'),
    (d,'authenticated','authenticated','qa-admin-'||d||'@example.invalid');
  update public.profiles set role='artisan' where id=a;
  update public.profiles set role='admin' where id=d;
  insert into public.artisans(profile_id,name,craft_specialty,location,is_verified) values (a,'QA Artisan','Songket','Kelantan',false) returning id into art;
  select id into seeded from public.artisans where is_verified and id<>art limit 1;
  select string_agg(role::text,',' order by role) into v from public.profiles where id in (c,a,d);
  r := r || ('setup roles: '||v);

  -- customer
  perform set_config('request.jwt.claims', json_build_object('sub',c,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin update public.profiles set role='admin' where id=c; get diagnostics n=row_count; r := r||('T1 customer self->admin: ALLOWED rows='||n);
  exception when others then r := r||('T1 customer self->admin: DENIED '||sqlstate||' '||sqlerrm); end;
  begin update public.profiles set display_name='QA ok', pdpa_consent_date=now() where id=c; get diagnostics n=row_count; r := r||('T1b customer edit own profile/PDPA: rows='||n);
  exception when others then r := r||('T1b customer edit own profile/PDPA: ERROR '||sqlstate||' '||sqlerrm); end;
  begin update public.profiles set display_name='x' where id=a; get diagnostics n=row_count; r := r||('T2 customer edit other profile: rows='||n);
  exception when others then r := r||('T2 customer edit other profile: DENIED '||sqlstate||' '||sqlerrm); end;
  begin insert into public.artisans(profile_id,name,craft_specialty,location,is_verified) values (c,'Fake','Batik','KL',true); r := r||'T3 customer insert verified artisan: ALLOWED';
  exception when others then r := r||('T3 customer insert verified artisan: DENIED '||sqlstate||' '||sqlerrm); end;
  begin insert into public.artisans(profile_id,name,craft_specialty,location,is_verified) values (a,'Spoof','Batik','KL',false); r := r||'T4 customer insert artisan for other profile: ALLOWED';
  exception when others then r := r||('T4 customer insert artisan for other profile: DENIED '||sqlstate||' '||sqlerrm); end;
  begin update public.artisans set is_verified=true, name='hijack' where id in (art, seeded); get diagnostics n=row_count; r := r||('T5 customer update others artisans: rows='||n);
  exception when others then r := r||('T5 customer update others artisans: DENIED '||sqlstate||' '||sqlerrm); end;
  begin delete from public.artisans where id in (art, seeded); get diagnostics n=row_count; r := r||('T6 customer delete others artisans: rows='||n);
  exception when others then r := r||('T6 customer delete others artisans: DENIED '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  -- artisan (unverified owner)
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin update public.profiles set role='admin' where id=a; get diagnostics n=row_count; r := r||('T7 artisan self->admin: ALLOWED rows='||n);
  exception when others then r := r||('T7 artisan self->admin: DENIED '||sqlstate||' '||sqlerrm); end;
  begin update public.artisans set is_verified=true where id=art; get diagnostics n=row_count; r := r||('T8 artisan self-verify: ALLOWED rows='||n);
  exception when others then r := r||('T8 artisan self-verify: DENIED '||sqlstate||' '||sqlerrm); end;
  begin insert into public.artisans(profile_id,name,craft_specialty,location,is_verified) values (a,'Second','Tenun','Terengganu',true); r := r||'T9 artisan insert verified artisan: ALLOWED';
  exception when others then r := r||('T9 artisan insert verified artisan: DENIED '||sqlstate||' '||sqlerrm); end;
  begin update public.artisans set bio='QA bio' where id=art; get diagnostics n=row_count; r := r||('T10 artisan edit own unverified bio: rows='||n);
  exception when others then r := r||('T10 artisan edit own unverified bio: ERROR '||sqlstate||' '||sqlerrm); end;
  begin update public.artisans set name='hijack' where id=seeded; get diagnostics n=row_count; r := r||('T11 artisan edit seeded artisan: rows='||n);
  exception when others then r := r||('T11 artisan edit seeded artisan: DENIED '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  -- admin
  perform set_config('request.jwt.claims', json_build_object('sub',d,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin update public.artisans set is_verified=true where id=art; get diagnostics n=row_count; r := r||('T12 admin verify artisan: rows='||n);
  exception when others then r := r||('T12 admin verify artisan: ERROR '||sqlstate||' '||sqlerrm); end;
  begin update public.profiles set role='artisan' where id=c; get diagnostics n=row_count; r := r||('T13 admin change role via client: rows='||n);
  exception when others then r := r||('T13 admin change role via client: DENIED '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  -- artisan (now verified owner)
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin update public.artisans set is_verified=false where id=art; get diagnostics n=row_count; r := r||('T14 verified owner un-verify: ALLOWED rows='||n);
  exception when others then r := r||('T14 verified owner un-verify: DENIED '||sqlstate||' '||sqlerrm); end;
  begin update public.artisans set bio='new bio' where id=art; get diagnostics n=row_count; r := r||('T15 verified owner edit bio: rows='||n);
  exception when others then r := r||('T15 verified owner edit bio: ERROR '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  -- anon
  perform set_config('request.jwt.claims', json_build_object('role','anon')::text, true);
  perform set_config('role','anon', true);
  begin select count(*) filter (where is_verified), count(*) filter (where not is_verified) into n, m from public.artisans; r := r||('T16 anon artisan visibility: verified='||n||' unverified='||m);
  exception when others then r := r||('T16 anon read: ERROR '||sqlstate||' '||sqlerrm); end;
  begin select count(*) into n from public.profiles; r := r||('T17 anon profiles visible='||n);
  exception when others then r := r||('T17 anon profiles: DENIED '||sqlstate||' '||sqlerrm); end;
  begin update public.artisans set name='x'; get diagnostics n=row_count; r := r||('T18 anon update artisans rows='||n);
  exception when others then r := r||('T18 anon update artisans: DENIED '||sqlstate||' '||sqlerrm); end;
  perform set_config('role','postgres', true);

  raise exception 'QA_ROLLBACK %', array_to_string(r, E'\n');
end $qa$;
