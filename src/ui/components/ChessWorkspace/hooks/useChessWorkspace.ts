import { useEffect, useMemo, useState } from "react";
import { DEFAULT_POSITION, type Move as ChessMove } from "chess.js";
import type { MoveResponse } from "@/app/api/moves/schemas";
import { MovesApi } from "@/ui/api/moves";
import { buildMoveTree, findMoveNode, getMovePath, type MoveNode } from "@/ui/utils/moveTree";

export const PENDING_USER_ID = -1;

export function useChessWorkspace() {
  const [moves, setMoves] = useState<MoveResponse[]>([]);
  const [currentMoveId, setCurrentMoveId] = useState<number | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<Record<string, number>>({});

  const tree = useMemo(() => buildMoveTree(moves), [moves]);
  const currentMove = useMemo(() => moves.find((move) => move.id === currentMoveId), [moves, currentMoveId]);
  const currentNode = useMemo(() => (currentMoveId === null ? undefined : findMoveNode(tree, currentMoveId)), [tree, currentMoveId]);

  const children = currentNode?.children ?? tree;
  const fen = currentMove?.fenTo ?? DEFAULT_POSITION;

  useEffect(() => {
    MovesApi.getAll().then(setMoves).catch(console.error);
  }, []);

  useEffect(() => {
    if (currentMoveId === null) return;
    const currentPath = getMovePath(tree, currentMoveId);
    if (!currentPath) return;
    setSelectedBranches((current) => {
      const next = { ...current };
      currentPath.forEach((move, index) => {
        const parentKey = index === 0 ? "root" : String(currentPath[index - 1].id);
        next[parentKey] = move.id;
      });
      return next;
    });
  }, [tree, currentMoveId]);

  async function applyMove(chessMove: ChessMove, fenTo: string) {
    const uci = `${chessMove.from}${chessMove.to}${chessMove.promotion ?? ""}`;
    const existingMove = children.find((move) => move.uci === uci);

    if (existingMove) {
      setCurrentMoveId(existingMove.id);
      return existingMove;
    }

    const tempId = -Date.now();

    const optimisticMove: MoveResponse = {
      id: tempId,
      userId: PENDING_USER_ID,
      parentId: currentMoveId,
      fenFrom: fen,
      fenTo,
      uci,
      evaluation: null,
    };

    setMoves((moves) => [...moves, optimisticMove]);
    setCurrentMoveId(tempId);

    try {
      const savedMove = await MovesApi.create({
        parentId: currentMoveId,
        fenFrom: fen,
        fenTo,
        uci,
        evaluation: null,
      });

      setMoves((moves) => moves.map((move) => (move.id === tempId ? savedMove : move)));
      setCurrentMoveId((currentId) => (currentId === tempId ? savedMove.id : currentId));

      return savedMove;
    } catch (error) {
      setMoves((moves) => moves.filter((move) => move.id !== tempId));
      setCurrentMoveId((currentId) => (currentId === tempId ? currentMoveId : currentId));
      throw error;
    }
  }

  function goToMove(moveId: number | null) {
    setCurrentMoveId(moveId);
  }

  function selectBranch(branchKey: string, moveId: number) {
    setSelectedBranches((current) => ({
      ...current,
      [branchKey]: moveId,
    }));
    setCurrentMoveId(moveId);
  }

  function goToPreviousMove() {
    if (!currentMove) return;

    setCurrentMoveId(currentMove.parentId);
  }

  function goToNextMove() {
    const nextMoves = currentNode?.children ?? tree;
    if (nextMoves.length === 0) return;

    const branchKey = currentMoveId === null ? "root" : String(currentMoveId);
    const selectedId = selectedBranches[branchKey];

    const nextMove = nextMoves.find((move) => move.id === selectedId) ?? getLongestNode(nextMoves);

    if (!nextMove) return;

    setCurrentMoveId(nextMove.id);
  }

  function changeVariant(direction: -1 | 1) {
    if (currentMoveId === null || !currentMove) return;
    const siblings = currentMove.parentId === null ? tree : (findMoveNode(tree, currentMove.parentId)?.children ?? []);
    if (siblings.length <= 1) return;
    const currentIndex = siblings.findIndex((move) => move.id === currentMoveId);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + direction + siblings.length) % siblings.length;
    const nextMove = siblings[nextIndex];
    const branchKey = currentMove.parentId === null ? "root" : String(currentMove.parentId);

    setSelectedBranches((current) => ({
      ...current,
      [branchKey]: nextMove.id,
    }));

    setCurrentMoveId(nextMove.id);
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
    selectedBranches,
    applyMove,
    goToMove,
    selectBranch,
    goToPreviousMove,
    goToNextMove,
    changeVariant,
    updateMoveEvaluation,
    removeMove,
  };
}

function getLongestNode(nodes: MoveNode[]): MoveNode | undefined {
  let longestNode: MoveNode | undefined;
  let longestDepth = -1;

  for (const node of nodes) {
    const depth = getDepth(node);
    if (depth > longestDepth) {
      longestDepth = depth;
      longestNode = node;
    }
  }

  return longestNode;
}

function getDepth(node: MoveNode): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(getDepth));
}
