export type ProductKind = "merch" | "affiliate";
export type CollectionId =
  | "barn-merch"
  | "garage-uniform"
  | "restoration-bench"
  | "show-day";

export type Product = {
  slug: string;
  name: string;
  price: number;
  kind: ProductKind;
  collection: CollectionId;
  image: string;
  blurb: string;
  retailer: string;
  commissionPct: number;
  buyUrl: string;
  tags: string[];
};

export type LookPin = {
  slug: string;
  x: number;
  y: number;
  label: string;
};

export type Look = {
  id: string;
  title: string;
  image: string;
  caption: string;
  location: string;
  products: LookPin[];
};

export type VideoType = "legacy" | "restoration" | "live" | "show" | "short";

export type Placement = {
  at: number;
  kind: "verbal" | "card" | "end";
  copy: string;
};

export type Video = {
  id: string;
  youtubeId: string;
  title: string;
  durationSec: number;
  views: number;
  published: string;
  type: VideoType;
  superScore: number;
  why: string;
  placements: Placement[];
  pinnedComment: string;
  descriptionLead: string;
  campaignId?: string;
  source?: "catalog" | "youtube" | "upload";
  hasFile?: boolean;
};

export type Campaign = {
  id: string;
  name: string;
  goal: number;
  raised: number;
  story: string;
  image: string;
  videoIds: string[];
};

export type SuperTier = {
  amount: number;
  label: string;
  keeps: number;
  meaning: string;
};

export const COLLECTIONS: { id: CollectionId; name: string; blurb: string }[] = [
  {
    id: "barn-merch",
    name: "Barn merch",
    blurb: "Ships from the family. Every shirt keeps the lights on in Tacoma.",
  },
  {
    id: "garage-uniform",
    name: "Garage uniform",
    blurb: "What Christine and Amanda actually wear between the lift and the camera.",
  },
  {
    id: "restoration-bench",
    name: "Restoration bench",
    blurb: "Tools and supplies from the El Camino, the Corvettes, and the 1922 shop.",
  },
  {
    id: "show-day",
    name: "Show day",
    blurb: "Hot Barker Nights energy — looks you can shop from the photos.",
  },
];

