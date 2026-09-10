"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clock3, PenLine, Play, Trash2 } from "lucide-react";
import type { CrosswordPuzzle } from "@/lib/crossword/types";
import { deletePuzzle, getSavedPuzzles } from "@/lib/storage";

const themeIdeas = ["A favorite movie", "Family history", "Cities at night", "90s music", "Ocean life", "A birthday", "Coffee culture", "Space travel"];
const visualGrid = ["...#.....", ".#...#...", "....I..#.", "#...D....", "..THEME#.", "....A.#..", "#...SHARE", "..#...#..", ".....#..."];

function ThemeGridVisual() {
  return (
    <div className="w-full max-w-[440px] justify-self-center lg:justify-self-end" data-scroll-reveal aria-hidden="true">
      <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.16em] text-black/40">
        <span>Idea becoming a grid</span><span>9 × 9</span>
      </div>
      <div className="visual-grid grid grid-cols-9 border-2 border-ink bg-ink">
        {visualGrid.join("").split("").map((value, index) => {
          const blocked = value === "#";
          const selected = index === 38;
          return (
            <span key={index} className={`visual-cell relative grid aspect-square place-items-center overflow-hidden border-b border-r border-black/65 ${blocked ? "bg-ink" : selected ? "bg-saffron" : "bg-white"}`}>
              {!blocked && value !== "." && <b className="visual-letter font-sans text-[clamp(13px,3.2vw,25px)] font-medium" style={{ animationDelay: `${160 + index * 34}ms` }}>{value}</b>}
            </span>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between border-t border-black/15 pt-3 text-xs text-black/40"><span>THEME</span><span>IDEAS</span><span>SHARE</span></div>
    </div>
  );
}

export function HomeContent() {
  const [puzzles, setPuzzles] = useState<CrosswordPuzzle[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setPuzzles(getSavedPuzzles());
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = document.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
    let observer: IntersectionObserver | undefined;
    if (!reducedMotion) {
      targets.forEach((target) => target.classList.add("reveal-ready"));
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer?.unobserve(entry.target); } });
      }, { threshold: 0.14 });
      targets.forEach((target) => observer?.observe(target));
    }
    const updateProgress = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const progress = available > 0 ? Math.min(1, window.scrollY / available) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => { observer?.disconnect(); window.removeEventListener("scroll", updateProgress); };
  }, []);

  function removePuzzle(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    deletePuzzle(id);
    setPuzzles(getSavedPuzzles());
  }

  return (
    <>
      <div ref={progressRef} className="fixed left-0 top-0 z-[70] h-0.5 w-full origin-left scale-x-0 bg-rust" aria-hidden="true" />
      <section className="page-shell py-20 sm:py-28 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)]">
          <div>
            <p className="eyebrow mb-6" data-scroll-reveal>Theme-first crossword studio</p>
            <h1 className="max-w-4xl font-serif text-[clamp(3.25rem,6.5vw,6.25rem)] font-medium leading-[.94] tracking-[-0.055em]" data-scroll-reveal>
              Start with a theme.<br />Build a crossword.
            </h1>
            <form action="/create" method="get" className="mt-12 max-w-3xl border-b-2 border-ink sm:flex sm:items-end" aria-label="Start a themed crossword" data-scroll-reveal>
              <label className="block flex-1 pb-3">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.16em] text-black/45">What should your puzzle be about?</span>
                <input name="theme" maxLength={80} className="w-full bg-transparent py-1 text-xl outline-none placeholder:text-black/25 sm:text-2xl" placeholder="e.g. family vacation, space" />
              </label>
              <button className="mb-3 inline-flex w-full items-center justify-center gap-2 bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/80 sm:w-auto">Start a puzzle <ArrowRight size={16} /></button>
            </form>
          </div>
          <ThemeGridVisual />
        </div>
      </section>

      <section className="overflow-hidden border-y border-black/15 bg-white py-7" data-scroll-reveal>
        <div className="page-shell mb-5 flex items-baseline justify-between gap-4">
          <p className="eyebrow">Need a starting point?</p>
          <span className="hidden text-xs text-black/40 sm:block">Hover to pause · Select one to begin</span>
        </div>
        <div className="theme-rail border-y border-black/10" aria-label="Crossword theme ideas">
          <div className="theme-track">
            {[false, true].map((duplicate) => (
              <div key={String(duplicate)} className="theme-group" aria-hidden={duplicate || undefined}>
                {themeIdeas.map((theme) => <Link key={`${duplicate}-${theme}`} href={{ pathname: "/create", query: { theme } }} tabIndex={duplicate ? -1 : undefined} className="whitespace-nowrap border-r border-black/10 px-7 py-4 font-serif text-xl transition hover:bg-saffron focus:bg-saffron focus:outline-none">{theme} <span className="ml-2 text-sm">↗</span></Link>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" id="your-crosswords" data-scroll-reveal>
        <div className="page-shell py-16 sm:py-24">
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
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-black/50"><span>{puzzle.width} × {puzzle.height}</span><span>By {puzzle.author || "Anonymous"}</span>{puzzle.updatedAt && <span className="flex items-center gap-1"><Clock3 size={12} /> Updated {new Date(puzzle.updatedAt).toLocaleDateString()}</span>}</p>
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
            <div className="border-b border-black/15 py-12">
              <p className="font-serif text-2xl">No drafts yet.</p>
              <p className="mt-2 text-sm text-black/50">Pick a theme above or start with a blank grid.</p>
              <Link href="/create" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline decoration-black/25 underline-offset-4 hover:decoration-ink"><PenLine size={15} /> Create a crossword</Link>
            </div>
          )}
        </div>
      </section>
      <footer className="border-t border-black/15 py-8"><div className="page-shell flex flex-wrap justify-between gap-3 text-xs text-black/45"><span>© {new Date().getFullYear()} Crossly</span><span>Theme → grid → clues → share</span></div></footer>
    </>
  );
}
