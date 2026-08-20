import { Link, useRouterState } from "@tanstack/react-router";
import {
  Clapperboard,
  Gauge,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  PenLine,
  Radio,
  Scissors,
  Store,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/brand";
import { UserButton } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/studio", label: "Board", icon: LayoutDashboard, exact: true },
  { to: "/studio/edit", label: "Edit", icon: Scissors, exact: false },
  { to: "/studio/optimize", label: "Optimize", icon: Gauge, exact: false },
  { to: "/studio/youtube", label: "YouTube", icon: Youtube, exact: false },
  { to: "/studio/supers", label: "Supers", icon: HeartHandshake, exact: false },
  { to: "/studio/copy", label: "Copy", icon: PenLine, exact: false },
  { to: "/studio/live", label: "Live", icon: Radio, exact: false },
  { to: "/studio/shop", label: "Shop math", icon: Store, exact: false },
] as const;

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="theme-studio flex min-h-dvh min-w-0 flex-col overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-line-dark bg-asphalt/95 backdrop-blur-sm">
        <div className="barn-stripes h-1.5 w-full" />
        <div className="mx-auto flex h-14 min-w-0 max-w-7xl items-center gap-2 px-3 sm:px-4">
          <Link to="/" aria-label="Back to site" className="shrink-0">
            <Wordmark invert compact />
          </Link>
          <span className="hidden rounded-full bg-barn px-2.5 py-0.5 text-[10px] tracking-[0.18em] text-cream uppercase lg:inline">
            The desk
          </span>
          <nav
            className="ml-auto flex min-w-0 items-center gap-0.5 overflow-x-auto"
            aria-label="Desk"
          >
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center gap-1.5 rounded-md text-sm text-chrome transition-colors duration-150 hover:text-cream min-[1360px]:h-10 min-[1360px]:w-auto min-[1360px]:px-2.5",
                    active && "bg-asphalt-soft text-cream",
                  )}
                  aria-label={item.label}
                >
                  <Icon className="size-4" />
                  <span className="hidden min-[1360px]:inline">{item.label}</span>
                </Link>
              );
            })}
            <Link
              to="/watch"
              className="ml-1 flex size-10 shrink-0 items-center justify-center rounded-md text-sm text-chrome hover:text-cream min-[1360px]:h-10 min-[1360px]:w-auto min-[1360px]:px-2.5"
              aria-label="Public site"
            >
              <Clapperboard className="size-4" />
              <span className="hidden min-[1360px]:inline">Public</span>
            </Link>
            <AccountChip />
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-3 py-6 sm:px-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}

function AccountChip() {
  const { user, isPending } = useCurrentUserState();
  const [signingOut, setSigningOut] = useState(false);
  if (isPending) {
    return <div className="ml-1 size-8 shrink-0 animate-pulse rounded-full bg-asphalt-soft" />;
  }
  if (!user) return null;
  return (
    <>
      <div className="ml-2 hidden min-w-0 max-w-[240px] overflow-hidden whitespace-nowrap text-cream md:block">
        <UserButton />
      </div>
      <button
        type="button"
        className="ml-1 flex size-10 shrink-0 items-center justify-center rounded-md text-chrome hover:text-cream md:hidden"
        disabled={signingOut}
        aria-label={signingOut ? "Signing out" : "Sign out"}
        onClick={() => {
          setSigningOut(true);
          void signOut("/").catch(() => setSigningOut(false));
        }}
      >
        <LogOut className="size-4" />
      </button>
    </>
  );
}
