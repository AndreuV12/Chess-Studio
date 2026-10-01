"use client";

import { useCallback, useState } from "react";

type ModalState<T> = {
  isOpen: boolean;
  data: T | null;
};

export function useModal<T = undefined>() {
  const [modal, setModal] = useState<ModalState<T>>({
    isOpen: false,
    data: null,
  });

  const openModal = useCallback((data?: T) => {
    setModal({
      isOpen: true,
      data: data ?? null,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal({
      isOpen: false,
      data: null,
    });
  }, []);

  return {
    ...modal,
    openModal,
    closeModal,
  };
}
