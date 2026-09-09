import type { CrosswordClue } from "@/lib/crossword/types";

export function ActiveClue({ clue }: { clue?: CrosswordClue }) {
  return (
    <div className="flex min-h-[76px] items-center gap-4 border-y border-black/15 bg-white px-4 py-3 sm:px-5">
      <strong className="min-w-[72px] text-sm">{clue ? `${clue.number} ${clue.direction === "across" ? "Across" : "Down"}` : "—"}</strong>
      <span className="text-sm leading-snug text-black/75">{clue?.clue || "Select a square to begin."}</span>
    </div>
  );
}
