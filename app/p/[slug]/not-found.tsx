import Link from "next/link";
import { SearchX } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";

export default function PublishedPuzzleNotFound() {
  return (
    <main className="min-h-screen bg-paper">
      <AppHeader />
      <div className="page-shell grid min-h-[65vh] place-items-center py-20 text-center">
        <div className="max-w-lg">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-canvas"><SearchX size={27} /></span>
          <p className="eyebrow mb-3 mt-6">Puzzle not found</p>
          <h1 className="font-serif text-5xl tracking-[-.04em]">This grid has gone missing.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/55">Check the link for a typo, or ask the puzzle’s creator to publish it again.</p>
          <Link href="/" className="button-primary mt-8">Return home</Link>
        </div>
      </div>
    </main>
  );
}
