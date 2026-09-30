import { useEffect, useMemo, useState } from "react";
import { DEFAULT_POSITION, type Move as ChessMove } from "chess.js";
import type { MoveResponse } from "@/app/api/moves/schemas";
import { MovesApi } from "@/ui/api/moves";
import { buildMoveTree, findMoveNode, getMovePath } from "@/ui/utils/moveTree";

export function useChessWorkspace() {
  const [moves, setMoves] = useState<MoveResponse[]>([]);
  const [currentMoveId, setCurrentMoveId] = useState<number | null>(null);

  const tree = useMemo(() => buildMoveTree(moves), [moves]);
  const path = useMemo(() => getMovePath(tree, currentMoveId), [tree, currentMoveId]);
  const currentMove = useMemo(() => moves.find((move) => move.id === currentMoveId), [moves, currentMoveId]);
  const currentNode = useMemo(() => (currentMoveId === null ? undefined : findMoveNode(tree, currentMoveId)), [tree, currentMoveId]);
  const children = currentNode?.children ?? tree;
  const fen = currentMove?.fenTo ?? DEFAULT_POSITION;

  useEffect(() => {
    MovesApi.getAll().then(setMoves).catch(console.error);
  }, []);

  async function applyMove(chessMove: ChessMove, fenTo: string) {
    const uci = `${chessMove.from}${chessMove.to}${chessMove.promotion ?? ""}`;
    const existingMove = children.find((move) => move.uci === uci);

    if (existingMove) {
      setCurrentMoveId(existingMove.id);
      return existingMove;
    }

    const move = await MovesApi.create({
      parentId: currentMoveId,
      fenFrom: fen,
      fenTo,
      uci,
      evaluation: null,
    });

    setMoves((moves) => [...moves, move]);
    setCurrentMoveId(move.id);

    return move;
  }

  function goToMove(moveId: number | null) {
    setCurrentMoveId(moveId);
  }

  async function removeMove(moveId: number) {
    const { deletedIds } = await MovesApi.deleteWithChildren(moveId);
    setMoves((moves) => moves.filter((move) => !deletedIds.includes(move.id)));

    if (currentMoveId !== null && deletedIds.includes(currentMoveId)) {
      setCurrentMoveId(null);
    }
  }

  async function updateMoveEvaluation(moveId: number, evaluation: number) {
    await MovesApi.updateEvaluation(moveId, evaluation);
    setMoves((moves) => moves.map((move) => (move.id === moveId ? { ...move, evaluation } : move)));
  }

  return {
    tree,
    moves,
    currentMove,
    currentMoveId,
    children,
    fen,
    applyMove,
    goToMove,
    updateMoveEvaluation,
    removeMove,
  };
}
