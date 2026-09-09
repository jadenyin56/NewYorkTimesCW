import { cellKey, getCell } from "./puzzleUtils";
import type { CellPosition, CrosswordCell, CrosswordClue, CrosswordPuzzle, Direction } from "./types";

type PuzzleGrid = Pick<CrosswordPuzzle, "width" | "height" | "cells">;

function beginsAcross(grid: PuzzleGrid, cell: CrosswordCell) {
  if (cell.blocked) return false;
  const boundary = cell.col === 0 || getCell(grid, cell.row, cell.col - 1)?.blocked;
  const hasNext = cell.col + 1 < grid.width && !getCell(grid, cell.row, cell.col + 1)?.blocked;
  return Boolean(boundary && hasNext);
}

function beginsDown(grid: PuzzleGrid, cell: CrosswordCell) {
  if (cell.blocked) return false;
  const boundary = cell.row === 0 || getCell(grid, cell.row - 1, cell.col)?.blocked;
  const hasNext = cell.row + 1 < grid.height && !getCell(grid, cell.row + 1, cell.col)?.blocked;
  return Boolean(boundary && hasNext);
}

export function numberCells(grid: PuzzleGrid): CrosswordCell[] {
  let number = 1;
  return grid.cells.map((cell) => {
    const numbered = beginsAcross(grid, cell) || beginsDown(grid, cell);
    return { ...cell, number: numbered ? number++ : undefined };
  });
}

function collectWord(grid: PuzzleGrid, start: CrosswordCell, direction: Direction) {
  const cells: CellPosition[] = [];
  let row = start.row;
  let col = start.col;
  while (row < grid.height && col < grid.width) {
    const cell = getCell(grid, row, col);
    if (!cell || cell.blocked) break;
    cells.push({ row, col });
    if (direction === "across") col++;
    else row++;
  }
  return cells;
}

export function generateClues(
  grid: PuzzleGrid,
  previous?: CrosswordPuzzle["clues"],
): { cells: CrosswordCell[]; clues: CrosswordPuzzle["clues"] } {
  const numberedCells = numberCells(grid);
  const numberedGrid = { ...grid, cells: numberedCells };
  const previousText = new Map<string, string>();
  for (const clue of [...(previous?.across ?? []), ...(previous?.down ?? [])]) {
    previousText.set(`${clue.direction}-${clue.startRow}-${clue.startCol}`, clue.clue);
  }
  const clues: CrosswordPuzzle["clues"] = { across: [], down: [] };

  for (const cell of numberedCells) {
    for (const direction of ["across", "down"] as const) {
      const begins = direction === "across" ? beginsAcross(numberedGrid, cell) : beginsDown(numberedGrid, cell);
      if (!begins || !cell.number) continue;
      const wordCells = collectWord(numberedGrid, cell, direction);
      const key = `${direction}-${cell.row}-${cell.col}`;
      const clue: CrosswordClue = {
        id: key,
        number: cell.number,
        direction,
        clue: previousText.get(key) ?? "",
        answer: wordCells.map(({ row, col }) => getCell(numberedGrid, row, col)?.solution || "").join(""),
        startRow: cell.row,
        startCol: cell.col,
        cells: wordCells,
      };
      clues[direction].push(clue);
    }
  }
  return { cells: numberedCells, clues };
}

export function hydratePuzzle(puzzle: CrosswordPuzzle): CrosswordPuzzle {
  const { cells, clues } = generateClues(puzzle, puzzle.clues);
  return { ...puzzle, cells, clues };
}

export function cluesForCell(puzzle: CrosswordPuzzle, position: CellPosition) {
  return {
    across: puzzle.clues.across.find((clue) => clue.cells.some((cell) => cell.row === position.row && cell.col === position.col)),
    down: puzzle.clues.down.find((clue) => clue.cells.some((cell) => cell.row === position.row && cell.col === position.col)),
  };
}

export function activeClueForCell(puzzle: CrosswordPuzzle, position: CellPosition | null, direction: Direction) {
  if (!position) return undefined;
  const matches = cluesForCell(puzzle, position);
  return matches[direction] ?? matches[direction === "across" ? "down" : "across"];
}

export function moveInGrid(puzzle: CrosswordPuzzle, from: CellPosition, rowDelta: number, colDelta: number) {
  let row = from.row + rowDelta;
  let col = from.col + colDelta;
  while (row >= 0 && col >= 0 && row < puzzle.height && col < puzzle.width) {
    const cell = getCell(puzzle, row, col);
    if (cell && !cell.blocked) return { row, col };
    row += rowDelta;
    col += colDelta;
  }
  return from;
}

export function adjacentInClue(clue: CrosswordClue, current: CellPosition, offset: -1 | 1) {
  const index = clue.cells.findIndex((cell) => cellKey(cell.row, cell.col) === cellKey(current.row, current.col));
  if (index < 0) return current;
  return clue.cells[Math.max(0, Math.min(clue.cells.length - 1, index + offset))];
}

export function neighboringClue(puzzle: CrosswordPuzzle, current: CrosswordClue | undefined, offset: -1 | 1) {
  const ordered = [...puzzle.clues.across, ...puzzle.clues.down];
  if (!ordered.length) return undefined;
  const index = current ? ordered.findIndex((clue) => clue.id === current.id) : -1;
  return ordered[(index + offset + ordered.length) % ordered.length];
}
