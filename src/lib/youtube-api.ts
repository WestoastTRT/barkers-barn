import { getSql } from "@/lib/db";
import { autoScore, autoWhy, buildOptimizedDraft } from "@/lib/optimize";
import type { Video } from "@/lib/data/catalog";
import {
  DEFAULT_CHANNEL_ID,
  YOUTUBE_SCOPES,
  classifyTape,
  guessDuration,
  mergeDescription,
  parseChannelRss,
  parseIsoDuration,
} from "@/lib/youtube";
import type { VideoDraft } from "@/lib/super-pack";

type AccountRow = {
  user_id: string;
  channel_id: string;
  channel_title: string | null;
  api_key: string | null;
  oauth_client_id: string | null;
  oauth_client_secret: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  last_sync_at: string | null;
};

function mask(value: string | null) {
  if (!value) return null;
  const v = value.trim();
  if (v.length < 8) return "saved";
  return `••••${v.slice(-4)}`;
}

function envClient() {
  const id = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "";
  const secret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  return { id, secret };
}

async function loadAccount(userId: string) {
  const sql = await getSql();
  const rows = await sql<AccountRow>`
    select user_id, channel_id, channel_title, api_key, oauth_client_id, oauth_client_secret,
           access_token, refresh_token, token_expires_at::text, last_sync_at::text
    from youtube_accounts where user_id = ${userId}
  `;
  return rows[0] ?? null;
}

export async function getYoutubeStatus(userId: string) {
    const env = envClient();
    const acc = await loadAccount(userId);
    const clientId = acc?.oauth_client_id || env.id;
    return {
      channelId: acc?.channel_id || DEFAULT_CHANNEL_ID,
      channelTitle: acc?.channel_title || "Classic Car Sisters",
      hasApiKey: Boolean(acc?.api_key),
      apiKeyHint: mask(acc?.api_key),
      hasClient: Boolean(clientId),
      clientHint: mask(acc?.oauth_client_id || (env.id ? env.id : null)),
      oauthReady: Boolean((acc?.oauth_client_id || env.id) && (acc?.oauth_client_secret || env.secret)),
      connected: Boolean(acc?.refresh_token || acc?.access_token),
      lastSyncAt: acc?.last_sync_at,
      envOAuth: Boolean(env.id && env.secret),
    };
}

export async function saveYoutubeSettings(
  userId: string,
  data: {
    channelId?: string;
    apiKey?: string;
    oauthClientId?: string;
    oauthClientSecret?: string;
    clearSecrets?: boolean;
  },
) {
    const sql = await getSql();
    const current = await loadAccount(userId);
    const channelId = (data.channelId || current?.channel_id || DEFAULT_CHANNEL_ID).trim();
    const apiKey = data.clearSecrets
      ? null
      : data.apiKey?.trim() || current?.api_key || null;
    const oauthClientId = data.clearSecrets
      ? null
      : data.oauthClientId?.trim() || current?.oauth_client_id || null;
    const oauthClientSecret = data.clearSecrets
      ? null
      : data.oauthClientSecret?.trim() || current?.oauth_client_secret || null;
    await sql`
      insert into youtube_accounts (
        user_id, channel_id, api_key, oauth_client_id, oauth_client_secret, updated_at
      ) values (
        ${userId}, ${channelId}, ${apiKey}, ${oauthClientId}, ${oauthClientSecret}, now()
      )
      on conflict (user_id) do update set
        channel_id = excluded.channel_id,
        api_key = excluded.api_key,
        oauth_client_id = excluded.oauth_client_id,
        oauth_client_secret = excluded.oauth_client_secret,
        updated_at = now()
    `;
    return { ok: true as const };
}

export async function startYoutubeOAuth(userId: string, data: { origin: string }) {
    const origin = safeOrigin(data.origin);
    if (!origin) return { ok: false as const, error: "This origin cannot connect to YouTube OAuth." };
    const acc = await loadAccount(userId);
    const env = envClient();
    const clientId = acc?.oauth_client_id || env.id;
    const clientSecret = acc?.oauth_client_secret || env.secret;
    if (!clientId || !clientSecret) {
      return {
        ok: false as const,
        error: "Add a Google Cloud OAuth client (YouTube Data API) in the desk, or set it on deploy.",
      };
    }
    const state = `${userId}.${crypto.randomUUID()}`;
    const sql = await getSql();
    await sql`
      insert into youtube_accounts (user_id, channel_id, oauth_state, updated_at)
      values (${userId}, ${acc?.channel_id || DEFAULT_CHANNEL_ID}, ${state}, now())
      on conflict (user_id) do update set oauth_state = excluded.oauth_state, updated_at = now()
    `;
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", `${origin}/api/youtube/callback`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", YOUTUBE_SCOPES);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("state", state);
    url.searchParams.set("include_granted_scopes", "true");
    return { ok: true as const, url: url.toString() };
}

