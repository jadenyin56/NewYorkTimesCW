"use client";

import type { CrosswordClue, CrosswordPuzzle } from "@/lib/crossword/types";

interface Props { puzzle: CrosswordPuzzle; activeClueId?: string; onSelect: (clue: CrosswordClue) => void; onChange: (clueId: string, value: string) => void; }

function DirectionEditor({ title, clues, activeClueId, onSelect, onChange }: { title: string; clues: CrosswordClue[]; activeClueId?: string; onSelect: (clue: CrosswordClue) => void; onChange: (id: string, value: string) => void }) {
  return (
    <section>
      <h2 className="mb-4 border-b-2 border-ink pb-2 text-xs font-bold uppercase tracking-[.18em]">{title} <span className="float-right text-black/35">{clues.length}</span></h2>
      <div className="space-y-3">
        {clues.map((clue) => (
          <label key={clue.id} className={`block border-l-[3px] py-1 pl-3 transition ${activeClueId === clue.id ? "border-saffron" : "border-transparent"}`} onClick={() => onSelect(clue)}>
            <span className="mb-1.5 flex items-baseline justify-between gap-3 text-xs"><strong>{clue.number}</strong><span className="truncate font-mono text-[11px] tracking-wider text-black/40">{clue.answer || "—"}</span></span>
            <input className="field !py-2" value={clue.clue} placeholder="Write a clue…" onFocus={() => onSelect(clue)} onChange={(event) => onChange(clue.id, event.target.value)} />
          </label>
        ))}
      </div>
    </section>
  );
}

export function ClueEditor(props: Props) {
  return <div className="grid gap-8 xl:grid-cols-2"><DirectionEditor title="Across" clues={props.puzzle.clues.across} activeClueId={props.activeClueId} onSelect={props.onSelect} onChange={props.onChange} /><DirectionEditor title="Down" clues={props.puzzle.clues.down} activeClueId={props.activeClueId} onSelect={props.onSelect} onChange={props.onChange} /></div>;
}
