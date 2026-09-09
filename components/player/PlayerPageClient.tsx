"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import type { CrosswordPuzzle } from "@/lib/crossword/types";
import { samplePuzzle } from "@/lib/samplePuzzle";
import { loadPuzzle } from "@/lib/storage";
import { PlayerView } from "./PlayerView";

export function PlayerPageClient({ id }: { id: string }) {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null | undefined>(undefined);
  useEffect(() => setPuzzle(id === samplePuzzle.id ? samplePuzzle : loadPuzzle(id) ?? null), [id]);
  if (puzzle === undefined) return <main className="min-h-screen"><AppHeader compact /><div className="page-shell py-24 text-center text-sm text-black/45">Opening puzzle…</div></main>;
  if (puzzle === null) return <main className="min-h-screen"><AppHeader /><div className="page-shell py-24 text-center"><p className="eyebrow mb-3">Puzzle not found</p><h1 className="font-serif text-5xl">This grid has gone missing.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/55">It may have been deleted, or it was saved in a different browser.</p><Link href="/" className="button-primary mt-8">Return home</Link></div></main>;
  return <PlayerView puzzle={puzzle} />;
}
