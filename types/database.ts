/**
 * Hand-written types matching supabase/migrations/20260912000000_init_schema.sql.
 * TODO: once the project is linked, replace with generated types:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 */

export type UserRole = "user" | "editor" | "moderator" | "admin";
export type Visibility = "public" | "unlisted" | "private";
export type FighterChoice = "a" | "b" | "draw";
export type DifficultyLevel =
  | "no_diff"
  | "low_diff"
  | "mid_diff"
  | "high_diff"
  | "extreme_diff";
export type SourceType = "manga" | "anime" | "databook" | "official" | "other";

export interface Profile {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  xp: number;
  rank: string;
  prediction_accuracy: number;
  created_at: string;
  updated_at: string;
}

export interface Anime {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface Character {
  id: string;
  anime_id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface CharacterForm {
  id: string;
  character_id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  power_score: number | null;
  speed_score: number | null;
  durability_score: number | null;
  iq_score: number | null;
  battle_iq_score: number | null;
  hax_score: number | null;
  stamina_score: number | null;
  experience_score: number | null;
  is_default: boolean;
  created_at: string;
}

export interface Battle {
  id: string;
  slug: string;
  fighter_a_form_id: string;
  fighter_b_form_id: string;
  status: "draft" | "published" | "archived";
  created_by: string | null;
  vote_a_count: number;
  vote_b_count: number;
  draw_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface BattleVote {
  id: string;
  battle_id: string;
  user_id: string;
  fighter_choice: FighterChoice;
  difficulty: DifficultyLevel | null;
  created_at: string;
}

export interface Argument {
  id: string;
  battle_id: string;
  user_id: string;
  content: string;
  fighter_choice: FighterChoice;
  upvotes: number;
  downvotes: number;
  is_removed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TierList {
  id: string;
  user_id: string;
  anime_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  visibility: Visibility;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

// Minimal Database generic so createBrowserClient<Database>/createServerClient<Database>
// type-check. Extend per-table `Row`/`Insert`/`Update` shapes as features are built.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      anime: { Row: Anime; Insert: Partial<Anime>; Update: Partial<Anime> };
      characters: { Row: Character; Insert: Partial<Character>; Update: Partial<Character> };
      character_forms: { Row: CharacterForm; Insert: Partial<CharacterForm>; Update: Partial<CharacterForm> };
      battles: { Row: Battle; Insert: Partial<Battle>; Update: Partial<Battle> };
      battle_votes: { Row: BattleVote; Insert: Partial<BattleVote>; Update: Partial<BattleVote> };
      arguments: { Row: Argument; Insert: Partial<Argument>; Update: Partial<Argument> };
      tier_lists: { Row: TierList; Insert: Partial<TierList>; Update: Partial<TierList> };
    };
  };
}
