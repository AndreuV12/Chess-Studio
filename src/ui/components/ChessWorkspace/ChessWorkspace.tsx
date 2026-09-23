"use client";

import InteractiveBoard from "@/ui/components/ChessWorkspace/InteractiveBoard/InteractiveBoard";
import ChessHistory from "@/ui/components/ChessWorkspace/ChessHistory";
import MovesPanel from "@/ui/components/ChessWorkspace/MovesPanel";
import OpeningTitle from "@/ui/components/ChessWorkspace/OpeningTitle";
import { useChessWorkspace } from "@/ui/components/ChessWorkspace/hooks/useChessWorkspace";
import { useStockfishAnalysis } from "@/ui/components/ChessWorkspace/hooks/useStockfishAnalysis";

export default function ChessWorkspace() {
  const { tree, moves, currentMove, currentMoveId, children, fen, applyMove, goToMove, updateMoveEvaluation, removeMove } = useChessWorkspace();

  const analysis = useStockfishAnalysis({
    fen,
    currentMove,
    onEvaluationUpdated: updateMoveEvaluation,
  });

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <OpeningTitle fen={fen} />

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full max-w-150">
          <InteractiveBoard fen={fen} lastMove={currentMove} analysis={analysis} children={children} onMove={applyMove} onGoToMove={goToMove} />
        </div>

        <div className="flex-1">
          <MovesPanel moves={children} onMoveClick={(move) => goToMove(move.id)} onDeleted={removeMove} />
        </div>
      </div>

      <ChessHistory tree={tree} currentMoveId={currentMoveId} onMoveClick={goToMove} />
    </div>
  );
}
