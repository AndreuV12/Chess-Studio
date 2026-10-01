import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type ChessNavigationProps = {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
};

export default function ChessNavigation({ canGoPrevious, canGoNext, onFirst, onPrevious, onNext, onLast }: ChessNavigationProps) {
  const buttonClass =
    "flex h-6 sm:h-8 flex-1 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-200 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="flex w-full items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
      <button className={buttonClass} type="button" disabled={!canGoPrevious} onClick={onFirst} aria-label="Ir al inicio">
        <ChevronsLeft size={19} />
      </button>

      <button className={buttonClass} type="button" disabled={!canGoPrevious} onClick={onPrevious} aria-label="Jugada anterior">
        <ChevronLeft size={19} />
      </button>

      <button className={buttonClass} type="button" disabled={!canGoNext} onClick={onNext} aria-label="Jugada siguiente">
        <ChevronRight size={19} />
      </button>

      <button className={buttonClass} type="button" disabled={!canGoNext} onClick={onLast} aria-label="Ir al final">
        <ChevronsRight size={19} />
      </button>
    </div>
  );
}
