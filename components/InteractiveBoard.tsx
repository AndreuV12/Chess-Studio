"use client";

import { useMemo, useState } from "react";
import { Chess, type Move, type Square } from "chess.js";
import ChessBoard from "@/components/ChessBoard";

type InteractiveBoardProps = {
  fen: string;
  rotated?: boolean;
  onMove?: (move: Move, fen: string) => void;
};

export default function InteractiveBoard({ fen, rotated = false, onMove }: InteractiveBoardProps) {
  const [selected, setSelected] = useState<Square | null>(null);

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

  return <ChessBoard fen={fen} selected={selected} rotated={rotated} onSquareClick={handleSquareClick} />;
}
