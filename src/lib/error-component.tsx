import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      }
    >
      <span className="text-red-500" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400">
        {error.message || "An unexpected error occurred. Try reloading the page."}
      </p>
    </main>
  );
}

export function MissingPage({
  title = "Nothing at this address",
  to = "/",
  action = "Back to the barn",
}: {
  title?: string;
  to?: string;
  action?: string;
}) {
  return (
    <PublicShell>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">404</p>
        <h1 className="font-display mt-2 text-5xl tracking-wide">{title}</h1>
        <Button className="mt-8" asChild>
          <a href={to}>{action}</a>
        </Button>
      </div>
    </PublicShell>
  );
}
