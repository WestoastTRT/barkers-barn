import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { ProductCard } from "@/components/product-card";
import { COLLECTIONS, PRODUCTS, type CollectionId } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/")({ component: ShopPage });

function ShopPage() {
  const [col, setCol] = useState<CollectionId | "all">("all");
  const items = useMemo(
    () => (col === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.collection === col)),
    [col],
  );

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">The barn shop</p>
        <h1 className="font-display mt-2 text-5xl tracking-wide sm:text-6xl">Shop like a shelf</h1>
        <div className="mt-8 flex flex-wrap gap-2">
          <FilterChip active={col === "all"} onClick={() => setCol("all")}>
            All
          </FilterChip>
          {COLLECTIONS.map((c) => (
            <FilterChip key={c.id} active={col === c.id} onClick={() => setCol(c.id)}>
              {c.name}
            </FilterChip>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </PublicShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-full px-4 text-sm font-medium ring-1 transition-colors duration-150",
        active ? "bg-asphalt text-cream ring-asphalt" : "bg-paper text-ink ring-line hover:bg-cream-deep",
      )}
    >
      {children}
    </button>
  );
}
