import { createFileRoute } from "@tanstack/react-router";
import { submitBarnOrder } from "@/lib/orders";

export const Route = createFileRoute("/api/orders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Bad order payload." }, { status: 400 });
        }
        const data = body as {
          name?: string;
          email?: string;
          note?: string;
          lines?: { slug: string; qty: number }[];
        };
        if (!data || typeof data.name !== "string" || typeof data.email !== "string" || !Array.isArray(data.lines)) {
          return Response.json({ ok: false, error: "Name, email, and bag lines are required." }, { status: 400 });
        }
        try {
          const result = await submitBarnOrder({
            name: data.name,
            email: data.email,
            note: typeof data.note === "string" ? data.note : "",
            lines: data.lines.map((l) => ({
              slug: String(l?.slug ?? ""),
              qty: Number(l?.qty) || 0,
            })),
          });
          return Response.json(result, { status: result.ok ? 200 : 400 });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Could not place the order";
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
    },
  },
});
