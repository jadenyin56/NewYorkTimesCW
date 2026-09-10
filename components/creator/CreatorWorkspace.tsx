"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Info } from "lucide-react";
import { CrosswordGrid } from "@/components/crossword/CrosswordGrid";
import { AppHeader } from "@/components/layout/AppHeader";
import { PlayerView } from "@/components/player/PlayerView";
import { activeClueForCell, adjacentInClue, cluesForCell, generateClues, moveInGrid } from "@/lib/crossword/engine";
import { createBlankCells, getCell, makeId, resizeCells, sanitizeLetter } from "@/lib/crossword/puzzleUtils";
import type { CellPosition, CrosswordClue, CrosswordPuzzle, Direction, ValidationIssue } from "@/lib/crossword/types";
import { isCrosswordPuzzle, validatePuzzle } from "@/lib/crossword/validation";
import type { PuzzlePublication, PuzzleVisibility } from "@/lib/publication";
import { loadPublication, loadPuzzle, savePublication, savePuzzle } from "@/lib/storage";
import { ClueEditor } from "./ClueEditor";
import { AIAssistDialog, type AIGeneratedGrid } from "./AIAssistDialog";
import { CreatorToolbar, type CreatorMode } from "./CreatorToolbar";
import { GridSettings } from "./GridSettings";
import { PublishDialog } from "./PublishDialog";
import { ValidationPanel } from "./ValidationPanel";

function blankPuzzle(): CrosswordPuzzle {
  const width = 7;
  const height = 7;
  const derived = generateClues({ width, height, cells: createBlankCells(width, height) });
  return { id: makeId(), title: "Untitled Crossword", author: "", description: "", width, height, cells: derived.cells, clues: derived.clues, createdAt: new Date().toISOString() };
}

