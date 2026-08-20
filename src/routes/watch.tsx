import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rankedVideos } from "@/lib/data/catalog";
import { formatCompact, youtubeThumb, youtubeWatch } from "@/lib/utils";

export const Route = createFileRoute("/watch")({ component: WatchPage });

function WatchPage() {
  const videos = rankedVideos();
  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">Watch</p>
        <h1 className="font-display mt-2 text-5xl tracking-wide sm:text-6xl">Tapes ranked for the heart</h1>
        <ol className="mt-10 flex flex-col gap-4">
          {videos.map((v, i) => (
            <li
              key={v.id}
              className="grid overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-border)] md:grid-cols-[220px_1fr]"
            >
              <a href={youtubeWatch(v.youtubeId)} target="_blank" rel="noreferrer" className="block">
                <img
                  src={youtubeThumb(v.youtubeId)}
                  alt=""
                  className="h-full min-h-36 w-full object-cover"
                />
              </a>
              <div className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-2xl tabular-nums text-barn">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Badge variant="outline">{v.type}</Badge>
                  <Badge variant={v.superScore >= 85 ? "default" : "cream"}>
                    Super score {v.superScore}
                  </Badge>
                  <span className="text-sm text-muted tabular-nums">
                    {formatCompact(v.views)} views
                  </span>
                </div>
                <h2 className="font-medium leading-snug">{v.title}</h2>
                <p className="text-sm text-muted">{v.why}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Button size="sm" asChild>
                    <a href={youtubeWatch(v.youtubeId)} target="_blank" rel="noreferrer">
                      Watch & Super Thanks <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/studio/supers">See placement</Link>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </PublicShell>
  );
}
