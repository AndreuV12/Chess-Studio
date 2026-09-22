import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type ChessNavigationProps = {
  currentIndex: number;
  historyLength: number;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
};

export default function ChessNavigation({ currentIndex, historyLength, onFirst, onPrevious, onNext, onLast }: ChessNavigationProps) {
  const buttonClass =
    "flex h-9 flex-1 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-200 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex w-full items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
      <button className={buttonClass} type="button" disabled={currentIndex === -1} onClick={onFirst}>
        <ChevronsLeft size={19} />
      </button>
      <button className={buttonClass} type="button" disabled={currentIndex === -1} onClick={onPrevious}>
        <ChevronLeft size={19} />
      </button>
      <button className={buttonClass} type="button" disabled={currentIndex >= historyLength - 1} onClick={onNext}>
        <ChevronRight size={19} />
      </button>
      <button className={buttonClass} type="button" disabled={currentIndex >= historyLength - 1} onClick={onLast}>
        <ChevronsRight size={19} />
      </button>
    </div>
  );
}
