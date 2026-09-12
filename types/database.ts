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

export type Profile = {
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
};

export type Anime = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_published: boolean;
  created_at: string;
};

export type Character = {
  id: string;
  anime_id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
};

export type CharacterForm = {
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
};

export type Battle = {
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
};

export type BattleVote = {
  id: string;
  battle_id: string;
  user_id: string;
  fighter_choice: FighterChoice;
  difficulty: DifficultyLevel | null;
  created_at: string;
};

export type Argument = {
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
};

export type TierList = {
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
};

// Minimal Database generic so createBrowserClient<Database>/createServerClient<Database>
// type-check. Extend per-table `Row`/`Insert`/`Update` shapes as features are built.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      anime: {
        Row: Anime;
        Insert: Partial<Anime>;
        Update: Partial<Anime>;
        Relationships: [];
      };
      characters: {
        Row: Character;
        Insert: Partial<Character>;
        Update: Partial<Character>;
        Relationships: [
          {
            foreignKeyName: "characters_anime_id_fkey";
            columns: ["anime_id"];
            referencedRelation: "anime";
            referencedColumns: ["id"];
          },
        ];
      };
      character_forms: {
        Row: CharacterForm;
        Insert: Partial<CharacterForm>;
        Update: Partial<CharacterForm>;
        Relationships: [
          {
            foreignKeyName: "character_forms_character_id_fkey";
            columns: ["character_id"];
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
        ];
      };
      battles: {
        Row: Battle;
        Insert: Partial<Battle>;
        Update: Partial<Battle>;
        Relationships: [
          {
            foreignKeyName: "battles_fighter_a_form_id_fkey";
            columns: ["fighter_a_form_id"];
            referencedRelation: "character_forms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "battles_fighter_b_form_id_fkey";
            columns: ["fighter_b_form_id"];
            referencedRelation: "character_forms";
            referencedColumns: ["id"];
          },
        ];
      };
      battle_votes: {
        Row: BattleVote;
        Insert: Partial<BattleVote>;
        Update: Partial<BattleVote>;
        Relationships: [];
      };
      argument_votes: {
        Row: { id: string; argument_id: string; user_id: string; vote: 1 | -1; created_at: string };
        Insert: { argument_id: string; user_id: string; vote: 1 | -1 };
        Update: Partial<{ vote: 1 | -1 }>;
        Relationships: [];
      };
      battle_conditions: {
        Row: {
          battle_id: string;
          location: string | null;
          distance: string | null;
          knowledge: string | null;
          prep_time: string | null;
          speed_equalized: boolean;
          verse_equalized: boolean;
          special_rules: string | null;
        };
        Insert: { battle_id: string; [key: string]: unknown };
        Update: Partial<{ [key: string]: unknown }>;
        Relationships: [
          {
            foreignKeyName: "battle_conditions_battle_id_fkey";
            columns: ["battle_id"];
            isOneToOne: true;
            referencedRelation: "battles";
            referencedColumns: ["id"];
          },
        ];
      };
      arguments: {
        Row: Argument;
        Insert: Partial<Argument>;
        Update: Partial<Argument>;
        Relationships: [
          {
            foreignKeyName: "arguments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      tier_lists: {
        Row: TierList;
        Insert: Partial<TierList>;
        Update: Partial<TierList>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
