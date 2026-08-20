-- Per-user YouTube Data API connection (Studio cannot be automated: no pin, no end screens, no Super Thanks toggle).
create table if not exists youtube_accounts (
  user_id            text primary key,
  channel_id         text not null default 'UChPM9aMyqnPg5irHADtbhqw',
  channel_title      text,
  api_key            text,
  oauth_client_id    text,
  oauth_client_secret text,
  access_token       text,
  refresh_token      text,
  token_expires_at   timestamptz,
  oauth_state        text,
  last_sync_at       timestamptz,
  updated_at         timestamptz not null default now()
);

create table if not exists youtube_pushes (
  id          serial primary key,
  user_id     text not null,
  youtube_id  text not null,
  title       text,
  kind        text not null,
  ok          boolean not null,
  detail      text,
  created_at  timestamptz not null default now()
);
create index if not exists youtube_pushes_user_idx on youtube_pushes (user_id, created_at desc);
