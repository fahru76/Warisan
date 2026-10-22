-- Ticket H-5: default session timezone is Asia/Kuala_Lumpur (MYT, UTC+8) for every new connection.
-- timestamptz values are stored in UTC regardless, so this changes no data; it only affects how
-- timestamps are rendered and how date/time arithmetic without an explicit zone behaves.
-- Uses current_database() so the same migration works locally, on branches and in production.
do $$
begin
  execute format('alter database %I set timezone to %L', current_database(), 'Asia/Kuala_Lumpur');
end;
$$;
