"use client";

import InteractiveBoard from "@/ui/components/ChessWorkspace/InteractiveBoard/InteractiveBoard";
import ChessHistory from "@/ui/components/ChessWorkspace/ChessHistory";
import MovesPanel from "@/ui/components/ChessWorkspace/MovesPanel";
import OpeningTitle from "@/ui/components/ChessWorkspace/OpeningTitle";
import { useChessWorkspace } from "@/ui/components/ChessWorkspace/hooks/useChessWorkspace";
import { useStockfishAnalysis } from "@/ui/components/ChessWorkspace/hooks/useStockfishAnalysis";
import WorkspaceHeader, { type WorkspaceUser } from "@/ui/components/ChessWorkspace/WorkspaceHeader";

type ChessWorkspaceProps = {
  user: WorkspaceUser;
};

export default function ChessWorkspace({ user }: ChessWorkspaceProps) {
  const { tree, moves, currentMove, currentMoveId, children, fen, applyMove, goToMove, updateMoveEvaluation, removeMove } = useChessWorkspace();

  const stockfish = useStockfishAnalysis({
    fen,
    currentMove,
    onEvaluationUpdated: updateMoveEvaluation,
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-5 lg:p-6">
      <WorkspaceHeader user={user} isStockfishReady={stockfish.isReady} />
      <OpeningTitle fen={fen} />

      <div className="mx-auto grid w-full max-w-150 gap-3 sm:gap-4 lg:max-w-none lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)]">
        <div className="min-w-0">
          <InteractiveBoard fen={fen} lastMove={currentMove} analysis={stockfish.analysis} children={children} onMove={applyMove} onGoToMove={goToMove} />
        </div>

        <div className="min-w-0">
          <MovesPanel moves={children} onMoveClick={(move) => goToMove(move.id)} onDeleted={removeMove} />
        </div>
      </div>

      <ChessHistory tree={tree} currentMoveId={currentMoveId} onMoveClick={goToMove} />
    </main>
  );
}
