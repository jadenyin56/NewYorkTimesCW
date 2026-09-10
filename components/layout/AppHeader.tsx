import Link from "next/link";
import { Plus } from "lucide-react";

export function AppHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="border-b border-black/15 bg-paper">
      <div className="page-shell flex h-16 items-center justify-between sm:h-[72px]">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Crossly home">
          <span className="grid h-7 w-7 grid-cols-2 gap-[2px] border-2 border-ink bg-ink p-[2px]" aria-hidden="true">
            <i className="bg-paper" /><i className="bg-saffron" /><i className="bg-paper" /><i className="bg-paper" />
          </span>
          <span className="font-serif text-[25px] font-semibold tracking-[-0.03em]">Crossly</span>
        </Link>
        {!compact && <nav aria-label="Main navigation"><Link href="/create" className="button-primary !px-3.5 !py-2 sm:!px-4"><Plus size={16} /> Create</Link></nav>}
      </div>
    </header>
  );
}
