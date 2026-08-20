import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Circle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CAMPAIGNS, PRODUCTS, rankedVideos } from "@/lib/data/catalog";
import { useEngine, type ChecklistId } from "@/lib/store";
import { cn, formatUsd } from "@/lib/utils";

export const Route = createFileRoute("/studio/")({ component: StudioHome });

const CHECKS: { id: ChecklistId; label: string; detail: string }[] = [
  { id: "enabled", label: "Super Thanks enabled in Studio", detail: "Earn → Super Thanks on. It backfills the catalog." },
  { id: "pinned-legacy", label: "Pin Super Thanks comments on the top 3 legacy tapes", detail: "Dad's Legacy, ANDYS to Barn, Who We Are." },
  { id: "desc-lead", label: "First 125 characters of those descriptions rewritten", detail: "The fold is the ask. Subscribe goes later." },
  { id: "live-goal", label: "Next live has a Super Chat goal on-screen", detail: "$200 body-drop. Announce at 0:30. Read every name." },
  { id: "reply-24h", label: "Reply to every Super Thanks within 24 hours", detail: "The highlighted comment is the ad for the next one." },
  { id: "end-screens", label: "End screens: Support + Shop the look", detail: "Two slots. Don't waste one on a random Short." },
  { id: "shop-links", label: "Shop links in the top of every restoration description", detail: "Polisher on Corvette tapes. Looks on ride-alongs." },
  { id: "community-post", label: "Community post the first week Super Thanks is on", detail: "Explain the heart. Point to the El Camino fund." },
];

const MIX = [
  { name: "Ads", now: 420, soon: 480 },
  { name: "Super Thanks", now: 40, soon: 620 },
  { name: "Super Chat", now: 90, soon: 380 },
  { name: "Merch", now: 60, soon: 340 },
  { name: "Affiliate", now: 25, soon: 210 },
];

function StudioHome() {
  const checklist = useEngine((s) => s.checklist);
  const toggle = useEngine((s) => s.toggleCheck);
  const done = CHECKS.filter((c) => checklist[c.id]).length;
  const harvest = rankedVideos().slice(0, 4);
  const shopEarn = PRODUCTS.reduce((s, p) => s + (p.price * p.commissionPct) / 100, 0);
  const drafts = useEngine((s) => s.drafts);
  const dressed = Object.values(drafts).filter(
    (d) => d.status === "ready" || d.status === "posted",
  ).length;

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] text-chrome uppercase">The Barn Desk</p>
      <h1 className="font-display mt-2 text-5xl tracking-wide text-cream">Revenue board</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat k="Setup" v={`${done}/${CHECKS.length}`} s="Unlock checklist" />
        <Stat k="Dressed tapes" v={`${dressed}/${rankedVideos().length}`} s="Ready or live in the edit bay" />
        <Stat k="90-day target" v={formatUsd(2030)} s="If the top 8 tapes are dressed" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <section className="rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark lg:col-span-3">
          <h2 className="font-display text-3xl tracking-wide text-cream">Mix · now vs dressed</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MIX} barGap={4}>
                <CartesianGrid stroke="color-mix(in oklab, var(--color-chrome) 18%, transparent)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-chrome)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-chrome)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-asphalt-soft)",
                    border: "1px solid var(--color-line-dark)",
                    borderRadius: 8,
                    color: "var(--color-cream)",
                  }}
                />
                <Bar dataKey="now" fill="var(--color-chrome-deep)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="soon" fill="var(--color-barn)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark lg:col-span-2">
          <h2 className="font-display text-3xl tracking-wide text-cream">Harvest this week</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {harvest.map((v) => (
              <li key={v.id} className="flex items-start justify-between gap-3 border-b border-line-dark pb-3">
                <Link
                  to="/studio/edit"
                  search={{ v: v.id }}
                  className="min-w-0 flex-1"
                >
                  <p className="text-sm text-cream">{v.title}</p>
                  <p className="text-xs text-chrome">{v.type} · score {v.superScore}</p>
                </Link>
                <Badge variant="default">{v.superScore}</Badge>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="cream" size="sm" asChild>
              <Link to="/studio/youtube">YouTube pipe</Link>
            </Button>
            <Button variant="onDark" size="sm" asChild>
              <Link to="/studio/edit" search={{ v: harvest[0]?.id }}>
                Edit bay
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-3xl tracking-wide text-cream">Unlock checklist</h2>
        <ul className="mt-4 divide-y divide-line-dark rounded-xl bg-asphalt-soft ring-1 ring-line-dark">
          {CHECKS.map((c) => {
            const on = checklist[c.id];
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left"
                >
                  {on ? (
                    <Check className="mt-0.5 size-5 text-pine-soft" />
                  ) : (
                    <Circle className="mt-0.5 size-5 text-chrome-deep" />
                  )}
                  <span>
                    <span className={cn("block text-sm", on ? "text-chrome line-through" : "text-cream")}>
                      {c.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-chrome">{c.detail}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {CAMPAIGNS.map((c) => (
          <div key={c.id} className="rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark">
            <p className="font-display text-2xl tracking-wide text-cream">{c.name}</p>
            <p className="mt-2 text-sm tabular-nums text-chrome">
              {formatUsd(c.raised)} / {formatUsd(c.goal)}
            </p>
          </div>
        ))}
        <div className="rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark md:col-span-3">
          <p className="text-sm text-chrome">
            Full shop shelf, if everything sold once: about {formatUsd(shopEarn)} back to the barn in margin + affiliate. The looks page is the better funnel than a grid.
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark">
      <p className="text-[11px] tracking-[0.18em] text-chrome uppercase">{k}</p>
      <p className="font-display mt-1 text-4xl tracking-wide text-cream tabular-nums">{v}</p>
      <p className="mt-1 text-xs text-chrome">{s}</p>
    </div>
  );
}