export const PRODUCTS: Product[] = [
  {
    slug: "barkers-barn-tee",
    name: "Barker's Barn work tee",
    price: 32,
    kind: "merch",
    collection: "barn-merch",
    image: "/shop/barn-tee.jpg",
    blurb:
      "Heavyweight candy-apple red. Small barn-gable on the chest. The shirt we throw on before rolling a frame under a body that's been on stands since 1990.",
    retailer: "The Barn",
    commissionPct: 42,
    buyUrl: "/shop/barkers-barn-tee",
    tags: ["merch", "red", "tee"],
  },
  {
    slug: "ccs-cap",
    name: "Classic Car Sisters cap",
    price: 28,
    kind: "merch",
    collection: "barn-merch",
    image: "/shop/ccs-cap.jpg",
    blurb:
      "Cream unstructured cap with a stitched barn-red gable. Same silhouette as the ones on in the garage videos.",
    retailer: "The Barn",
    commissionPct: 45,
    buyUrl: "/shop/ccs-cap",
    tags: ["merch", "hat", "cream"],
  },
  {
    slug: "hbn-tee",
    name: "Hot Barker Nights tee",
    price: 34,
    kind: "merch",
    collection: "barn-merch",
    image: "/shop/hbn-tee.jpg",
    blurb:
      "Black heavyweight with a racing stripe. For the 901-car family reunion at the Puyallup fairgrounds.",
    retailer: "The Barn",
    commissionPct: 40,
    buyUrl: "/shop/hbn-tee",
    tags: ["merch", "event", "black"],
  },
  {
    slug: "andys-mug",
    name: "ANDYS 1922 camp mug",
    price: 22,
    kind: "merch",
    collection: "barn-merch",
    image: "/shop/andys-mug.jpg",
    blurb:
      "Barn-red ceramic. Named for the gas station Great Uncle Andy Norwood opened in 1922 — the door the sisters unlocked two years after Dad passed.",
    retailer: "The Barn",
    commissionPct: 48,
    buyUrl: "/shop/andys-mug",
    tags: ["merch", "mug", "legacy"],
  },
  {
    slug: "barn-club-set",
    name: "Barn Club sweatshirt",
    price: 64,
    kind: "affiliate",
    collection: "garage-uniform",
    image: "/shop/barn-club.jpg",
    blurb:
      "Oversized cream heavyweight — the garage-day sweatshirt from the pickleball-club morning in the bay. Pairs with the clover-green leggings.",
    retailer: "Shop the look",
    commissionPct: 12,
    buyUrl: "https://www.amazon.com/s?k=oversized+cream+heavyweight+sweatshirt",
    tags: ["sweatshirt", "cream", "look"],
  },
  {
    slug: "olive-tank",
    name: "Ride-along ribbed tank",
    price: 28,
    kind: "affiliate",
    collection: "show-day",
    image: "/shop/olive-tank.jpg",
    blurb:
      "Olive ribbed tank — the one from the passenger seat of the red classic with the chrome surround and cream interior.",
    retailer: "Shop the look",
    commissionPct: 14,
    buyUrl: "https://www.amazon.com/s?k=womens+ribbed+olive+tank+top",
    tags: ["tank", "olive", "look"],
  },
  {
    slug: "blue-leggings",
    name: "Show-day blue leggings",
    price: 48,
    kind: "affiliate",
    collection: "garage-uniform",
    image: "/shop/blue-leggings.jpg",
    blurb:
      "Cornflower high-waist. The other half of the garage-bay uniform, next to the cream sweatshirt and white caps.",
    retailer: "Shop the look",
    commissionPct: 15,
    buyUrl: "https://www.amazon.com/s?k=high+waist+blue+athletic+leggings",
    tags: ["leggings", "blue", "look"],
  },
  {
    slug: "chrome-polish",
    name: "Barn chrome polish",
    price: 18,
    kind: "affiliate",
    collection: "restoration-bench",
    image: "/shop/chrome-polish.jpg",
    blurb:
      "The tin that brings the 427 lettering and the Corvette bumpers back. Linked to the same class of polish we use on camera.",
    retailer: "Summit Racing",
    commissionPct: 6,
    buyUrl: "https://www.summitracing.com/search?keyword=chrome%20polish",
    tags: ["detail", "chrome", "bench"],
  },
  {
    slug: "gloves-kit",
    name: "Mechanics gloves + microfiber",
    price: 36,
    kind: "affiliate",
    collection: "restoration-bench",
    image: "/shop/gloves-kit.jpg",
    blurb:
      "Tan mechanics gloves and a stack of towels. What is actually on the bench when the El Camino body comes down.",
    retailer: "Amazon",
    commissionPct: 4,
    buyUrl: "https://www.amazon.com/s?k=mechanics+gloves+microfiber+towels",
    tags: ["gloves", "microfiber", "bench"],
  },
  {
    slug: "polisher",
    name: "Dual-action polisher",
    price: 129,
    kind: "affiliate",
    collection: "restoration-bench",
    image: "/shop/polisher.jpg",
    blurb:
      "The machine behind the candy-apple on the C2. Highest affiliate dollar on the bench — pin it under every Corvette detail video.",
    retailer: "Amazon",
    commissionPct: 4.5,
    buyUrl: "https://www.amazon.com/s?k=dual+action+car+polisher",
    tags: ["tool", "corvette", "bench"],
  },
];

export const LOOKS: Look[] = [
  {
    id: "show-day",
    title: "Show day, hood up",
    image: "/photos/sisters-show.jpg",
    caption:
      "Christine and Amanda with Dad's red Corvette, hood open, freight train behind them. The photo that sells the channel in one frame.",
    location: "PNW car show",
    products: [
      { slug: "olive-tank", x: 38, y: 42, label: "White tank (shop similar)" },
      { slug: "blue-leggings", x: 22, y: 62, label: "Athletic set" },
      { slug: "ccs-cap", x: 18, y: 22, label: "Sisters cap" },
    ],
  },
  {
    id: "barn-club",
    title: "Garage bay, barn club",
    image: "/photos/garage-pickleball.jpg",
    caption:
      "White caps, cream sweatshirt, clover green and cornflower blue. Shot in the bay with the black classic behind them.",
    location: "Barker's Barn",
    products: [
      { slug: "barn-club-set", x: 38, y: 38, label: "Cream sweatshirt" },
      { slug: "blue-leggings", x: 68, y: 62, label: "Blue leggings" },
      { slug: "ccs-cap", x: 52, y: 16, label: "White caps" },
    ],
  },
  {
    id: "ride-along",
    title: "Passenger seat, chrome surround",
    image: "/photos/ride-along.jpg",
    caption:
      "The ride-along still. Cream interior, red door, chrome drip. This is the look people screenshot.",
    location: "The red classic",
    products: [
      { slug: "olive-tank", x: 48, y: 48, label: "Olive tank" },
      { slug: "chrome-polish", x: 78, y: 72, label: "Door chrome" },
    ],
  },
  {
    id: "barn-door",
    title: "Out front of the barn",
    image: "/photos/steve-barn.jpg",
    caption:
      "The red C2 under the striped gable. Barker's Barn, still open.",
    location: "Barker's Barn, Tacoma",
    products: [
      { slug: "barkers-barn-tee", x: 62, y: 48, label: "Barn tee" },
      { slug: "andys-mug", x: 82, y: 62, label: "1922 mug" },
      { slug: "ccs-cap", x: 58, y: 28, label: "Cap" },
    ],
  },
];

