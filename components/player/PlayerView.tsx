"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pause, Pencil } from "lucide-react";
import { ActiveClue } from "@/components/crossword/ActiveClue";
import { CrosswordClues } from "@/components/crossword/CrosswordClues";
import { CrosswordGrid } from "@/components/crossword/CrosswordGrid";
import { AppHeader } from "@/components/layout/AppHeader";
import { activeClueForCell, adjacentInClue, cluesForCell, moveInGrid, neighboringClue } from "@/lib/crossword/engine";
import { cellKey, getCell, sanitizeLetter } from "@/lib/crossword/puzzleUtils";
import type { CellPosition, CrosswordGameState, CrosswordPuzzle, Direction } from "@/lib/crossword/types";
import { clearGame, clearSharedGame, loadGame, loadSharedGame, saveGame, saveSharedGame } from "@/lib/storage";
import { CompletionModal } from "./CompletionModal";
import { PlayerToolbar } from "./PlayerToolbar";

type Scope = "square" | "word" | "puzzle";

function initialState(puzzle: CrosswordPuzzle): CrosswordGameState {
  const first = puzzle.cells.find((cell) => !cell.blocked);
  return { selectedCell: first ? { row: first.row, col: first.col } : null, direction: "across", values: {}, incorrectCells: [], revealedCells: [], elapsedSeconds: 0, completed: false, mistakes: 0 };
}

