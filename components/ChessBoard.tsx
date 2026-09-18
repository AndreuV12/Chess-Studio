"use client";

import { useMemo } from "react";
import { Chess, DEFAULT_POSITION, type Square } from "chess.js";
import ChessPiece from "@/components/ChessPiece";

type ChessBoardProps = {
  fen?: string;
  selected?: Square | null;
  lastMoved?: Square[];
  rotated?: boolean;
  onSquareClick?: (square: Square) => void;
};

export default function ChessBoard({ fen = DEFAULT_POSITION, selected = null, lastMoved = [], rotated = false, onSquareClick }: ChessBoardProps) {
  const board = useMemo(() => new Chess(fen).board(), [fen]);

  const squares = useMemo(() => {
    const ranks = rotated ? "12345678" : "87654321";
    const files = rotated ? "hgfedcba" : "abcdefgh";

    return Array.from({ length: 8 }, (_, row) =>
      Array.from({ length: 8 }, (_, col) => ({
        square: `${files[col]}${ranks[row]}` as Square,
        piece: board[row][col],
      })),
    ).flat();
  }, [board, rotated]);

  function getSquareColor(square: Square, index: number) {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const isLight = (row + col) % 2 === 0;

    if (square === selected) {
      return isLight ? "bg-yellow-300/80" : "bg-yellow-600/80";
    }
    if (lastMoved.includes(square)) {
      return isLight ? "bg-orange-300" : "bg-amber-700/80";
    }
    return isLight ? "bg-orange-200/80" : "bg-orange-800/80";
  }

  return (
    <div className="grid aspect-square grid-cols-8 grid-rows-8 overflow-hidden rounded-lg border-4 border-gray-700">
      {" "}
      {squares.map(({ square, piece }, index) => (
        <button key={square} type="button" className={getSquareColor(square, index)} onClick={() => onSquareClick?.(square)}>
          {piece && <ChessPiece type={piece.type} color={piece.color} className="h-full w-full" />}
        </button>
      ))}
    </div>
  );
}
