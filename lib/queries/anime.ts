import { createClient } from "@/lib/supabase/server";

export type AnimeOption = { id: string; slug: string; name: string };

export async function getPublishedAnime(): Promise<AnimeOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("anime")
    .select("id, slug, name")
    .eq("is_published", true)
    .order("name");
  return data ?? [];
}
