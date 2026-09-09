"use client";

import type { CSSProperties } from "react";
import { cellKey } from "@/lib/crossword/puzzleUtils";
import type { CellPosition, CrosswordPuzzle } from "@/lib/crossword/types";

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  values?: Record<string, string>;
  selectedCell?: CellPosition | null;
  activeCells?: CellPosition[];
  incorrectCells?: string[];
  revealedCells?: string[];
  showSolution?: boolean;
  mode?: "play" | "layout" | "answers" | "clues";
  onCellClick?: (position: CellPosition) => void;
  onCellPointerEnter?: (position: CellPosition, event: React.PointerEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function CrosswordGrid({
  puzzle, values = {}, selectedCell, activeCells = [], incorrectCells = [], revealedCells = [],
  showSolution = false, mode = "play", onCellClick, onCellPointerEnter, onKeyDown,
}: CrosswordGridProps) {
  const active = new Set(activeCells.map((cell) => cellKey(cell.row, cell.col)));
  const incorrect = new Set(incorrectCells);
  const revealed = new Set(revealedCells);
  return (
    <div
      className="w-full select-none outline-none focus-visible:ring-4 focus-visible:ring-saffron/50"
      style={{ maxWidth: `min(100%, ${Math.max(360, puzzle.width * 54)}px)` }}
      role="grid"
      aria-label={`${puzzle.width} by ${puzzle.height} crossword grid`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div
        className="grid border-[2px] border-ink bg-ink"
        style={{ gridTemplateColumns: `repeat(${puzzle.width}, minmax(0, 1fr))`, aspectRatio: `${puzzle.width} / ${puzzle.height}` } as CSSProperties}
      >
        {puzzle.cells.map((cell) => {
          const key = cellKey(cell.row, cell.col);
          const selected = selectedCell?.row === cell.row && selectedCell.col === cell.col;
          const letter = showSolution || mode === "answers" || mode === "clues" ? cell.solution : values[key] ?? "";
          const stateClass = cell.blocked
            ? "bg-ink text-white"
            : incorrect.has(key)
              ? "bg-red-100 text-rust after:absolute after:bottom-1 after:right-1 after:h-1.5 after:w-1.5 after:rounded-full after:bg-rust"
              : selected
                ? "bg-saffron"
                : active.has(key)
                  ? "bg-sky"
                  : "bg-white hover:bg-canvas";
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              disabled={cell.blocked && mode !== "layout"}
              className={`relative flex min-h-0 min-w-0 items-center justify-center border-b border-r border-black/70 p-0 outline-none transition-colors ${stateClass}`}
              aria-label={`Row ${cell.row + 1}, column ${cell.col + 1}${cell.number ? `, clue ${cell.number}` : ""}${cell.blocked ? ", blocked" : ""}`}
              aria-selected={selected}
              onClick={() => onCellClick?.({ row: cell.row, col: cell.col })}
              onPointerEnter={(event) => onCellPointerEnter?.({ row: cell.row, col: cell.col }, event)}
            >
              {!cell.blocked && cell.number && <span className="absolute left-[7%] top-[3%] text-[clamp(7px,1.6vw,12px)] font-semibold leading-none">{cell.number}</span>}
              {!cell.blocked && <span className="translate-y-[3%] text-[clamp(16px,5vw,34px)] font-medium uppercase leading-none">{letter}</span>}
              {!cell.blocked && revealed.has(key) && <span className="absolute bottom-[6%] right-[7%] h-1.5 w-1.5 rounded-full border border-ink bg-white" title="Revealed" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
