import { createClient } from "@/lib/supabase/server";
import { gradientFor, initialsFor } from "@/lib/characters/appearance";

export type CharacterFormOption = {
  formId: string;
  name: string;
  formName: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
};

/** All published character forms for a given anime — used by the Tier List Builder's picker panel. */
export async function getCharacterFormsByAnime(
  animeId: string,
): Promise<CharacterFormOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("character_forms")
    .select("id, name, characters!inner ( name, anime_id, is_published )")
    .eq("characters.anime_id", animeId)
    .eq("characters.is_published", true);

  return (data ?? []).map((row: any) => {
    const characterName = row.characters?.name ?? row.name;
    return {
      formId: row.id,
      name: characterName,
      formName: row.name,
      initials: initialsFor(characterName),
      gradientFrom: gradientFor(row.id)[0],
      gradientTo: gradientFor(row.id)[1],
    };
  });
}
