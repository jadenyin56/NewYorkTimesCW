"use client";

import { CheckCircle2, Eye, RotateCcw } from "lucide-react";
import { Timer } from "./Timer";

type Scope = "square" | "word" | "puzzle";

function ActionMenu({ label, icon, onAction }: { label: string; icon: React.ReactNode; onAction: (scope: Scope) => void }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded px-3 py-2 text-xs font-semibold hover:bg-black/5">{icon}{label}</summary>
      <div className="absolute right-0 top-full z-30 mt-1 w-40 border border-black/15 bg-white p-1 shadow-lg">
        {(["square", "word", "puzzle"] as Scope[]).map((scope) => <button key={scope} type="button" onClick={(event) => { onAction(scope); (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open"); }} className="block w-full px-3 py-2 text-left text-xs font-medium capitalize hover:bg-canvas">{label} {scope}</button>)}
      </div>
    </details>
  );
}

export function PlayerToolbar({ seconds, paused, onPause, onCheck, onReveal, onReset }: { seconds: number; paused: boolean; onPause: () => void; onCheck: (scope: Scope) => void; onReveal: (scope: Scope) => void; onReset: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-y border-black/15 py-2">
      <Timer seconds={seconds} paused={paused} onToggle={onPause} />
      <div className="flex items-center">
        <ActionMenu label="Check" icon={<CheckCircle2 size={15} />} onAction={onCheck} />
        <ActionMenu label="Reveal" icon={<Eye size={15} />} onAction={onReveal} />
        <button type="button" onClick={onReset} className="flex items-center gap-2 rounded px-3 py-2 text-xs font-semibold hover:bg-black/5"><RotateCcw size={15} /> Reset</button>
      </div>
    </div>
  );
}
