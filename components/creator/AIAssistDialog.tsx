"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles, X } from "lucide-react";

export interface AIGeneratedGrid {
  title: string;
  description: string;
  rows: string[];
}

export function AIAssistDialog({ initialTheme, initialWidth, initialHeight, onApply, onClose }: { initialTheme: string; initialWidth: number; initialHeight: number; onApply: (grid: AIGeneratedGrid) => void; onClose: () => void }) {
  const [theme, setTheme] = useState(initialTheme);
  const [words, setWords] = useState("");
  const [width, setWidth] = useState(Math.min(15, Math.max(3, initialWidth)));
  const [height, setHeight] = useState(Math.min(15, Math.max(3, initialHeight)));
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    setGenerating(true); setError(null);
    try {
      const requiredWords = words.split(/[\n,]+/).map((word) => word.trim()).filter(Boolean);
      const response = await fetch("/api/ai/fill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ theme, words: requiredWords, width, height }) });
      const result = await response.json() as Partial<AIGeneratedGrid> & { error?: string };
      if (!response.ok || !result.rows || !result.title || typeof result.description !== "string") throw new Error(result.error || "The grid could not be generated.");
      onApply({ title: result.title, description: result.description, rows: result.rows });
      onClose();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The grid could not be generated."); }
    finally { setGenerating(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/55 p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="ai-assist-title">
      <form onSubmit={generate} className="animate-pop relative my-auto w-full max-w-xl bg-paper p-6 shadow-2xl sm:p-9">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded p-2 text-black/45 hover:bg-black/5 hover:text-ink" aria-label="Close AI assistant"><X size={18} /></button>
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-saffron"><Sparkles size={21} /></div>
        <p className="eyebrow mb-2">AI assistance</p>
        <h2 id="ai-assist-title" className="font-serif text-4xl tracking-[-.03em]">Build around your words.</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-black/55">Give Crossly a theme and any must-have answers. It will construct and fill a new grid, replacing the current layout. You can edit everything afterward.</p>

        <div className="mt-7 space-y-5">
          <label className="block text-xs font-semibold text-black/60">Theme<input className="field mt-1.5" value={theme} maxLength={160} onChange={(event) => setTheme(event.target.value)} placeholder="e.g. A trip through Japan" autoFocus /></label>
          <label className="block text-xs font-semibold text-black/60">Words to include <span className="font-normal text-black/40">(comma or new line separated)</span><textarea className="field mt-1.5 min-h-28 resize-y" value={words} onChange={(event) => setWords(event.target.value)} placeholder={"TOKYO, RAMEN, SHINKANSEN\nMOUNT FUJI"} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-black/60">Width<input className="field mt-1.5" type="number" min={3} max={15} value={width} onChange={(event) => setWidth(Math.min(15, Math.max(3, Number(event.target.value))))} /></label>
            <label className="text-xs font-semibold text-black/60">Height<input className="field mt-1.5" type="number" min={3} max={15} value={height} onChange={(event) => setHeight(Math.min(15, Math.max(3, Number(event.target.value))))} /></label>
          </div>
        </div>

        {error && <div className="mt-5 border border-rust/25 bg-red-50 px-4 py-3 text-sm leading-5 text-rust" role="alert">{error}</div>}
        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="button-secondary">Cancel</button><button type="submit" disabled={generating || (!theme.trim() && !words.trim())} className="button-primary disabled:cursor-not-allowed disabled:opacity-50">{generating ? <LoaderCircle className="animate-spin" size={16} /> : <Sparkles size={16} />}{generating ? "Constructing…" : "Generate grid"}</button></div>
      </form>
    </div>
  );
}
