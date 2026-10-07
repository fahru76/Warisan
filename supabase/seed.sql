insert into public.artisans (id,name,craft_specialty,bio,location,is_verified) values
("11111111-1111-4111-8111-111111111111","Aisyah Rahman","Songket","Third-generation Songket weaver.","Kuala Terengganu",true),
("22222222-2222-4222-8222-222222222222","Hassan Ismail","Ukiran","Traditional woodcarver.","Kota Bharu",true),
("33333333-3333-4333-8333-333333333333","Siti Mariam","Canting","Batik artist.","Kuantan",true),
("44444444-4444-4444-8444-444444444444","Rahim Salleh","Labu Sayong","Perak potter.","Kuala Kangsar",true),
("55555555-5555-4555-8555-555555555555","Noraini Yusof","Anyaman","Pandan weaving specialist.","Kuching",true)
on conflict (id) do nothing;