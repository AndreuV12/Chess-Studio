"use client";

import { useMemo, useState } from "react";
import { Chess, type Move, type Square } from "chess.js";
import { RotateCwSquare } from "lucide-react";
import ChessBoard from "@/components/ChessBoard";
import ChessNavigation from "@/components/ChessNavigation";
import EvalBar from "@/components/EvalBar";
import type { Move as MoveSchema } from "@/db/schema/move";
import type { EngineAnalysis } from "@/engine/types";

type InteractiveBoardProps = {
  fen: string;
  lastMove?: MoveSchema;
  analysis?: EngineAnalysis | null;
  currentIndex: number;
  historyLength: number;
  onMove?: (move: Move, fen: string) => void;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
};

export default function InteractiveBoard({
  fen,
  lastMove,
  analysis,
  currentIndex,
  historyLength,
  onMove,
  onFirst,
  onPrevious,
  onNext,
  onLast,
}: InteractiveBoardProps) {
  const [selected, setSelected] = useState<Square | null>(null);
  const [rotated, setRotated] = useState(false);
  const chess = useMemo(() => new Chess(fen), [fen]);

  function handleSquareClick(square: Square) {
    const piece = chess.get(square);

    if (!selected) {
      if (!piece || piece.color !== chess.turn()) return;
      setSelected(square);
      return;
    }

    if (square === selected) {
      setSelected(null);
      return;
    }

    const legalMoves = chess.moves({
      square: selected,
      verbose: true,
    });

    const legalMove = legalMoves.find((move) => move.to === square);

    if (!legalMove) {
      setSelected(null);
      return;
    }

    const game = new Chess(fen);
    const move = game.move({
      from: selected,
      to: square,
      promotion: "q",
    });

    setSelected(null);
    onMove?.(move, game.fen());
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2 border">
        <EvalBar evaluation={analysis?.evaluation ?? null} />

        <div className="flex-1">
          <ChessBoard fen={fen} selected={selected} lastMove={lastMove} rotated={rotated} onSquareClick={handleSquareClick} />
        </div>
      </div>

      <div className="flex gap-1">
        <ChessNavigation currentIndex={currentIndex} historyLength={historyLength} onFirst={onFirst} onPrevious={onPrevious} onNext={onNext} onLast={onLast} />

        <button
          type="button"
          onClick={() => setRotated((rotated) => !rotated)}
          className="flex w-12 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:bg-zinc-200"
        >
          <RotateCwSquare size={22} />
        </button>
      </div>
    </div>
  );
}
