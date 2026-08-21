import { VIDEOS, type Video, type VideoType } from "@/lib/data/catalog";
import { getSql } from "@/lib/db";
import {
  autoScore,
  autoWhy,
  buildOptimizedDraft,
  templateCopy,
} from "@/lib/optimize";
import { seedDraft, type DressStatus, type VideoDraft } from "@/lib/super-pack";

export type LibraryTape = {
  video: Video;
  draft: VideoDraft;
};

type TapeRow = {
  id: string;
  youtube_id: string | null;
  title: string;
  duration_sec: number;
  views: number;
  type: string;
  super_score: number;
  why: string;
  campaign_id: string | null;
  source: string;
  published: string | null;
  has_file: boolean;
  draft: string;
  status: string;
};

const TYPES: VideoType[] = ["legacy", "restoration", "live", "show", "short"];

function asType(v: string): VideoType {
  return TYPES.includes(v as VideoType) ? (v as VideoType) : "legacy";
}

function rowToLibrary(row: TapeRow): LibraryTape {
  let draft: VideoDraft;
  try {
    draft = JSON.parse(row.draft) as VideoDraft;
  } catch {
    draft = {
      videoId: row.id,
      pinnedComment: "",
      descriptionLead: "",
      overlayLine: "",
      endLeft: "Super Thanks",
      endRight: "Shop the look",
      placements: [],
      status: (row.status as DressStatus) || "bare",
    };
  }
  draft.status = (row.status as DressStatus) || draft.status;
  const video: Video = {
    id: row.id,
    youtubeId: row.youtube_id ?? "",
    title: row.title,
    durationSec: row.duration_sec,
    views: row.views,
    published: row.published ?? "",
    type: asType(row.type),
    superScore: row.super_score,
    why: row.why,
    campaignId: row.campaign_id ?? undefined,
    placements: draft.placements,
    pinnedComment: draft.pinnedComment,
    descriptionLead: draft.descriptionLead,
    source: (row.source as Video["source"]) ?? "youtube",
    hasFile: Boolean(row.has_file),
  };
  return { video, draft };
}

async function seedCatalog(userId: string) {
  const sql = await getSql();
  for (const v of VIDEOS) {
    const draft = seedDraft(v);
    await sql`
      insert into studio_tapes (
        id, user_id, youtube_id, title, duration_sec, views, type, super_score,
        why, campaign_id, source, published, has_file, draft, status
      ) values (
        ${v.id}, ${userId}, ${v.youtubeId}, ${v.title}, ${v.durationSec}, ${v.views},
        ${v.type}, ${v.superScore}, ${v.why}, ${v.campaignId ?? null}, ${"catalog"},
        ${v.published}, ${false}, ${JSON.stringify(draft)}, ${"bare"}
      )
      on conflict (user_id, id) do nothing
    `;
  }
}

export async function loadLibrary(userId: string): Promise<LibraryTape[]> {
  const sql = await getSql();
  const existing = await sql<{ id: string }>`
    select id from studio_tapes where user_id = ${userId}
  `;
  const have = new Set(existing.map((r) => r.id));
  if (VIDEOS.some((v) => !have.has(v.id))) {
    await seedCatalog(userId);
  }
  const rows = await sql<TapeRow>`
    select id, youtube_id, title, duration_sec, views, type, super_score, why,
           campaign_id, source, published, has_file, draft, status
    from studio_tapes
    where user_id = ${userId}
    order by super_score desc
  `;
  return rows.map(rowToLibrary);
}

export async function upsertTape(
  userId: string,
  data: { video: Video; draft: VideoDraft },
) {
  const sql = await getSql();
  const v = data.video;
  const draft = { ...data.draft, videoId: v.id };
  await sql`
    insert into studio_tapes (
      id, user_id, youtube_id, title, duration_sec, views, type, super_score,
      why, campaign_id, source, published, has_file, draft, status, updated_at
    ) values (
      ${v.id}, ${userId}, ${v.youtubeId || null}, ${v.title}, ${v.durationSec},
      ${v.views}, ${v.type}, ${v.superScore}, ${v.why}, ${v.campaignId ?? null},
      ${v.source ?? "youtube"}, ${v.published || null}, ${Boolean(v.hasFile)},
      ${JSON.stringify(draft)}, ${draft.status}, now()
    )
    on conflict (user_id, id) do update set
      youtube_id = excluded.youtube_id,
      title = excluded.title,
      duration_sec = excluded.duration_sec,
      views = excluded.views,
      type = excluded.type,
      super_score = excluded.super_score,
      why = excluded.why,
      campaign_id = excluded.campaign_id,
      source = excluded.source,
      published = excluded.published,
      has_file = excluded.has_file,
      draft = excluded.draft,
      status = excluded.status,
      updated_at = now()
  `;
  return { ok: true as const };
}

export async function optimizeTape(data: {
  title: string;
  type: VideoType;
  durationSec: number;
  views?: number;
  campaignId?: string;
  useGrok?: boolean;
}) {
  const views = data.views ?? 0;
  const score = autoScore(data.type, data.durationSec, views);
  const why = autoWhy(data.type, views, score);
  const fallback = templateCopy(data.title, data.type);
  let copy = fallback;

  const apiKey = data.useGrok ? process.env.XAI_API_KEY : undefined;
  if (apiKey) {
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(9000),
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content:
                "You write Super Thanks copy for Classic Car Sisters (Christine and Amanda, Barker's Barn, Tacoma). Voice: two sisters, plain, specific. Return ONLY compact JSON with keys pinnedComment, descriptionLead, overlayLine, verbal, card, end, endLeft, endRight. No markdown.",
            },
            {
              role: "user",
              content: `Title: ${data.title}. Type: ${data.type}. Duration: ${data.durationSec}s. Views: ${views}.`,
            },
          ],
        }),
      });
      if (res.ok) {
        const body = (await res.json()) as {
          choices: { message: { content: string } }[];
        };
        const raw = body.choices[0]?.message.content?.trim() ?? "";
        const json = raw.replace(/^```json\s*|```$/g, "");
        const parsed = JSON.parse(json) as Partial<typeof fallback>;
        copy = { ...fallback, ...parsed };
      }
    } catch {
      copy = fallback;
    }
  }

  return {
    score,
    why,
    copy,
    draft: buildOptimizedDraft(
      {
        id: "tmp",
        title: data.title,
        type: data.type,
        durationSec: data.durationSec,
        campaignId: data.campaignId,
      },
      copy,
    ),
  };
}
