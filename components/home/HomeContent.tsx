"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock3, PenLine, Play, Trash2 } from "lucide-react";
import { deletePuzzle, getSavedPuzzles } from "@/lib/storage";
import type { CrosswordPuzzle } from "@/lib/crossword/types";

const miniGrid = [
  "..#....", ".......", "....#..", "#......", "..#....", ".......", "....#..",
];

export function HomeContent() {
  const [puzzles, setPuzzles] = useState<CrosswordPuzzle[]>([]);
  useEffect(() => setPuzzles(getSavedPuzzles()), []);

  function removePuzzle(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    deletePuzzle(id);
    setPuzzles(getSavedPuzzles());
  }

  return (
    <>
      <section className="page-shell grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow mb-5">A crossword studio for everyone</p>
          <h1 className="font-serif text-[clamp(3.6rem,8vw,7.25rem)] font-medium leading-[.84] tracking-[-0.06em]">
            Make a puzzle<br /><span className="italic text-rust">worth sharing.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-black/60 sm:text-lg">
            Build thoughtful custom crosswords, write your own clues, and invite someone to solve. No design experience required.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/create" className="button-primary">Create a crossword <ArrowRight size={17} /></Link>
            <Link href="/play/sample-the-inkling" className="button-secondary"><Play size={16} fill="currentColor" /> Play the sample</Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[540px] py-8 lg:justify-self-end">
          <div className="absolute -left-6 top-0 h-24 w-24 rounded-full bg-saffron sm:-left-12" />
          <div className="absolute -right-4 bottom-1 h-32 w-32 rounded-full bg-sky sm:-right-8" />
          <div className="relative rotate-[2deg] bg-white p-5 shadow-lift sm:p-8">
            <div className="mb-5 flex items-end justify-between border-b border-black/15 pb-4">
              <div><p className="eyebrow">Mini No. 01</p><h2 className="font-serif text-3xl">Sunday Stroll</h2></div>
              <span className="text-xs font-semibold text-black/45">BY YOU</span>
            </div>
            <div className="grid grid-cols-7 border-2 border-ink bg-ink">
              {miniGrid.join("").split("").map((cell, index) => (
                <span key={index} className={`aspect-square border-b border-r border-black/60 ${cell === "#" ? "bg-ink" : "bg-white"}`} />
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-7 text-[10px] font-bold uppercase tracking-[.16em]">
              <div><span className="border-b border-ink pb-1">Across</span></div><div><span className="border-b border-ink pb-1">Down</span></div>
            </div>
          </div>
          <span className="absolute -bottom-3 left-2 rotate-[-5deg] bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">Made with Crossly</span>
        </div>
      </section>

      <section className="border-y border-black/15 bg-canvas">
        <div className="page-shell grid gap-8 py-12 md:grid-cols-3">
          {[
            ["01", "Shape your grid", "Choose any size, place blocks, and use optional rotational symmetry."],
            ["02", "Fill the answers", "Type naturally with keyboard-first controls while Crossly numbers every entry."],
            ["03", "Write & share", "Add clues, preview the solving experience, then save or export your puzzle."],
          ].map(([number, title, copy]) => (
            <div key={number} className="grid grid-cols-[44px_1fr] gap-2">
              <span className="font-serif text-2xl italic text-rust">{number}</span>
              <div><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-black/55">{copy}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-16 sm:py-24" id="your-crosswords">
        <div className="mb-8 flex items-end justify-between gap-4 border-b-2 border-ink pb-4">
          <div><p className="eyebrow mb-2">Saved in this browser</p><h2 className="font-serif text-4xl sm:text-5xl">Your crosswords</h2></div>
          <Link href="/create" className="hidden text-sm font-semibold underline decoration-black/25 underline-offset-4 hover:decoration-ink sm:block">Start a new one</Link>
        </div>
        {puzzles.length ? (
          <div className="divide-y divide-black/15 border-b border-black/15">
            {puzzles.map((puzzle) => (
              <article key={puzzle.id} className="grid items-center gap-4 py-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="font-serif text-2xl font-semibold">{puzzle.title || "Untitled crossword"}</h3>
                  <p className="mt-1 flex items-center gap-3 text-xs text-black/50"><span>{puzzle.width} × {puzzle.height}</span><span>By {puzzle.author || "Anonymous"}</span>{puzzle.updatedAt && <span className="flex items-center gap-1"><Clock3 size={12} /> Updated {new Date(puzzle.updatedAt).toLocaleDateString()}</span>}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/play/${puzzle.id}`} className="button-primary !px-4 !py-2"><Play size={14} /> Play</Link>
                  <Link href={`/create?id=${puzzle.id}`} className="button-secondary !px-3 !py-2" aria-label={`Edit ${puzzle.title}`}><PenLine size={15} /></Link>
                  <button onClick={() => removePuzzle(puzzle.id, puzzle.title)} className="button-secondary !px-3 !py-2 text-rust" aria-label={`Delete ${puzzle.title}`}><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-black/25 bg-white px-6 py-14 text-center">
            <p className="font-serif text-2xl">Your puzzle shelf is waiting.</p>
            <p className="mt-2 text-sm text-black/50">Crosswords you save will stay here on this device.</p>
            <Link href="/create" className="button-secondary mt-6"><PenLine size={16} /> Make your first puzzle</Link>
          </div>
        )}
      </section>
      <footer className="border-t border-black/15 py-8"><div className="page-shell flex flex-wrap justify-between gap-3 text-xs text-black/45"><span>© {new Date().getFullYear()} Crossly</span><span>Made for people who love a good clue.</span></div></footer>
    </>
  );
}
