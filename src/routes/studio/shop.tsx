import { createFileRoute, Link } from "@tanstack/react-router";
import { COLLECTIONS, PRODUCTS } from "@/lib/data/catalog";
import { formatUsd } from "@/lib/utils";

export const Route = createFileRoute("/studio/shop")({ component: StudioShop });

function StudioShop() {
  const rows = PRODUCTS.map((p) => ({
    ...p,
    cut: (p.price * p.commissionPct) / 100,
  }));
  const total = rows.reduce((s, r) => s + r.cut, 0);

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] text-chrome uppercase">Affiliate + merch</p>
      <h1 className="font-display mt-2 text-5xl tracking-wide text-cream">Shop math</h1>

      <div className="mt-8 overflow-x-auto rounded-xl ring-1 ring-line-dark">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-asphalt-soft text-xs tracking-[0.14em] text-chrome uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Shelf</th>
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Cut %</th>
              <th className="px-4 py-3 font-medium">Cut $</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-t border-line-dark">
                <td className="px-4 py-3 text-cream">
                  <Link to="/shop/$slug" params={{ slug: r.slug }} className="hover:underline">
                    {r.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-chrome">
                  {COLLECTIONS.find((c) => c.id === r.collection)?.name}
                </td>
                <td className="px-4 py-3 text-chrome">{r.kind}</td>
                <td className="px-4 py-3 tabular-nums text-cream">{formatUsd(r.price)}</td>
                <td className="px-4 py-3 tabular-nums text-chrome">{r.commissionPct}%</td>
                <td className="px-4 py-3 tabular-nums text-cream">{formatUsd(r.cut)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line-dark bg-asphalt-soft">
              <td className="px-4 py-3 text-chrome" colSpan={5}>
                If the whole shelf sold once
              </td>
              <td className="px-4 py-3 tabular-nums text-cream">{formatUsd(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Note
          title="Put the look URL in the description fold"
          body="Ride-along tapes → /looks/ride-along. Garage-day shorts → /looks/barn-club. Don't dump a grid. One still, three pins."
        />
        <Note
          title="Polisher is the silent earner"
          body="Pin it on every Corvette chrome close-up. $129 × 4.5% is more than a $5 Super Thanks, and it doesn't compete with the heart ask — it sits in the description."
        />
        <Note
          title="Merch at Hot Barker Nights"
          body="The HBN tee and the cap are the in-person SKUs. Online, lead with the red barn tee — it matches the channel art."
        />
        <Note
          title="Replace these retailer URLs"
          body="Right now they search Amazon and Summit. Drop real ShopMy or LTK links in the product records when the accounts are approved. The look pins stay the same."
        />
      </div>
    </div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark">
      <p className="font-medium text-cream">{title}</p>
      <p className="mt-2 text-sm text-chrome">{body}</p>
    </div>
  );
}