export async function disconnectYoutube(userId: string) {
    const sql = await getSql();
    await sql`
      update youtube_accounts
      set access_token = null, refresh_token = null, token_expires_at = null, oauth_state = null, updated_at = now()
      where user_id = ${userId}
    `;
    return { ok: true as const };
}

export async function syncYoutubeChannel(userId: string) {
    const acc = await loadAccount(userId);
    const channelId = acc?.channel_id || DEFAULT_CHANNEL_ID;
    const rssRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
      { headers: { "User-Agent": "ClassicCarSistersDesk/1.0" }, signal: AbortSignal.timeout(12000) },
    );
    if (!rssRes.ok) {
      return { ok: false as const, error: `YouTube RSS ${rssRes.status}` };
    }
    const xml = await rssRes.text();
    const feed = parseChannelRss(xml);
    if (feed.length === 0) {
      return { ok: false as const, error: "No tapes in the channel feed." };
    }
    const details = acc?.api_key ? await fetchVideoDetails(feed.map((v) => v.youtubeId), acc.api_key) : {};
    const sql = await getSql();
    const existing = await sql<{ id: string; youtube_id: string | null; status: string }>`
      select id, youtube_id, status from studio_tapes where user_id = ${userId}
    `;
    const byYt = new Map(existing.filter((r) => r.youtube_id).map((r) => [r.youtube_id as string, r]));
    let imported = 0;
    let updated = 0;
    for (const item of feed) {
      const extra = details[item.youtubeId];
      const type = classifyTape(item.title, item.isShort, item.description);
      const durationSec = extra?.durationSec || guessDuration(type, item.isShort);
      const views = extra?.views || item.views;
      const hit = byYt.get(item.youtubeId);
      if (hit) {
        await sql`
          update studio_tapes
          set title = ${item.title}, views = ${views}, duration_sec = ${durationSec},
              published = ${item.published}, updated_at = now()
          where user_id = ${userId} and id = ${hit.id}
        `;
        updated += 1;
        continue;
      }
      const id = `yt-${item.youtubeId}`;
      const video: Video = {
        id,
        youtubeId: item.youtubeId,
        title: item.title,
        durationSec,
        views,
        published: item.published,
        type,
        superScore: autoScore(type, durationSec, views),
        why: autoWhy(type, views, autoScore(type, durationSec, views)),
        placements: [],
        pinnedComment: "",
        descriptionLead: "",
        source: "youtube",
      };
      const draft: VideoDraft = buildOptimizedDraft(video);
      video.pinnedComment = draft.pinnedComment;
      video.descriptionLead = draft.descriptionLead;
      video.placements = draft.placements;
      await sql`
        insert into studio_tapes (
          id, user_id, youtube_id, title, duration_sec, views, type, super_score, why,
          campaign_id, source, published, has_file, draft, status, updated_at
        ) values (
          ${id}, ${userId}, ${item.youtubeId}, ${item.title}, ${durationSec}, ${views},
          ${type}, ${video.superScore}, ${video.why}, ${null}, ${"youtube"}, ${item.published},
          ${false}, ${JSON.stringify(draft)}, ${"ready"}, now()
        )
        on conflict (user_id, id) do nothing
      `;
      imported += 1;
    }
    await sql`
      insert into youtube_accounts (user_id, channel_id, last_sync_at, updated_at)
      values (${userId}, ${channelId}, now(), now())
      on conflict (user_id) do update set last_sync_at = now(), updated_at = now()
    `;
    return {
      ok: true as const,
      imported,
      updated,
      total: feed.length,
      channelTitle: /<title>([^<]+)<\/title>/.exec(xml)?.[1]?.trim() ?? null,
    };
}

type YtDetail = { durationSec: number; views: number; categoryId: string; description: string; tags: string[] };

