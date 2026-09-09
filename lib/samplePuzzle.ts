import { generateClues } from "./crossword/engine";
import type { CrosswordCell, CrosswordPuzzle } from "./crossword/types";

const rows = ["CAT", "ARE", "TEN"];
const cells: CrosswordCell[] = rows.flatMap((row, rowIndex) => [...row].map((letter, colIndex) => ({
  row: rowIndex,
  col: colIndex,
  blocked: letter === "#",
  solution: letter === "#" ? "" : letter,
})));
const derived = generateClues({ width: 7, height: 7, cells });
const clueText: Record<string, string> = {
  "across-0-0": "Companion known to purr", "across-1-0": "Exist, for more than one",
  "across-2-0": "A perfect score, sometimes", "down-0-0": "Pet with whiskers",
  "down-0-1": "Measure of land", "down-0-2": "Number after nine",
};

export const samplePuzzle: CrosswordPuzzle = {
  id: "sample-the-inkling",
  title: "Small Talk",
  author: "Crossly Studio",
  description: "A tiny, friendly warm-up for your coffee break.",
  width: 3,
  height: 3,
  cells: derived.cells,
  clues: {
    across: derived.clues.across.map((clue) => ({ ...clue, clue: clueText[clue.id] ?? "" })),
    down: derived.clues.down.map((clue) => ({ ...clue, clue: clueText[clue.id] ?? "" })),
  },
  createdAt: "2025-01-01T00:00:00.000Z",
};