export const VIDEOS: Video[] = [
  {
    id: "legacy-1922",
    youtubeId: "jqpqXeGqkww",
    title: "Our Dad's Legacy, a 1922 Gas Station & Why We Keep Going",
    durationSec: 12 * 60 + 40,
    views: 18400,
    published: "2026-06-05",
    type: "legacy",
    superScore: 96,
    why: "Highest-emotion video on the channel. Super Thanks converts on grief, legacy, and a door that hadn't been opened in two years.",
    campaignId: "andys",
    placements: [
      {
        at: 48,
        kind: "verbal",
        copy: "If Dad's shop still means something to you, Super Thanks is the heart under the video — it goes straight to keeping ANDYS standing.",
      },
      {
        at: 9 * 60 + 20,
        kind: "end",
        copy: "Full ask: Super Thanks, then subscribe. We read every one.",
      },
    ],
    pinnedComment:
      "Super Thanks is on this video. Every one of them goes to the 1922 shop and the cars Dad left in the barn. We reply to each one — thank you for keeping this place in the family.",
    descriptionLead:
      "Super Thanks is unlocked on this video. If this story meant something, the heart under the player keeps ANDYS and Barker's Barn going.",
  },
  {
    id: "andys-to-barn",
    youtubeId: "CI5KfOJFC9o",
    title: "From ANDY'S Auto Parts to Barker's Barn",
    durationSec: 10 * 60 + 2,
    views: 1900,
    published: "2025-12-20",
    type: "legacy",
    superScore: 91,
    why: "Origin story. Under-harvested views — pin Super Thanks and a shop link in the first two description lines.",
    campaignId: "andys",
    placements: [
      {
        at: 32,
        kind: "verbal",
        copy: "This is the building. Super Thanks on this video is how we keep the doors from closing again.",
      },
    ],
    pinnedComment:
      "This is the origin tape. Super Thanks on this one is earmarked for the original ANDYS building.",
    descriptionLead:
      "Inside Barker's Barn — and the 1922 shop it grew from. Super Thanks keeps the lights on. Shop the barn from the link below.",
  },
  {
    id: "who-we-are",
    youtubeId: "7Xxuc7hEE_g",
    title: "From 7,000 to 25,000 in 40 Days — Here's Who We Are",
    durationSec: 8 * 60 + 12,
    views: 8200,
    published: "2026-02-11",
    type: "legacy",
    superScore: 88,
    why: "New viewers land here. First 125 characters of the description must be the Super Thanks ask, not a subscribe plea.",
    placements: [
      {
        at: 20,
        kind: "verbal",
        copy: "We're two sisters from Barker's Barn. If you just found us — Super Thanks is the fastest way to help.",
      },
    ],
    pinnedComment:
      "New here? Super Thanks is the heart button under the player. We just unlocked it and we read every name out loud on the next live.",
    descriptionLead:
      "Two sisters, Barker's Barn, ANDYS since 1922. Super Thanks is now on — tap the heart under this video if you want the barn to keep going.",
  },
  {
    id: "mark-andersen",
    youtubeId: "OdXL2GGtBLk",
    title: "Decades of Racing, Friendship & Legacy | Mark Andersen",
    durationSec: 6 * 60 + 7,
    views: 570,
    published: "2026-01-08",
    type: "legacy",
    superScore: 84,
    why: "Quiet, long-time-friend interview. Super Thanks from the old racing circle — ask in the pinned comment, not as a mid-roll gag.",
    placements: [
      {
        at: 5 * 60 + 40,
        kind: "end",
        copy: "If you knew Steve, or raced with him — Super Thanks on this one is for the people who built the barn with him.",
      },
    ],
    pinnedComment:
      "Dedicated to Steve Barker and the people who helped him build this. Super Thanks from the old racing circle means more than we can say.",
    descriptionLead:
      "Mark Andersen — a Barker's Barn original. Super Thanks on this tape goes to keeping Steve's cars in the family.",
  },
  {
    id: "mothers-day-vette",
    youtubeId: "agWijjYfseM",
    title: "Come Ride With Us — Mother's Day in the 1967 Corvette",
    durationSec: 7 * 60 + 55,
    views: 4100,
    published: "2026-05-11",
    type: "restoration",
    superScore: 79,
    why: "Feel-good Corvette ride. Pair Super Thanks with the chrome polish and the ride-along look.",
    campaignId: "elcamino",
    placements: [
      {
        at: 6 * 60 + 10,
        kind: "card",
        copy: "Shop the tank + chrome polish from this ride. Super Thanks if you just want the barn funded.",
      },
    ],
    pinnedComment:
      "Mother's Day in Dad's 1967. Super Thanks and the shop links below both go back into the next drive.",
    descriptionLead:
      "Mother's Day in the 1967 Corvette. Super Thanks is on. Shop the ride-along look in the description.",
  },
  {
    id: "57-chevy",
    youtubeId: "c3LeHbzscbI",
    title: "Ultimate 1957 Chevy Convertible Barn Find — Last Driven in 1971",
    durationSec: 3 * 60 + 37,
    views: 290,
    published: "2025-10-20",
    type: "restoration",
    superScore: 71,
    why: "Barn-find format. Lower views, high intent. Description should lead with the dual-action polisher + Super Thanks.",
    placements: [
      {
        at: 3 * 60 + 5,
        kind: "end",
        copy: "If you want the next barn find on camera, Super Thanks on this short tape goes a long way.",
      },
    ],
    pinnedComment:
      "Seattle barn find. Super Thanks helps us keep showing up to dusty buildings with a camera and a trailer.",
    descriptionLead:
      "Last driven in 1971. Super Thanks keeps the barn-find trips funded. Polisher we use is linked below.",
  },
  {
    id: "live-barn",
    youtubeId: "TYLq5Inep0A",
    title: "LIVE from Barker's Barn with the Barker girls",
    durationSec: 37 * 60 + 39,
    views: 3500,
    published: "2026-08-20",
    type: "live",
    superScore: 93,
    why: "Super Chat, not Super Thanks — announce at 0:30, pin a goal, read every name. Highest dollars-per-hour on the channel.",
    campaignId: "elcamino",
    placements: [
      {
        at: 30,
        kind: "verbal",
        copy: "Super Chat is how you pin a message tonight. First goal: $200 and we roll the El Camino update.",
      },
      {
        at: 18 * 60,
        kind: "verbal",
        copy: "We're halfway to the body-drop goal. If you've been lurking, this is the moment.",
      },
    ],
    pinnedComment:
      "LIVE replay. Super Thanks still works on the VOD. Super Chat was for the night-of — thank you to everyone we read out loud.",
    descriptionLead:
      "Replay of live from the barn. Super Thanks is on the VOD. Next live: Saturday. Super Chat goals posted in community.",
  },
  {
    id: "10k-short",
    youtubeId: "yKBkCBxHuNA",
    title: "10,000 on Instagram",
    durationSec: 36,
    views: 1200,
    published: "2026-08-19",
    type: "short",
    superScore: 62,
    why: "Shorts Super Thanks is easy to miss. Put the ask in the on-screen caption and the pinned comment — there is no description fold.",
    placements: [
      {
        at: 8,
        kind: "verbal",
        copy: "10K. Super Thanks on this Short if you were one of them.",
      },
    ],
    pinnedComment:
      "We hit 10K. Super Thanks on this Short goes to the El Camino body mount. Next stop 20K.",
    descriptionLead:
      "10K. Super Thanks is on this Short — tap the heart if you've been following the barn.",
  },
  {
    id: "winner",
    youtubeId: "TCUtqgCk2a4",
    title: "We have a winner!",
    durationSec: 36,
    views: 640,
    published: "2026-08-19",
    type: "short",
    superScore: 54,
    why: "Giveaway energy. Don't hard-ask Super Thanks on a winner announce — thank existing senders in the pinned comment instead.",
    placements: [
      {
        at: 30,
        kind: "end",
        copy: "Congrats to the winner. If you Super Thanked this week, we see you — names on the next live.",
      },
    ],
    pinnedComment:
      "Winner posted. If you sent Super Thanks this week, we're reading names on Saturday's live.",
    descriptionLead:
      "Giveaway winner. Super Thanks still helps the barn — we just don't ask on a winner tape.",
  },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: "elcamino",
    name: "El Camino body drop",
    goal: 2500,
    raised: 840,
    image: "/photos/sisters-show.jpg",
    story:
      "Dad's 1960 El Camino sat on a stand since 1990. The frame is finally rolled under the body. Super Thanks on the live and the restoration tapes is earmarked for the mount, the missing seat, and getting it to Hot Barker Nights.",
    videoIds: ["live-barn", "mothers-day-vette"],
  },
  {
    id: "andys",
    name: "ANDYS 1922 lights-on",
    goal: 5000,
    raised: 1260,
    image: "/photos/hero-corvette.jpg",
    story:
      "Great Uncle Andy Norwood opened the gas station in 1922. Two years after Steve passed, Christine and Amanda found the key and unlocked the door. Super Thanks on the origin videos keeps that building in the family.",
    videoIds: ["legacy-1922", "andys-to-barn"],
  },
  {
    id: "hbn",
    name: "Hot Barker Nights 2026",
    goal: 3000,
    raised: 410,
    image: "/photos/steve-barn.jpg",
    story:
      "901 cars. 3,500 people. One of Washington's largest family shows, built around Steve's name. Merch + Super Thanks on the show tapes fund the next one.",
    videoIds: ["10k-short"],
  },
];

