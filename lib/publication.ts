import type { CrosswordPuzzle } from "./crossword/types";

export type PuzzleVisibility = "unlisted" | "public";

export interface PuzzlePublication {
  id: string;
  slug: string;
  editToken: string;
  visibility: PuzzleVisibility;
}

export interface PublishedPuzzleRow {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  description: string | null;
  width: number;
  height: number;
  puzzle_data: CrosswordPuzzle;
  visibility: PuzzleVisibility;
  created_at: string;
  updated_at: string;
}

export function makeEditToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
