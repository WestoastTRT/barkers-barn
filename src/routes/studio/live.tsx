import { createFileRoute } from "@tanstack/react-router";
import { CopyBlock } from "@/components/copy-block";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/studio/live")({ component: LivePage });

const BEATS = [
  { t: "0:00–0:30", title: "Open the barn", body: "Wave. Say where you are. Do not ask for money yet." },
  { t: "0:30–1:00", title: "Explain Super Chat", body: "“If you want a message pinned, Super Chat is the colored one. Super Thanks still works on the VODs after.”" },
  { t: "1:00", title: "Pin the goal", body: "On-screen: $200 unlocks the El Camino body-drop update. Read the number every 15 minutes." },
  { t: "Always", title: "Read every name", body: "Skip one and the next three don't send. Repeat the amount and the note." },
  { t: "Mid", title: "Halfway nudge", body: "Only if the chat is warm. Never twice in five minutes." },
  { t: "End", title: "Close the fund", body: "Total, thank-yous, when the next live is, and the VOD still takes Super Thanks." },
];

function LivePage() {
  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] text-chrome uppercase">Super Chat playbook</p>
      <h1 className="font-display mt-2 text-5xl tracking-wide text-cream">Saturday in the barn</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        <Badge>Goal $200</Badge>
        <Badge variant="cream">El Camino body drop</Badge>
        <Badge variant="outline">Read every Super Chat</Badge>
      </div>

      <ol className="mt-8 flex flex-col gap-4">
        {BEATS.map((b, i) => (
          <li key={b.t} className="grid gap-3 rounded-xl bg-asphalt-soft p-5 ring-1 ring-line-dark sm:grid-cols-[140px_1fr]">
            <p className="font-display text-2xl tracking-wide text-barn">{String(i + 1).padStart(2, "0")}</p>
            <div>
              <p className="text-xs tracking-[0.16em] text-chrome uppercase">{b.t}</p>
              <p className="mt-1 font-medium text-cream">{b.title}</p>
              <p className="mt-1 text-sm text-chrome">{b.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col gap-3">
        <CopyBlock
          invert
          id="live-open"
          label="Spoken · 0:30"
          text="We're live from Barker's Barn. If you want to pin a message tonight, Super Chat is the colored one in the chat. First goal is $200 — that's the El Camino body-drop update we promised. We read every name."
        />
        <CopyBlock
          invert
          id="live-half"
          label="Spoken · halfway"
          text="We're halfway to the body-drop goal. If you've been lurking in the barn with us, this is a fine time. Super Thanks still works on the replay after we go dark."
        />
        <CopyBlock
          invert
          id="live-close"
          label="Spoken · close"
          text="That's the night. Thank you to everyone we read. Replay stays up — Super Thanks is the heart under the VOD if you catch this tomorrow. Same barn, Saturday."
        />
        <CopyBlock
          invert
          id="live-overlay"
          label="Lower-third text"
          text="SUPER CHAT GOAL  $200  ·  EL CAMINO BODY DROP  ·  we read every name"
        />
      </div>
    </div>
  );
}
