import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Play } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/separator";
import { CAMPAIGNS, LOOKS, PRODUCTS, rankedVideos } from "@/lib/data/catalog";
import { formatUsd, youtubeWatch } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const merch = PRODUCTS.filter((p) => p.kind === "merch").slice(0, 4);
  const top = rankedVideos()[0];

  return (
    <PublicShell>
      <section className="relative min-h-[72vh] overflow-hidden bg-asphalt text-cream">
        <img
          src="/photos/hero-corvette.jpg"
          alt="Candy-apple red 1963 Corvette parked in front of Barker's Barn"
          className="absolute inset-0 size-full object-cover object-[center_60%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/55 to-asphalt/25" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28">
          <p className="text-[11px] tracking-[0.28em] text-cream/80 uppercase">
            Tacoma · ANDYS since 1922 · Super Thanks is on
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-6xl leading-[0.9] tracking-[0.06em] sm:text-8xl">
            Classic Car Sisters
          </h1>
          <p className="mt-4 max-w-xl text-base text-cream/85 sm:text-lg">
            Christine and Amanda keeping Steve Barker's barn, his Corvettes, and a 1922 gas station in the family. Shop the looks. Super Thanks the restorations.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="cream" size="lg" asChild>
              <Link to="/support">
                <Heart className="size-4" />
                Super Thanks
              </Link>
            </Button>
            <Button variant="onDark" size="lg" asChild>
              <Link to="/shop">Shop the barn</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-line bg-paper py-3">
        <p className="font-display px-4 text-center text-sm tracking-[0.18em] text-muted sm:text-xl sm:tracking-[0.2em]">
          1922 ANDYS · STEVE BARKER · 1960 EL CAMINO · 1963 CORVETTE 427 · HOT BARKER NIGHTS · BARKER'S BARN
        </p>
      </div>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
        <HomePill
          kicker="Just unlocked"
          title="Super Thanks"
          body="YouTube finally turned on the heart under the videos. We mapped every tape to a project so a $5 or $50 actually goes somewhere."
          to="/support"
          action="Send one"
        />
        <HomePill
          kicker="ShopMy-style"
          title="Looks from the photos"
          body="The cream sweatshirt. The olive tank in the passenger seat. The cap. Tap a pin, add it to the bag, the sisters earn the cut."
          to="/looks"
          action="Shop a look"
        />
        <HomePill
          kicker="The desk"
          title="Copy, placement, live"
          body="Pinned comments, first 125 characters, live Super Chat goals, and which back-catalog tape to harvest this week."
          to="/studio"
          action="Open the desk"
        />
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-muted uppercase">Barn fund</p>
              <h2 className="font-display text-4xl tracking-wide sm:text-5xl">Where Super Thanks goes</h2>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/support">
                All campaigns <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {CAMPAIGNS.map((c) => {
              const pct = Math.round((c.raised / c.goal) * 100);
              return (
                <Link
                  key={c.id}
                  to="/support"
                  className="overflow-hidden rounded-xl bg-cream shadow-[var(--shadow-border)]"
                >
                  <img src={c.image} alt="" className="h-40 w-full object-cover" />
                  <div className="p-5">
                    <h3 className="font-display text-2xl tracking-wide">{c.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted">{c.story}</p>
                    <Progress value={pct} className="mt-4" />
                    <p className="mt-2 flex justify-between text-sm">
                      <span className="tabular-nums text-barn">{formatUsd(c.raised)}</span>
                      <span className="text-muted">of {formatUsd(c.goal)}</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div className="relative">
          <img
            src={LOOKS[0].image}
            alt={LOOKS[0].caption}
            className="aspect-square w-full rounded-xl object-cover"
          />
          <Badge className="absolute top-4 left-4">Look · {LOOKS[0].location}</Badge>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.22em] text-muted uppercase">Shop this still</p>
          <h2 className="font-display mt-2 text-5xl tracking-wide">{LOOKS[0].title}</h2>
          <p className="mt-4 text-muted">{LOOKS[0].caption}</p>
          <ul className="mt-6 flex flex-col gap-2 text-sm">
            {LOOKS[0].products.map((p) => (
              <li key={p.slug} className="flex min-h-11 items-center justify-between border-b border-line">
                <span>{p.label}</span>
                <Link to="/shop/$slug" params={{ slug: p.slug }} className="text-barn">
                  Shop
                </Link>
              </li>
            ))}
          </ul>
          <Button className="mt-6" asChild>
            <Link to="/looks/$id" params={{ id: LOOKS[0].id }}>
              Open the look
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-muted uppercase">From the barn</p>
              <h2 className="font-display text-4xl tracking-wide sm:text-5xl">Merch that ships from Tacoma</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/shop">
                Full shop <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {merch.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-asphalt py-16 text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-chrome uppercase">Highest Super Thanks score</p>
            <h2 className="font-display mt-2 text-5xl tracking-wide">{top.title}</h2>
            <p className="mt-4 text-chrome">{top.why}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="cream" asChild>
                <a href={youtubeWatch(top.youtubeId)} target="_blank" rel="noreferrer">
                  <Play className="size-4" />
                  Watch on YouTube
                </a>
              </Button>
              <Button variant="onDark" asChild>
                <Link to="/watch">All Super Thanks tapes</Link>
              </Button>
            </div>
          </div>
          <a
            href={youtubeWatch(top.youtubeId)}
            target="_blank"
            rel="noreferrer"
            className="relative block overflow-hidden rounded-xl"
          >
            <img
              src="/photos/hero-corvette.jpg"
              alt=""
              className="aspect-video w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-cream text-asphalt">
                <Play className="size-6 translate-x-0.5" />
              </span>
            </span>
          </a>
        </div>
      </section>
    </PublicShell>
  );
}

function HomePill({
  kicker,
  title,
  body,
  to,
  action,
}: {
  kicker: string;
  title: string;
  body: string;
  to: "/support" | "/looks" | "/studio";
  action: string;
}) {
  return (
    <div className="flex flex-col rounded-xl bg-paper p-6 shadow-[var(--shadow-border)]">
      <p className="text-[11px] tracking-[0.2em] text-barn uppercase">{kicker}</p>
      <h2 className="font-display mt-2 text-3xl tracking-wide">{title}</h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{body}</p>
      <Link to={to} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-barn">
        {action} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
