import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ImportDock } from "@/components/studio/import-dock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VIDEOS, type Video } from "@/lib/data/catalog";
import { estimatedLiftUsd } from "@/lib/optimize";
import { STATUS_LABEL, type VideoDraft } from "@/lib/super-pack";
import { deskCall } from "@/lib/desk-client";
import { useEngine } from "@/lib/store";
import { formatCompact, formatUsd, youtubeThumb } from "@/lib/utils";

export const Route = createFileRoute("/studio/optimize")({
  component: OptimizePage,
});

function OptimizePage() {
  const custom = useEngine((s) => s.customVideos);
  const drafts = useEngine((s) => s.drafts);
  const putVideo = useEngine((s) => s.putVideo);
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  const videos = useMemo(() => {
    const map = new Map<string, Video>();
    for (const v of VIDEOS) map.set(v.id, { ...v, source: v.source ?? "catalog" });
    for (const v of custom) map.set(v.id, v);
    return [...map.values()].sort((a, b) => b.superScore - a.superScore);
  }, [custom]);

  const undressed = videos.filter((v) => {
    const s = drafts[v.id]?.status ?? "bare";
    return s === "bare" || s === "drafted";
  });
  const lift = videos.reduce(
    (n, v) => n + estimatedLiftUsd(v.views, drafts[v.id] ? v.superScore : v.superScore),
    0,
  );

  async function runOne(video: Video, useGrok: boolean) {
    setBusy(video.id);
    try {
      const result = await deskCall<{
        score: number;
        why: string;
        draft: VideoDraft;
      }>("optimizeTape", {
        title: video.title,
        type: video.type,
        durationSec: video.durationSec,
        views: video.views,
        campaignId: video.campaignId,
        useGrok,
      });
      const draft: VideoDraft = {
        ...result.draft,
        videoId: video.id,
        status: "ready",
      };
      const dressed: Video = {
        ...video,
        superScore: result.score,
        why: result.why,
        pinnedComment: draft.pinnedComment,
        descriptionLead: draft.descriptionLead,
        placements: draft.placements,
      };
      putVideo(dressed, draft);
      await deskCall("upsertTape", { video: dressed, draft }).catch(() => {});
      toast.success(`Dressed “${video.title}”`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Optimizer missed");
    } finally {
      setBusy(null);
    }
  }

  async function runAll() {
    for (const v of undressed) {
      await runOne(v, false);
    }
    toast.success("Catalog dressed. Open Edit to paste into YouTube Studio.");
  }

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] text-chrome uppercase">Optimizer</p>
      <h1 className="font-display mt-2 text-5xl tracking-wide text-cream">Max the catalog</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat k="Tapes in the bay" v={`${videos.length}`} s="Catalog + imports" />
        <Stat k="Still undressed" v={`${undressed.length}`} s="Need a Super Thanks pack" />
        <Stat k="If dressed" v={formatUsd(lift)} s="Directional, from current views" />
      </div>

      <div className="mt-8">
        <ImportDock
          onAdded={(v) => {
            void navigate({ to: "/studio/edit", search: { v: v.id } });
          }}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="cream" disabled={!!busy || undressed.length === 0} onClick={() => void runAll()}>
          {busy ? "Optimizing…" : `Optimize ${undressed.length} undressed`}
        </Button>
        <Button variant="onDark" asChild>
          <Link to="/studio/edit">Open edit bay</Link>
        </Button>
      </div>

      <ul className="mt-8 divide-y divide-line-dark rounded-xl bg-asphalt-soft ring-1 ring-line-dark">
        {videos.map((v) => {
          const draft = drafts[v.id];
          const status = draft?.status ?? "bare";
          const beats = draft?.placements.length ?? v.placements.length;
          return (
            <li key={v.id} className="flex flex-wrap items-center gap-3 px-4 py-4">
              <img
                src={v.youtubeId ? youtubeThumb(v.youtubeId) : "/photos/hero-corvette.jpg"}
                alt=""
                className="h-14 w-24 rounded-sm object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-cream">{v.title}</p>
                <p className="mt-0.5 text-xs text-chrome">
                  {v.type} · {formatCompact(v.views)} views · {beats} beats · {formatUsd(estimatedLiftUsd(v.views, v.superScore))}
                </p>
              </div>
              <Badge variant={status === "posted" ? "pine" : status === "ready" ? "cream" : "asphalt"}>
                {STATUS_LABEL[status]}
              </Badge>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="onDark"
                  disabled={busy === v.id}
                  onClick={() => void runOne(v, true)}
                >
                  {busy === v.id ? "…" : "Optimize"}
                </Button>
                <Button size="sm" variant="cream" asChild>
                  <Link to="/studio/edit" search={{ v: v.id }}>
                    Edit
                  </Link>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark">
      <p className="text-[11px] tracking-[0.18em] text-chrome uppercase">{k}</p>
      <p className="font-display mt-2 text-4xl tracking-wide text-cream">{v}</p>
      <p className="mt-1 text-xs text-chrome">{s}</p>
    </div>
  );
}
