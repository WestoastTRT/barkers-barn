import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CopyBlock } from "@/components/copy-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VIDEOS, type Video } from "@/lib/data/catalog";
import { cn, formatCompact, secondsToStamp, youtubeThumb } from "@/lib/utils";

export const Route = createFileRoute("/studio/supers")({ component: SupersPage });

function SupersPage() {
  const ranked = [...VIDEOS].sort((a, b) => b.superScore - a.superScore);
  const [id, setId] = useState(ranked[0].id);
  const video = ranked.find((v) => v.id === id)!;

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] text-chrome uppercase">Placement engine</p>
      <h1 className="font-display mt-2 text-5xl tracking-wide text-cream">Where the ask lives</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <ul className="flex flex-col gap-1">
          {ranked.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setId(v.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-3 text-left",
                  v.id === id ? "bg-asphalt-soft text-cream" : "text-chrome hover:text-cream",
                )}
              >
                <span className="w-8 font-display text-xl tabular-nums text-barn">{v.superScore}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{v.title}</span>
              </button>
            </li>
          ))}
        </ul>

        <Placement video={video} />
      </div>
    </div>
  );
}

function Placement({ video }: { video: Video }) {
  const marks = [
    { at: 0, label: "Open" },
    ...video.placements.map((p) => ({ at: p.at, label: p.kind })),
    { at: video.durationSec, label: "End" },
  ];

  return (
    <div className="rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{video.type}</Badge>
        <Badge variant="cream">score {video.superScore}</Badge>
        <span className="text-sm text-chrome tabular-nums">{formatCompact(video.views)} views</span>
        <Button size="sm" variant="cream" className="ml-auto" asChild>
          <Link to="/studio/edit" search={{ v: video.id }}>
            Dress in edit bay
          </Link>
        </Button>
      </div>
      <h2 className="mt-3 text-lg font-medium text-cream">{video.title}</h2>
      <p className="mt-2 text-sm text-chrome">{video.why}</p>

      <div className="relative mt-6 overflow-hidden rounded-lg">
        <img
          src={youtubeThumb(video.youtubeId)}
          alt=""
          className="aspect-video w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-asphalt/80 p-3">
          <div className="relative h-2 rounded-full bg-line-dark">
            {marks.map((m) => (
              <span
                key={m.at + m.label}
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-barn"
                style={{ left: `${(m.at / video.durationSec) * 100}%` }}
                title={`${m.label} ${secondsToStamp(m.at)}`}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-chrome">
            {video.placements.map((p) => (
              <span key={p.at}>
                {secondsToStamp(p.at)} · {p.kind}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {video.placements.map((p) => (
          <CopyBlock
            key={p.at}
            id={`${video.id}-${p.kind}-${p.at}`}
            label={`${p.kind} · ${secondsToStamp(p.at)}`}
            text={p.copy}
            invert
          />
        ))}
        <CopyBlock
          id={`${video.id}-pinned`}
          label="Pinned comment"
          text={video.pinnedComment}
          invert
        />
        <CopyBlock
          id={`${video.id}-desc`}
          label="Description · first fold"
          text={video.descriptionLead}
          invert
        />
      </div>
    </div>
  );
}
