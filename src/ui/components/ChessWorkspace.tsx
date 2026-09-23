"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stockfish } from "@/ui/engine/stockfish";

import { DEFAULT_POSITION, type Move as ChessMove } from "chess.js";
import { EngineAnalysis } from "@/ui/engine/types";

import InteractiveBoard from "@/ui/components/InteractiveBoard";
import ChessHistory from "@/ui/components/ChessHistory";
import MovesPanel from "@/ui/components/MovesPanel";
import OpeningTitle from "@/ui/components/OpeningTitle";
import { createMove, getMoves, updateMoveEvaluation } from "@/ui/api/moves";
import type { Move } from "@/server/db/schema/move";

export default function ChessWorkspace() {
  const [fen, setFen] = useState(DEFAULT_POSITION);
  const [moves, setMoves] = useState<Move[]>([]);
  const [history, setHistory] = useState<Move[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const currentMove = currentIndex >= 0 ? history[currentIndex] : undefined;

  const [analysis, setAnalysis] = useState<EngineAnalysis | null>(null);

  const stockfishRef = useRef<Stockfish | null>(null);

  useEffect(() => {
    stockfishRef.current = Stockfish.getInstance();
  }, []);

  useEffect(() => {
    if (!stockfishRef.current) return;
    if (!currentMove) {
      setAnalysis(null);
      return;
    }

    if (currentMove.evaluation !== null) {
      setAnalysis({
        depth: 0,
        evaluation: currentMove.evaluation,
        mate: null,
        bestMove: null,
        pv: [],
      });
      return;
    }

    stockfishRef.current
      .analyze(fen, { depth: 18 })
      .then(async (analysis) => {
        setAnalysis(analysis);
        if (analysis.evaluation === null) return;
        await updateMoveEvaluation(currentMove.id, analysis.evaluation);
        setMoves((moves) => moves.map((move) => (move.id === currentMove.id ? { ...move, evaluation: analysis.evaluation } : move)));
        setHistory((history) => history.map((move) => (move.id === currentMove.id ? { ...move, evaluation: analysis.evaluation } : move)));
      })
      .catch((error) => {
        if (error.message !== "Analysis cancelled") {
          console.error(error);
        }
      });
  }, [fen, currentMove]);

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
        userId: 1,
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
        <div className="w-full max-w-150">
          <InteractiveBoard
            fen={fen}
            lastMove={currentMove}
            analysis={analysis}
            currentIndex={currentIndex}
            historyLength={history.length}
            onMove={handleBoardMove}
            onFirst={goToFirst}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onLast={goToLast}
          />
        </div>

        <div className="flex-1">
          <MovesPanel
            fen={fen}
            moves={moves}
            onMoveClick={handleSavedMove}
            onDeleted={(ids) => {
              setMoves((moves) => moves.filter((move) => !ids.includes(move.id)));
              setHistory((history) => history.filter((move) => !ids.includes(move.id)));
            }}
          />
        </div>
      </div>

      <ChessHistory history={history} currentIndex={currentIndex} onMoveClick={goToMove} />
    </div>
  );
}
