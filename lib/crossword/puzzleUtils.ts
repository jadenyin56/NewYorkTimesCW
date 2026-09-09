import type { CellPosition, CrosswordCell, CrosswordPuzzle } from "./types";

export const cellKey = (row: number, col: number) => `${row}-${col}`;

export function getCell(puzzle: Pick<CrosswordPuzzle, "cells" | "width">, row: number, col: number) {
  if (row < 0 || col < 0 || col >= puzzle.width) return undefined;
  return puzzle.cells[row * puzzle.width + col];
}

export function isSameCell(a: CellPosition | null, b: CellPosition | null) {
  return Boolean(a && b && a.row === b.row && a.col === b.col);
}

export function makeId(prefix = "puzzle") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createBlankCells(width: number, height: number): CrosswordCell[] {
  return Array.from({ length: width * height }, (_, index) => ({
    row: Math.floor(index / width),
    col: index % width,
    blocked: false,
    solution: "",
  }));
}

export function resizeCells(cells: CrosswordCell[], oldWidth: number, width: number, height: number) {
  const byPosition = new Map(cells.map((cell) => [cellKey(cell.row, cell.col), cell]));
  return Array.from({ length: width * height }, (_, index) => {
    const row = Math.floor(index / width);
    const col = index % width;
    const prior = row * oldWidth + col < cells.length ? byPosition.get(cellKey(row, col)) : undefined;
    return { row, col, blocked: prior?.blocked ?? false, solution: prior?.solution ?? "" };
  });
}

export function sanitizeLetter(value: string) {
  return value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
}
