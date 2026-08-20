import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PRODUCTS } from "@/lib/data/catalog";
import { placeBarnOrder } from "@/lib/orders-api";
import { useEngine } from "@/lib/store";
import { formatUsd } from "@/lib/utils";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, clearCart } =
    useEngine();
  const [checking, setChecking] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const lines = cart
    .map((l) => {
      const product = PRODUCTS.find((p) => p.slug === l.slug);
      return product ? { ...l, product } : null;
    })
    .filter(Boolean) as { slug: string; qty: number; product: (typeof PRODUCTS)[0] }[];
  const merch = lines.filter((l) => l.product.kind === "merch");
  const aff = lines.filter((l) => l.product.kind === "affiliate");
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const commission = lines.reduce(
    (s, l) => s + (l.product.price * l.qty * l.product.commissionPct) / 100,
    0,
  );

  function openRetailers() {
    for (const l of aff) {
      window.open(l.product.buyUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function submitMerch(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await placeBarnOrder({
        data: {
          name,
          email,
          note,
          lines: merch.map((l) => ({ slug: l.slug, qty: l.qty })),
        },
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (aff.length) openRetailers();
      toast.success(
        aff.length
          ? `Order #${res.id} in. Retailer tabs opened for the rest.`
          : `Order #${res.id} in. The barn will email ${email}.`,
      );
      clearCart();
      setChecking(false);
      setCartOpen(false);
      setName("");
      setEmail("");
      setNote("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
  }

  function checkout() {
    if (!lines.length) return;
    if (merch.length) {
      setChecking(true);
      return;
    }
    openRetailers();
    toast.success("Retailer opened — commission tracks when they buy through that tab.");
    clearCart();
    setCartOpen(false);
  }

  return (
    <Sheet
      open={cartOpen}
      onOpenChange={(open) => {
        setCartOpen(open);
        if (!open) setChecking(false);
      }}
    >
      <SheetContent className="p-0">
        <div className="flex h-full flex-col">
          <div className="border-b border-line px-5 py-5 pr-14">
            <SheetTitle>{checking ? "Barn merch order" : "Shop bag"}</SheetTitle>
          </div>
          {checking ? (
            <form onSubmit={submitMerch} className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
              <p className="text-sm text-muted">
                {formatUsd(merch.reduce((s, l) => s + l.product.price * l.qty, 0))} merch. We email a confirm and ship from Tacoma.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <Label htmlFor="order-name">Name</Label>
                  <Input
                    id="order-name"
                    className="mt-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order-email">Email</Label>
                  <Input
                    id="order-email"
                    className="mt-1"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order-note">Note</Label>
                  <Textarea
                    id="order-note"
                    className="mt-1"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Size, color, ship to…"
                  />
                </div>
              </div>
              <div className="mt-auto flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setChecking(false)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={busy}>
                  {busy ? "Sending…" : "Place barn order"}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {lines.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <ShoppingBag className="size-8 text-chrome-deep" />
                    <p className="text-sm text-muted">Bag is empty.</p>
                    <Button variant="outline" asChild>
                      <Link to="/shop" onClick={() => setCartOpen(false)}>
                        Open the shop
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {lines.map((l) => (
                      <li key={l.slug} className="flex gap-3">
                        <img
                          src={l.product.image}
                          alt=""
                          className="size-20 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{l.product.name}</p>
                          <p className="text-sm text-muted">
                            {formatUsd(l.product.price)} · {l.product.kind === "merch" ? "Barn merch" : l.product.retailer}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              className="flex size-9 items-center justify-center rounded-sm ring-1 ring-line"
                              onClick={() => setQty(l.slug, l.qty - 1)}
                              aria-label="Decrease"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-6 text-center tabular-nums text-sm">{l.qty}</span>
                            <button
                              type="button"
                              className="flex size-9 items-center justify-center rounded-sm ring-1 ring-line"
                              onClick={() => setQty(l.slug, l.qty + 1)}
                              aria-label="Increase"
                            >
                              <Plus className="size-3" />
                            </button>
                            <button
                              type="button"
                              className="ml-auto flex size-9 items-center justify-center rounded-sm text-muted hover:text-barn"
                              onClick={() => removeFromCart(l.slug)}
                              aria-label="Remove"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {lines.length > 0 && (
                <div className="border-t border-line p-5">
                  <div className="mb-3 flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="tabular-nums font-medium">{formatUsd(total)}</span>
                  </div>
                  <div className="mb-4 flex justify-between text-sm">
                    <span className="text-muted">Est. barn cut</span>
                    <span className="tabular-nums text-pine">{formatUsd(commission)}</span>
                  </div>
                  <Button className="w-full" onClick={checkout}>
                    {merch.length ? "Place barn order" : "Checkout · open retailers"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
