export type Direction = "across" | "down";

export interface CellPosition {
  row: number;
  col: number;
}

export interface CrosswordCell extends CellPosition {
  blocked: boolean;
  solution: string;
  number?: number;
}

export interface CrosswordClue {
  id: string;
  number: number;
  direction: Direction;
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
  cells: CellPosition[];
}

export interface CrosswordPuzzle {
  id: string;
  title: string;
  author?: string;
  description?: string;
  width: number;
  height: number;
  cells: CrosswordCell[];
  clues: { across: CrosswordClue[]; down: CrosswordClue[] };
  createdAt: string;
  updatedAt?: string;
}

export interface CrosswordGameState {
  selectedCell: CellPosition | null;
  direction: Direction;
  values: Record<string, string>;
  incorrectCells: string[];
  revealedCells: string[];
  elapsedSeconds: number;
  completed: boolean;
  mistakes: number;
  lastPlayedAt?: string;
}

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  message: string;
  cell?: CellPosition;
  clueId?: string;
}
