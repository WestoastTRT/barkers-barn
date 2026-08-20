import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PublicShell } from "@/components/layout/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/separator";
import {
  CAMPAIGNS,
  SUPER_TIERS,
  VIDEOS,
  videoById,
} from "@/lib/data/catalog";
import { useEngine } from "@/lib/store";
import { formatUsd, youtubeWatch } from "@/lib/utils";

export const Route = createFileRoute("/support")({ component: SupportPage });

function SupportPage() {
  const [campaignId, setCampaignId] = useState(CAMPAIGNS[0].id);
  const [tier, setTier] = useState(SUPER_TIERS[1].amount);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const campaign = CAMPAIGNS.find((c) => c.id === campaignId)!;
  const video = videoById(campaign.videoIds[0]) ?? VIDEOS[0];
  const wall = useEngine((s) => s.wall);
  const addWall = useEngine((s) => s.addWall);
  const keeps = useMemo(() => Math.round(tier * 0.7 * 100) / 100, [tier]);

  function send() {
    window.open(youtubeWatch(video.youtubeId), "_blank", "noopener,noreferrer");
    addWall({
      name: name.trim() || "Anonymous",
      amount: tier,
      note: note.trim() || `Toward ${campaign.name}`,
      videoId: video.id,
    });
    toast.success("YouTube opened. Tap the heart under the player — Super Thanks.");
    setName("");
    setNote("");
  }

  return (
    <PublicShell>
      <section className="bg-asphalt py-16 text-cream">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-[11px] tracking-[0.22em] text-chrome uppercase">YouTube Super Thanks</p>
          <h1 className="font-display mt-2 max-w-3xl text-5xl tracking-wide sm:text-7xl">
            The heart under the video is the new parts run.
          </h1>
          <p className="mt-5 max-w-2xl text-chrome">
            Pick a project, then Super Thanks on the tape we open.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-4xl tracking-wide">Pick a project</h2>
          <div className="mt-5 grid gap-3">
            {CAMPAIGNS.map((c) => {
              const pct = Math.round((c.raised / c.goal) * 100);
              const on = c.id === campaignId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCampaignId(c.id)}
                  className={`rounded-xl bg-paper p-4 text-left shadow-[var(--shadow-border)] ring-2 ${on ? "ring-barn" : "ring-transparent"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-2xl tracking-wide">{c.name}</p>
                      <p className="mt-1 text-sm text-muted">{c.story}</p>
                    </div>
                    <Badge>{pct}%</Badge>
                  </div>
                  <Progress value={pct} className="mt-3" />
                  <p className="mt-2 text-sm tabular-nums text-muted">
                    {formatUsd(c.raised)} of {formatUsd(c.goal)}
                  </p>
                </button>
              );
            })}
          </div>

          <h2 className="font-display mt-12 text-4xl tracking-wide">Choose a Super Thanks</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SUPER_TIERS.map((t) => (
              <button
                key={t.amount}
                type="button"
                onClick={() => setTier(t.amount)}
                className={`rounded-xl bg-paper p-4 text-left shadow-[var(--shadow-border)] ring-2 ${tier === t.amount ? "ring-barn" : "ring-transparent"}`}
              >
                <p className="font-display text-3xl tabular-nums tracking-wide">{formatUsd(t.amount)}</p>
                <p className="mt-1 text-xs text-muted">{t.label}</p>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            {formatUsd(tier)} on YouTube · barn keeps about {formatUsd(keeps)} after YouTube's 30%. Apple takes extra on iPhone.
          </p>
          <p className="mt-2 text-sm text-muted">
            {SUPER_TIERS.find((t) => t.amount === tier)?.meaning}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="n">Name on the wall</Label>
              <Input id="n" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" maxLength={40} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="For Steve. For the El Camino. For the 1922 door."
                maxLength={160}
              />
            </div>
          </div>
          <Button size="lg" className="mt-6" onClick={send}>
            <Heart className="size-4" />
            Open YouTube and Super Thanks
            <ExternalLink className="size-4" />
          </Button>
          <p className="mt-3 text-xs text-muted">
            Opens {video.title}. Heart under the player, then {formatUsd(tier)}.
          </p>
        </div>

        <aside className="lg:col-span-2">
          <h2 className="font-display text-4xl tracking-wide">The wall</h2>
          <ul className="mt-5 flex flex-col gap-3">
            {wall.slice(0, 12).map((w) => (
              <li key={w.id} className="rounded-lg bg-paper p-4 shadow-[var(--shadow-border)]">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium">{w.name}</p>
                  <p className="tabular-nums text-barn">{formatUsd(w.amount)}</p>
                </div>
                <p className="mt-1 text-sm text-muted">{w.note}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </PublicShell>
  );
}
