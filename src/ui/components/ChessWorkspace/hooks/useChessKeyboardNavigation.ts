import { useEffect } from "react";

type UseChessKeyboardNavigationProps = {
  onPrevious: () => void;
  onNext: () => void;
  onPreviousVariant: () => void;
  onNextVariant: () => void;
};

export function useChessKeyboardNavigation({ onPrevious, onNext, onPreviousVariant, onNextVariant }: UseChessKeyboardNavigationProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          onPrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          onNext();
          break;
        case "ArrowUp":
          event.preventDefault();
          onPreviousVariant();
          break;
        case "ArrowDown":
          event.preventDefault();
          onNextVariant();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPrevious, onNext, onPreviousVariant, onNextVariant]);
}
