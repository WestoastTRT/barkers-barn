import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { LOOKS } from "@/lib/data/catalog";

export const Route = createFileRoute("/looks/")({ component: LooksPage });

function LooksPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">LTK, but it's a barn</p>
        <h1 className="font-display mt-2 text-5xl tracking-wide sm:text-6xl">Shop the stills</h1>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {LOOKS.map((look) => (
            <Link
              key={look.id}
              to="/looks/$id"
              params={{ id: look.id }}
              className="group overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-border)]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={look.image}
                  alt={look.title}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] sm:aspect-[5/4]"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-asphalt/80 px-3 py-1 text-xs text-cream">
                  {look.products.length} tagged
                </span>
              </div>
              <div className="p-5">
                <p className="text-[11px] tracking-[0.18em] text-muted uppercase">{look.location}</p>
                <h2 className="font-display mt-1 text-3xl tracking-wide">{look.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{look.caption}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
