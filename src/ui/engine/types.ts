export type AnalyzeOptions = {
  depth?: number;
  multiPV?: number;
};

export type EngineBestMove = {
  rank: number;
  move: string;
  evaluation: number | null;
  mate: number | null;
  pv: string[];
};

export type EngineAnalysis = {
  depth: number;
  evaluation: number | null;
  mate: number | null;
  bestMove: string | null;
  pv: string[];
  bestMoves: EngineBestMove[];
};

export type PendingAnalysis = {
  turn: "w" | "b";
  resolve: (analysis: EngineAnalysis) => void;
  reject: (error: Error) => void;
  latest: EngineAnalysis;
  lines: Map<number, Map<number, EngineBestMove>>;
  requestedDepth: number;
  multiPV: number;
  cancelled: boolean;
};
