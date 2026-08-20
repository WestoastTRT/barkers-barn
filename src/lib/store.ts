import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SEED_WALL,
  VIDEOS,
  type Video,
  type VideoType,
} from "@/lib/data/catalog";
import {
  defaultPlacements,
  packFromVideo,
  seedDraft,
  type DressStatus,
  type DraftPlacement,
  type VideoDraft,
} from "@/lib/super-pack";

export type CartLine = { slug: string; qty: number };

export type WallEntry = {
  id: string;
  name: string;
  amount: number;
  note: string;
  videoId: string;
  at: number;
};

export type ChecklistId =
  | "enabled"
  | "pinned-legacy"
  | "desc-lead"
  | "live-goal"
  | "reply-24h"
  | "end-screens"
  | "shop-links"
  | "community-post";

const DEFAULT_CHECKLIST: Record<ChecklistId, boolean> = {
  enabled: true,
  "pinned-legacy": false,
  "desc-lead": false,
  "live-goal": false,
  "reply-24h": false,
  "end-screens": false,
  "shop-links": false,
  "community-post": false,
};

type EngineState = {
  cart: CartLine[];
  cartOpen: boolean;
  wall: WallEntry[];
  checklist: Record<ChecklistId, boolean>;
  copied: Record<string, number>;
  drafts: Record<string, VideoDraft>;
  customVideos: Video[];
  addToCart: (slug: string) => void;
  removeFromCart: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  addWall: (entry: Omit<WallEntry, "id" | "at">) => void;
  toggleCheck: (id: ChecklistId) => void;
  markCopied: (key: string) => void;
  ensureDraft: (video: Video) => VideoDraft;
  patchDraft: (videoId: string, patch: Partial<VideoDraft>) => void;
  setDraftStatus: (videoId: string, status: DressStatus) => void;
  addBeat: (videoId: string, beat: Omit<DraftPlacement, "id">) => void;
  updateBeat: (videoId: string, beatId: string, patch: Partial<DraftPlacement>) => void;
  removeBeat: (videoId: string, beatId: string) => void;
  applyPack: (video: Video) => void;
  dressHarvest: (videos: Video[]) => void;
  addCustomVideo: (input: {
    youtubeId: string;
    title: string;
    durationSec: number;
    type: VideoType;
    campaignId?: string;
  }) => Video;
  putVideo: (video: Video, draft: VideoDraft) => void;
  hydrateLibrary: (items: { video: Video; draft: VideoDraft }[]) => void;
};

function seedWall(): WallEntry[] {
  return SEED_WALL.map((s, i) => ({
    id: `seed-${i}`,
    name: s.name,
    amount: s.amount,
    note: s.note,
    videoId: s.videoId,
    at: Date.now() - (i + 1) * 36e5 * 6,
  }));
}

function catalogVideo(id: string, custom: Video[]) {
  return custom.find((v) => v.id === id) ?? VIDEOS.find((v) => v.id === id);
}

