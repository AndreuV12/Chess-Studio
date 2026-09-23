"use client";

import { useMemo, useState } from "react";
import { Chess, type Move as ChessMove, type Square } from "chess.js";
import { RotateCwSquare } from "lucide-react";
import ChessBoard from "@/ui/components/ChessWorkspace/InteractiveBoard/ChessBoard/ChessBoard";
import ChessNavigation from "@/ui/components/ChessWorkspace/InteractiveBoard/ChessNavigation";
import EvalBar from "@/ui/components/ChessWorkspace/InteractiveBoard/EvalBar";
import type { Move } from "@/types/move.types";
import type { MoveNode } from "@/ui/utils/moveTree";
import type { EngineAnalysis } from "@/ui/engine/types";

type InteractiveBoardProps = {
  fen: string;
  lastMove?: Move;
  children: MoveNode[];
  analysis?: EngineAnalysis | null;
  onMove?: (move: ChessMove, fen: string) => void;
  onGoToMove: (moveId: number | null) => void;
};

export default function InteractiveBoard({ fen, lastMove, children, analysis, onMove, onGoToMove }: InteractiveBoardProps) {
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

  function goToFirst() {
    onGoToMove(null);
  }

  function goToPrevious() {
    onGoToMove(lastMove?.parentId ?? null);
  }

  function goToNext() {
    const next = getLongestNode(children);
    if (next) onGoToMove(next.id);
  }

  function goToLast() {
    const last = getLastNode(children);
    if (last) onGoToMove(last.id);
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-1.5 sm:gap-2">
        <EvalBar evaluation={analysis?.evaluation ?? null} />
        <div className="min-w-0 flex-1">
          <ChessBoard fen={fen} selected={selected} lastMove={lastMove} rotated={rotated} onSquareClick={handleSquareClick} />
        </div>
      </div>

      <div className="flex gap-1">
        <ChessNavigation
          canGoPrevious={!!lastMove}
          canGoNext={children.length > 0}
          onFirst={goToFirst}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onLast={goToLast}
        />

        <button
          type="button"
          onClick={() => setRotated((rotated) => !rotated)}
          className="flex w-12 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:bg-zinc-200"
          aria-label="Girar tablero"
        >
          <RotateCwSquare size={22} />
        </button>
      </div>
    </div>
  );
}

function getLongestNode(nodes: MoveNode[]): MoveNode | undefined {
  return nodes.reduce<MoveNode | undefined>((longest, node) => {
    if (!longest) return node;
    return getDepth(node) > getDepth(longest) ? node : longest;
  }, undefined);
}

function getLastNode(nodes: MoveNode[]): MoveNode | undefined {
  let node = getLongestNode(nodes);
  if (!node) return;
  while (node.children.length > 0) {
    node = getLongestNode(node.children)!;
  }
  return node;
}

function getDepth(node: MoveNode): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(getDepth));
}
