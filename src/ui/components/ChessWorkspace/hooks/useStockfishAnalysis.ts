import { useEffect, useRef, useState } from "react";
import { Stockfish } from "@/ui/engine/stockfish";
import type { EngineAnalysis } from "@/ui/engine/types";
import type { MoveResponse } from "@/app/api/moves/schemas";
import { PENDING_USER_ID } from "./useChessWorkspace";

type UseStockfishAnalysisProps = {
  fen: string;
  currentMove?: MoveResponse;
  onEvaluationUpdated: (moveId: number, evaluation: number) => Promise<void>;
};

export function useStockfishAnalysis({ fen, currentMove, onEvaluationUpdated }: UseStockfishAnalysisProps) {
  const [state, setState] = useState<{
    analysis: EngineAnalysis | null;
    isReady: boolean;
  }>({
    analysis: null,
    isReady: false,
  });
  const stockfishRef = useRef<Stockfish | null>(null);

  useEffect(() => {
    const stockfish = Stockfish.getInstance();
    stockfishRef.current = stockfish;

    const unsubscribe = stockfish.subscribeToReadyState((isReady) => {
      setState((current) => ({ ...current, isReady }));
    });

    return () => {
      unsubscribe();
      stockfish.stop();
    };
  }, []);

  useEffect(() => {
    const stockfish = stockfishRef.current;
    if (!stockfish || !currentMove) {
      setState((current) => ({ ...current, analysis: null }));
      return;
    }

    if (currentMove.userId == PENDING_USER_ID) return;

    if (currentMove.evaluation !== null) {
      setState((current) => ({
        ...current,
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

    if (!stockfish.isReady()) {
      setState((current) => ({ ...current, analysis: null }));
      return;
    }

    stockfish
      .analyze(fen, { depth: 18 })
      .then(async (analysis) => {
        if (!analysis) return;

        setState((current) => ({ ...current, analysis }));
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

  return state;
}
