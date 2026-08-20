import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { lookById, productBySlug } from "@/lib/data/catalog";
import { MissingPage } from "@/lib/error-component";
import { useEngine } from "@/lib/store";
import { cn, formatUsd } from "@/lib/utils";

export const Route = createFileRoute("/looks/$id")({
  loader: ({ params }) => {
    const look = lookById(params.id);
    if (!look) throw notFound();
    return look;
  },
  notFoundComponent: () => (
    <MissingPage title="That still is not in the look book" to="/looks" action="Back to looks" />
  ),
  component: LookPage,
});

function LookPage() {
  const look = Route.useLoaderData();
  const add = useEngine((s) => s.addToCart);
  const [active, setActive] = useState(look.products[0]?.slug);

  const pins = look.products
    .map((pin) => {
      const product = productBySlug(pin.slug);
      return product ? { ...pin, product } : null;
    })
    .filter(Boolean) as {
    slug: string;
    x: number;
    y: number;
    label: string;
    product: NonNullable<ReturnType<typeof productBySlug>>;
  }[];

  const current = pins.find((p) => p.slug === active) ?? pins[0];

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl">
          <img src={look.image} alt={look.caption} className="w-full object-cover" />
          {pins.map((pin) => (
            <button
              key={pin.slug}
              type="button"
              onClick={() => setActive(pin.slug)}
              className={cn(
                "absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-cream transition-transform duration-150",
                active === pin.slug ? "scale-110 bg-barn" : "bg-asphalt/80",
              )}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              aria-label={pin.label}
            >
              <span className="block size-full rounded-full" />
            </button>
          ))}
        </div>
        <div>
          <p className="text-[11px] tracking-[0.2em] text-muted uppercase">{look.location}</p>
          <h1 className="font-display mt-2 text-5xl tracking-wide">{look.title}</h1>
          <p className="mt-4 text-muted">{look.caption}</p>
          <ul className="mt-8 flex flex-col gap-3">
            {pins.map((pin) => (
              <li key={pin.slug}>
                <button
                  type="button"
                  onClick={() => setActive(pin.slug)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg p-3 text-left ring-1 transition-colors duration-150",
                    active === pin.slug
                      ? "bg-paper ring-barn"
                      : "bg-paper/60 ring-line hover:ring-chrome-deep",
                  )}
                >
                  <img
                    src={pin.product.image}
                    alt=""
                    className="size-16 rounded-md object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{pin.product.name}</span>
                    <span className="block text-sm text-muted">
                      {pin.label} · {formatUsd(pin.product.price)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {current && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => add(current.product.slug)}>
                <ShoppingBag className="size-4" />
                Add {current.product.name}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/shop/$slug" params={{ slug: current.product.slug }}>
                  Product page
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
