import { CAMPAIGNS, type Placement, type Video, type VideoType } from "@/lib/data/catalog";
import { defaultPlacements, withPlacementIds, type VideoDraft } from "@/lib/super-pack";

export function autoScore(type: VideoType, durationSec: number, views: number) {
  let score = 70;
  if (type === "legacy") score = 90;
  if (type === "live") score = 92;
  if (type === "restoration") score = 76;
  if (type === "show") score = 70;
  if (type === "short") score = 58;
  if (views >= 10000) score += 5;
  else if (views >= 3000) score += 3;
  else if (views >= 800) score += 1;
  if (type === "legacy" && durationSec >= 8 * 60) score += 3;
  if (type === "short") score = Math.min(score, 66);
  return Math.max(40, Math.min(98, score));
}

export function autoWhy(type: VideoType, views: number, score: number) {
  if (type === "legacy") {
    return views < 2000
      ? "Origin story, under-harvested. Auto-placed a verbal ask early and Super Thanks in the first description line."
      : "Highest-emotion format on the channel. Optimizer put the ask on the first quiet beat and the pinned comment.";
  }
  if (type === "live") {
    return "Super Chat on the night, Super Thanks on the VOD. Optimizer pinned a goal at 0:30 and a halfway bump.";
  }
  if (type === "short") {
    return "Shorts hide the heart. Optimizer put the ask in the on-screen caption and the pinned comment — no description fold.";
  }
  if (type === "restoration") {
    return "Bench tape. Optimizer paired Super Thanks with an end-screen shop slot for the tool on camera.";
  }
  return `Score ${score}. Optimizer dressed Super Thanks without cutting a new video.`;
}

export function templateCopy(title: string, type: VideoType, campaignName?: string) {
  const fund = campaignName ?? "the barn";
  if (type === "live") {
    return {
      pinnedComment: `Replay of live from the barn. Super Thanks still works on the VOD. Super Chat was for the night-of — we read every name.`,
      descriptionLead: `Replay from Barker's Barn. Super Thanks is on this VOD. Next live: Saturday. Super Chat goals in community.`,
      overlayLine: "SUPER CHAT  ·  $200 El Camino body drop  ·  we read every name",
      verbal:
        "Super Chat is the colored one in chat. First goal is $200 — El Camino body drop. We read every name.",
      card: "Goal on-screen. Super Chat now, Super Thanks on the replay.",
      end: "End screen: Super Chat / next live.",
      endLeft: "Super Chat",
      endRight: "Next live",
    };
  }
  if (type === "short") {
    return {
      pinnedComment: `Super Thanks is the heart under this Short. It goes to ${fund}.`,
      descriptionLead: `Super Thanks is on this Short — tap the heart if the barn still means something.`,
      overlayLine: "SUPER THANKS  ·  heart under this Short",
      verbal: "Super Thanks is the heart under this Short. It goes to the barn.",
      card: "Caption: Super Thanks · heart under this Short.",
      end: "Sticker: Super Thanks.",
      endLeft: "Super Thanks",
      endRight: "Follow",
    };
  }
  return {
    pinnedComment: `Super Thanks is on this video — "${title}". Every one goes to ${fund}. We reply to each name.`,
    descriptionLead: `Super Thanks is unlocked on this video — tap the heart under the player if ${fund} still means something.`,
    overlayLine: `SUPER THANKS  ·  heart under the player  ·  ${fund}`,
    verbal: `If this still means something, Super Thanks is the heart under the player. It goes to ${fund}. We read every name.`,
    card: "Lower third on: Super Thanks · heart under the player.",
    end: "End screen: Super Thanks left, shop the look right.",
    endLeft: "Super Thanks",
    endRight: type === "restoration" ? "Shop the bench" : "Shop the look",
  };
}

export function buildOptimizedDraft(
  video: Pick<Video, "id" | "title" | "type" | "durationSec" | "campaignId">,
  copy = templateCopy(
    video.title,
    video.type,
    video.campaignId
      ? CAMPAIGNS.find((c) => c.id === video.campaignId)?.name
      : undefined,
  ),
): VideoDraft {
  const base = defaultPlacements(video.type, video.durationSec).map((p) => {
    if (p.kind === "verbal") return { ...p, copy: copy.verbal };
    if (p.kind === "card") return { ...p, copy: copy.card };
    return { ...p, copy: copy.end };
  });
  return {
    videoId: video.id,
    pinnedComment: copy.pinnedComment,
    descriptionLead: copy.descriptionLead,
    overlayLine: copy.overlayLine,
    endLeft: copy.endLeft,
    endRight: copy.endRight,
    placements: withPlacementIds(video.id, base as Placement[]),
    status: "ready",
  };
}

export function estimatedLiftUsd(views: number, score: number) {
  const undressed = (views / 1000) * 0.4;
  const dressed = (views / 1000) * (score / 100) * 16;
  return Math.max(0, Math.round(dressed - undressed));
}
