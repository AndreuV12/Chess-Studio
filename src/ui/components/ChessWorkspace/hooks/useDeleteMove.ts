"use client";

import { useAction } from "@/ui/hooks/useAction";
import { useModal } from "@/ui/hooks/useModal";
import { getDescendantCount, type MoveNode } from "@/ui/utils/moveTree";

type DeleteMoveModalData = {
  moveId: number;
  descendantCount: number;
};

type UseDeleteMoveProps = {
  removeMove: (moveId: number) => Promise<void>;
};

export function useDeleteMove({ removeMove }: UseDeleteMoveProps) {
  const modal = useModal<DeleteMoveModalData>();

  const action = useAction({
    action: async (moveId: number) => {
      await removeMove(moveId);
    },
    onSuccess: () => {
      modal.closeModal();
    },
  });

  async function requestDelete(move: MoveNode) {
    const descendantCount = getDescendantCount(move);

    if (descendantCount === 0) {
      await action.execute(move.id);
      return;
    }

    action.reset();

    modal.openModal({
      moveId: move.id,
      descendantCount,
    });
  }

  async function confirmDelete() {
    if (!modal.data) return;

    await action.execute(modal.data.moveId);
  }

  function closeModal() {
    if (action.loading) return;

    modal.closeModal();
    action.reset();
  }

  const errorMessage = action.error instanceof Error ? action.error.message : action.error ? "No se pudo eliminar el movimiento." : null;

  return {
    isOpen: modal.isOpen,
    descendantCount: modal.data?.descendantCount ?? 0,
    loading: action.loading,
    errorMessage,
    requestDelete,
    confirmDelete,
    closeModal,
  };
}
