-- Per-user studio library: imported tapes, Super Thanks drafts, optimizer status.
create table if not exists studio_tapes (
  id            text not null,
  user_id       text not null,
  youtube_id    text,
  title         text not null,
  duration_sec  integer not null default 0,
  views         integer not null default 0,
  type          text not null,
  super_score   integer not null default 70,
  why           text not null default '',
  campaign_id   text,
  source        text not null default 'youtube',
  published     text,
  has_file      boolean not null default false,
  draft         text not null default '{}',
  status        text not null default 'bare',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists studio_tapes_user_id_idx on studio_tapes (user_id);
