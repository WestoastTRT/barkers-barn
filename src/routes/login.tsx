import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { next?: string } => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const dest = next && next.startsWith("/") ? next : "/studio";
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 8) {
      toast.error("Use a real email and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || "Barn desk",
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (error) throw new Error(error.message);
      }
      window.location.assign(dest);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
      setBusy(false);
    }
  }

  return (
    <div className="theme-studio flex min-h-dvh flex-col">
      <div className="barn-stripes h-1.5 w-full" />
      <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Link to="/" className="self-start">
          <Wordmark invert />
        </Link>
        <p className="mt-10 text-[11px] tracking-[0.22em] text-chrome uppercase">The desk</p>
        <h1 className="font-display mt-2 text-5xl tracking-wide text-cream">Sign in to the studio</h1>

        {!authEnabled ? (
          <p className="mt-8 text-sm text-chrome">Sign-in is disabled in this build.</p>
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-3">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  variant="cream"
                  className="w-full"
                  type="button"
                  onClick={() => void signIn(p.providerId, { callbackURL: dest, errorCallbackURL: "/login" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>

            {emailAndPasswordEnabled && (
              <>
                <p className="mt-8 text-center text-[11px] tracking-[0.18em] text-chrome uppercase">
                  Or the barn email
                </p>
                <form onSubmit={onEmail} className="mt-4 flex flex-col gap-3">
                  {mode === "up" && (
                    <div>
                      <Label htmlFor="name" className="text-chrome">
                        Name
                      </Label>
                      <Input
                        id="name"
                        className="mt-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="email" className="text-chrome">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-1"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-chrome">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      className="mt-1"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "up" ? "new-password" : "current-password"}
                      required
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" disabled={busy} className="w-full">
                    {busy ? "Opening the bay…" : mode === "up" ? "Create a desk account" : "Sign in"}
                  </Button>
                </form>
                <button
                  type="button"
                  className="mt-4 min-h-11 text-sm text-chrome underline-offset-4 hover:text-cream hover:underline"
                  onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
                >
                  {mode === "in" ? "Need a desk account? Create one." : "Already have one? Sign in."}
                </button>
              </>
            )}
          </>
        )}

        <p className="mt-10 text-xs text-chrome">Shop and Super Thanks stay public.</p>
      </main>
    </div>
  );
}
