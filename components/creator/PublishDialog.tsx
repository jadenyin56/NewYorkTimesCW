"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, X } from "lucide-react";

export function PublishDialog({ title, link, updated, onClose }: { title: string; link: string; updated: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-5" role="dialog" aria-modal="true" aria-labelledby="publish-title">
      <div className="animate-pop relative w-full max-w-lg bg-paper p-7 shadow-2xl sm:p-10">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded p-2 text-black/45 hover:bg-black/5 hover:text-ink" aria-label="Close publish dialog"><X size={18} /></button>
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Check size={25} strokeWidth={2.5} /></div>
        <p className="eyebrow mb-2">{updated ? "Published puzzle updated" : "Puzzle published"}</p>
        <h2 id="publish-title" className="font-serif text-4xl leading-tight">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-black/55">Your puzzle is ready to share. Anyone with this link can play without an account.</p>
        <div className="my-6 flex items-center gap-2 border border-black/15 bg-white p-2 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-black/65">{link}</span>
          <button type="button" onClick={copy} className="button-secondary shrink-0 !px-3 !py-2">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</button>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="button-secondary">Keep editing</button><a href={link} className="button-primary">Play puzzle <ExternalLink size={15} /></a></div>
      </div>
    </div>
  );
}