export function CreatorWorkspace() {
  const searchParams = useSearchParams();
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle>(blankPuzzle);
  const [mode, setMode] = useState<CreatorMode>("layout");
  const [selected, setSelected] = useState<CellPosition | null>({ row: 0, col: 0 });
  const [direction, setDirection] = useState<Direction>("across");
  const [symmetry, setSymmetry] = useState(true);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [publication, setPublication] = useState<PuzzlePublication | null>(null);
  const [visibility, setVisibility] = useState<PuzzleVisibility>("unlisted");
  const [publishing, setPublishing] = useState(false);
  const [publishDialog, setPublishDialog] = useState<{ link: string; updated: boolean } | null>(null);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [suggestingClueId, setSuggestingClueId] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const editId = searchParams.get("id");
    if (editId) {
      const saved = loadPuzzle(editId);
      if (saved) {
        setPuzzle(saved);
        const published = loadPublication(saved.id);
        setPublication(published);
        if (published) setVisibility(published.visibility);
      }
      return;
    }
    const theme = searchParams.get("theme")?.trim().slice(0, 80);
    if (theme) setPuzzle((current) => ({ ...current, title: theme, description: `A themed crossword about ${theme}.` }));
  }, [searchParams]);

  const activeClue = useMemo(() => activeClueForCell(puzzle, selected, direction), [puzzle, selected, direction]);
  const issues = useMemo(() => validatePuzzle(puzzle), [puzzle]);

  function updateStructure(cells: CrosswordPuzzle["cells"], width = puzzle.width, height = puzzle.height) {
    const derived = generateClues({ width, height, cells }, puzzle.clues);
    setPuzzle((current) => ({ ...current, width, height, cells: derived.cells, clues: derived.clues, updatedAt: new Date().toISOString() }));
  }

  function toggleBlock(position: CellPosition) {
    const target = getCell(puzzle, position.row, position.col);
    if (!target) return;
    const keys = new Set([`${position.row}-${position.col}`]);
    if (symmetry) keys.add(`${puzzle.height - position.row - 1}-${puzzle.width - position.col - 1}`);
    const cells = puzzle.cells.map((cell) => keys.has(`${cell.row}-${cell.col}`) ? { ...cell, blocked: !target.blocked, solution: "" } : cell);
    updateStructure(cells);
  }

  function chooseCell(position: CellPosition) {
    if (mode === "layout") { toggleBlock(position); return; }
    const cell = getCell(puzzle, position.row, position.col);
    if (!cell || cell.blocked) return;
    if (selected?.row === position.row && selected.col === position.col) {
      const available = cluesForCell(puzzle, position);
      if (available.across && available.down) setDirection((current) => current === "across" ? "down" : "across");
    } else {
      const available = cluesForCell(puzzle, position);
      if (!available[direction]) setDirection(available.across ? "across" : "down");
      setSelected(position);
    }
  }

  function enterLetter(letter: string) {
    if (!selected || !activeClue) return;
    const clean = sanitizeLetter(letter);
    if (!clean) return;
    const cells = puzzle.cells.map((cell) => cell.row === selected.row && cell.col === selected.col ? { ...cell, solution: clean } : cell);
    updateStructure(cells);
    setSelected(adjacentInClue(activeClue, selected, 1));
  }

  function handleGridKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (mode === "layout" || !selected) return;
    if (/^[a-zA-Z]$/.test(event.key)) { event.preventDefault(); enterLetter(event.key); return; }
    if (event.key === "Backspace") {
      event.preventDefault();
      const current = getCell(puzzle, selected.row, selected.col);
      const position = current?.solution || !activeClue ? selected : adjacentInClue(activeClue, selected, -1);
      const cells = puzzle.cells.map((cell) => cell.row === position.row && cell.col === position.col ? { ...cell, solution: "" } : cell);
      updateStructure(cells); setSelected(position); return;
    }
    const arrows: Record<string, [number, number, Direction]> = { ArrowRight: [0, 1, "across"], ArrowLeft: [0, -1, "across"], ArrowDown: [1, 0, "down"], ArrowUp: [-1, 0, "down"] };
    if (arrows[event.key]) { event.preventDefault(); const [dr, dc, nextDirection] = arrows[event.key]; setDirection(nextDirection); setSelected(moveInGrid(puzzle, selected, dr, dc)); }
    if (event.key === " ") { event.preventDefault(); const both = cluesForCell(puzzle, selected); if (both.across && both.down) setDirection((current) => current === "across" ? "down" : "across"); }
  }

  function resize(width: number, height: number) {
    const cells = resizeCells(puzzle.cells, puzzle.width, width, height);
    updateStructure(cells, width, height);
    setSelected({ row: 0, col: 0 });
  }

  function updateClue(id: string, value: string) {
    setPuzzle((current) => ({ ...current, clues: { across: current.clues.across.map((clue) => clue.id === id ? { ...clue, clue: value } : clue), down: current.clues.down.map((clue) => clue.id === id ? { ...clue, clue: value } : clue) } }));
  }

  function selectClue(clue: CrosswordClue) { setSelected(clue.cells[0]); setDirection(clue.direction); }

  function applyAIGeneratedGrid(grid: AIGeneratedGrid) {
    const width = grid.rows[0]?.length ?? puzzle.width;
    const height = grid.rows.length;
    const cells = grid.rows.flatMap((row, rowIndex) => [...row].map((value, colIndex) => ({
      row: rowIndex,
      col: colIndex,
      blocked: value === "#",
      solution: value === "#" ? "" : value,
    })));
    const derived = generateClues({ width, height, cells });
    setPuzzle((current) => ({
      ...current,
      title: grid.title,
      description: grid.description,
      width,
      height,
      cells: derived.cells,
      clues: derived.clues,
      updatedAt: new Date().toISOString(),
    }));
    const firstOpenCell = derived.cells.find((cell) => !cell.blocked);
    setSelected(firstOpenCell ? { row: firstOpenCell.row, col: firstOpenCell.col } : null);
    setDirection("across");
    setMode("clues");
    flash("AI grid generated — review the fill and add clues");
  }

  async function suggestClue(clue: CrosswordClue) {
    if (!clue.answer) return;
    if (clue.clue && !window.confirm(`Replace the current clue for ${clue.answer}?`)) return;
    setSuggestingClueId(clue.id);
    try {
      const response = await fetch("/api/ai/clue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: clue.answer,
          theme: [puzzle.title, puzzle.description].filter(Boolean).join(". "),
          direction: clue.direction,
        }),
      });
      const result = await response.json() as { clue?: string; error?: string };
      if (!response.ok || !result.clue) throw new Error(result.error || "The AI could not suggest a clue.");
      updateClue(clue.id, result.clue);
      selectClue(clue);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "The AI could not suggest a clue.");
    } finally {
      setSuggestingClueId(undefined);
    }
  }

  function flash(message: string) { setNotice(message); window.setTimeout(() => setNotice(null), 2400); }

  function save() { const stamped = { ...puzzle, updatedAt: new Date().toISOString() }; setPuzzle(stamped); savePuzzle(stamped); flash("Puzzle saved in this browser"); }

  function publishedLink(slug = publication?.slug) {
    return slug ? `${window.location.origin}/p/${slug}` : "";
  }

  async function copyPublishedLink() {
    const link = publishedLink();
    if (!link) return;
    try { await navigator.clipboard.writeText(link); flash("Share link copied"); }
    catch { window.prompt("Copy your puzzle link:", link); }
  }

  async function publish() {
    const serious = issues.filter((issue) => issue.severity === "error" || issue.id.startsWith("clue-"));
    if (serious.length) {
      flash(`Fix ${serious.length} serious ${serious.length === 1 ? "issue" : "issues"} before publishing`);
      visitIssue(serious[0]);
      return;
    }
    const wasUpdate = Boolean(publication);
    setPublishing(true);
    try {
      const response = await fetch("/api/puzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: wasUpdate ? "update" : "publish", puzzle, visibility, publishedId: publication?.id, editToken: publication?.editToken }),
      });
      const result = await response.json() as Partial<PuzzlePublication> & { error?: string };
      if (!response.ok || !result.id || !result.slug || !result.editToken) throw new Error(result.error || "Publishing failed. Please try again.");
      const next: PuzzlePublication = { id: result.id, slug: result.slug, editToken: result.editToken, visibility };
      setPublication(next);
      savePublication(puzzle.id, next);
      const stamped = { ...puzzle, updatedAt: new Date().toISOString() };
      setPuzzle(stamped);
      savePuzzle(stamped);
      setPublishDialog({ link: publishedLink(next.slug), updated: wasUpdate });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Publishing failed. Please try again.");
    } finally { setPublishing(false); }
  }

  function duplicate() {
    const copy: CrosswordPuzzle = { ...structuredClone(puzzle), id: makeId(), title: `${puzzle.title} Copy`, createdAt: new Date().toISOString(), updatedAt: undefined };
    setPuzzle(copy);
    setPublication(null);
    setVisibility("unlisted");
    savePuzzle(copy);
    window.history.replaceState(null, "", "/create");
    flash("Duplicate created as a new local draft");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(puzzle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `${puzzle.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "crossword"}.json`; anchor.click(); URL.revokeObjectURL(url);
  }

  async function importJson(file?: File) {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isCrosswordPuzzle(parsed)) throw new Error("That file is not a valid Crossly puzzle.");
      const derived = generateClues(parsed, parsed.clues);
      setPuzzle({ ...parsed, cells: derived.cells, clues: derived.clues, id: makeId(), createdAt: new Date().toISOString(), updatedAt: undefined });
      setPublication(null); setVisibility("unlisted"); setSelected({ row: 0, col: 0 }); flash("Puzzle imported as a new draft");
    } catch (error) { window.alert(error instanceof Error ? error.message : "Could not read that JSON file."); }
  }

  function visitIssue(issue: ValidationIssue) {
    if (issue.cell) { setSelected(issue.cell); setMode("answers"); }
    if (issue.clueId) { const clue = [...puzzle.clues.across, ...puzzle.clues.down].find((item) => item.id === issue.clueId); if (clue) { selectClue(clue); setMode("clues"); } }
  }

  if (preview) return <PlayerView puzzle={puzzle} preview onExitPreview={() => setPreview(false)} />;

  return (
    <main className="min-h-screen bg-paper">
      <AppHeader compact />
      <div className="page-shell py-6 sm:py-10">
        <Link href="/" className="mb-7 inline-flex items-center gap-2 text-xs font-semibold text-black/50 hover:text-ink"><ArrowLeft size={14} /> Back to home</Link>
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow mb-2">Crossword creator</p>
            <input aria-label="Puzzle title" value={puzzle.title} onChange={(event) => setPuzzle({ ...puzzle, title: event.target.value })} className="w-full bg-transparent font-serif text-4xl font-medium tracking-[-.03em] outline-none placeholder:text-black/25 sm:text-5xl" placeholder="Untitled Crossword" />
          </div>
          <label className="block text-xs font-semibold text-black/50 lg:mr-4">
            <span className="block">Made by</span>
            <input value={puzzle.author ?? ""} onChange={(event) => setPuzzle({ ...puzzle, author: event.target.value })} className="field mt-1 block lg:w-64" placeholder="Your name" />
          </label>
        </div>
        <CreatorToolbar
          mode={mode} onModeChange={setMode} onSave={save} onPreview={() => setPreview(true)} onExport={exportJson} onImport={() => fileInput.current?.click()}
          visibility={visibility} publication={publication} publishing={publishing} onVisibilityChange={setVisibility} onPublish={publish}
          onCopyLink={copyPublishedLink} onOpenPublished={() => window.open(publishedLink(), "_blank", "noopener,noreferrer")} onDuplicate={duplicate}
          onAIAssist={() => setShowAIAssist(true)}
        />
        <label className="mt-4 block text-xs font-semibold text-black/50">Description
          <textarea value={puzzle.description ?? ""} onChange={(event) => setPuzzle({ ...puzzle, description: event.target.value })} className="field mt-1 min-h-20 resize-y" maxLength={1000} placeholder="A short note for your solvers (optional)" />
        </label>
        <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(480px,680px)_1fr]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="eyebrow">{mode === "layout" ? "Click or drag to place blocks" : mode === "answers" ? "Type the completed grid" : "Select an entry to write its clue"}</p>
              <span className="font-mono text-xs text-black/40">{puzzle.width} × {puzzle.height}</span>
            </div>
            <CrosswordGrid puzzle={puzzle} selectedCell={selected} activeCells={activeClue?.cells} showSolution mode={mode} onCellClick={chooseCell} onCellPointerEnter={(position, event) => { if (mode === "layout" && event.buttons === 1) toggleBlock(position); }} onKeyDown={handleGridKey} />
            {activeClue && mode !== "layout" && <div className="mt-3 flex gap-3 bg-white px-4 py-3 text-sm"><strong>{activeClue.number} {activeClue.direction === "across" ? "Across" : "Down"}</strong><span className="text-black/55">{activeClue.clue || (mode === "clues" ? "Write this clue →" : "Clue not written yet")}</span></div>}
          </section>

          <aside className="min-w-0 border-t border-black/15 pt-7 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
            {mode === "layout" && <div className="space-y-8"><GridSettings width={puzzle.width} height={puzzle.height} symmetry={symmetry} onResize={resize} onSymmetryChange={setSymmetry} onReset={() => { if (window.confirm("Clear the entire grid?")) updateStructure(createBlankCells(puzzle.width, puzzle.height)); }} /><div className="flex gap-3 bg-sky/45 p-4 text-xs leading-5 text-black/65"><Info size={17} className="shrink-0" /><p>Start with the shape. Every white square should connect to another, and standard puzzles avoid one-letter entries.</p></div></div>}
            {mode === "answers" && <div><p className="eyebrow mb-4">Answer entry</p><h2 className="font-serif text-3xl">Fill every white square.</h2><p className="mt-3 max-w-md text-sm leading-6 text-black/55">Letters advance through the active word. Use arrow keys to move freely, Backspace to erase, and Space to switch direction at a crossing.</p><div className="mt-7"><ValidationPanel issues={issues.filter((issue) => issue.id.startsWith("blank") || issue.id.startsWith("invalid"))} onIssueClick={visitIssue} /></div></div>}
              {mode === "clues" && <ClueEditor puzzle={puzzle} activeClueId={activeClue?.id} suggestingClueId={suggestingClueId} onSelect={selectClue} onChange={updateClue} onSuggest={suggestClue} />}
          </aside>
        </div>

        <div className="mt-10 grid gap-4 border-t-2 border-ink pt-6 md:grid-cols-[1fr_auto] md:items-start">
          <ValidationPanel issues={issues} onIssueClick={visitIssue} />
          <div className="flex gap-2"><button className="button-secondary" onClick={() => setPreview(true)}>Preview</button><button className="button-primary" onClick={save}><Check size={16} /> Save puzzle</button></div>
        </div>
      </div>
      {notice && <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl"><Check size={16} className="text-saffron" />{notice}</div>}
      {publishDialog && <PublishDialog title={puzzle.title} link={publishDialog.link} updated={publishDialog.updated} onClose={() => setPublishDialog(null)} />}
      {showAIAssist && (
        <AIAssistDialog
          initialTheme={puzzle.title === "Untitled Crossword" ? "" : puzzle.title}
          initialWidth={puzzle.width}
          initialHeight={puzzle.height}
          onApply={applyAIGeneratedGrid}
          onClose={() => setShowAIAssist(false)}
        />
      )}
    </main>
  );
}
