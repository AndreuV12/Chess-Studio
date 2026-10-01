"use client";

import InteractiveBoard from "@/ui/components/ChessWorkspace/InteractiveBoard/InteractiveBoard";
import ChessHistory from "@/ui/components/ChessWorkspace/ChessHistory/ChessHistory";
import DeleteMoveModal from "@/ui/components/ChessWorkspace/DeleteMoveModal";
import MovesPanel from "@/ui/components/ChessWorkspace/MovesPanel";
import OpeningTitle from "@/ui/components/ChessWorkspace/OpeningTitle";
import { useChessWorkspace } from "@/ui/components/ChessWorkspace/hooks/useChessWorkspace";
import { useModal } from "@/ui/hooks/useModal";
import { useAction } from "@/ui/hooks/useAction";
import { useStockfishAnalysis } from "@/ui/components/ChessWorkspace/hooks/useStockfishAnalysis";
import WorkspaceHeader, { type WorkspaceUser } from "@/ui/components/ChessWorkspace/WorkspaceHeader";
import { useChessKeyboardNavigation } from "@/ui/components/ChessWorkspace/hooks/useChessKeyboardNavigation";
import { getMoveSan } from "@/ui/utils/chess";
import { getDescendantCount, type MoveNode } from "@/ui/utils/moveTree";

type ChessWorkspaceProps = {
  user: WorkspaceUser;
};

type DeleteMoveModalData = {
  moveId: number;
  moveSan: string;
  descendantCount: number;
};

export default function ChessWorkspace({ user }: ChessWorkspaceProps) {
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

  const deleteMoveModal = useModal<DeleteMoveModalData>();

  const deleteMoveAction = useAction({
    action: async (moveId: number) => {
      await removeMove(moveId);
    },
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
      await deleteMoveAction.execute(move.id);
      return;
    }
    deleteMoveModal.openModal({
      moveId: move.id,
      moveSan: getMoveSan(move),
      descendantCount,
    });
  }

  function closeDeleteMoveModal() {
    if (deleteMoveAction.loading) return;
    deleteMoveModal.closeModal();
  }

  async function confirmMoveDeletion() {
    if (!deleteMoveModal.data) return;
    const result = await deleteMoveAction.execute(deleteMoveModal.data.moveId);
    if (result !== null) {
      deleteMoveModal.closeModal();
    }
  }

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
            moves={children}
            evaluation={currentMove?.evaluation ?? null}
            onMoveClick={(move) => goToMove(move.id)}
            onDeleteRequest={requestMoveDeletion}
          />
        </div>
      </div>

      <ChessHistory tree={tree} currentMoveId={currentMoveId} selectedBranches={selectedBranches} onMoveClick={goToMove} onBranchSelect={selectBranch} />

      <DeleteMoveModal
        isOpen={deleteMoveModal.isOpen}
        moveSan={deleteMoveModal.data?.moveSan ?? ""}
        descendantCount={deleteMoveModal.data?.descendantCount ?? 0}
        isDeleting={deleteMoveAction.loading}
        errorMessage={deleteMoveAction.error instanceof Error ? deleteMoveAction.error.message : null}
        onClose={closeDeleteMoveModal}
        onConfirm={confirmMoveDeletion}
      />
    </main>
  );
}
