"use client";

import { Check, Copy, CopyPlus, Download, ExternalLink, Eye, Globe2, LoaderCircle, Save, Upload } from "lucide-react";
import type { PuzzlePublication, PuzzleVisibility } from "@/lib/publication";

export type CreatorMode = "layout" | "answers" | "clues";

interface Props {
  mode: CreatorMode;
  onModeChange: (mode: CreatorMode) => void;
  onSave: () => void;
  onPreview: () => void;
  onExport: () => void;
  onImport: () => void;
  visibility: PuzzleVisibility;
  publication: PuzzlePublication | null;
  publishing: boolean;
  onVisibilityChange: (visibility: PuzzleVisibility) => void;
  onPublish: () => void;
  onCopyLink: () => void;
  onOpenPublished: () => void;
  onDuplicate: () => void;
}

export function CreatorToolbar({ mode, onModeChange, onSave, onPreview, onExport, onImport, visibility, publication, publishing, onVisibilityChange, onPublish, onCopyLink, onOpenPublished, onDuplicate }: Props) {
  return (
    <div className="border-y border-black/15 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex overflow-hidden rounded-md border border-black/20 bg-white p-1" role="tablist" aria-label="Editing mode">
          {(["layout", "answers", "clues"] as CreatorMode[]).map((item, index) => (
            <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => onModeChange(item)} className={`flex-1 rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition sm:flex-none ${mode === item ? "bg-ink text-white" : "text-black/50 hover:bg-canvas hover:text-ink"}`}>
              {index + 1}. {item}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="button-secondary !px-3 !py-2" onClick={onImport}><Upload size={15} /> Import</button>
          <button className="button-secondary !px-3 !py-2" onClick={onExport}><Download size={15} /> Export</button>
          <button className="button-secondary !px-3 !py-2" onClick={onPreview}><Eye size={15} /> Preview</button>
          <button className="button-secondary !px-3 !py-2" onClick={onSave}><Save size={15} /> Save</button>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-black/10 pt-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {publication && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800"><Check size={14} /> Published</span>}
          <label className="flex items-center gap-2 text-xs font-semibold text-black/55">
            Visibility
            <select className="rounded border border-black/20 bg-white px-2 py-1.5 text-xs font-semibold text-ink outline-none focus:ring-2 focus:ring-saffron" value={visibility} onChange={(event) => onVisibilityChange(event.target.value as PuzzleVisibility)}>
              <option value="unlisted">Unlisted</option><option value="public">Public</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {publication && <>
            <button className="button-secondary !px-3 !py-2" onClick={onCopyLink}><Copy size={14} /> Copy link</button>
            <button className="button-secondary !px-3 !py-2" onClick={onOpenPublished}><ExternalLink size={14} /> Open puzzle</button>
            <button className="button-secondary !px-3 !py-2" onClick={onDuplicate}><CopyPlus size={14} /> Duplicate</button>
          </>}
          <button className="button-primary !px-4 !py-2 disabled:cursor-wait disabled:opacity-65" disabled={publishing} onClick={onPublish}>
            {publishing ? <LoaderCircle className="animate-spin" size={15} /> : <Globe2 size={15} />}
            {publication ? "Update published puzzle" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
