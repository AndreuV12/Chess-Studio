export type EngineAnalysis = {
  depth: number;
  evaluation: number | null;
  mate: number | null;
  bestMove: string | null;
  pv: string[];
};

export type AnalyzeOptions = {
  depth?: number;
};
