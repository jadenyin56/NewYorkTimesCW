import { AppHeader } from "@/components/layout/AppHeader";

export default function PublishedPuzzleLoading() {
  return (
    <main className="min-h-screen bg-paper">
      <AppHeader compact />
      <div className="page-shell animate-pulse py-10">
        <div className="h-3 w-28 bg-black/10" /><div className="mt-4 h-12 w-72 max-w-full bg-black/10" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(390px,650px)_1fr]">
          <div className="aspect-square max-w-[600px] bg-black/10" />
          <div className="space-y-4"><div className="h-16 bg-black/10" /><div className="h-5 w-24 bg-black/10" /><div className="h-4 bg-black/10" /><div className="h-4 w-4/5 bg-black/10" /></div>
        </div>
      </div>
    </main>
  );
}
