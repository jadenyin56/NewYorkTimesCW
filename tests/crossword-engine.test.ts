import assert from "node:assert/strict";
import test from "node:test";
import { activeClueForCell, generateClues, moveInGrid } from "../lib/crossword/engine";
import { createBlankCells } from "../lib/crossword/puzzleUtils";
import { validatePuzzle } from "../lib/crossword/validation";
import type { CrosswordPuzzle } from "../lib/crossword/types";

test("numbers a grid top-to-bottom, left-to-right and shares crossing numbers", () => {
  const cells = createBlankCells(3, 3).map((cell) => ({ ...cell, solution: "A" }));
  const result = generateClues({ width: 3, height: 3, cells });
  assert.deepEqual(result.cells.map((cell) => cell.number), [1, 2, 3, 4, undefined, undefined, 5, undefined, undefined]);
  assert.deepEqual(result.clues.across.map((clue) => clue.number), [1, 4, 5]);
  assert.deepEqual(result.clues.down.map((clue) => clue.number), [1, 2, 3]);
});

test("supports rectangular grids and skips blocks when navigating", () => {
  const cells = createBlankCells(4, 3).map((cell) => ({ ...cell, solution: "A" }));
  cells[1] = { ...cells[1], blocked: true, solution: "" };
  const result = generateClues({ width: 4, height: 3, cells });
  const puzzle = { id: "test", title: "Test", width: 4, height: 3, ...result, author: "", description: "", createdAt: "" } satisfies CrosswordPuzzle;
  assert.deepEqual(moveInGrid(puzzle, { row: 0, col: 0 }, 0, 1), { row: 0, col: 2 });
  assert.equal(activeClueForCell(puzzle, { row: 1, col: 0 }, "down")?.direction, "down");
});

test("validation detects disconnected regions and one-letter entries", () => {
  const cells = createBlankCells(3, 3).map((cell) => ({ ...cell, blocked: true, solution: "" }));
  cells[0] = { ...cells[0], blocked: false, solution: "A" };
  cells[8] = { ...cells[8], blocked: false, solution: "B" };
  const result = generateClues({ width: 3, height: 3, cells });
  const puzzle = { id: "test", title: "Test", width: 3, height: 3, ...result, author: "", description: "", createdAt: "" } satisfies CrosswordPuzzle;
  const ids = validatePuzzle(puzzle).map((issue) => issue.id);
  assert.ok(ids.includes("disconnected"));
  assert.ok(ids.some((id) => id.startsWith("one-across")));
  assert.ok(ids.some((id) => id.startsWith("one-down")));
});
