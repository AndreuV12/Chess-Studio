"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_POSITION, type Move as ChessMove } from "chess.js";
import InteractiveBoard from "@/components/InteractiveBoard";
import ChessHistory from "@/components/ChessHistory";
import ChessNavigation from "@/components/ChessNavigation";
import MovesPanel from "@/components/MovesPanel";
import OpeningTitle from "@/components/OpeningTitle";
import { createMove, getMoves } from "@/api/moves";
import type { Move } from "@/db/schema/move";

export default function ChessWorkspace() {
  const [fen, setFen] = useState(DEFAULT_POSITION);
  const [moves, setMoves] = useState<Move[]>([]);
  const [history, setHistory] = useState<Move[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    getMoves()
      .then((moves) => {
        setMoves(moves);

        const initialHistory = buildLine(DEFAULT_POSITION, moves);

        setHistory(initialHistory);
        setCurrentIndex(-1);
        setFen(DEFAULT_POSITION);
      })
      .catch(console.error);
  }, []);

  const availableMoves = useMemo(() => moves.filter((move) => move.fenFrom === fen), [moves, fen]);

  function buildLine(fenFrom: string, allMoves: Move[]) {
    const line: Move[] = [];
    let currentFen = fenFrom;

    while (true) {
      const nextMove = allMoves.find((move) => move.fenFrom === currentFen);

      if (!nextMove) break;

      line.push(nextMove);
      currentFen = nextMove.fenTo;
    }

    return line;
  }

  async function applyMove(fenFrom: string, fenTo: string, uci: string) {
    let move = moves.find((move) => move.fenFrom === fenFrom && move.uci === uci);

    let allMoves = moves;

    if (!move) {
      move = await createMove({
        fenFrom,
        fenTo,
        uci,
        evaluation: null,
      });

      allMoves = [...moves, move];
      setMoves(allMoves);
    }

    const prefix = history.slice(0, currentIndex + 1);
    const continuation = buildLine(move.fenTo, allMoves);

    const nextHistory = [...prefix, move, ...continuation];

    setHistory(nextHistory);
    setCurrentIndex(prefix.length);
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
    <div className="mx-auto w-full max-w-5xl p-6">
      <OpeningTitle fen={fen} />
      <div className="flex gap-4">
        <div className="w-full max-w-2xl space-y-1">
          <InteractiveBoard fen={fen} onMove={handleBoardMove} />
          <ChessNavigation
            currentIndex={currentIndex}
            historyLength={history.length}
            onFirst={goToFirst}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onLast={goToLast}
          />
        </div>

        <div className="flex-1">
          <MovesPanel moves={availableMoves} onMoveClick={handleSavedMove} />
        </div>
      </div>

      <ChessHistory history={history} currentIndex={currentIndex} onMoveClick={goToMove} />
    </div>
  );
}
