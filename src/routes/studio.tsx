import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { StudioShell } from "@/components/layout/studio-shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useEngine } from "@/lib/store";

export const Route = createFileRoute("/studio")({
  component: StudioLayout,
});

function StudioLayout() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="theme-studio flex min-h-dvh items-center justify-center">
        <p className="text-sm text-chrome">Opening the desk…</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return (
    <StudioShell>
      <LibrarySync />
      <Outlet />
    </StudioShell>
  );
}

function LibrarySync() {
  const hydrate = useEngine((s) => s.hydrateLibrary);
  useEffect(() => {
    let alive = true;
    import("@/lib/studio-api")
      .then(({ loadLibrary }) => loadLibrary())
      .then((lib) => {
        if (alive) hydrate(lib);
      })
      .catch(() => {
        /* offline — local drafts still work */
      });
    return () => {
      alive = false;
    };
  }, [hydrate]);
  return null;
}