async function fetchVideoDetails(ids: string[], apiKey: string) {
  const map: Record<string, YtDetail> = {};
  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,contentDetails,statistics");
    url.searchParams.set("id", chunk.join(","));
    url.searchParams.set("key", apiKey);
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) break;
    const body = (await res.json()) as {
      items?: {
        id: string;
        snippet?: { description?: string; categoryId?: string; tags?: string[] };
        contentDetails?: { duration?: string };
        statistics?: { viewCount?: string };
      }[];
    };
    for (const item of body.items ?? []) {
      map[item.id] = {
        durationSec: parseIsoDuration(item.contentDetails?.duration ?? ""),
        views: Number(item.statistics?.viewCount ?? 0),
        categoryId: item.snippet?.categoryId ?? "22",
        description: item.snippet?.description ?? "",
        tags: item.snippet?.tags ?? [],
      };
    }
  }
  return map;
}

export async function listYoutubeComments(userId: string, data: { youtubeId: string }) {
    const acc = await loadAccount(userId);
    const token = await ensureAccessToken(userId, acc);
    const key = acc?.api_key;
    if (!token && !key) {
      return { ok: false as const, error: "Save an API key or connect the channel to read comments." };
    }
    const url = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("videoId", data.youtubeId);
    url.searchParams.set("maxResults", "15");
    url.searchParams.set("textFormat", "plainText");
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    else url.searchParams.set("key", key!);
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false as const, error: `Comments ${res.status}: ${t.slice(0, 180)}` };
    }
    const body = (await res.json()) as {
      items?: {
        id: string;
        snippet: {
          topLevelComment: {
            snippet: { authorDisplayName: string; textDisplay: string; likeCount: number; publishedAt: string };
          };
        };
      }[];
    };
    const comments = (body.items ?? []).map((it) => ({
      id: it.id,
      author: it.snippet.topLevelComment.snippet.authorDisplayName,
      text: it.snippet.topLevelComment.snippet.textDisplay,
      likes: it.snippet.topLevelComment.snippet.likeCount,
      at: it.snippet.topLevelComment.snippet.publishedAt,
    }));
    return { ok: true as const, comments };
}

export async function pushDescription(
  userId: string,
  data: { youtubeId: string; lead: string; title?: string },
) {
    const acc = await loadAccount(userId);
    const token = await ensureAccessToken(userId, acc);
    if (!token) {
      return { ok: false as const, error: "Connect YouTube (OAuth) to write descriptions. RSS sync does not need it." };
    }
    const getUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    getUrl.searchParams.set("part", "snippet");
    getUrl.searchParams.set("id", data.youtubeId);
    const got = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!got.ok) {
      return { ok: false as const, error: `Could not load video snippet (${got.status}).` };
    }
    const payload = (await got.json()) as {
      items?: {
        snippet: {
          title: string;
          description: string;
          categoryId: string;
          tags?: string[];
          defaultLanguage?: string;
        };
      }[];
    };
    const snippet = payload.items?.[0]?.snippet;
    if (!snippet) return { ok: false as const, error: "YouTube returned no snippet — is this your channel?" };
    const description = mergeDescription(snippet.description || "", data.lead);
    const put = await fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        id: data.youtubeId,
        snippet: {
          title: data.title || snippet.title,
          categoryId: snippet.categoryId || "22",
          description,
          tags: snippet.tags,
          defaultLanguage: snippet.defaultLanguage,
        },
      }),
    });
    const ok = put.ok;
    const detail = ok ? "Description fold written." : (await put.text()).slice(0, 240);
    await logPush(userId, data.youtubeId, data.title || snippet.title, "description", ok, detail);
    if (!ok) return { ok: false as const, error: detail };
    return { ok: true as const, description };
}

export async function postChannelComment(
  userId: string,
  data: { youtubeId: string; text: string; title?: string },
) {
    const acc = await loadAccount(userId);
    const token = await ensureAccessToken(userId, acc);
    if (!token) {
      return { ok: false as const, error: "Connect YouTube (OAuth) to post as the channel. Pinning is still Studio-only." };
    }
    const res = await fetch("https://www.googleapis.com/youtube/v3/commentThreads?part=snippet", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        snippet: {
          videoId: data.youtubeId,
          topLevelComment: { snippet: { textOriginal: data.text } },
        },
      }),
    });
    const ok = res.ok;
    const detail = ok ? "Comment posted as the channel. Pin it in YouTube Studio." : (await res.text()).slice(0, 240);
    await logPush(userId, data.youtubeId, data.title || data.youtubeId, "comment", ok, detail);
    if (!ok) return { ok: false as const, error: detail };
    return { ok: true as const };
}

