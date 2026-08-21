import { createFileRoute } from "@tanstack/react-router";
import { generateBarnCopy } from "@/lib/ai";
import { UnauthorizedError, requireUserId } from "@/lib/auth/verify.server";
import { loadLibrary, optimizeTape, upsertTape } from "@/lib/studio-api";
import {
  disconnectYoutube,
  getYoutubeStatus,
  listYoutubeComments,
  listYoutubePushes,
  postChannelComment,
  pushDescription,
  saveYoutubeSettings,
  startYoutubeOAuth,
  syncYoutubeChannel,
} from "@/lib/youtube-api";

export const Route = createFileRoute("/api/desk")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: { op?: string; data?: unknown };
        try {
          payload = (await request.json()) as { op?: string; data?: unknown };
        } catch {
          return Response.json({ error: "Bad payload" }, { status: 400 });
        }
        const op = payload.op;
        const data = payload.data as Record<string, unknown> | null;
        try {
          const authz = request.headers.get("authorization");
          const bearer = authz?.toLowerCase().startsWith("bearer ")
            ? authz.slice(7)
            : undefined;
          const userId = await requireUserId(bearer);
          const result = await dispatch(op, userId, data);
          return Response.json(result);
        } catch (err) {
          if (err instanceof UnauthorizedError) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }
          const msg = err instanceof Error ? err.message : "Desk failed";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});

async function dispatch(op: string | undefined, userId: string, data: Record<string, unknown> | null) {
  switch (op) {
    case "loadLibrary":
      return loadLibrary(userId);
    case "upsertTape":
      return upsertTape(userId, data as never);
    case "optimizeTape":
      return optimizeTape(data as never);
    case "generateBarnCopy":
      return generateBarnCopy(data as never);
    case "getYoutubeStatus":
      return getYoutubeStatus(userId);
    case "saveYoutubeSettings":
      return saveYoutubeSettings(userId, data as never);
    case "startYoutubeOAuth":
      return startYoutubeOAuth(userId, data as never);
    case "disconnectYoutube":
      return disconnectYoutube(userId);
    case "syncYoutubeChannel":
      return syncYoutubeChannel(userId);
    case "listYoutubeComments":
      return listYoutubeComments(userId, data as never);
    case "pushDescription":
      return pushDescription(userId, data as never);
    case "postChannelComment":
      return postChannelComment(userId, data as never);
    case "listYoutubePushes":
      return listYoutubePushes(userId);
    default:
      throw new Error("Unknown desk op");
  }
}
