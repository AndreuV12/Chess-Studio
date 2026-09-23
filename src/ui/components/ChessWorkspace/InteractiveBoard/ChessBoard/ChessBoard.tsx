"use client";

import { useMemo } from "react";
import { Chess, DEFAULT_POSITION, type Square } from "chess.js";
import ChessPiece from "@/ui/components/ChessWorkspace/InteractiveBoard/ChessBoard/ChessPiece";
import type { Move } from "@/types/move.types";

type ChessBoardProps = {
  fen?: string;
  selected?: Square | null;
  lastMove?: Move;
  rotated?: boolean;
  onSquareClick?: (square: Square) => void;
};

export default function ChessBoard({ fen = DEFAULT_POSITION, selected = null, lastMove, rotated = false, onSquareClick }: ChessBoardProps) {
  const chess = useMemo(() => new Chess(fen), [fen]);

  const squares = useMemo(() => {
    const ranks = rotated ? "12345678" : "87654321";
    const files = rotated ? "hgfedcba" : "abcdefgh";

    return Array.from({ length: 8 }, (_, row) =>
      Array.from({ length: 8 }, (_, col) => {
        const square = `${files[col]}${ranks[row]}` as Square;

        return {
          square,
          piece: chess.get(square),
        };
      }),
    ).flat();
  }, [chess, rotated]);

  function getSquareColor(square: Square, index: number) {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const isLight = (row + col) % 2 === 0;
    const isLastMove = square === lastMove?.uci.slice(0, 2) || square === lastMove?.uci.slice(2, 4);

    if (square === selected) {
      return isLight ? "bg-yellow-300" : "bg-yellow-500";
    }

    if (isLastMove) {
      return isLight ? "bg-amber-300/80" : "bg-amber-600/90";
    }

    return isLight ? "bg-orange-200/80" : "bg-orange-800/80";
  }

  return (
    <div className="grid aspect-square grid-cols-8 grid-rows-8 overflow-hidden rounded-lg border-4 border-gray-700">
      {squares.map(({ square, piece }, index) => (
        <button
          key={square}
          type="button"
          className={`${getSquareColor(square, index)} relative transition-colors duration-150`}
          onClick={() => onSquareClick?.(square)}
        >
          {piece && <ChessPiece type={piece.type} color={piece.color} className="h-full w-full" />}
        </button>
      ))}
    </div>
  );
}
