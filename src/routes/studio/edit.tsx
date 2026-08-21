import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ExternalLink,
  Heart,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ImportDock } from "@/components/studio/import-dock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { VIDEOS, type Placement, type Video } from "@/lib/data/catalog";
import { useEngine } from "@/lib/store";
import { deskCall } from "@/lib/desk-client";
import { STATUS_LABEL, exportPackText, type DraftPlacement } from "@/lib/super-pack";
import { getTapeFileUrl } from "@/lib/tape-files";
import {
  cn,
  formatCompact,
  formatUsd,
  potentialUsd,
  secondsToStamp,
  youtubeEmbed,
  youtubeStudio,
  youtubeStudioComments,
  youtubeThumb,
} from "@/lib/utils";

type Search = { v?: string };

export const Route = createFileRoute("/studio/edit")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    v: typeof s.v === "string" ? s.v : undefined,
  }),
  component: EditBay,
});

const KINDS: Placement["kind"][] = ["verbal", "card", "end"];

function EditBay() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const custom = useEngine((s) => s.customVideos);
  const drafts = useEngine((s) => s.drafts);
  const videos = useMemo(() => {
    const map = new Map<string, Video>();
    for (const v of VIDEOS) map.set(v.id, v);
    for (const v of custom) map.set(v.id, v);
    return [...map.values()].sort((a, b) => b.superScore - a.superScore);
  }, [custom]);

  const [id, setId] = useState(search.v ?? videos[0]?.id ?? "");
  const video = videos.find((v) => v.id === id) ?? videos[0];

  useEffect(() => {
    if (search.v && search.v !== id && videos.some((v) => v.id === search.v)) {
      setId(search.v);
    }
  }, [search.v, id, videos]);

  if (!video) {
    return <p className="text-chrome">No tapes in the bay yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-chrome uppercase">Cut studio</p>
          <h1 className="font-display mt-2 text-5xl tracking-wide text-cream">Edit bay</h1>
        </div>
        <HarvestButton videos={videos} />
      </div>

      <div className="mt-6">
        <ImportDock
          onAdded={(next) => {
            setId(next.id);
            void navigate({ to: "/studio/edit", search: { v: next.id } });
          }}
        />
      </div>

      <div className="mt-6 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 lg:w-52 lg:shrink-0">
        <Bin
          videos={videos}
          drafts={drafts}
          active={video.id}
          onPick={(next) => {
            setId(next);
            void navigate({ to: "/studio/edit", search: { v: next } });
          }}
        />
        </div>
        <div className="min-w-0 flex-1">
        <Editor video={video} />
        </div>
        <div className="min-w-0 lg:w-72 lg:shrink-0">
        <Inspector video={video} />
        </div>
      </div>
    </div>
  );
}

function HarvestButton({ videos }: { videos: Video[] }) {
  const dress = useEngine((s) => s.dressHarvest);
  const top = videos.slice(0, 4);
  return (
    <Button
      variant="cream"
      onClick={() => {
        dress(top);
        toast.success("Top four tapes dressed. Open each and ship.");
      }}
    >
      Dress this week's harvest
    </Button>
  );
}

