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
  const onEvaluationUpdatedRef = useRef(onEvaluationUpdated);

  useEffect(() => {
    onEvaluationUpdatedRef.current = onEvaluationUpdated;
  }, [onEvaluationUpdated]);

  useEffect(() => {
    const stockfish = Stockfish.getInstance();
    stockfishRef.current = stockfish;

    const unsubscribe = stockfish.subscribeToReadyState((isReady) => {
      setState((current) => ({ ...current, isReady }));
    });

    return () => {
      unsubscribe();
      stockfish.stop();
      stockfishRef.current = null;
    };
  }, []);

  const moveId = currentMove?.id;
  const userId = currentMove?.userId;
  const savedEvaluation = currentMove?.evaluation;

  useEffect(() => {
    const stockfish = stockfishRef.current;

    if (!stockfish || !state.isReady) {
      setState((current) => ({
        ...current,
        analysis: null,
      }));
      return;
    }

    // No analizamos movimientos pendientes.
    if (userId === PENDING_USER_ID) {
      stockfish.stop();
      setState((current) => ({
        ...current,
        analysis: null,
      }));
      return;
    }

    let cancelled = false;

    stockfish
      .analyze(fen, {
        depth: 18,
        multiPV: 3,
      })
      .then(async (result) => {
        if (!result || cancelled) return;

        setState((current) => ({
          ...current,
          analysis: {
            ...result,
            evaluation: savedEvaluation ?? result.evaluation,
          },
        }));

        // Guardamos la evaluación solo si no existe.
        if (moveId !== undefined && savedEvaluation == null && result.evaluation !== null) {
          try {
            await onEvaluationUpdatedRef.current(moveId, result.evaluation);
          } catch (error) {
            console.error("[Stockfish] Error saving evaluation", error);
          }
        }
      })
      .catch((error) => {
        if (!cancelled && (!(error instanceof Error) || error.message !== "Analysis cancelled")) {
          console.error("[Stockfish]", error);
        }
      });

    return () => {
      cancelled = true;
      stockfish.stop();
    };
  }, [fen, moveId, userId, savedEvaluation, state.isReady]);

  return state;
}
