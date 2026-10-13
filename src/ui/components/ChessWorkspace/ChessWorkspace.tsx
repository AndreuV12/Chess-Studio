"use client";

import { useState } from "react";
import InteractiveBoard from "@/ui/components/ChessWorkspace/InteractiveBoard/InteractiveBoard";
import ChessHistory from "@/ui/components/ChessWorkspace/ChessHistory/ChessHistory";
import DeleteMoveModal from "@/ui/components/ChessWorkspace/DeleteMoveModal";
import MovesPanel from "@/ui/components/ChessWorkspace/MovesPanel";
import OpeningTitle from "@/ui/components/ChessWorkspace/OpeningTitle";
import { useChessWorkspace } from "@/ui/components/ChessWorkspace/hooks/useChessWorkspace";
import { useStockfishAnalysis } from "@/ui/components/ChessWorkspace/hooks/useStockfishAnalysis";
import WorkspaceHeader from "@/ui/components/ChessWorkspace/WorkspaceHeader";
import { useChessKeyboardNavigation } from "@/ui/components/ChessWorkspace/hooks/useChessKeyboardNavigation";
import { useActionModal } from "@/ui/hooks/useActionModal";
import { getDescendantCount, type MoveNode } from "@/ui/utils/moveTree";

export type WorkspaceUser = {
  name: string | null;
  email: string;
};

type ChessWorkspaceProps = {
  user: WorkspaceUser;
};

export default function ChessWorkspace({ user }: ChessWorkspaceProps) {
  const [directDeletingMoveId, setDirectDeletingMoveId] = useState<number | null>(null);
  const {
    tree,
    currentMove,
    currentMoveId,
    children,
    fen,
    selectedBranches,
    applyMove,
    goToMove,
    selectBranch,
    goToPreviousMove,
    goToNextMove,
    changeVariant,
    updateMoveEvaluation,
    removeMove,
  } = useChessWorkspace();

  const deleteMoveModal = useActionModal<
    {
      moveId: number;
      descendantCount: number;
    },
    void
  >({
    action: ({ moveId }) => removeMove(moveId),
  });

  useChessKeyboardNavigation({
    onPrevious: goToPreviousMove,
    onNext: goToNextMove,
    onPreviousVariant: () => changeVariant(-1),
    onNextVariant: () => changeVariant(1),
  });

  const stockfish = useStockfishAnalysis({
    fen,
    currentMove,
    onEvaluationUpdated: updateMoveEvaluation,
  });

  async function requestMoveDeletion(move: MoveNode) {
    const descendantCount = getDescendantCount(move);
    if (descendantCount === 0) {
      setDirectDeletingMoveId(move.id);

      try {
        await removeMove(move.id);
      } finally {
        setDirectDeletingMoveId(null);
      }

      return;
    }
    deleteMoveModal.open({
      moveId: move.id,
      descendantCount,
    });
  }

  const deleteErrorMessage =
    deleteMoveModal.error instanceof Error ? deleteMoveModal.error.message : deleteMoveModal.error ? "No se pudo eliminar el movimiento." : null;
  const deletingMoveId = deleteMoveModal.loading ? (deleteMoveModal.data?.moveId ?? null) : directDeletingMoveId;

  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-5 lg:p-6">
      <WorkspaceHeader user={user} isStockfishReady={stockfish.isReady} />
      <OpeningTitle fen={fen} />

      <div className="mx-auto grid w-full max-w-150 gap-3 sm:gap-4 lg:max-w-none lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)]">
        <div className="min-w-0">
          <InteractiveBoard fen={fen} lastMove={currentMove} analysis={stockfish.analysis} children={children} onMove={applyMove} onGoToMove={goToMove} />
        </div>

        <div className="min-w-0">
          <MovesPanel
            fen={fen}
            moves={children}
            evaluation={currentMove?.evaluation ?? null}
            bestMoves={stockfish.analysis?.bestMoves ?? []}
            analysisDepth={stockfish.analysis?.depth ?? 0}
            deletingMoveId={deletingMoveId}
            onMoveClick={(move) => goToMove(move.id)}
            onDeleteRequest={requestMoveDeletion}
          />
        </div>
      </div>

      <ChessHistory tree={tree} currentMoveId={currentMoveId} selectedBranches={selectedBranches} onMoveClick={goToMove} onBranchSelect={selectBranch} />

      <DeleteMoveModal
        isOpen={deleteMoveModal.isOpen}
        descendantCount={deleteMoveModal.data?.descendantCount ?? 0}
        isDeleting={deleteMoveModal.loading}
        errorMessage={deleteErrorMessage}
        onClose={deleteMoveModal.close}
        onConfirm={deleteMoveModal.confirm}
      />
    </main>
  );
}
