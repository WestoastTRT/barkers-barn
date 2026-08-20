import { createFileRoute } from "@tanstack/react-router";
import { finishYoutubeOAuth } from "@/lib/youtube-api";

export const Route = createFileRoute("/api/youtube/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = url.origin;
        const err = url.searchParams.get("error");
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (err) {
          return htmlRedirect(`/studio/youtube?yt=error&msg=${encodeURIComponent(err)}`);
        }
        if (!code || !state) {
          return htmlRedirect("/studio/youtube?yt=error&msg=missing_code");
        }
        try {
          await finishYoutubeOAuth({ code, state, origin });
          return htmlRedirect("/studio/youtube?yt=connected");
        } catch (e) {
          const msg = e instanceof Error ? e.message : "oauth_failed";
          return htmlRedirect(`/studio/youtube?yt=error&msg=${encodeURIComponent(msg.slice(0, 180))}`);
        }
      },
    },
  },
});

function htmlRedirect(path: string) {
  const body = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>YouTube</title>
<body>
<p>Returning to the desk…</p>
<script>
  var dest = ${JSON.stringify(path)};
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.location.href = dest;
      window.close();
    } else {
      location.replace(dest);
    }
  } catch (e) {
    location.replace(dest);
  }
</script>
</body>
</html>`;
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
