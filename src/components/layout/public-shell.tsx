import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Button } from "@/components/ui/button";
import { useEngine } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/watch", label: "Watch" },
  { to: "/shop", label: "Shop" },
  { to: "/looks", label: "Looks" },
  { to: "/support", label: "Super Thanks" },
  { to: "/story", label: "The barn" },
] as const;

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const count = useEngine((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  const setCartOpen = useEngine((s) => s.setCartOpen);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <div className="flex min-h-dvh flex-col bg-cream text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur-sm">
        <div className="barn-stripes h-1.5 w-full" aria-hidden="true" />
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="min-w-0" aria-label="Classic Car Sisters home">
            <Wordmark />
          </Link>
          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink",
                  pathname.startsWith(item.to) && "text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 md:ml-2">
            <DeskLink />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              aria-label={`Open bag, ${count} items`}
              className="relative"
            >
              <ShoppingBag className="size-5" />
              {hydrated && count > 0 && (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-barn text-[10px] text-cream tabular-nums">
                  {count}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-line px-4 py-3 md:hidden" aria-label="Mobile">
            <div className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <DeskLink mobile onNavigate={() => setOpen(false)} />
            </div>
          </nav>
        )}
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-line bg-asphalt text-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <Wordmark invert />
            <p className="mt-3 max-w-sm text-sm text-chrome">
              Two sisters keeping Steve Barker's barn, ANDYS since 1922, and a row of Corvettes in the family. Tacoma, WA.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-display text-xl tracking-widest text-cream">Visit</p>
            <ul className="mt-3 flex flex-col gap-2 text-chrome">
              <li>
                <a className="hover:text-cream" href="https://www.youtube.com/channel/UChPM9aMyqnPg5irHADtbhqw">
                  YouTube
                </a>
              </li>
              <li>
                <a className="hover:text-cream" href="https://www.instagram.com/classiccarsisters/">
                  Instagram
                </a>
              </li>
              <li>
                <a className="hover:text-cream" href="https://www.facebook.com/barker.s.barn.2025/">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-display text-xl tracking-widest text-cream">The desk</p>
            <p className="mt-3 text-chrome">Sisters only. Sign in to dress the catalog.</p>
            <Button variant="cream" size="sm" className="mt-4" asChild>
              <Link to="/login" search={{ next: "/studio" }}>
                Sign in to the desk
              </Link>
            </Button>
          </div>
        </div>
        <div className="barn-stripes h-2 w-full" />
      </footer>
      <CartDrawer />
    </div>
  );
}

function DeskLink({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  if (mobile) {
    return (
      <Link to="/studio" onClick={onNavigate} className="flex min-h-11 items-center text-sm font-medium">
        The Barn Desk
      </Link>
    );
  }
  return (
    <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
      <Link to="/studio" aria-label="The Barn Desk">
        The desk
      </Link>
    </Button>
  );
}
