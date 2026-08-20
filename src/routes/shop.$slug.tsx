import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { productBySlug, PRODUCTS } from "@/lib/data/catalog";
import { MissingPage } from "@/lib/error-component";
import { useEngine } from "@/lib/store";
import { formatUsd } from "@/lib/utils";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const product = productBySlug(params.slug);
    if (!product) throw notFound();
    return product;
  },
  notFoundComponent: () => (
    <MissingPage title="That item is not on the shelf" to="/shop" action="Back to the shop" />
  ),
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const add = useEngine((s) => s.addToCart);
  const related = PRODUCTS.filter(
    (p) => p.collection === product.collection && p.slug !== product.slug,
  ).slice(0, 3);

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
        <img
          src={product.image}
          alt={product.name}
          className="w-full rounded-xl object-cover"
        />
        <div>
          <Badge variant={product.kind === "merch" ? "default" : "outline"}>
            {product.kind === "merch" ? "Ships from the barn" : `Affiliate · ${product.retailer}`}
          </Badge>
          <h1 className="font-display mt-4 text-5xl tracking-wide">{product.name}</h1>
          <p className="mt-2 text-2xl tabular-nums">{formatUsd(product.price)}</p>
          <p className="mt-4 leading-relaxed text-muted">{product.blurb}</p>
          {product.kind === "affiliate" && (
            <p className="mt-3 text-sm text-muted">
              Estimated barn cut {product.commissionPct}% when you buy through the sister's link. Same price you'd pay anyway.
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => add(product.slug)}>
              <ShoppingBag className="size-4" />
              Add to bag
            </Button>
            {product.kind === "affiliate" && (
              <Button size="lg" variant="outline" asChild>
                <a href={product.buyUrl} target="_blank" rel="noreferrer">
                  Buy at {product.retailer} <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </div>
          {related.length > 0 && (
            <div className="mt-12">
              <p className="text-[11px] tracking-[0.2em] text-muted uppercase">Same shelf</p>
              <ul className="mt-3 flex flex-col">
                {related.map((p) => (
                  <li key={p.slug} className="border-b border-line">
                    <Link
                      to="/shop/$slug"
                      params={{ slug: p.slug }}
                      className="flex min-h-12 items-center justify-between text-sm"
                    >
                      {p.name}
                      <span className="tabular-nums text-muted">{formatUsd(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
