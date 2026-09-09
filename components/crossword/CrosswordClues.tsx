"use client";

import { useEffect, useRef } from "react";
import type { CrosswordClue, CrosswordPuzzle } from "@/lib/crossword/types";

interface Props { puzzle: CrosswordPuzzle; activeClueId?: string; onClueClick?: (clue: CrosswordClue) => void; }

function ClueList({ title, clues, activeClueId, onClueClick }: { title: string; clues: CrosswordClue[]; activeClueId?: string; onClueClick?: (clue: CrosswordClue) => void }) {
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [activeClueId]);
  return (
    <section>
      <h2 className="mb-3 border-b-2 border-ink pb-2 text-xs font-bold uppercase tracking-[0.18em]">{title}</h2>
      <ol className="space-y-1">
        {clues.map((clue) => (
          <li key={clue.id}>
            <button
              ref={activeClueId === clue.id ? activeRef : undefined}
              type="button"
              className={`grid w-full grid-cols-[32px_1fr] rounded-sm px-2 py-2.5 text-left text-sm leading-snug transition ${activeClueId === clue.id ? "bg-sky font-semibold" : "hover:bg-black/[0.045]"}`}
              onClick={() => onClueClick?.(clue)}
            >
              <strong>{clue.number}</strong><span>{clue.clue || <em className="font-normal text-black/40">Clue not written</em>}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CrosswordClues({ puzzle, activeClueId, onClueClick }: Props) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <ClueList title="Across" clues={puzzle.clues.across} activeClueId={activeClueId} onClueClick={onClueClick} />
      <ClueList title="Down" clues={puzzle.clues.down} activeClueId={activeClueId} onClueClick={onClueClick} />
    </div>
  );
}
