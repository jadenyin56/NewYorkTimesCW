"use client";

import { Check, Sparkles } from "lucide-react";
import { formatTime } from "./Timer";

export function CompletionModal({ title, seconds, mistakes, onClose }: { title: string; seconds: number; mistakes: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-5" role="dialog" aria-modal="true" aria-labelledby="completion-title">
      <div className="animate-pop w-full max-w-md bg-paper p-7 text-center shadow-2xl sm:p-10">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-saffron"><Sparkles size={27} /></div>
        <p className="eyebrow mb-2">Puzzle complete</p>
        <h2 id="completion-title" className="font-serif text-4xl leading-tight">Nicely solved!</h2>
        <p className="mt-2 text-sm text-black/55">{title}</p>
        <div className="my-7 grid grid-cols-2 divide-x divide-black/15 border-y border-black/15 py-5">
          <div><p className="eyebrow">Time</p><strong className="mt-1 block font-mono text-xl">{formatTime(seconds)}</strong></div>
          <div><p className="eyebrow">Mistakes</p><strong className="mt-1 block font-mono text-xl">{mistakes}</strong></div>
        </div>
        <button type="button" autoFocus onClick={onClose} className="button-primary w-full"><Check size={17} /> View completed puzzle</button>
      </div>
    </div>
  );
}
