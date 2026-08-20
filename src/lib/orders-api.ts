import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { productBySlug } from "@/lib/data/catalog";

export const placeBarnOrder = createServerFn({ method: "POST" })
  .validator(
    (input: {
      name: string;
      email: string;
      note?: string;
      lines: { slug: string; qty: number }[];
    }) => input,
  )
  .handler(async ({ data }) => {
    const name = data.name.trim();
    const email = data.email.trim();
    if (name.length < 2) return { ok: false as const, error: "Name the order." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false as const, error: "Need a real email so the barn can confirm." };
    }
    const merch = data.lines
      .map((l) => {
        const p = productBySlug(l.slug);
        if (!p || p.kind !== "merch" || l.qty < 1) return null;
        return { slug: p.slug, name: p.name, qty: Math.min(12, Math.floor(l.qty)), price: p.price };
      })
      .filter(Boolean) as { slug: string; name: string; qty: number; price: number }[];
    if (merch.length === 0) {
      return { ok: false as const, error: "No barn merch in the bag." };
    }
    const total = merch.reduce((s, l) => s + l.price * l.qty, 0);
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into barn_orders (name, email, note, lines, total_cents)
      values (
        ${name},
        ${email},
        ${data.note?.trim().slice(0, 240) || null},
        ${JSON.stringify(merch)},
        ${Math.round(total * 100)}
      )
      returning id
    `;
    return { ok: true as const, id: rows[0]?.id ?? 0, total };
  });
