# Graph Report - NYTGames  (2026-09-10)

## Corpus Check
- 52 files · ~13,339 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 276 nodes · 632 edges · 16 communities (11 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `539e25ff`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- CreatorWorkspace.tsx
- engine.ts
- PlayerView.tsx
- types.ts
- fill/route.ts
- HomeContent.tsx
- compilerOptions
- puzzles/route.ts
- CreatorWorkspace
- ◩ Crossly
- AGENTS.md
- CLAUDE.md
- next-env.d.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `CreatorWorkspace()` - 27 edges
2. `CrosswordPuzzle` - 21 edges
3. `PlayerView()` - 19 edges
4. `generateClues()` - 19 edges
5. `getCell()` - 17 edges
6. `lucide-react` - 16 edges
7. `compilerOptions` - 16 edges
8. `cellKey()` - 12 edges
9. `available()` - 11 edges
10. `◩ Crossly` - 11 edges

## Surprising Connections (you probably didn't know these)
- `PublishRequest` --references--> `PuzzleVisibility`  [EXTRACTED]
  app/api/puzzles/route.ts → lib/publication.ts
- `validateGrid()` --calls--> `generateClues()`  [EXTRACTED]
  app/api/ai/fill/route.ts → lib/crossword/engine.ts
- `normalizePuzzle()` --calls--> `generateClues()`  [EXTRACTED]
  app/api/puzzles/route.ts → lib/crossword/engine.ts
- `POST()` --calls--> `validatePuzzle()`  [EXTRACTED]
  app/api/puzzles/route.ts → lib/crossword/validation.ts
- `PublishedPuzzlePage()` --calls--> `getPublishedPuzzle()`  [EXTRACTED]
  app/p/[slug]/page.tsx → lib/supabase/puzzles.ts

## Import Cycles
- None detected.

## Communities (16 total, 4 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.04
Nodes (42): metadata, nextConfig, dependencies, lucide-react, next, openai, react, react-dom (+34 more)

### Community 1 - "CreatorWorkspace.tsx"
Cohesion: 0.11
Nodes (19): AIAssistDialog(), AIGeneratedGrid, CreatorMode, CreatorToolbar(), Props, GridSettings(), Props, PublishDialog() (+11 more)

### Community 2 - "engine.ts"
Cohesion: 0.17
Nodes (27): chooseCell(), enterLetter(), handleGridKey(), resize(), toggleBlock(), updateStructure(), PlayerView(), check() (+19 more)

### Community 3 - "PlayerView.tsx"
Cohesion: 0.18
Nodes (21): ActiveClue(), CrosswordGrid(), initialState(), reset(), Scope, neighboringClue(), CrosswordGameState, Direction (+13 more)

### Community 4 - "types.ts"
Cohesion: 0.19
Nodes (12): ClueEditor(), DirectionEditorProps, Props, CrosswordClues(), Props, CrosswordGridProps, createBlankCells(), CellPosition (+4 more)

### Community 5 - "fill/route.ts"
Cohesion: 0.22
Nodes (16): maxDuration, POST(), GridResponse, maxDuration, normalizeWord(), POST(), validateGrid(), AIFeature (+8 more)

### Community 6 - "HomeContent.tsx"
Cohesion: 0.15
Nodes (9): HomeContent(), removePuzzle(), themeIdeas, visualGrid, AppHeader(), PlayerPageClient(), deletePuzzle(), getSavedPuzzles() (+1 more)

### Community 7 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "puzzles/route.ts"
Cohesion: 0.22
Nodes (13): hashToken(), normalizePuzzle(), POST(), PublishRequest, randomSlug(), dynamic, PublishedPuzzlePage(), isCrosswordPuzzle() (+5 more)

### Community 9 - "CreatorWorkspace"
Cohesion: 0.24
Nodes (16): blankPuzzle(), CreatorWorkspace(), applyAIGeneratedGrid(), copyPublishedLink(), duplicate(), flash(), importJson(), publish() (+8 more)

### Community 10 - "◩ Crossly"
Cohesion: 0.13
Nodes (14): AI assistance setup, Architecture, Create, ◩ Crossly, Features, How numbering works, Ideas for what comes next, Keyboard shortcuts (+6 more)

## Knowledge Gaps
- **82 isolated node(s):** `maxDuration`, `maxDuration`, `GridResponse`, `metadata`, `dynamic` (+77 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 106 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `CreatorWorkspace.tsx` to `package.json`, `PlayerView.tsx`, `types.ts`, `HomeContent.tsx`, `puzzles/route.ts`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `react` connect `CreatorWorkspace.tsx` to `package.json`, `PlayerView.tsx`, `types.ts`, `HomeContent.tsx`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `CreatorWorkspace()` connect `CreatorWorkspace` to `CreatorWorkspace.tsx`, `engine.ts`, `PlayerView.tsx`, `types.ts`, `fill/route.ts`, `HomeContent.tsx`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `maxDuration`, `maxDuration`, `GridResponse` to the rest of the system?**
  _82 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `CreatorWorkspace.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10588235294117647 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._