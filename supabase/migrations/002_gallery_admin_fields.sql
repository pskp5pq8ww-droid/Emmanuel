alter table public.galleries
  add column if not exists event_date date,
  add column if not exists description text;

create index if not exists galleries_event_date_idx on public.galleries(event_date);
