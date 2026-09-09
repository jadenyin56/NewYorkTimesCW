import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { generateClues } from "@/lib/crossword/engine";
import type { CrosswordPuzzle } from "@/lib/crossword/types";
import { isCrosswordPuzzle, validatePuzzle } from "@/lib/crossword/validation";
import type { PuzzleVisibility } from "@/lib/publication";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface PublishRequest {
  action?: "publish" | "update";
  puzzle?: unknown;
  visibility?: PuzzleVisibility;
  publishedId?: string;
  editToken?: string;
}

function normalizePuzzle(puzzle: CrosswordPuzzle) {
  const priorClues = puzzle.clues && Array.isArray(puzzle.clues.across) && Array.isArray(puzzle.clues.down)
    ? puzzle.clues
    : undefined;
  const derived = generateClues(puzzle, priorClues);
  return { ...puzzle, title: puzzle.title.trim(), cells: derived.cells, clues: derived.clues };
}

function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

function randomSlug() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(randomBytes(6), (byte) => alphabet[byte % alphabet.length]).join("");
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Publishing is not configured yet. Add the Supabase environment variables." }, { status: 503 });
  }

  let body: PublishRequest;
  try { body = await request.json() as PublishRequest; }
  catch { return NextResponse.json({ error: "The publish request was not valid JSON." }, { status: 400 }); }

  if (!isCrosswordPuzzle(body.puzzle)) return NextResponse.json({ error: "The puzzle data is invalid." }, { status: 400 });
  const puzzle = normalizePuzzle(body.puzzle);
  const seriousIssues = validatePuzzle(puzzle).filter((issue) => issue.severity === "error" || issue.id.startsWith("clue-"));
  if (seriousIssues.length) return NextResponse.json({ error: "Fix the puzzle errors before publishing.", issues: seriousIssues }, { status: 422 });
  if (JSON.stringify(puzzle).length > 500000) return NextResponse.json({ error: "This puzzle is too large to publish." }, { status: 413 });

  const visibility = body.visibility === "public" ? "public" : "unlisted";
  const common = {
    p_title: puzzle.title,
    p_author: puzzle.author ?? "",
    p_description: puzzle.description ?? "",
    p_width: puzzle.width,
    p_height: puzzle.height,
    p_puzzle_data: puzzle,
    p_visibility: visibility,
  };

  const supabase = getSupabaseClient();
  if (body.action === "update") {
    if (!body.publishedId || !body.editToken) return NextResponse.json({ error: "Creator ownership information is missing." }, { status: 403 });
    const { data, error } = await supabase.rpc("update_published_puzzle", { ...common, p_id: body.publishedId, p_edit_token_hash: hashToken(body.editToken) });
    if (error || !data?.[0]) return NextResponse.json({ error: error?.message ?? "The published puzzle could not be updated." }, { status: 403 });
    return NextResponse.json({ id: data[0].id, slug: data[0].slug, editToken: body.editToken, visibility });
  }

  const editToken = randomBytes(32).toString("hex");
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase.rpc("publish_puzzle", { ...common, p_slug: randomSlug(), p_edit_token_hash: hashToken(editToken) });
    if (data?.[0]) return NextResponse.json({ id: data[0].id, slug: data[0].slug, editToken, visibility }, { status: 201 });
    if (error?.code !== "23505") return NextResponse.json({ error: error?.message ?? "The puzzle could not be published." }, { status: 500 });
  }
  return NextResponse.json({ error: "A unique share link could not be generated. Please try again." }, { status: 500 });
}
