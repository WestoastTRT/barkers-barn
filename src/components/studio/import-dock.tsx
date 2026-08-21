import { Plus, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { type Video, type VideoType } from "@/lib/data/catalog";
import { deskCall } from "@/lib/desk-client";
import { buildOptimizedDraft } from "@/lib/optimize";
import { type VideoDraft } from "@/lib/super-pack";
import { useEngine } from "@/lib/store";
import { putTapeFile, readVideoDuration } from "@/lib/tape-files";
import { parseYoutubeId, stampToSeconds } from "@/lib/utils";

const TYPES: VideoType[] = ["legacy", "restoration", "live", "show", "short"];

export function ImportDock({
  onAdded,
}: {
  onAdded: (video: Video) => void;
}) {
  const putVideo = useEngine((s) => s.putVideo);
  const addYt = useEngine((s) => s.addCustomVideo);
  const [open, setOpen] = useState(true);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<VideoType>("legacy");
  const [dur, setDur] = useState("10:00");
  const [views, setViews] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function dress(video: Video, useGrok: boolean) {
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
    const draft = {
      ...result.draft,
      videoId: video.id,
      status: "ready" as const,
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
    return dressed;
  }

  async function onYoutube(e: React.FormEvent) {
    e.preventDefault();
    const youtubeId = parseYoutubeId(url);
    if (!youtubeId) {
      toast.error("Paste a YouTube link or 11-character id");
      return;
    }
    setBusy(true);
    try {
      const video = addYt({
        youtubeId,
        title: title.trim() || `Existing tape ${youtubeId}`,
        durationSec: Math.max(15, stampToSeconds(dur) || 600),
        type,
      });
      video.views = Number(views) || 0;
      const dressed = await dress(video, true);
      toast.success("Optimizer dressed Super Thanks. Open the tape in the bay.");
      setUrl("");
      setTitle("");
      onAdded(dressed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not import");
    } finally {
      setBusy(false);
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      let last: Video | null = null;
      for (const file of [...files]) {
        if (!file.type.startsWith("video/")) {
          toast.error(`${file.name} is not a video`);
          continue;
        }
        const durationSec = await readVideoDuration(file);
        const id = `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        await putTapeFile(id, file);
        const name = title.trim() || file.name.replace(/\.[^.]+$/, "");
        const video: Video = {
          id,
          youtubeId: "",
          title: name,
          durationSec: durationSec || 60,
          views: Number(views) || 0,
          published: new Date().toISOString().slice(0, 10),
          type,
          superScore: 70,
          why: "",
          placements: [],
          pinnedComment: "",
          descriptionLead: "",
          source: "upload",
          hasFile: true,
        };
        const dressed = await dress(video, true);
        last = dressed;
      }
      if (last) {
        toast.success("Tape is in the bay. Timeline, lower third, and paste pack are ready.");
        onAdded(last);
        setTitle("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that tape");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-asphalt-soft p-4 ring-1 ring-line-dark">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="font-medium text-cream">Import a tape</span>
        <Plus className={`size-4 text-chrome transition-transform ${open ? "rotate-45" : ""}`} />
      </button>
      {open && (
        <div className="mt-4 flex flex-col gap-4">
          <label
            className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center ${
              drag ? "border-cream bg-asphalt" : "border-line-dark"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              void onFiles(e.dataTransfer.files);
            }}
          >
            <Upload className="size-5 text-cream" />
            <span className="mt-2 text-sm text-cream">Drop video</span>
            <span className="mt-1 text-xs text-chrome">mp4, mov, webm</span>
            <input
              type="file"
              accept="video/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                void onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>

          <form onSubmit={onYoutube} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="sm:col-span-2 lg:col-span-2">
              <Label htmlFor="yt" className="text-chrome">
                YouTube link
              </Label>
              <Input
                id="yt"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="title" className="text-chrome">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="As it appears"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="kind" className="text-chrome">
                Kind
              </Label>
              <select
                id="kind"
                value={type}
                onChange={(e) => setType(e.target.value as VideoType)}
                className="mt-1 h-11 w-full rounded-md bg-paper px-3 text-sm text-ink ring-1 ring-line"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="dur" className="text-chrome">
                Length
              </Label>
              <Input
                id="dur"
                value={dur}
                onChange={(e) => setDur(e.target.value)}
                placeholder="10:00"
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="views" className="text-chrome">
                  Views
                </Label>
                <Input
                  id="views"
                  inputMode="numeric"
                  value={views}
                  onChange={(e) => setViews(e.target.value)}
                  placeholder="optional"
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={busy} className="shrink-0">
                {busy ? "Dressing…" : "Import"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function autoDraftFor(video: Video) {
  return buildOptimizedDraft(video);
}
