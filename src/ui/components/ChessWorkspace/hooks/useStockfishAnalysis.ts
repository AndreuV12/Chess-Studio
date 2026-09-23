import { useEffect, useRef, useState } from "react";
import { Stockfish } from "@/ui/engine/stockfish";
import type { EngineAnalysis } from "@/ui/engine/types";
import type { Move } from "@/types/move.types";

type UseStockfishAnalysisProps = {
  fen: string;
  currentMove?: Move;
  onEvaluationUpdated: (moveId: number, evaluation: number) => Promise<void>;
};

export function useStockfishAnalysis({ fen, currentMove, onEvaluationUpdated }: UseStockfishAnalysisProps) {
  const [analysis, setAnalysis] = useState<EngineAnalysis | null>(null);
  const stockfishRef = useRef<Stockfish | null>(null);
  useEffect(() => {
    stockfishRef.current = Stockfish.getInstance();
    return () => {
      stockfishRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    const stockfish = stockfishRef.current;
    if (!stockfish || !currentMove) {
      setAnalysis(null);
      return;
    }
    if (currentMove.evaluation !== null) {
      setAnalysis({
        depth: 0,
        evaluation: currentMove.evaluation,
        mate: null,
        bestMove: null,
        pv: [],
      });
      return;
    }

    stockfish
      .analyze(fen, { depth: 18 })
      .then(async (analysis) => {
        setAnalysis(analysis);
        if (analysis.evaluation !== null) {
          await onEvaluationUpdated(currentMove.id, analysis.evaluation);
        }
      })
      .catch((error) => {
        if (error.message !== "Analysis cancelled") {
          console.error(error);
        }
      });

    return () => {
      stockfish.stop();
    };
  }, [currentMove, fen]);
  return analysis;
}
