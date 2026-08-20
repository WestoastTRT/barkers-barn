import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/story")({ component: StoryPage });

function StoryPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">Barker's Barn · Tacoma</p>
        <h1 className="font-display mt-2 text-5xl tracking-wide sm:text-6xl">
          Two sisters, a 1922 shop, and the cars Dad left in the barn.
        </h1>
        <div className="mt-10 overflow-hidden rounded-xl">
          <img
            src="/photos/steve-barn.jpg"
            alt="Out front of Barker's Barn with the red Corvette"
            className="w-full object-cover"
          />
        </div>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-ink">
          <p>
            Great Uncle Andy Norwood opened ANDYS in 1922. Steve Barker grew up in that parts counter. He started working there at eleven, and spent the rest of his life filling a red barn in Tacoma with Corvettes, an El Camino that hadn't sat on its own frame since 1990, and a racing family that still shows up.
          </p>
          <p>
            When Steve passed unexpectedly, Christine Barker and Amanda Owusu inherited the building, the cars, and a lot of questions. They found the key to the original gas station two years later, cleared the door, and hit record. That tape is still the one people Super Thanks.
          </p>
          <p>
            They did not set out to be YouTubers. The barn, the 1960 El Camino, the 1963 427, the 1967 Corvette, Hot Barker Nights — 901 cars and 3,500 people at the Puyallup fairgrounds — was already there. They just started bringing the rest of us along.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <img
            src="/photos/ride-along.jpg"
            alt="Passenger seat of the red classic"
            className="rounded-xl object-cover"
          />
          <img
            src="/photos/garage-pickleball.jpg"
            alt="Christine and Amanda in the garage bay"
            className="rounded-xl object-cover"
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/support">Support the barn</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://www.youtube.com/channel/UChPM9aMyqnPg5irHADtbhqw">YouTube</a>
          </Button>
        </div>
      </div>
    </PublicShell>
  );
}
