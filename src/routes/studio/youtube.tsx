import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { VIDEOS, type Video } from "@/lib/data/catalog";
import { deskCall } from "@/lib/desk-client";
import { useEngine } from "@/lib/store";
import type { YoutubePush, YoutubeStatus } from "@/lib/youtube-api";
import { youtubeStudio, youtubeThumb, formatCompact } from "@/lib/utils";

export const Route = createFileRoute("/studio/youtube")({
  validateSearch: (s: Record<string, unknown>): { yt?: string; msg?: string } => ({
    ...(typeof s.yt === "string" ? { yt: s.yt } : {}),
    ...(typeof s.msg === "string" ? { msg: s.msg } : {}),
  }),
  component: YoutubePage,
});

type Status = YoutubeStatus;

function YoutubePage() {
  const search = Route.useSearch();
  const custom = useEngine((s) => s.customVideos);
  const drafts = useEngine((s) => s.drafts);
  const hydrate = useEngine((s) => s.hydrateLibrary);
  const [status, setStatus] = useState<Status | null>(null);
  const [pushes, setPushes] = useState<YoutubePush[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [channelId, setChannelId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const videos = useMemo(() => {
    const map = new Map<string, Video>();
    for (const v of VIDEOS) map.set(v.id, v);
    for (const v of custom) map.set(v.id, v);
    return [...map.values()].filter((v) => v.youtubeId);
  }, [custom]);

  async function refresh() {
    const s = await deskCall<YoutubeStatus>("getYoutubeStatus");
    setStatus(s);
    setChannelId(s.channelId);
    setPushes(await deskCall<YoutubePush[]>("listYoutubePushes"));
  }

  useEffect(() => {
    void refresh().catch(() => {});
  }, []);

  useEffect(() => {
    if (search.yt === "connected") toast.success("YouTube channel connected");
    if (search.yt === "error") toast.error(search.msg || "YouTube connect failed");
  }, [search.yt, search.msg]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    try {
      await deskCall("saveYoutubeSettings", {
        channelId,
        apiKey: apiKey || undefined,
        oauthClientId: clientId || undefined,
        oauthClientSecret: clientSecret || undefined,
      });
      setApiKey("");
      setClientId("");
      setClientSecret("");
      toast.success("YouTube settings saved on this desk account");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(null);
    }
  }

  async function onSync() {
    setBusy("sync");
    try {
      const res = await deskCall<
        | { ok: true; total: number; imported: number; updated: number }
        | { ok: false; error: string }
      >("syncYoutubeChannel");
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Synced ${res.total} tapes · ${res.imported} new · ${res.updated} refreshed`);
      hydrate(await deskCall("loadLibrary"));
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setBusy(null);
    }
  }

  async function onConnect() {
    setBusy("oauth");
    try {
      const res = await deskCall<{ ok: true; url: string } | { ok: false; error: string }>(
        "startYoutubeOAuth",
        { origin: window.location.origin },
      );
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const popup = window.open(res.url, "youtube-oauth", "popup,width=520,height=720");
      if (!popup) window.location.assign(res.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start Google");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] text-chrome uppercase">YouTube Data API</p>
      <h1 className="font-display mt-2 text-5xl tracking-wide text-cream">Studio pipe</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat k="Channel" v={status?.channelTitle ?? "Classic Car Sisters"} s={status?.channelId ?? ""} />
        <Stat
          k="Write access"
          v={status?.connected ? "Connected" : "Read only"}
          s={status?.connected ? "Descriptions + comments" : "Public feed only"}
        />
        <Stat
          k="Last sync"
          v={status?.lastSyncAt ? status.lastSyncAt.slice(0, 16).replace("T", " ") : "Never"}
          s={status?.hasApiKey ? "API key on file" : "Add a key for duration + comments"}
        />
      </div>

      <section className="mt-8 rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark">
        <div className="flex flex-wrap gap-2">
          <Button variant="cream" disabled={busy === "sync"} onClick={() => void onSync()}>
            {busy === "sync" ? "Syncing…" : "Sync channel"}
          </Button>
          <Button variant="onDark" disabled={busy === "oauth" || !status} onClick={() => void onConnect()}>
            {status?.connected ? "Reconnect YouTube" : "Connect channel (write)"}
          </Button>
          {status?.connected && (
            <Button
              variant="onDark"
              onClick={() => {
                void deskCall("disconnectYoutube").then(() => {
                  toast.success("Write access dropped");
                  void refresh();
                });
              }}
            >
              Disconnect
            </Button>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark">
        <h2 className="font-display text-3xl tracking-wide text-cream">Credentials</h2>
        <p className="mt-2 text-sm text-chrome">
          OAuth redirect: {origin ? `${origin}/api/youtube/callback` : "this origin + /api/youtube/callback"}
        </p>
        <form onSubmit={onSave} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="chid" className="text-chrome">
              Channel ID
            </Label>
            <Input id="chid" className="mt-1" value={channelId} onChange={(e) => setChannelId(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="key" className="text-chrome">
              Data API key {status?.apiKeyHint ? `(${status.apiKeyHint})` : ""}
            </Label>
            <Input
              id="key"
              className="mt-1"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave blank to keep"
            />
          </div>
          <div>
            <Label htmlFor="cid" className="text-chrome">
              OAuth client ID {status?.clientHint ? `(${status.clientHint})` : ""}
            </Label>
            <Input
              id="cid"
              className="mt-1"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="xxxx.apps.googleusercontent.com"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="csec" className="text-chrome">
              OAuth client secret
            </Label>
            <Input
              id="csec"
              className="mt-1"
              type="password"
              autoComplete="off"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Leave blank to keep"
            />
          </div>
          <Button type="submit" disabled={busy === "save"}>
            {busy === "save" ? "Saving…" : "Save credentials"}
          </Button>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl tracking-wide text-cream">Push queue</h2>
          <Button variant="onDark" size="sm" asChild>
            <Link to="/studio/edit">Open edit bay</Link>
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-line-dark rounded-xl bg-asphalt-soft ring-1 ring-line-dark">
          {videos.map((v) => {
            const draft = drafts[v.id];
            return (
              <li key={v.id} className="flex flex-wrap items-center gap-3 px-4 py-4">
                <img
                  src={youtubeThumb(v.youtubeId)}
                  alt=""
                  className="h-14 w-24 rounded-sm object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-cream">{v.title}</p>
                  <p className="text-xs text-chrome">
                    {v.type} · {formatCompact(v.views)} views · {draft?.status ?? "bare"}
                  </p>
                </div>
                <PushButtons
                  video={v}
                  lead={draft?.descriptionLead || v.descriptionLead}
                  comment={draft?.pinnedComment || v.pinnedComment}
                  busy={busy}
                  setBusy={setBusy}
                  onDone={refresh}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-3xl tracking-wide text-cream">Push log</h2>
        <ul className="mt-4 divide-y divide-line-dark rounded-xl bg-asphalt-soft ring-1 ring-line-dark">
          {pushes.length === 0 && (
            <li className="px-4 py-4 text-sm text-chrome">Nothing pushed yet.</li>
          )}
          {pushes.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Badge variant={p.ok ? "pine" : "default"}>{p.kind}</Badge>
              <span className="min-w-0 flex-1 truncate text-sm text-cream">{p.title}</span>
              <span className="text-xs text-chrome">{p.ok ? "Wrote" : p.detail}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PushButtons({
  video,
  lead,
  comment,
  busy,
  setBusy,
  onDone,
}: {
  video: Video;
  lead: string;
  comment: string;
  busy: string | null;
  setBusy: (v: string | null) => void;
  onDone: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<{ author: string; text: string }[] | null>(null);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="cream"
        disabled={busy === video.id}
        onClick={async () => {
          setBusy(video.id);
          try {
            const res = await deskCall<{ ok: true } | { ok: false; error: string }>("pushDescription", {
              youtubeId: video.youtubeId,
              lead,
              title: video.title,
            });
            if (!res.ok) toast.error(res.error);
            else toast.success("Description fold written on YouTube");
            await onDone();
          } finally {
            setBusy(null);
          }
        }}
      >
        Push description
      </Button>
      <Button
        size="sm"
        variant="onDark"
        disabled={busy === video.id}
        onClick={async () => {
          setBusy(video.id);
          try {
            const res = await deskCall<{ ok: true } | { ok: false; error: string }>("postChannelComment", {
              youtubeId: video.youtubeId,
              text: comment,
              title: video.title,
            });
            if (!res.ok) toast.error(res.error);
            else toast.success("Comment posted. Pin it in Studio.");
            await onDone();
          } finally {
            setBusy(null);
          }
        }}
      >
        Post comment
      </Button>
      <Button size="sm" variant="onDark" asChild>
        <a href={youtubeStudio(video.youtubeId)} target="_blank" rel="noreferrer">
          Studio
        </a>
      </Button>
      <Button
        size="sm"
        variant="onDark"
        onClick={async () => {
          setOpen((v) => !v);
          if (comments) return;
          const res = await deskCall<
            { ok: true; comments: { author: string; text: string }[] } | { ok: false; error: string }
          >("listYoutubeComments", { youtubeId: video.youtubeId });
          if (res.ok) setComments(res.comments);
          else toast.error(res.error);
        }}
      >
        Comments
      </Button>
      {open && comments && (
        <div className="w-full rounded-md bg-asphalt p-3 text-xs text-chrome">
          {comments.length === 0 && <p>No public comments yet.</p>}
          {comments.map((c, i) => (
            <p key={i} className="border-b border-line-dark py-2 last:border-0">
              <span className="text-cream">{c.author}</span> — {c.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark">
      <p className="text-[11px] tracking-[0.18em] text-chrome uppercase">{k}</p>
      <p className="font-display mt-2 truncate text-3xl tracking-wide text-cream">{v}</p>
      <p className="mt-1 truncate text-xs text-chrome">{s}</p>
    </div>
  );
}
