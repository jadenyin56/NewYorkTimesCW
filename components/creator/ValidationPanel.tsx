import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ValidationIssue } from "@/lib/crossword/types";

export function ValidationPanel({ issues, onIssueClick }: { issues: ValidationIssue[]; onIssueClick?: (issue: ValidationIssue) => void }) {
  if (!issues.length) return <div className="flex items-start gap-3 border border-emerald-700/20 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 className="mt-0.5 shrink-0" size={17} /><div><strong>Ready to publish</strong><p className="mt-1 text-xs text-emerald-800/75">Every square is filled and every entry has a clue.</p></div></div>;
  return (
    <section className="border border-black/15 bg-white p-4">
      <div className="mb-3 flex items-center gap-2"><AlertCircle size={17} className="text-rust" /><strong className="text-sm">{issues.length} {issues.length === 1 ? "issue" : "issues"} to review</strong></div>
      <ul className="max-h-52 space-y-1 overflow-auto">
        {issues.map((issue) => <li key={issue.id}><button type="button" onClick={() => onIssueClick?.(issue)} className="flex w-full gap-2 px-1 py-1.5 text-left text-xs leading-5 text-black/65 hover:bg-canvas hover:text-ink">{issue.severity === "error" ? <AlertCircle size={13} className="mt-1 shrink-0 text-rust" /> : <AlertTriangle size={13} className="mt-1 shrink-0 text-amber-700" />}{issue.message}</button></li>)}
      </ul>
    </section>
  );
}
