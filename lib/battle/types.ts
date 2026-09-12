// Shared shape consumed by every Battle Page component.
// lib/queries/battles.ts maps real Supabase rows into this shape;
// lib/mock/battle.ts (dev fallback only) provides the same shape from static data.

export type FighterView = {
  formId: string;
  name: string;
  formName: string;
  anime: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  stats: {
    power: number;
    speed: number;
    durability: number;
    iq: number;
    battleIq: number;
    hax: number;
    stamina: number;
    experience: number;
  };
};

export type ArgumentView = {
  id: string;
  username: string;
  rank: string;
  content: string;
  fighterChoice: "a" | "b";
  upvotes: number;
  downvotes: number;
  replyCount: number;
  createdAt: string;
};

export type BattleView = {
  id: string;
  slug: string;
  animeLabel: string;
  fighterA: FighterView;
  fighterB: FighterView;
  voteACount: number;
  voteBCount: number;
  drawCount: number;
  conditions: {
    location: string;
    knowledge: string;
    prepTime: string;
    speedEqualized: boolean;
    verseEqualized: boolean;
  };
  arguments: ArgumentView[];
  relatedBattles: { slug: string; label: string; votes: number }[];
  /** Current visitor's existing vote, if any — null when logged out or not yet voted. */
  currentUserVote: "a" | "b" | "draw" | null;
};

export const STAT_LABELS: { key: keyof FighterView["stats"]; label: string }[] = [
  { key: "power", label: "Power" },
  { key: "speed", label: "Speed" },
  { key: "durability", label: "Durability" },
  { key: "iq", label: "IQ" },
  { key: "battleIq", label: "Battle IQ" },
  { key: "hax", label: "Hax" },
  { key: "stamina", label: "Stamina" },
  { key: "experience", label: "Experience" },
];
