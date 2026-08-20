import type { VideoType } from "@/lib/data/catalog";

export const DEFAULT_CHANNEL_ID = "UChPM9aMyqnPg5irHADtbhqw";

export type RssVideo = {
  youtubeId: string;
  title: string;
  published: string;
  description: string;
  views: number;
  isShort: boolean;
  link: string;
};

function tag(block: string, name: string) {
  const m = block.match(new RegExp(`<${name}>([^<]*)`));
  return m?.[1]?.trim() ?? "";
}

export function parseChannelRss(xml: string): RssVideo[] {
  const chunks = xml.split("<entry>").slice(1);
  const out: RssVideo[] = [];
  for (const block of chunks) {
    const youtubeId = tag(block, "yt:videoId");
    if (!/^[\w-]{11}$/.test(youtubeId)) continue;
    const href = block.match(/rel="alternate" href="([^"]+)"/)?.[1] ?? "";
    const views = Number(block.match(/views="(\d+)"/)?.[1] ?? 0);
    const published = tag(block, "published").slice(0, 10);
    const description =
      block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1]?.trim() ?? "";
    out.push({
      youtubeId,
      title: decodeXml(tag(block, "title") || tag(block, "media:title")),
      published,
      description: decodeXml(description),
      views,
      isShort: href.includes("/shorts/"),
      link: href,
    });
  }
  return out;
}

function decodeXml(s: string) {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'");
}

export function classifyTape(title: string, isShort: boolean, description: string): VideoType {
  const t = `${title} ${description}`.toLowerCase();
  if (isShort && !/live/.test(t)) return "short";
  if (/\blive\b/.test(t)) return "live";
  if (/legacy|andy'?s|1922|dad|who we are|gas station/.test(t)) return "legacy";
  if (/hot barker|car show|show day/.test(t)) return "show";
  return "restoration";
}

export function guessDuration(type: VideoType, isShort: boolean) {
  if (isShort || type === "short") return 45;
  if (type === "live") return 30 * 60;
  if (type === "legacy") return 10 * 60;
  return 7 * 60;
}

export const SUPER_MARKER = "Super Thanks is";

export function mergeDescription(existing: string, lead: string) {
  const clean = existing.replace(/\r\n/g, "\n").trim();
  const body = stripLead(clean);
  const fold = lead.trim();
  if (!fold) return clean;
  return body ? `${fold}\n\n${body}` : fold;
}

export function stripLead(description: string) {
  if (!description.startsWith(SUPER_MARKER) && !description.toLowerCase().startsWith("super thanks")) {
    return description;
  }
  const parts = description.split(/\n{2,}/);
  return parts.slice(1).join("\n\n").trim();
}

export function parseIsoDuration(iso: string) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

export const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.readonly",
].join(" ");