function Bin({
  videos,
  drafts,
  active,
  onPick,
}: {
  videos: Video[];
  drafts: Record<string, { status: string }>;
  active: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex max-w-full gap-2 overflow-x-auto lg:block lg:overflow-visible">
      <p className="mb-2 hidden text-[11px] tracking-[0.18em] text-chrome uppercase lg:block">
        Catalog
      </p>
      <ul className="flex gap-2 lg:flex-col">
        {videos.map((v) => {
          const status = drafts[v.id]?.status ?? "bare";
          return (
            <li key={v.id} className="min-w-44 shrink-0 lg:min-w-0">
              <button
                type="button"
                onClick={() => onPick(v.id)}
                className={cn(
                  "flex w-full gap-2 rounded-md p-2 text-left ring-1 ring-transparent",
                  v.id === active ? "bg-asphalt-soft ring-line-dark" : "hover:bg-asphalt-soft/60",
                )}
              >
                <img
                  src={v.youtubeId ? youtubeThumb(v.youtubeId) : "/photos/hero-corvette.jpg"}
                  alt=""
                  className="h-12 w-20 shrink-0 rounded-sm object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-xs text-cream">{v.title}</span>
                  <span className="mt-1 flex items-center gap-2 text-[10px] tracking-wide text-chrome uppercase">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        status === "posted"
                          ? "bg-pine-soft"
                          : status === "ready"
                            ? "bg-cream"
                            : status === "drafted"
                              ? "bg-chrome"
                              : "bg-barn",
                      )}
                    />
                    {STATUS_LABEL[status as keyof typeof STATUS_LABEL]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Editor({ video }: { video: Video }) {
  const ensure = useEngine((s) => s.ensureDraft);
  const addBeat = useEngine((s) => s.addBeat);
  const draft = useEngine((s) => s.drafts[video.id]);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [kind, setKind] = useState<Placement["kind"]>("verbal");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const localRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    ensure(video);
    setPlayhead(0);
    setPlaying(false);
  }, [video.id, ensure, video]);

  useEffect(() => {
    let url: string | null = null;
    let alive = true;
    if (video.hasFile) {
      void getTapeFileUrl(video.id).then((u) => {
        if (!alive) {
          if (u) URL.revokeObjectURL(u);
          return;
        }
        url = u;
        setFileUrl(u);
      });
    } else {
      setFileUrl(null);
    }
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [video.id, video.hasFile]);

  const pack = draft;
  if (!pack) {
    return (
      <div className="rounded-xl bg-asphalt-soft p-8 text-sm text-chrome ring-1 ring-line-dark">
        Loading the bay…
      </div>
    );
  }
  const near = (p: DraftPlacement) => Math.abs(p.at - playhead) <= 8;
  const showEnd =
    playhead >= Math.max(0, video.durationSec - 16) ||
    pack.placements.some((p) => p.kind === "end" && near(p));

  function dropBeat() {
    const copy =
      kind === "verbal"
        ? pack.placements.find((p) => p.kind === "verbal")?.copy ||
          "Super Thanks is the heart under the player. We read every name."
        : kind === "card"
          ? pack.overlayLine
          : `End screen: ${pack.endLeft} / ${pack.endRight}`;
    addBeat(video.id, { at: playhead, kind, copy });
    toast.success(`Dropped ${kind} at ${secondsToStamp(playhead)}`);
  }

  return (
    <div className="rounded-xl bg-asphalt-soft p-4 ring-1 ring-line-dark">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{video.type}</Badge>
        <Badge variant="cream">score {video.superScore}</Badge>
        <span className="text-xs text-chrome tabular-nums">
          {formatCompact(video.views)} views · {formatUsd(potentialUsd(video.views, video.superScore))} if dressed
        </span>
      </div>
      <h2 className="mt-2 text-base font-medium text-cream">{video.title}</h2>
      <p className="mt-1 text-xs text-chrome">{video.why}</p>

      <div className="relative mt-4 aspect-video overflow-hidden rounded-lg bg-asphalt">
        {fileUrl ? (
          <video
            ref={localRef}
            src={fileUrl}
            className="absolute inset-0 size-full object-cover"
            onTimeUpdate={(e) => setPlayhead(Math.floor(e.currentTarget.currentTime))}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : playing && video.youtubeId ? (
          <iframe
            title={video.title}
            src={youtubeEmbed(video.youtubeId, playhead)}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img
            src={video.youtubeId ? youtubeThumb(video.youtubeId) : "/photos/hero-corvette.jpg"}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0">
          {!showEnd && (
            <div className="absolute bottom-9 left-2 right-2 sm:right-24">
              <div className="barn-stripes mb-1 h-1 w-24" />
              <p className="bg-asphalt/85 px-3 py-2 font-display text-sm tracking-wide text-cream sm:text-xl">
                {pack.overlayLine}
              </p>
            </div>
          )}
          {showEnd && (
            <div className="absolute right-2 bottom-9 flex w-36 flex-col gap-2 sm:w-52">
              <div className="rounded-md bg-cream px-3 py-2 text-asphalt">
                <p className="text-[10px] tracking-[0.16em] uppercase">End · left</p>
                <p className="font-medium">{pack.endLeft}</p>
              </div>
              <div className="rounded-md bg-barn px-3 py-2 text-cream">
                <p className="text-[10px] tracking-[0.16em] uppercase">End · right</p>
                <p className="font-medium">{pack.endRight}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between rounded-md bg-asphalt px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-cream">
          <Heart className="size-4 text-barn" />
          Super Thanks
        </div>
        <p className="max-w-[60%] truncate text-xs text-chrome">{pack.descriptionLead}</p>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="cream"
            onClick={() => {
              if (fileUrl && localRef.current) {
                localRef.current.currentTime = playhead;
                if (playing) localRef.current.pause();
                else void localRef.current.play();
                return;
              }
              setPlaying((p) => !p);
            }}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {playing ? "Hold" : "Play from playhead"}
          </Button>
          <span className="font-display text-xl tabular-nums text-cream">
            {secondsToStamp(playhead)}
          </span>
          <span className="text-xs text-chrome">/ {secondsToStamp(video.durationSec)}</span>
          <div className="ml-auto flex flex-wrap items-center gap-1">
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs ring-1",
                  kind === k
                    ? "bg-cream text-asphalt ring-cream"
                    : "text-chrome ring-line-dark",
                )}
              >
                {k}
              </button>
            ))}
            <Button size="sm" variant="onDark" onClick={dropBeat}>
              Drop at playhead
            </Button>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={video.durationSec}
          value={playhead}
          onChange={(e) => {
            const t = Number(e.target.value);
            setPlayhead(t);
            setPlaying(false);
            if (localRef.current) {
              localRef.current.currentTime = t;
              localRef.current.pause();
            }
          }}
          className="w-full accent-barn"
          aria-label="Playhead"
        />
        <Timeline
          video={video}
          placements={pack.placements}
          playhead={playhead}
          onSeek={(t) => {
            setPlayhead(t);
            setPlaying(false);
          }}
        />
      </div>
    </div>
  );
}

function Timeline({
  video,
  placements,
  playhead,
  onSeek,
}: {
  video: Video;
  placements: DraftPlacement[];
  playhead: number;
  onSeek: (t: number) => void;
}) {
  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    onSeek(Math.round(Math.max(0, Math.min(1, x)) * video.durationSec));
  }

  return (
    <div className="mt-3">
      {KINDS.map((lane) => (
        <div key={lane} className="mb-1 flex items-center gap-2">
          <span className="w-12 text-[10px] tracking-[0.14em] text-chrome uppercase">{lane}</span>
          <div
            className="relative h-8 flex-1 cursor-pointer rounded-sm bg-asphalt ring-1 ring-line-dark"
            onClick={seek}
            role="presentation"
          >
            {placements
              .filter((p) => p.kind === lane)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-barn ring-2 ring-cream"
                  style={{ left: `${(p.at / video.durationSec) * 100}%` }}
                  aria-label={`${lane} at ${secondsToStamp(p.at)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(p.at);
                  }}
                />
              ))}
            <span
              className="pointer-events-none absolute top-0 h-full w-px bg-cream"
              style={{ left: `${(playhead / video.durationSec) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Inspector({ video }: { video: Video }) {
  const ensure = useEngine((s) => s.ensureDraft);
  const patch = useEngine((s) => s.patchDraft);
  const apply = useEngine((s) => s.applyPack);
  const setStatus = useEngine((s) => s.setDraftStatus);
  const removeBeat = useEngine((s) => s.removeBeat);
  const updateBeat = useEngine((s) => s.updateBeat);
  const mark = useEngine((s) => s.markCopied);
  const draft = useEngine((s) => s.drafts[video.id]);

  useEffect(() => {
    ensure(video);
  }, [video, ensure]);

  if (!draft) return null;

  function persist(next = draft) {
    void deskCall("upsertTape", {
      video: {
        ...video,
        pinnedComment: next.pinnedComment,
        descriptionLead: next.descriptionLead,
        placements: next.placements,
      },
      draft: next,
    }).catch(() => {});
  }

  async function copyAll() {
    await navigator.clipboard.writeText(exportPackText(video, draft));
    mark(`pack-${video.id}`);
    const nextStatus = draft.status === "posted" ? "posted" : "ready";
    setStatus(video.id, nextStatus);
    persist({ ...draft, status: nextStatus });
    toast.success("Whole pack copied — paste into YouTube Studio");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-asphalt-soft p-4 ring-1 ring-line-dark">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] tracking-[0.18em] text-chrome uppercase">Super Thanks pack</p>
          <Badge variant={draft.status === "posted" ? "pine" : "cream"}>
            {STATUS_LABEL[draft.status]}
          </Badge>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <Button
            size="sm"
            variant="onDark"
            onClick={() => {
              apply(video);
              const d = useEngine.getState().drafts[video.id];
              if (d) persist(d);
              toast.success("Pack applied from the barn templates");
            }}
          >
            Apply Super Thanks pack
          </Button>
          <Button size="sm" variant="cream" onClick={copyAll}>
            Copy entire pack
          </Button>
          {video.youtubeId ? (
            <>
              <Button size="sm" variant="onDark" asChild>
                <a href={youtubeStudio(video.youtubeId)} target="_blank" rel="noreferrer">
                  Open YouTube Studio <ExternalLink className="size-3.5" />
                </a>
              </Button>
              <Button size="sm" variant="onDark" asChild>
                <a href={youtubeStudioComments(video.youtubeId)} target="_blank" rel="noreferrer">
                  Pin the comment <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </>
          ) : (
            <p className="text-xs text-chrome">
              Local tape — copy the pack, then paste onto the matching YouTube upload.
            </p>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="cream"
            className="flex-1"
            onClick={() => {
              setStatus(video.id, "ready");
              persist({ ...draft, status: "ready" });
            }}
          >
            Ready
          </Button>
          <Button
            size="sm"
            variant="onDark"
            className="flex-1"
            onClick={() => {
              setStatus(video.id, "posted");
              persist({ ...draft, status: "posted" });
              toast.success("Marked live on YouTube");
            }}
          >
            Posted
          </Button>
        </div>
      </div>

      <Field
        label="Description fold"
        value={draft.descriptionLead}
        onChange={(v) => patch(video.id, { descriptionLead: v })}
      />
      <Field
        label="Pinned comment"
        value={draft.pinnedComment}
        onChange={(v) => patch(video.id, { pinnedComment: v })}
      />
      <Field
        label="Lower third"
        value={draft.overlayLine}
        onChange={(v) => patch(video.id, { overlayLine: v })}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-2">
        <ShortField
          label="End left"
          value={draft.endLeft}
          onChange={(v) => patch(video.id, { endLeft: v })}
        />
        <ShortField
          label="End right"
          value={draft.endRight}
          onChange={(v) => patch(video.id, { endRight: v })}
        />
      </div>

      <div>
        <p className="mb-2 text-[11px] tracking-[0.18em] text-chrome uppercase">Beats</p>
        <ul className="flex flex-col gap-2">
          {draft.placements.map((p) => (
            <li key={p.id} className="rounded-md bg-asphalt p-3 ring-1 ring-line-dark">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg tabular-nums text-barn">
                  {secondsToStamp(p.at)}
                </span>
                <span className="text-xs text-chrome uppercase">{p.kind}</span>
                <button
                  type="button"
                  className="ml-auto flex size-9 items-center justify-center text-chrome hover:text-cream"
                  aria-label="Remove beat"
                  onClick={() => removeBeat(video.id, p.id)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <Textarea
                value={p.copy}
                rows={2}
                className="mt-2 min-h-16"
                onChange={(e) => updateBeat(video.id, p.id, { copy: e.target.value })}
              />
            </li>
          ))}
          {draft.placements.length === 0 && (
            <li className="text-xs text-chrome">No beats. Drop one on the timeline.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <Label className="text-chrome">{label}</Label>
      <Textarea
        value={value}
        rows={rows}
        className="mt-1"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ShortField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-chrome">{label}</Label>
      <Input className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
