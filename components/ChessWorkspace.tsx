"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess, DEFAULT_POSITION, type Move as ChessMove, type Square } from "chess.js";
import InteractiveBoard from "@/components/InteractiveBoard";
import ChessHistory from "@/components/ChessHistory";
import MovesPanel from "@/components/MovesPanel";
import { createMove, getMoves } from "@/api/moves";
import type { Move } from "@/db/schema/move";

export default function ChessWorkspace() {
  const [fen, setFen] = useState(DEFAULT_POSITION);
  const [moves, setMoves] = useState<Move[]>([]);
  const [history, setHistory] = useState<Move[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    getMoves().then(setMoves).catch(console.error);
  }, []);

  const availableMoves = useMemo(() => moves.filter((move) => move.fenFrom === fen), [moves, fen]);

  async function applyMove(fenFrom: string, fenTo: string, uci: string) {
    let move = moves.find((move) => move.fenFrom === fenFrom && move.uci === uci);

    if (!move) {
      move = await createMove({
        fenFrom,
        fenTo,
        uci,
        evaluation: null,
      });

      setMoves((current) => [...current, move!]);
    }

    const nextHistory = [...history.slice(0, currentIndex + 1), move];

    setHistory(nextHistory);
    setCurrentIndex(nextHistory.length - 1);
    setFen(move.fenTo);
  }

  async function handleBoardMove(chessMove: ChessMove, newFen: string) {
    const uci = `${chessMove.from}${chessMove.to}${chessMove.promotion ?? ""}`;

    await applyMove(fen, newFen, uci);
  }

  async function handleSavedMove(move: Move) {
    await applyMove(move.fenFrom, move.fenTo, move.uci);
  }

  function goToMove(index: number) {
    setCurrentIndex(index);
    setFen(index === -1 ? DEFAULT_POSITION : history[index].fenTo);
  }

  function goToFirst() {
    goToMove(-1);
  }

  function goToPrevious() {
    if (currentIndex >= 0) {
      goToMove(currentIndex - 1);
    }
  }

  function goToNext() {
    if (currentIndex < history.length - 1) {
      goToMove(currentIndex + 1);
    }
  }

  function goToLast() {
    if (history.length > 0) {
      goToMove(history.length - 1);
    }
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex flex-1 justify-center p-6">
        <div className="w-full max-w-2xl">
          <InteractiveBoard fen={fen} onMove={handleBoardMove} />

          <ChessHistory
            history={history}
            currentIndex={currentIndex}
            onMoveClick={goToMove}
            onFirst={goToFirst}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onLast={goToLast}
          />
        </div>
      </main>

      <MovesPanel moves={availableMoves} onMoveClick={handleSavedMove} />
    </div>
  );
}
