"use client";

import InteractiveBoard from "@/ui/components/ChessWorkspace/InteractiveBoard/InteractiveBoard";
import ChessHistory from "@/ui/components/ChessWorkspace/ChessHistory";
import MovesPanel from "@/ui/components/ChessWorkspace/MovesPanel";
import OpeningTitle from "@/ui/components/ChessWorkspace/OpeningTitle";
import StockfishStatus from "@/ui/components/ChessWorkspace/StockfishStatus";
import { useChessWorkspace } from "@/ui/components/ChessWorkspace/hooks/useChessWorkspace";
import { useStockfishAnalysis } from "@/ui/components/ChessWorkspace/hooks/useStockfishAnalysis";

export default function ChessWorkspace() {
  const { tree, moves, currentMove, currentMoveId, children, fen, applyMove, goToMove, updateMoveEvaluation, removeMove } = useChessWorkspace();

  const stockfish = useStockfishAnalysis({
    fen,
    currentMove,
    onEvaluationUpdated: updateMoveEvaluation,
  });

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <OpeningTitle fen={fen} />
        <StockfishStatus isReady={stockfish.isReady} />
      </header>

      <div className="flex gap-4">
        <div className="w-full max-w-150">
          <InteractiveBoard fen={fen} lastMove={currentMove} analysis={stockfish.analysis} children={children} onMove={applyMove} onGoToMove={goToMove} />
        </div>

        <div className="flex-1">
          <MovesPanel moves={children} onMoveClick={(move) => goToMove(move.id)} onDeleted={removeMove} />
        </div>
      </div>

      <ChessHistory tree={tree} currentMoveId={currentMoveId} onMoveClick={goToMove} />
    </div>
  );
}
