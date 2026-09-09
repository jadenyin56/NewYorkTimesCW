import Link from "next/link";
import { CloudOff } from "lucide-react";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { PlayerView } from "@/components/player/PlayerView";
import { getPublishedPuzzle } from "@/lib/supabase/puzzles";

export const dynamic = "force-dynamic";

function ServiceUnavailable({ configured }: { configured: boolean }) {
  return (
    <main className="min-h-screen bg-paper">
      <AppHeader />
      <div className="page-shell grid min-h-[65vh] place-items-center py-20 text-center">
        <div className="max-w-lg">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-canvas"><CloudOff size={27} /></span>
          <p className="eyebrow mb-3 mt-6">{configured ? "Puzzle library unavailable" : "Publishing unavailable"}</p>
          <h1 className="font-serif text-5xl tracking-[-.04em]">{configured ? "We couldn’t reach this grid." : "The puzzle library isn’t connected."}</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/55">{configured ? "The puzzle service may be temporarily unavailable. Please try this link again shortly." : "The site owner needs to finish the Supabase setup before shared puzzles can open."}</p>
          <Link href="/" className="button-primary mt-8">Return home</Link>
        </div>
      </div>
    </main>
  );
}

export default async function PublishedPuzzlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPublishedPuzzle(slug);
  if (result.status === "not-found") notFound();
  if (result.status !== "ok") return <ServiceUnavailable configured={result.status !== "not-configured"} />;
  return <PlayerView puzzle={result.puzzle} progressSlug={slug} />;
}