export const SUPER_TIERS: SuperTier[] = [
  {
    amount: 2,
    label: "Coffee in the barn",
    keeps: 1.4,
    meaning: "A cup on the workbench while the body comes down.",
  },
  {
    amount: 5,
    label: "Parts-store run",
    keeps: 3.5,
    meaning: "Bolts, tape, a can of something we didn't know we needed.",
  },
  {
    amount: 10,
    label: "Panel fund",
    keeps: 7,
    meaning: "Toward the El Camino mount and the missing pieces.",
  },
  {
    amount: 50,
    label: "Barn light bill",
    keeps: 35,
    meaning: "A real chunk of keeping ANDYS and the barn open this month.",
  },
];

export const SEED_WALL = [
  { name: "Mike", amount: 50, note: "For Steve.", videoId: "legacy-1922" },
  { name: "Dale", amount: 10, note: "Oreo says hi.", videoId: "live-barn" },
  { name: "Mark A.", amount: 50, note: "Old racing circle.", videoId: "mark-andersen" },
  { name: "Puyallup Gary", amount: 5, note: "See you at Hot Barker Nights.", videoId: "10k-short" },
  { name: "Christine's neighbor", amount: 10, note: "Keep the El Camino coming.", videoId: "mothers-day-vette" },
];

export function productBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function videoById(id: string) {
  return VIDEOS.find((v) => v.id === id);
}

export function lookById(id: string) {
  return LOOKS.find((l) => l.id === id);
}

export function campaignById(id: string) {
  return CAMPAIGNS.find((c) => c.id === id);
}

export function productsIn(collection: CollectionId) {
  return PRODUCTS.filter((p) => p.collection === collection);
}

export function rankedVideos() {
  return [...VIDEOS].sort((a, b) => b.superScore - a.superScore);
}

export const CHANNEL = {
  name: "Classic Car Sisters",
  handle: "@ClassicCarSisters",
  id: "UChPM9aMyqnPg5irHADtbhqw",
  url: "https://www.youtube.com/channel/UChPM9aMyqnPg5irHADtbhqw",
  instagram: "https://www.instagram.com/classiccarsisters/",
  facebook: "https://www.facebook.com/barker.s.barn.2025/",
  location: "Tacoma, WA",
  sisters: ["Christine Barker", "Amanda Owusu"],
};
