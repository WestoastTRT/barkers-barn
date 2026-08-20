-- Public merch orders (no login). Affiliate checkouts still open the retailer.
create table if not exists barn_orders (
  id          serial primary key,
  name        text not null,
  email       text not null,
  note        text,
  lines       text not null,
  total_cents integer not null,
  created_at  timestamptz not null default now()
);
