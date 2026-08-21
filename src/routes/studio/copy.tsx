import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CopyBlock } from "@/components/copy-block";
import { Button } from "@/components/ui/button";
import { type CopyKind } from "@/lib/ai";
import { VIDEOS } from "@/lib/data/catalog";
import { deskCall } from "@/lib/desk-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio/copy")({ component: CopyPage });

const KINDS: { id: CopyKind; label: string }[] = [
  { id: "pinned", label: "Pinned comment" },
  { id: "description", label: "Description fold" },
  { id: "verbal", label: "Spoken ask" },
  { id: "community", label: "Community post" },
  { id: "instagram", label: "Instagram caption" },
];

function CopyPage() {
  const [videoId, setVideoId] = useState(VIDEOS[0].id);
  const [kind, setKind] = useState<CopyKind>("pinned");
  const [text, setText] = useState("");
  const [source, setSource] = useState<"grok" | "template" | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const res = await deskCall<
        | { ok: true; text: string; source: "grok" | "template" }
        | { ok: false; error: string }
      >("generateBarnCopy", { videoId, kind });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setText(res.text);
      setSource(res.source);
    } catch {
      toast.error("Could not generate copy");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] text-chrome uppercase">Automation</p>
      <h1 className="font-display mt-2 text-5xl tracking-wide text-cream">Copy factory</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-chrome">
          Video
          <select
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            className="h-11 rounded-md bg-asphalt-soft px-3 text-cream ring-1 ring-line-dark"
          >
            {VIDEOS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
        </label>
        <div>
          <p className="mb-2 text-sm text-chrome">Surface</p>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={cn(
                  "h-10 rounded-full px-3 text-sm ring-1",
                  kind === k.id
                    ? "bg-cream text-asphalt ring-cream"
                    : "bg-asphalt-soft text-chrome ring-line-dark",
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button variant="cream" className="mt-6" onClick={run} disabled={busy}>
        {busy ? "Writing…" : "Write this surface"}
      </Button>

      {text && (
        <div className="mt-8">
          {source && (
            <p className="mb-3 text-xs tracking-[0.16em] text-chrome uppercase">
              {source === "grok" ? "Written with Grok · edit before you paste" : "Barn template · edit before you paste"}
            </p>
          )}
          <CopyBlock id={`gen-${videoId}-${kind}`} label={KINDS.find((k) => k.id === kind)!.label} text={text} invert />
        </div>
      )}

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-wide text-cream">Always-on reply kit</h2>
        <div className="mt-4 flex flex-col gap-3">
          <CopyBlock
            invert
            id="reply-thanks"
            label="Default reply"
            text="Thank you — we read this. It goes to the El Camino and the 1922 shop. We'll say your name on Saturday's live from the barn."
          />
          <CopyBlock
            invert
            id="reply-legacy"
            label="When they mention Dad"
            text="Thank you for saying his name. That's the whole reason we hit record. Super Thanks on this tape stays with the cars he left us."
          />
          <CopyBlock
            invert
            id="reply-parts"
            label="When they ask about parts"
            text="Appreciate you. The bench tools we actually use are in the shop link in the description — same stuff that's on camera. Thank you for the Super Thanks."
          />
        </div>
      </section>
    </div>
  );
}
