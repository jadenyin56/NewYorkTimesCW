"use client";

import { RotateCcw } from "lucide-react";

interface Props {
  width: number;
  height: number;
  symmetry: boolean;
  onResize: (width: number, height: number) => void;
  onSymmetryChange: (value: boolean) => void;
  onReset: () => void;
}

export function GridSettings({ width, height, symmetry, onResize, onSymmetryChange, onReset }: Props) {
  const clamp = (value: number) => Math.max(2, Math.min(30, value || 2));
  return (
    <section>
      <p className="eyebrow mb-4">Grid settings</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-black/60">Width<input className="field mt-1" type="number" min={2} max={30} value={width} onChange={(event) => onResize(clamp(Number(event.target.value)), height)} /></label>
        <label className="text-xs font-semibold text-black/60">Height<input className="field mt-1" type="number" min={2} max={30} value={height} onChange={(event) => onResize(width, clamp(Number(event.target.value)))} /></label>
      </div>
      <label className="mt-4 flex cursor-pointer items-center justify-between border-y border-black/10 py-3 text-sm font-medium">
        Rotational symmetry
        <input className="h-4 w-4 accent-ink" type="checkbox" checked={symmetry} onChange={(event) => onSymmetryChange(event.target.checked)} />
      </label>
      <button type="button" onClick={onReset} className="mt-4 flex items-center gap-2 text-xs font-semibold text-black/55 underline decoration-black/20 underline-offset-4 hover:text-ink"><RotateCcw size={14} /> Reset to a blank grid</button>
    </section>
  );
}