export function PlayerView({ puzzle, preview = false, onExitPreview, progressSlug }: { puzzle: CrosswordPuzzle; preview?: boolean; onExitPreview?: () => void; progressSlug?: string }) {
  const [game, setGame] = useState<CrosswordGameState>(() => initialState(puzzle));
  const [restored, setRestored] = useState(preview);
  const [paused, setPaused] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const activeClue = useMemo(() => activeClueForCell(puzzle, game.selectedCell, game.direction), [puzzle, game.selectedCell, game.direction]);

  useEffect(() => {
    if (!preview) {
      const saved = progressSlug ? loadSharedGame(progressSlug) : loadGame(puzzle.id);
      if (saved) setGame(saved);
      setRestored(true);
    }
  }, [preview, progressSlug, puzzle.id]);

  useEffect(() => {
    if (!restored || paused || game.completed) return;
    const timer = window.setInterval(() => setGame((current) => ({ ...current, elapsedSeconds: current.elapsedSeconds + 1 })), 1000);
    return () => window.clearInterval(timer);
  }, [restored, paused, game.completed]);

  useEffect(() => {
    if (preview || !restored) return;
    if (progressSlug) saveSharedGame(progressSlug, game);
    else saveGame(puzzle.id, game);
  }, [game, preview, progressSlug, puzzle.id, restored]);

  useEffect(() => {
    const playable = puzzle.cells.filter((cell) => !cell.blocked);
    if (!restored || !playable.length || game.completed) return;
    const solved = playable.every((cell) => game.values[cellKey(cell.row, cell.col)] === cell.solution);
    if (solved) { setGame((current) => ({ ...current, completed: true, incorrectCells: [] })); setShowCompletion(true); }
  }, [restored, game.values, game.completed, puzzle.cells]);

  function chooseCell(position: CellPosition) {
    if (paused) return;
    const cell = getCell(puzzle, position.row, position.col);
    if (!cell || cell.blocked) return;
    setGame((current) => {
      let direction = current.direction;
      const clues = cluesForCell(puzzle, position);
      if (current.selectedCell?.row === position.row && current.selectedCell.col === position.col && clues.across && clues.down) direction = direction === "across" ? "down" : "across";
      else if (!clues[direction]) direction = clues.across ? "across" : "down";
      return { ...current, selectedCell: position, direction };
    });
  }

  const enterLetter = useCallback((letter: string) => {
    if (!game.selectedCell || !activeClue || paused) return;
    const clean = sanitizeLetter(letter); if (!clean) return;
    const key = cellKey(game.selectedCell.row, game.selectedCell.col);
    const next = adjacentInClue(activeClue, game.selectedCell, 1);
    setGame((current) => ({ ...current, values: { ...current.values, [key]: clean }, selectedCell: next, incorrectCells: current.incorrectCells.filter((item) => item !== key) }));
  }, [activeClue, game.selectedCell, paused]);

  function handleKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (paused || !game.selectedCell) return;
    if (/^[a-zA-Z]$/.test(event.key)) { event.preventDefault(); enterLetter(event.key); return; }
    if (event.key === "Backspace") {
      event.preventDefault();
      const currentKey = cellKey(game.selectedCell.row, game.selectedCell.col);
      const position = game.values[currentKey] || !activeClue ? game.selectedCell : adjacentInClue(activeClue, game.selectedCell, -1);
      const key = cellKey(position.row, position.col);
      setGame((current) => { const values = { ...current.values }; delete values[key]; return { ...current, values, selectedCell: position, incorrectCells: current.incorrectCells.filter((item) => item !== key) }; }); return;
    }
    const arrows: Record<string, [number, number, Direction]> = { ArrowRight: [0, 1, "across"], ArrowLeft: [0, -1, "across"], ArrowDown: [1, 0, "down"], ArrowUp: [-1, 0, "down"] };
    if (arrows[event.key]) { event.preventDefault(); const [dr, dc, direction] = arrows[event.key]; setGame((current) => ({ ...current, direction, selectedCell: moveInGrid(puzzle, current.selectedCell!, dr, dc) })); return; }
    if (event.key === " ") { event.preventDefault(); const clues = cluesForCell(puzzle, game.selectedCell); if (clues.across && clues.down) setGame((current) => ({ ...current, direction: current.direction === "across" ? "down" : "across" })); return; }
    if (event.key === "Tab") { event.preventDefault(); const clue = neighboringClue(puzzle, activeClue, event.shiftKey ? -1 : 1); if (clue) setGame((current) => ({ ...current, direction: clue.direction, selectedCell: clue.cells[0] })); }
  }

  function keysForScope(scope: Scope) {
    if (scope === "puzzle") return puzzle.cells.filter((cell) => !cell.blocked).map((cell) => cellKey(cell.row, cell.col));
    if (scope === "word") return activeClue?.cells.map((cell) => cellKey(cell.row, cell.col)) ?? [];
    return game.selectedCell ? [cellKey(game.selectedCell.row, game.selectedCell.col)] : [];
  }

  function check(scope: Scope) {
    const keys = keysForScope(scope);
    const wrong = keys.filter((key) => { const [row, col] = key.split("-").map(Number); const value = game.values[key]; return Boolean(value && value !== getCell(puzzle, row, col)?.solution); });
    setGame((current) => ({ ...current, incorrectCells: [...new Set([...current.incorrectCells.filter((key) => !keys.includes(key)), ...wrong])], mistakes: current.mistakes + wrong.length }));
  }

  function reveal(scope: Scope) {
    if (scope === "puzzle" && !window.confirm("Reveal the entire puzzle? This will fill every answer.")) return;
    const keys = keysForScope(scope);
    setGame((current) => {
      const values = { ...current.values };
      for (const key of keys) { const [row, col] = key.split("-").map(Number); values[key] = getCell(puzzle, row, col)?.solution ?? ""; }
      return { ...current, values, revealedCells: [...new Set([...current.revealedCells, ...keys])], incorrectCells: current.incorrectCells.filter((key) => !keys.includes(key)) };
    });
  }

  function reset() {
    if (!window.confirm("Reset this puzzle? Your letters and timer will be cleared.")) return;
    if (progressSlug) clearSharedGame(progressSlug);
    else clearGame(puzzle.id);
    setGame(initialState(puzzle)); setPaused(false); setShowCompletion(false);
  }

  return (
    <main className="min-h-screen bg-paper">
      <AppHeader compact />
      <div className="page-shell py-6 sm:py-9">
        <div className="mb-5 flex items-center justify-between gap-4">
          {preview ? <button onClick={onExitPreview} className="inline-flex items-center gap-2 text-xs font-semibold text-black/55 hover:text-ink"><ArrowLeft size={14} /> Back to editing</button> : <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-black/55 hover:text-ink"><ArrowLeft size={14} /> All crosswords</Link>}
          {preview ? <span className="rounded bg-saffron/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Preview mode</span> : !progressSlug && <Link href={`/create?id=${puzzle.id}`} className="inline-flex items-center gap-2 text-xs font-semibold text-black/55 hover:text-ink"><Pencil size={13} /> Edit puzzle</Link>}
        </div>
        <header className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div><p className="eyebrow mb-2">Crossly puzzle</p><h1 className="font-serif text-4xl tracking-[-.03em] sm:text-5xl">{puzzle.title}</h1><p className="mt-2 text-sm text-black/50">By {puzzle.author || "Anonymous"}{puzzle.description ? ` · ${puzzle.description}` : ""}</p></div>
        </header>
        <div className="mt-6"><PlayerToolbar seconds={game.elapsedSeconds} paused={paused} onPause={() => setPaused((value) => !value)} onCheck={check} onReveal={reveal} onReset={reset} /></div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(390px,650px)_1fr] xl:gap-12">
          <section className="relative">
            <CrosswordGrid puzzle={puzzle} values={game.values} selectedCell={game.selectedCell} activeCells={activeClue?.cells} incorrectCells={game.incorrectCells} revealedCells={game.revealedCells} onCellClick={chooseCell} onKeyDown={handleKey} />
            {paused && <button type="button" onClick={() => setPaused(false)} className="absolute inset-0 grid w-full place-items-center bg-paper/95 text-center backdrop-blur-sm"><span><Pause className="mx-auto mb-3" size={30} /><strong className="block font-serif text-3xl">Puzzle paused</strong><small className="mt-2 block text-black/50">Click to resume</small></span></button>}
            <div className="mt-4 lg:hidden"><ActiveClue clue={activeClue} /></div>
          </section>
          <aside className="min-w-0"><div className="mb-5 hidden lg:block"><ActiveClue clue={activeClue} /></div><CrosswordClues puzzle={puzzle} activeClueId={activeClue?.id} onClueClick={(clue) => setGame((current) => ({ ...current, direction: clue.direction, selectedCell: clue.cells[0] }))} /></aside>
        </div>
      </div>
      {showCompletion && <CompletionModal title={puzzle.title} seconds={game.elapsedSeconds} mistakes={game.mistakes} onClose={() => setShowCompletion(false)} />}
    </main>
  );
}
