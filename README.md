<div align="center">

# ◩ Crossly

### Make a puzzle worth sharing.

A polished, keyboard-first studio for creating and solving custom crosswords — built with Next.js, TypeScript, and Tailwind CSS.

[Features](#features) · [Quick start](#quick-start) · [Supabase-setup](#supabase-setup) · [Architecture](#architecture)

</div>

---

Crossly brings the calm, editorial feel of a newspaper puzzle to a flexible browser-based creator. Design any rectangular grid, write original clues, preview the solving experience, then publish a private-by-link or public puzzle for anyone to play.

## Features

### Create

- Arbitrary grids from `2 × 2` through `30 × 30`
- Block painting with optional 180° rotational symmetry
- Fast answer entry with automatic capitalization and word navigation
- Automatic Across/Down numbering and answer generation
- Clue editor with live grid highlighting
- Validation for blanks, missing clues, invalid characters, isolated cells, one-letter entries, and disconnected regions
- Player-accurate preview without leaving the editor
- JSON import and export
- Supabase publishing with random, non-sequential share links
- Unlisted and public visibility modes
- Token-protected updates and one-click duplication

### Play

- Responsive desktop and mobile solving layouts
- Mouse, touch, and full keyboard control
- Across/Down switching at crossings
- Arrow-key movement, `Space` direction toggle, and `Tab` clue navigation
- Square, word, and puzzle-level check/reveal actions
- Pauseable timer, reset flow, mistake count, and completion celebration
- Automatic progress restoration with `localStorage`
- Independent progress for every solver of a shared puzzle

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `A`–`Z` | Enter a letter and advance |
| `Backspace` | Clear the current square, or move back and clear |
| Arrow keys | Move through the grid and set direction |
| `Space` | Toggle Across/Down at a crossing |
| `Tab` / `Shift + Tab` | Move to the next/previous clue |

## Quick start

You will need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page includes an original sample puzzle, so the solver is ready to try immediately.

Local creation and solving work without Supabase. Publishing requires the setup below.

Production checks:

```bash
npm test
npm run lint
npm run build
```

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run [`supabase/migrations/20260909000000_create_puzzles.sql`](supabase/migrations/20260909000000_create_puzzles.sql).
3. Copy `.env.example` to `.env.local` and add the project URL and anon/publishable key:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

4. Restart the development server and publish a completed puzzle from `/create`.

The migration enables Row Level Security. Published puzzles are anonymously readable, while inserts and updates go through narrow database functions. Updates require a SHA-256-hashed creator token whose original value exists only in the publishing browser’s local storage.

For Vercel, add the same two variables under **Project Settings → Environment Variables** for Production, Preview, and Development. No service-role key is required or exposed.

## Architecture

```text
app/
├── api/puzzles/            Validated publish/update endpoint
├── create/                 Creator route
├── p/[slug]/               Public Supabase-backed player route
├── play/[id]/              Dynamic player route
├── globals.css             Editorial design system
└── page.tsx                Landing page
components/
├── crossword/              Shared grid, clues, and active-clue UI
├── creator/                Creator modes, settings, validation
├── player/                 Solver, toolbar, timer, completion
├── home/                   Landing page and saved-puzzle shelf
└── layout/                 App shell and header
lib/
├── crossword/
│   ├── engine.ts           Numbering, entry generation, navigation
│   ├── puzzleUtils.ts      Grid/cell helpers
│   ├── types.ts            Strict shared data contracts
│   └── validation.ts       Structural and content validation
├── samplePuzzle.ts         Original bundled sample
├── publication.ts          Publication and visibility contracts
├── storage.ts              Draft, ownership, and progress storage
└── supabase/               Supabase client and puzzle queries
supabase/
└── migrations/             Reproducible table, RLS, and RPC setup
tests/
└── crossword-engine.test.ts
```

Puzzle definition state and player progress are deliberately separate. The crossword engine consists of pure functions. Local drafts and ownership tokens live behind `lib/storage.ts`; published definitions live in Supabase. A shared solver’s state is never written to the puzzle row—it remains in `localStorage` under `crossword-progress-{slug}`.

## How numbering works

The engine scans cells from left to right, then top to bottom. A white square receives the next number when it begins an Across entry, a Down entry, or both:

- Across starts at the left edge or after a block, with at least one white square to the right.
- Down starts at the top edge or below a block, with at least one white square beneath it.
- A square that begins both entries gets one shared number.

Entries then collect consecutive white squares in their direction. Answers are rebuilt directly from the solution letters, while existing clue text is preserved by direction and start position.

## Puzzle format

Exported files are plain, portable JSON. A puzzle contains metadata, dimensions, a row/column-addressed cell list, and generated clue entries:

```json
{
  "id": "puzzle-…",
  "title": "Weekend Walk",
  "author": "Ada",
  "width": 7,
  "height": 7,
  "cells": [
    { "row": 0, "col": 0, "blocked": false, "solution": "S", "number": 1 }
  ],
  "clues": {
    "across": [
      {
        "id": "across-0-0",
        "number": 1,
        "direction": "across",
        "clue": "A bright beginning",
        "answer": "SUN",
        "startRow": 0,
        "startCol": 0,
        "cells": [{ "row": 0, "col": 0 }]
      }
    ],
    "down": []
  },
  "createdAt": "2026-01-01T12:00:00.000Z"
}
```

Imported files are shape-checked before opening. Clue numbers, entry cells, and answers are regenerated so stale derived data cannot corrupt the editor.

## Persistence and ownership

Drafts and local games stay in the current browser. Published puzzle definitions are stored in the Supabase `puzzles` table, with the complete grid and clue model in `puzzle_data` JSONB. Share URLs use six-character random slugs rather than database IDs.

Because this version does not require accounts, Crossly stores a high-entropy edit token locally after publishing. The database stores only its hash. Keep an exported JSON backup: clearing browser data preserves the public puzzle but removes that browser’s ability to update it.

## Ideas for what comes next

- Creator accounts and recoverable puzzle ownership
- Collaborative clue writing
- `.puz` import/export
- Undo/redo history in the constructor
- Word-list suggestions and fill assistance
- Accessibility preference controls and high-contrast themes

## Originality

Crossly uses an original name, interface, sample puzzle, and visual system. It does not include newspaper trademarks, proprietary fonts, branded assets, or copied puzzle content.
