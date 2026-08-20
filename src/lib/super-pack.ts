import { CAMPAIGNS, type Placement, type Video, type VideoType } from "@/lib/data/catalog";
import { secondsToStamp, youtubeStudio, youtubeStudioComments } from "@/lib/utils";

export type DressStatus = "bare" | "drafted" | "ready" | "posted";

export type DraftPlacement = Placement & { id: string };

export type VideoDraft = {
  videoId: string;
  pinnedComment: string;
  descriptionLead: string;
  overlayLine: string;
  endLeft: string;
  endRight: string;
  placements: DraftPlacement[];
  status: DressStatus;
};

const TYPE_SCORE: Record<VideoType, number> = {
  legacy: 90,
  live: 92,
  restoration: 76,
  show: 70,
  short: 58,
};

export function scoreForType(type: VideoType) {
  return TYPE_SCORE[type];
}

export function withPlacementIds(videoId: string, placements: Placement[]): DraftPlacement[] {
  return placements.map((p, i) => ({
    ...p,
    id: `${videoId}-${p.kind}-${p.at}-${i}`,
  }));
}

export function defaultPlacements(type: VideoType, durationSec: number): Placement[] {
  const dur = Math.max(20, durationSec);
  const verbalAt = Math.min(48, Math.round(dur * 0.08));
  const endAt = Math.max(verbalAt + 8, dur - (type === "short" ? 4 : 14));
  if (type === "live") {
    return [
      {
        at: 30,
        kind: "verbal",
        copy: "Super Chat is the colored one in chat. First goal is $200 — El Camino body drop. We read every name.",
      },
      {
        at: Math.min(dur - 20, Math.round(dur * 0.5)),
        kind: "verbal",
        copy: "Halfway to the goal. If you've been lurking in the barn, this is a fine time.",
      },
    ];
  }
  if (type === "short") {
    return [
      {
        at: Math.min(8, Math.floor(dur / 3)),
        kind: "verbal",
        copy: "Super Thanks is the heart under this Short. It goes to the barn.",
      },
    ];
  }
  const pack: Placement[] = [
    {
      at: verbalAt,
      kind: "verbal",
      copy: "If this still means something, Super Thanks is the heart under the player. We read every one.",
    },
  ];
  if (dur > 90) {
    pack.push({
      at: Math.round(dur * 0.72),
      kind: "card",
      copy: "Lower third on: Super Thanks · heart under the player.",
    });
  }
  pack.push({
    at: endAt,
    kind: "end",
    copy: "End screen: Super Thanks left, shop the look right.",
  });
  return pack;
}

export function packFromVideo(video: Video): Omit<VideoDraft, "videoId" | "status"> {
  const fund =
    (video.campaignId && CAMPAIGNS.find((c) => c.id === video.campaignId)?.name) || "the barn";
  return {
    pinnedComment: video.pinnedComment,
    descriptionLead: video.descriptionLead,
    overlayLine:
      video.type === "live"
        ? "SUPER CHAT  ·  $200 El Camino body drop  ·  we read every name"
        : `SUPER THANKS  ·  heart under the player  ·  ${fund}`,
    endLeft: video.type === "live" ? "Super Chat" : "Super Thanks",
    endRight: video.type === "restoration" ? "Shop the bench" : "Shop the look",
    placements: withPlacementIds(video.id, video.placements),
  };
}

export function seedDraft(video: Video): VideoDraft {
  return {
    videoId: video.id,
    ...packFromVideo(video),
    status: "bare",
  };
}

export function exportPackText(video: Video, draft: VideoDraft) {
  const beats = [...draft.placements]
    .sort((a, b) => a.at - b.at)
    .map((p) => `${secondsToStamp(p.at)}  ${p.kind}  —  ${p.copy}`)
    .join("\n");
  return [
    `CLASSIC CAR SISTERS · SUPER THANKS PACK`,
    video.title,
    `YouTube Studio: ${youtubeStudio(video.youtubeId)}`,
    `Comments: ${youtubeStudioComments(video.youtubeId)}`,
    ``,
    `DESCRIPTION (paste at the very top)`,
    draft.descriptionLead,
    ``,
    `PINNED COMMENT`,
    draft.pinnedComment,
    ``,
    `ON-SCREEN LOWER THIRD`,
    draft.overlayLine,
    ``,
    `END SCREEN`,
    `Left: ${draft.endLeft}`,
    `Right: ${draft.endRight}`,
    ``,
    `TIMELINE`,
    beats || "(no beats yet)",
  ].join("\n");
}

export const STATUS_LABEL: Record<DressStatus, string> = {
  bare: "Undressed",
  drafted: "In the bay",
  ready: "Ready to paste",
  posted: "Live on YouTube",
};
