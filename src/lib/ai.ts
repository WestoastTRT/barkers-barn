import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { VIDEOS, CAMPAIGNS } from "@/lib/data/catalog";

export type CopyKind =
  | "pinned"
  | "description"
  | "verbal"
  | "community"
  | "instagram";

export const generateBarnCopy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { videoId: string; kind: CopyKind }) => input)
  .handler(async ({ data }) => {
    const video = VIDEOS.find((v) => v.id === data.videoId);
    if (!video) return { ok: false as const, error: "Unknown video" };

    const campaign = video.campaignId
      ? CAMPAIGNS.find((c) => c.id === video.campaignId)
      : undefined;

    const fallback = fallbackCopy(video.title, data.kind, campaign?.name);

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: true as const, text: fallback, source: "template" as const };

    const kindPrompt: Record<CopyKind, string> = {
      pinned:
        "Write a YouTube pinned comment (max 280 characters) that thanks Super Thanks senders, names the project the money goes to, and says the sisters reply to every one. No hashtags. No emoji except a single heart if it feels honest.",
      description:
        "Write the first 125 characters of a YouTube description. Super Thanks must be mentioned in the first sentence. Then one more sentence with a shop/look cue. Total under 220 characters.",
      verbal:
        "Write a 12-18 second spoken Super Thanks ask in Christine or Amanda's voice — warm, specific, not salesy. Include a timestamp suggestion like [at 0:48].",
      community:
        "Write a YouTube Community post (max 400 characters) reporting a Super Thanks milestone or inviting people to the next live Super Chat goal.",
      instagram:
        "Write an Instagram caption (max 120 words) that teases the YouTube video, mentions Super Thanks without sounding like an ad, and ends with 4 hashtags including #BarkersBarn #ClassicCarSisters.",
    };

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(9000),
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 400,
          messages: [
            {
              role: "system",
              content:
                "You write copy for Classic Car Sisters (Christine Barker and Amanda Owusu) of Barker's Barn in Tacoma. Their dad Steve Barker died unexpectedly. They are restoring his cars (1960 El Camino, 1967 Corvette, 1963 427) and the 1922 ANDYS gas station. Voice: two sisters, plain, specific, never corporate, never slangy-influencer. Super Thanks just unlocked on the channel.",
            },
            {
              role: "user",
              content: `Video: "${video.title}" (${video.type}, Super Thanks score ${video.superScore}/100). ${campaign ? `Campaign: ${campaign.name}.` : ""}\n\n${kindPrompt[data.kind]}`,
            },
          ],
        }),
      });
      if (!res.ok) return { ok: true as const, text: fallback, source: "template" as const };
      const body = (await res.json()) as {
        choices: { message: { content: string } }[];
      };
      const text = body.choices[0]?.message.content?.trim();
      if (!text) return { ok: true as const, text: fallback, source: "template" as const };
      return { ok: true as const, text, source: "grok" as const };
    } catch {
      return { ok: true as const, text: fallback, source: "template" as const };
    }
  });

function fallbackCopy(title: string, kind: CopyKind, campaign?: string) {
  const project = campaign ?? "the barn";
  switch (kind) {
    case "pinned":
      return `Super Thanks is on this video. Every one of them goes to ${project}. We reply to each name — thank you for keeping Dad's place in the family.`;
    case "description":
      return `Super Thanks is unlocked on this video — tap the heart under the player if ${project} still means something. Shop the barn looks in the links below.`;
    case "verbal":
      return `[at 0:48] If you've been following this, Super Thanks is the heart under the video. It goes to ${project}. We read every name.`;
    case "community":
      return `Super Thanks is live on the channel. We just unlocked it. If "${title}" hit you, that's the one to tap. Next live from the barn we'll read every name out loud.`;
    case "instagram":
      return `Full tape is on YouTube — "${title}". Super Thanks is finally on the channel if you want to throw something at ${project}. We'll see you in the barn.\n\n#BarkersBarn #ClassicCarSisters #ClassicCars #ElCamino`;
  }
}
