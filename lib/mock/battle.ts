// Dev-only fallback data — used by nothing in the live app anymore now that
// lib/queries/battles.ts reads from Supabase. Kept around for Storybook-style
// component preview / offline UI work. Safe to delete once no longer needed.

import type { BattleView } from "@/lib/battle/types";
export type { FighterView as MockFighter, ArgumentView as MockArgument } from "@/lib/battle/types";
export type MockBattle = BattleView;
export { STAT_LABELS } from "@/lib/battle/types";

export const MOCK_BATTLE: BattleView = {
  id: "mock-battle-id",
  currentUserVote: null,
  slug: "madara-vs-aizen",
  animeLabel: "Naruto Universe × Bleach Universe",
  fighterA: {
    formId: "madara-six-paths",
    name: "Madara Uchiha",
    formName: "Six Paths — Ten-Tails Jinchūriki",
    anime: "Naruto",
    initials: "MU",
    gradientFrom: "#22D07A",
    gradientTo: "#0f6b3d",
    stats: {
      power: 98,
      speed: 94,
      durability: 96,
      iq: 97,
      battleIq: 99,
      hax: 100,
      stamina: 95,
      experience: 98,
    },
  },
  fighterB: {
    formId: "aizen-tybw",
    name: "Sosuke Aizen",
    formName: "Thousand-Year Blood War Arc",
    anime: "Bleach",
    initials: "SA",
    gradientFrom: "#7C5CFF",
    gradientTo: "#3d2b8f",
    stats: {
      power: 96,
      speed: 99,
      durability: 92,
      iq: 98,
      battleIq: 99,
      hax: 100,
      stamina: 94,
      experience: 97,
    },
  },
  voteACount: 943,
  voteBCount: 1538,
  drawCount: 0,
  conditions: {
    location: "Open battlefield",
    knowledge: "Standard",
    prepTime: "None",
    speedEqualized: false,
    verseEqualized: true,
  },
  arguments: [
    {
      id: "a1",
      username: "ShadowUchiha",
      rank: "Kage",
      content:
        "Aizen's biggest edge is that Kyoka Suigetsu makes every exchange a mind game before it's a power game — Madara has to assume every hit he lands isn't real. Once that seed of doubt is in, his usual battlefield control stops mattering.",
      fighterChoice: "b",
      upvotes: 412,
      downvotes: 58,
      replyCount: 37,
      createdAt: "2h ago",
    },
    {
      id: "a2",
      username: "RinneganTakeover",
      rank: "Jonin",
      content:
        "Madara's Limbo clones don't rely on sight to land hits, which is the one thing Kyoka Suigetsu can't touch. Aizen has never fought an opponent who can attack from a dimension his hypnosis can't reach.",
      fighterChoice: "a",
      upvotes: 358,
      downvotes: 71,
      replyCount: 29,
      createdAt: "4h ago",
    },
    {
      id: "a3",
      username: "BleachGoat",
      rank: "Jonin",
      content:
        "People underrate how fast Aizen actually is post-Hōgyoku. He was reacting to Ichigo's Getsuga at a level Madara has never had to keep up with.",
      fighterChoice: "b",
      upvotes: 201,
      downvotes: 44,
      replyCount: 12,
      createdAt: "6h ago",
    },
  ],
  relatedBattles: [
    { slug: "madara-vs-hashirama", label: "Madara vs Hashirama", votes: 3204 },
    { slug: "gojo-vs-madara", label: "Gojo vs Madara", votes: 2871 },
    { slug: "aizen-vs-yhwach", label: "Aizen vs Yhwach", votes: 2510 },
  ],
};
