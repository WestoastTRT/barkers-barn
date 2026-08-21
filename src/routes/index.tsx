import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: DeskGate });

function DeskGate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="theme-studio flex min-h-dvh items-center justify-center bg-asphalt">
        <p className="text-sm text-chrome">Opening the desk…</p>
      </div>
    );
  }
  if (user) return <Navigate to="/studio" />;
  return <Navigate to="/login" />;
}