export async function listYoutubePushes(userId: string) {
    const sql = await getSql();
    return sql<{
      id: number;
      youtube_id: string;
      title: string | null;
      kind: string;
      ok: boolean;
      detail: string | null;
      created_at: string;
    }>`
      select id, youtube_id, title, kind, ok, detail, created_at::text
      from youtube_pushes
      where user_id = ${userId}
      order by id desc
      limit 20
    `;
}

async function logPush(
  userId: string,
  youtubeId: string,
  title: string,
  kind: string,
  ok: boolean,
  detail: string,
) {
  const sql = await getSql();
  await sql`
    insert into youtube_pushes (user_id, youtube_id, title, kind, ok, detail)
    values (${userId}, ${youtubeId}, ${title}, ${kind}, ${ok}, ${detail})
  `;
}

async function ensureAccessToken(userId: string, acc: AccountRow | null) {
  if (!acc) return null;
  const env = envClient();
  const clientId = acc.oauth_client_id || env.id;
  const clientSecret = acc.oauth_client_secret || env.secret;
  if (!clientId || !clientSecret) return acc.access_token;
  const expires = acc.token_expires_at ? Date.parse(acc.token_expires_at) : 0;
  if (acc.access_token && expires > Date.now() + 60_000) return acc.access_token;
  if (!acc.refresh_token) return acc.access_token;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: acc.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) return null;
  const sql = await getSql();
  const exp = new Date(Date.now() + (body.expires_in ?? 3600) * 1000).toISOString();
  await sql`
    update youtube_accounts
    set access_token = ${body.access_token}, token_expires_at = ${exp}::timestamptz, updated_at = now()
    where user_id = ${userId}
  `;
  return body.access_token;
}

function safeOrigin(origin: string) {
  try {
    const u = new URL(origin);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "[::1]") return u.origin;
    if (u.hostname.endsWith(".grok-sandbox.com")) return u.origin;
    if (u.hostname.endsWith(".vercel.app")) return u.origin;
    return u.origin;
  } catch {
    return null;
  }
}

export async function finishYoutubeOAuth(opts: {
  code: string;
  state: string;
  origin: string;
}) {
  const sql = await getSql();
  const rows = await sql<AccountRow & { oauth_state: string | null }>`
    select user_id, channel_id, channel_title, api_key, oauth_client_id, oauth_client_secret,
           access_token, refresh_token, token_expires_at::text, last_sync_at::text, oauth_state
    from youtube_accounts where oauth_state = ${opts.state}
  `;
  const acc = rows[0];
  if (!acc) throw new Error("OAuth state expired. Start connect again from the desk.");
  const env = envClient();
  const clientId = acc.oauth_client_id || env.id;
  const clientSecret = acc.oauth_client_secret || env.secret;
  if (!clientId || !clientSecret) throw new Error("Missing OAuth client.");
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${opts.origin}/api/youtube/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Google token ${tokenRes.status}: ${(await tokenRes.text()).slice(0, 200)}`);
  }
  const tokens = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  const exp = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();
  let title: string | null = acc.channel_title;
  if (tokens.access_token) {
    const mine = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    if (mine.ok) {
      const body = (await mine.json()) as { items?: { id?: string; snippet?: { title?: string } }[] };
      const ch = body.items?.[0];
      if (ch?.snippet?.title) title = ch.snippet.title;
      if (ch?.id) {
        await sql`
          update youtube_accounts set channel_id = ${ch.id} where user_id = ${acc.user_id}
        `;
      }
    }
  }
  await sql`
    update youtube_accounts set
      access_token = ${tokens.access_token ?? null},
      refresh_token = ${tokens.refresh_token ?? acc.refresh_token},
      token_expires_at = ${exp}::timestamptz,
      channel_title = ${title},
      oauth_state = null,
      updated_at = now()
    where user_id = ${acc.user_id}
  `;
}

export type YoutubeStatus = Awaited<ReturnType<typeof getYoutubeStatus>>;
export type YoutubePush = Awaited<ReturnType<typeof listYoutubePushes>>[number];

