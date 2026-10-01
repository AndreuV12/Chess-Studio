"use client";

import { useAction } from "./useAction";
import { useModal } from "./useModal";

type UseActionModalOptions<TData, TResult> = {
  action: (data: TData) => Promise<TResult>;
};

export function useActionModal<TData, TResult>({ action }: UseActionModalOptions<TData, TResult>) {
  const modal = useModal<TData>();

  const actionState = useAction({
    action,
    onSuccess: () => {
      modal.closeModal();
    },
  });

  function open(data: TData) {
    actionState.reset();
    modal.openModal(data);
  }

  function close() {
    if (actionState.loading) return;

    actionState.reset();
    modal.closeModal();
  }

  async function confirm() {
    if (!modal.data) return;

    await actionState.execute(modal.data);
  }

  return {
    isOpen: modal.isOpen,
    data: modal.data,
    loading: actionState.loading,
    error: actionState.error,
    open,
    close,
    confirm,
  };
}
