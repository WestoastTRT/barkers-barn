import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function youtubeWatch(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeStudio(id: string) {
  return `https://studio.youtube.com/video/${id}/edit`;
}

export function youtubeStudioComments(id: string) {
  return `https://studio.youtube.com/video/${id}/comments`;
}

export function youtubeEmbed(id: string, start = 0) {
  const s = Math.max(0, Math.floor(start));
  return `https://www.youtube.com/embed/${id}?start=${s}&rel=0`;
}

export function secondsToStamp(total: number) {
  const n = Math.max(0, Math.floor(total));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function stampToSeconds(stamp: string) {
  const parts = stamp.trim().split(":").map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 1) return parts[0] ?? 0;
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
}

export function parseYoutubeId(raw: string): string | null {
  const s = raw.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
    const m = u.pathname.match(/\/(shorts|embed|live)\/([\w-]{11})/);
    if (m?.[2]) return m[2];
  } catch {
    return null;
  }
  return null;
}

export function potentialUsd(views: number, score: number) {
  return Math.round((views / 1000) * (score / 100) * 16);
}
