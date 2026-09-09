import "server-only";
import { generateClues } from "@/lib/crossword/engine";
import type { CrosswordPuzzle } from "@/lib/crossword/types";
import { isCrosswordPuzzle } from "@/lib/crossword/validation";
import type { PublishedPuzzleRow } from "@/lib/publication";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

export type PublishedPuzzleResult =
  | { status: "ok"; puzzle: CrosswordPuzzle }
  | { status: "not-found" }
  | { status: "not-configured" }
  | { status: "error" };

export async function getPublishedPuzzle(slug: string): Promise<PublishedPuzzleResult> {
  if (!isSupabaseConfigured()) return { status: "not-configured" };
  if (!/^[A-Za-z0-9_-]{4,20}$/.test(slug)) return { status: "not-found" };

  const { data, error } = await getSupabaseClient()
    .from("puzzles")
    .select("id,slug,title,author,description,width,height,puzzle_data,visibility,created_at,updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return { status: "error" };
  if (!data) return { status: "not-found" };
  const row = data as PublishedPuzzleRow;
  const source = row.puzzle_data;
  if (!isCrosswordPuzzle(source)) return { status: "error" };
  const derived = generateClues(source, source.clues);
  return {
    status: "ok",
    puzzle: {
      ...source,
      id: row.id,
      title: row.title,
      author: row.author ?? undefined,
      description: row.description ?? undefined,
      width: row.width,
      height: row.height,
      cells: derived.cells,
      clues: derived.clues,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
  };
}
