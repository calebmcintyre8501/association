export type Contract = {
  id: number;
  title: string;
  description: string;
  price: string;
  difficulty: "Standard" | "Elevated" | "Extreme";
  category: "Security" | "Bounty" | "Recovery" | "Escort" | "Military";
};

export type Member = {
  id: number;
  name: string;
  title: string;
  specialty: string;
  status: "Active" | "Reserve" | "Deployed" | "Unavailable";
  quote: string;
};

export type Asset = {
  id: number;
  name: string;
  type: string;
  description: string;
};

export const guildInfo = {
  name: "The Association",
  tagline: "Discreet force. Paid loyalty. Proven results.",
  motto: "Payment first. Precision always.",
};

export const guildLore = `
In the shadows between governments, syndicates, and warlords, there are problems that cannot be solved through diplomacy alone.

The Association exists for those moments.

Born from veteran soldiers, bounty hunters, pilots, and tacticians who chose contract over allegiance, the Association operates as an independent mercenary guild offering disciplined manpower, protection details, recovery teams, strike elements, and strategic support.

The guild is not bound by Senate decree, Imperial doctrine, or local politics. Its loyalty begins and ends with the contract.

Across the Outer Rim and beyond, their name has become associated with three things:
results, discretion, and a price that reflects both.
`;

export const contracts: Contract[] = [
  {
    id: 1,
    title: "VIP Escort Detail",
    description:
      "Protect a dignitary, broker, or high-value client through unstable sectors or active conflict zones.",
    price: "18,000 credits",
    difficulty: "Standard",
    category: "Escort",
  },
  {
    id: 2,
    title: "Bounty Acquisition",
    description:
      "Track, capture, or terminate a designated target. Final price varies based on location and resistance.",
    price: "45,000+ credits",
    difficulty: "Extreme",
    category: "Bounty",
  },
  {
    id: 3,
    title: "Asset Recovery",
    description:
      "Recover stolen cargo, sensitive data, equipment, or captured personnel from hostile actors.",
    price: "32,000 credits",
    difficulty: "Elevated",
    category: "Recovery",
  },
  {
    id: 4,
    title: "Sector Security Contract",
    description:
      "Temporary deployment of armed personnel to reinforce compounds, convoys, docks, or trade lanes.",
    price: "27,000 credits",
    difficulty: "Elevated",
    category: "Security",
  },
  {
    id: 5,
    title: "Strike Team Deployment",
    description:
      "Rapid-response combat unit for raids, eliminations, or offensive action against fortified targets.",
    price: "60,000 credits",
    difficulty: "Extreme",
    category: "Military",
  },
  {
    id: 6,
    title: "Convoy Shielding",
    description:
      "Provide overwatch, escort vehicles, and anti-ambush support for valuable transport operations.",
    price: "22,000 credits",
    difficulty: "Standard",
    category: "Security",
  },
];

export const members: Member[] = [
  {
    id: 1,
    name: "Luther Hill",
    title: "Director",
    specialty: "Strategic command and contract authorization",
    status: "Active",
    quote: "Clients pay for outcomes, not excuses.",
  },
  {
    id: 2,
    name: "Elae'nz'oro 'Enzo'",
    title: "Associate",
    specialty: "Deployment logistics and tactical coordination",
    status: "Active",
    quote: "Every operation has a weak point. We find it first.",
  },
  {
    id: 3,
    name: "Sarah-Carmine",
    title: "Associate",
    specialty: "Raid leadership and live combat command",
    status: "Deployed",
    quote: "If we’re already in the firefight, someone else planned badly.",
  },
  {
    id: 4,
    name: "Taris Keld",
    title: "Recon Specialist",
    specialty: "Tracking, infiltration, and target intel",
    status: "Reserve",
    quote: "The best kill is the one that never sees you coming.",
  },
];

export const assets: Asset[] = [
  {
    id: 1,
    name: "Blackline",
    type: "Assault Shuttle",
    description:
      "Fast-response insertion craft equipped for escort, extraction, and rapid deployment.",
  },
  {
    id: 2,
    name: "Vault Seven",
    type: "Armory Node",
    description:
      "Secured weapons cache containing modular blasters, explosives, armor, and field gear.",
  },
  {
    id: 3,
    name: "Ghost Relay",
    type: "Intel Network",
    description:
      "A scattered web of informants, slicers, and local watchers used for contract preparation.",
  },
  {
    id: 4,
    name: "Harrow Station",
    type: "Forward Base",
    description:
      "Temporary guild outpost used for refit, planning, detention, and supply staging.",
  },
];
