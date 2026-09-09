import type { CrosswordGameState, CrosswordPuzzle } from "./crossword/types";
import type { PuzzlePublication } from "./publication";

const PUZZLES_KEY = "crossly:puzzles";
const gameKey = (id: string) => `crossly:game:${id}`;
const publicationKey = (id: string) => `crossly:publication:${id}`;
const sharedGameKey = (slug: string) => `crossword-progress-${slug}`;

function available() { return typeof window !== "undefined"; }

export function getSavedPuzzles(): CrosswordPuzzle[] {
  if (!available()) return [];
  try { return JSON.parse(localStorage.getItem(PUZZLES_KEY) ?? "[]") as CrosswordPuzzle[]; } catch { return []; }
}

export function savePuzzle(puzzle: CrosswordPuzzle) {
  const puzzles = getSavedPuzzles();
  const next = [puzzle, ...puzzles.filter((item) => item.id !== puzzle.id)];
  localStorage.setItem(PUZZLES_KEY, JSON.stringify(next));
}

export function loadPuzzle(id: string) { return getSavedPuzzles().find((puzzle) => puzzle.id === id); }

export function deletePuzzle(id: string) {
  localStorage.setItem(PUZZLES_KEY, JSON.stringify(getSavedPuzzles().filter((puzzle) => puzzle.id !== id)));
  localStorage.removeItem(gameKey(id));
}

export function saveGame(id: string, state: CrosswordGameState) {
  if (available()) localStorage.setItem(gameKey(id), JSON.stringify(state));
}

export function loadGame(id: string): CrosswordGameState | null {
  if (!available()) return null;
  try { return JSON.parse(localStorage.getItem(gameKey(id)) ?? "null") as CrosswordGameState | null; } catch { return null; }
}

export function clearGame(id: string) { if (available()) localStorage.removeItem(gameKey(id)); }

export function saveSharedGame(slug: string, state: CrosswordGameState) {
  if (available()) localStorage.setItem(sharedGameKey(slug), JSON.stringify({ ...state, lastPlayedAt: new Date().toISOString() }));
}

export function loadSharedGame(slug: string): CrosswordGameState | null {
  if (!available()) return null;
  try { return JSON.parse(localStorage.getItem(sharedGameKey(slug)) ?? "null") as CrosswordGameState | null; } catch { return null; }
}

export function clearSharedGame(slug: string) { if (available()) localStorage.removeItem(sharedGameKey(slug)); }

export function savePublication(localPuzzleId: string, publication: PuzzlePublication) {
  if (available()) localStorage.setItem(publicationKey(localPuzzleId), JSON.stringify(publication));
}

export function loadPublication(localPuzzleId: string): PuzzlePublication | null {
  if (!available()) return null;
  try { return JSON.parse(localStorage.getItem(publicationKey(localPuzzleId)) ?? "null") as PuzzlePublication | null; } catch { return null; }
}

export function deletePublication(localPuzzleId: string) { if (available()) localStorage.removeItem(publicationKey(localPuzzleId)); }