export const useEngine = create<EngineState>()(
  persist(
    (set, get) => ({
      cart: [],
      cartOpen: false,
      wall: seedWall(),
      checklist: DEFAULT_CHECKLIST,
      copied: {},
      drafts: {},
      customVideos: [],
      addToCart: (slug) => {
        const existing = get().cart.find((l) => l.slug === slug);
        const cart = existing
          ? get().cart.map((l) =>
              l.slug === slug ? { ...l, qty: l.qty + 1 } : l,
            )
          : [...get().cart, { slug, qty: 1 }];
        set({ cart, cartOpen: true });
      },
      removeFromCart: (slug) =>
        set({ cart: get().cart.filter((l) => l.slug !== slug) }),
      setQty: (slug, qty) =>
        set({
          cart:
            qty <= 0
              ? get().cart.filter((l) => l.slug !== slug)
              : get().cart.map((l) => (l.slug === slug ? { ...l, qty } : l)),
        }),
      clearCart: () => set({ cart: [] }),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      addWall: (entry) =>
        set({
          wall: [
            {
              ...entry,
              id: `w-${Date.now()}`,
              at: Date.now(),
            },
            ...get().wall,
          ],
        }),
      toggleCheck: (id) =>
        set({
          checklist: { ...get().checklist, [id]: !get().checklist[id] },
        }),
      markCopied: (key) =>
        set({ copied: { ...get().copied, [key]: Date.now() } }),
      ensureDraft: (video) => {
        const existing = get().drafts[video.id];
        if (existing) return existing;
        const draft = seedDraft(video);
        set({ drafts: { ...get().drafts, [video.id]: draft } });
        return draft;
      },
      patchDraft: (videoId, patch) => {
        const current =
          get().drafts[videoId] ??
          (() => {
            const v = catalogVideo(videoId, get().customVideos);
            return v ? seedDraft(v) : null;
          })();
        if (!current) return;
        const next = { ...current, ...patch, videoId };
        if (next.status === "bare") next.status = "drafted";
        set({ drafts: { ...get().drafts, [videoId]: next } });
      },
      setDraftStatus: (videoId, status) => {
        const current = get().drafts[videoId];
        if (!current) return;
        set({
          drafts: { ...get().drafts, [videoId]: { ...current, status } },
        });
      },
      addBeat: (videoId, beat) => {
        const video = catalogVideo(videoId, get().customVideos);
        if (!video) return;
        const current = get().drafts[videoId] ?? seedDraft(video);
        const placement: DraftPlacement = {
          ...beat,
          id: `${videoId}-${Date.now()}`,
        };
        set({
          drafts: {
            ...get().drafts,
            [videoId]: {
              ...current,
              status: current.status === "bare" ? "drafted" : current.status,
              placements: [...current.placements, placement].sort(
                (a, b) => a.at - b.at,
              ),
            },
          },
        });
      },
      updateBeat: (videoId, beatId, patch) => {
        const current = get().drafts[videoId];
        if (!current) return;
        set({
          drafts: {
            ...get().drafts,
            [videoId]: {
              ...current,
              status: current.status === "bare" ? "drafted" : current.status,
              placements: current.placements
                .map((p) => (p.id === beatId ? { ...p, ...patch } : p))
                .sort((a, b) => a.at - b.at),
            },
          },
        });
      },
      removeBeat: (videoId, beatId) => {
        const current = get().drafts[videoId];
        if (!current) return;
        set({
          drafts: {
            ...get().drafts,
            [videoId]: {
              ...current,
              placements: current.placements.filter((p) => p.id !== beatId),
            },
          },
        });
      },
      applyPack: (video) => {
        const pack = packFromVideo(video);
        const current = get().drafts[video.id];
        set({
          drafts: {
            ...get().drafts,
            [video.id]: {
              videoId: video.id,
              ...pack,
              status:
                current?.status === "posted" || current?.status === "ready"
                  ? current.status
                  : "drafted",
            },
          },
        });
      },
      dressHarvest: (videos) => {
        const drafts = { ...get().drafts };
        for (const video of videos) {
          if (drafts[video.id]?.status === "posted") continue;
          drafts[video.id] = {
            videoId: video.id,
            ...packFromVideo(video),
            status: "ready",
          };
        }
        set({ drafts });
      },
      addCustomVideo: (input) => {
        const catalogHit = VIDEOS.find((v) => v.youtubeId === input.youtubeId);
        if (catalogHit) return catalogHit;
        const id = `yt-${input.youtubeId}`;
        const existing = get().customVideos.find((v) => v.id === id);
        if (existing) return existing;
        const placements = defaultPlacements(input.type, input.durationSec);
        const fund = "the barn";
        const video: Video = {
          id,
          youtubeId: input.youtubeId,
          title: input.title || `Tape ${input.youtubeId}`,
          durationSec: input.durationSec,
          views: 0,
          published: new Date().toISOString().slice(0, 10),
          type: input.type,
          superScore:
            input.type === "legacy" ? 90 : input.type === "live" ? 92 : input.type === "restoration" ? 76 : input.type === "short" ? 58 : 70,
          why: "Imported from YouTube. Optimizer dressed Super Thanks — paste into YouTube Studio, no re-upload.",
          campaignId: input.campaignId,
          placements,
          pinnedComment: `Super Thanks is on this video. It goes to ${fund}. We reply to every one.`,
          descriptionLead:
            "Super Thanks is unlocked on this video — tap the heart under the player if the barn still means something.",
          source: "youtube",
        };
        set({
          customVideos: [video, ...get().customVideos],
          drafts: {
            ...get().drafts,
            [id]: { ...seedDraft(video), status: "drafted" },
          },
        });
        return video;
      },
      putVideo: (video, draft) => {
        const custom = get().customVideos.filter((v) => v.id !== video.id);
        const isCatalog = VIDEOS.some((v) => v.id === video.id);
        set({
          customVideos: isCatalog ? custom : [video, ...custom],
          drafts: { ...get().drafts, [video.id]: { ...draft, videoId: video.id } },
        });
      },
      hydrateLibrary: (items) => {
        const custom: Video[] = [];
        const drafts = { ...get().drafts };
        for (const item of items) {
          drafts[item.video.id] = item.draft;
          if (item.video.source && item.video.source !== "catalog") {
            custom.push(item.video);
          }
        }
        set({ customVideos: custom, drafts });
      },
    }),
    {
      name: "barn-desk",
      partialize: (s) => ({
        cart: s.cart,
        wall: s.wall,
        checklist: s.checklist,
        copied: s.copied,
        drafts: s.drafts,
        customVideos: s.customVideos,
      }),
    },
  ),
);
