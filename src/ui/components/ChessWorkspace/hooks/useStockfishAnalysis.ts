import { useEffect, useRef, useState } from "react";
import { Stockfish } from "@/ui/engine/stockfish";
import type { EngineAnalysis } from "@/ui/engine/types";
import type { Move } from "@/types/move.types";

type UseStockfishAnalysisProps = {
  fen: string;
  currentMove?: Move;
  onEvaluationUpdated: (moveId: number, evaluation: number) => Promise<void>;
};

type StockfishAnalysisState = {
  analysis: EngineAnalysis | null;
  isReady: boolean;
};

export function useStockfishAnalysis({ fen, currentMove, onEvaluationUpdated }: UseStockfishAnalysisProps) {
  const [state, setState] = useState<StockfishAnalysisState>({
    analysis: null,
    isReady: false,
  });
  const stockfishRef = useRef<Stockfish | null>(null);

  useEffect(() => {
    const stockfish = Stockfish.getInstance();
    stockfishRef.current = stockfish;
    const unsubscribe = stockfish.subscribeToReady((isReady) => {
      setState((state) => ({ ...state, isReady }));
    });

    return () => {
      unsubscribe();
      stockfish.stop();
    };
  }, []);

  useEffect(() => {
    const stockfish = stockfishRef.current;
    if (!stockfish || !currentMove) {
      setState((state) => ({ ...state, analysis: null }));
      return;
    }

    if (currentMove.evaluation !== null) {
      setState((state) => ({
        ...state,
        analysis: {
          depth: 0,
          evaluation: currentMove.evaluation,
          mate: null,
          bestMove: null,
          pv: [],
        },
      }));
      return;
    }

    if (!state.isReady) {
      setState((state) => ({ ...state, analysis: null }));
      return;
    }

    stockfish
      .analyze(fen, { depth: 18 })
      .then(async (analysis) => {
        setState((state) => ({ ...state, analysis }));
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
  }, [currentMove, state.isReady]);

  return state;
}
