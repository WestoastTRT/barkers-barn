import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/data/catalog";
import { useEngine } from "@/lib/store";
import { formatUsd } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const add = useEngine((s) => s.addToCart);
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-border)]">
      <Link to="/shop/$slug" params={{ slug: product.slug }} className="block overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
          {product.kind === "merch" ? "Barn merch" : product.retailer}
        </p>
        <Link to="/shop/$slug" params={{ slug: product.slug }} className="font-medium leading-snug">
          {product.name}
        </Link>
        <p className="mt-auto flex items-center justify-between pt-2">
          <span className="tabular-nums">{formatUsd(product.price)}</span>
          <Button
            size="sm"
            variant="asphalt"
            onClick={() => add(product.slug)}
            aria-label={`Add ${product.name} to bag`}
          >
            <ShoppingBag className="size-3.5" />
            Add
          </Button>
        </p>
      </div>
    </article>
  );
}
