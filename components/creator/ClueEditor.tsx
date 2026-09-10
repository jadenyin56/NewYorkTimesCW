"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import type { CrosswordClue, CrosswordPuzzle } from "@/lib/crossword/types";

interface Props {
  puzzle: CrosswordPuzzle;
  activeClueId?: string;
  suggestingClueId?: string;
  onSelect: (clue: CrosswordClue) => void;
  onChange: (clueId: string, value: string) => void;
  onSuggest: (clue: CrosswordClue) => void;
}

interface DirectionEditorProps extends Omit<Props, "puzzle"> {
  title: string;
  clues: CrosswordClue[];
}

function DirectionEditor({
  title,
  clues,
  activeClueId,
  suggestingClueId,
  onSelect,
  onChange,
  onSuggest,
}: DirectionEditorProps) {
  return (
    <section>
      <h2 className="mb-4 border-b-2 border-ink pb-2 text-xs font-bold uppercase tracking-[.18em]">
        {title}<span className="float-right text-black/35">{clues.length}</span>
      </h2>
      <div className="space-y-3">
        {clues.map((clue) => {
          const suggesting = suggestingClueId === clue.id;
          return (
            <label
              key={clue.id}
              className={`block border-l-[3px] py-1 pl-3 transition ${activeClueId === clue.id ? "border-saffron" : "border-transparent"}`}
              onClick={() => onSelect(clue)}
            >
              <span className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
                <strong>{clue.number}</strong>
                <span className="truncate font-mono text-[11px] tracking-wider text-black/40">{clue.answer || "—"}</span>
              </span>
              <span className="flex gap-1.5">
                <input
                  className="field !py-2"
                  value={clue.clue}
                  placeholder="Write a clue…"
                  onFocus={() => onSelect(clue)}
                  onChange={(event) => onChange(clue.id, event.target.value)}
                />
                <button
                  type="button"
                  disabled={Boolean(suggestingClueId) || !clue.answer}
                  onClick={() => onSuggest(clue)}
                  className="button-secondary shrink-0 !px-2.5 !py-2 disabled:opacity-50"
                  aria-label={`Suggest a clue for ${clue.answer}`}
                >
                  {suggesting ? <LoaderCircle className="animate-spin" size={15} /> : <Sparkles size={15} />}
                  <span className="text-xs">AI</span>
                </button>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

export function ClueEditor(props: Props) {
  const shared = {
    activeClueId: props.activeClueId,
    suggestingClueId: props.suggestingClueId,
    onSelect: props.onSelect,
    onChange: props.onChange,
    onSuggest: props.onSuggest,
  };

  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <DirectionEditor title="Across" clues={props.puzzle.clues.across} {...shared} />
      <DirectionEditor title="Down" clues={props.puzzle.clues.down} {...shared} />
    </div>
  );
}
