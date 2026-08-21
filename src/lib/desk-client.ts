import { getBearerToken } from "@/lib/auth/client";

export async function deskCall<T>(op: string, data?: unknown): Promise<T> {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = getBearerToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch("/api/desk", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ op, data: data ?? null }),
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(json.error || `Desk ${op} failed`);
  return json;
}
