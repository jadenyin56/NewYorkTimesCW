import { cellKey, getCell } from "./puzzleUtils";
import type { CrosswordPuzzle, ValidationIssue } from "./types";

export function validatePuzzle(puzzle: CrosswordPuzzle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!puzzle.title.trim()) issues.push({ id: "title", severity: "error", message: "Give your puzzle a title." });

  const whiteCells = puzzle.cells.filter((cell) => !cell.blocked);
  for (const cell of whiteCells) {
    if (!cell.solution) {
      issues.push({ id: `blank-${cellKey(cell.row, cell.col)}`, severity: "error", message: `Cell R${cell.row + 1}C${cell.col + 1} has no answer letter.`, cell });
    } else if (!/^[A-Z]$/.test(cell.solution)) {
      issues.push({ id: `invalid-${cellKey(cell.row, cell.col)}`, severity: "error", message: `Cell R${cell.row + 1}C${cell.col + 1} contains an invalid character.`, cell });
    }
    const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dr, dc]) => {
      const neighbor = getCell(puzzle, cell.row + dr, cell.col + dc);
      return neighbor && !neighbor.blocked;
    });
    if (!neighbors) issues.push({ id: `isolated-${cellKey(cell.row, cell.col)}`, severity: "error", message: `Cell R${cell.row + 1}C${cell.col + 1} is isolated.`, cell });

    const horizontalLengthOne = (cell.col === 0 || getCell(puzzle, cell.row, cell.col - 1)?.blocked) &&
      (cell.col === puzzle.width - 1 || getCell(puzzle, cell.row, cell.col + 1)?.blocked);
    const verticalLengthOne = (cell.row === 0 || getCell(puzzle, cell.row - 1, cell.col)?.blocked) &&
      (cell.row === puzzle.height - 1 || getCell(puzzle, cell.row + 1, cell.col)?.blocked);
    if (horizontalLengthOne) issues.push({ id: `one-across-${cellKey(cell.row, cell.col)}`, severity: "error", message: `Cell R${cell.row + 1}C${cell.col + 1} creates a one-letter Across entry.`, cell });
    if (verticalLengthOne) issues.push({ id: `one-down-${cellKey(cell.row, cell.col)}`, severity: "error", message: `Cell R${cell.row + 1}C${cell.col + 1} creates a one-letter Down entry.`, cell });
  }

  for (const clue of [...puzzle.clues.across, ...puzzle.clues.down]) {
    if (!clue.clue.trim()) issues.push({ id: `clue-${clue.id}`, severity: "warning", message: `${clue.number} ${clue.direction === "across" ? "Across" : "Down"} needs a clue.`, clueId: clue.id });
  }

  if (whiteCells.length) {
    const seen = new Set<string>();
    const queue = [{ row: whiteCells[0].row, col: whiteCells[0].col }];
    while (queue.length) {
      const current = queue.shift()!;
      const key = cellKey(current.row, current.col);
      if (seen.has(key)) continue;
      seen.add(key);
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const next = getCell(puzzle, current.row + dr, current.col + dc);
        if (next && !next.blocked && !seen.has(cellKey(next.row, next.col))) queue.push(next);
      }
    }
    if (seen.size !== whiteCells.length) issues.push({ id: "disconnected", severity: "error", message: "The white squares are split into disconnected regions." });
  }

  if (!whiteCells.length) issues.push({ id: "empty-grid", severity: "error", message: "The grid has no playable squares." });
  return issues;
}

export function isCrosswordPuzzle(value: unknown): value is CrosswordPuzzle {
  if (!value || typeof value !== "object") return false;
  const puzzle = value as Partial<CrosswordPuzzle>;
  if (typeof puzzle.id !== "string" || typeof puzzle.title !== "string") return false;
  if (!Number.isInteger(puzzle.width) || !Number.isInteger(puzzle.height)) return false;
  if ((puzzle.width ?? 0) < 2 || (puzzle.width ?? 0) > 30 || (puzzle.height ?? 0) < 2 || (puzzle.height ?? 0) > 30) return false;
  if (!puzzle.clues || !Array.isArray(puzzle.clues.across) || !Array.isArray(puzzle.clues.down)) return false;
  const validClues = [...puzzle.clues.across, ...puzzle.clues.down].every((clue) => clue && typeof clue === "object" && typeof clue.clue === "string" && (clue.direction === "across" || clue.direction === "down") && typeof clue.startRow === "number" && typeof clue.startCol === "number");
  if (!validClues) return false;
  return Array.isArray(puzzle.cells) && puzzle.cells.length === puzzle.width! * puzzle.height! && puzzle.cells.every((cell) =>
    cell && typeof cell.row === "number" && typeof cell.col === "number" && typeof cell.blocked === "boolean" && typeof cell.solution === "string",
  );
}
