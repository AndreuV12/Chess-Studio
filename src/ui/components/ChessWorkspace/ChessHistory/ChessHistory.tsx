"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess, DEFAULT_POSITION, type Square } from "chess.js";
import MoveButton, { type PlayedMove } from "./MoveButton";
import type { MoveNode } from "@/ui/utils/moveTree";

type ChessHistoryProps = {
  tree: MoveNode[];
  currentMoveId: number | null;
  onMoveClick: (moveId: number) => void;
};

export default function ChessHistory({ tree, currentMoveId, onMoveClick }: ChessHistoryProps) {
  const [selectedBranches, setSelectedBranches] = useState<Record<string, number>>({});
  const [openBranch, setOpenBranch] = useState<string | null>(null);

  useEffect(() => {
    if (currentMoveId === null) return;

    const path = findPath(tree, currentMoveId);
    if (!path) return;

    setSelectedBranches((current) => {
      const next = { ...current };

      path.forEach((move, index) => {
        const parentKey = index === 0 ? "root" : String(path[index - 1].id);
        next[parentKey] = move.id;
      });

      return next;
    });
  }, [tree, currentMoveId]);

  const playedMoves = useMemo(() => buildPlayedMoves(tree, selectedBranches), [tree, selectedBranches]);

  const rows = [];

  for (let i = 0; i < playedMoves.length; i += 2) {
    rows.push({
      number: i / 2 + 1,
      white: playedMoves[i],
      black: playedMoves[i + 1],
    });
  }

  function selectBranch(move: PlayedMove, moveId: number) {
    setSelectedBranches((current) => ({
      ...current,
      [move.branchKey]: moveId,
    }));

    setOpenBranch(null);
    onMoveClick(moveId);
  }

  return (
    <div className="mx-auto mt-3 min-h-28 w-full max-w-150 rounded-lg border border-zinc-200 bg-white p-2 sm:min-h-32 sm:p-3 lg:min-h-40 lg:max-w-none">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {rows.map((row) => (
          <div key={row.number} className="flex items-center gap-0.5 rounded-md px-0.5 py-0.5">
            <span className="text-xs text-zinc-500 sm:text-sm">{row.number}.</span>

            <MoveButton
              move={row.white}
              active={currentMoveId === row.white.id}
              open={openBranch === row.white.branchKey}
              onMoveClick={onMoveClick}
              onToggle={() => setOpenBranch((current) => (current === row.white.branchKey ? null : row.white.branchKey))}
              onClose={() => setOpenBranch(null)}
              onSelect={(moveId) => selectBranch(row.white, moveId)}
            />

            {row.black && (
              <MoveButton
                move={row.black}
                active={currentMoveId === row.black.id}
                open={openBranch === row.black.branchKey}
                onMoveClick={onMoveClick}
                onToggle={() => setOpenBranch((current) => (current === row.black.branchKey ? null : row.black.branchKey))}
                onClose={() => setOpenBranch(null)}
                onSelect={(moveId) => selectBranch(row.black, moveId)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function buildPlayedMoves(tree: MoveNode[], selectedBranches: Record<string, number>): PlayedMove[] {
  const chess = new Chess(DEFAULT_POSITION);
  const playedMoves: PlayedMove[] = [];

  let nodes = tree;
  let parentKey = "root";

  while (nodes.length > 0) {
    const selectedId = selectedBranches[parentKey];
    const selectedNode = nodes.find((node) => node.id === selectedId) ?? getLongestNode(nodes);

    if (!selectedNode) break;

    const alternatives = nodes.map((node) => {
      const variationChess = new Chess(chess.fen());
      const move = playMove(variationChess, node);

      return {
        id: node.id,
        san: move.san,
      };
    });

    const playedMove = playMove(chess, selectedNode);

    playedMoves.push({
      id: selectedNode.id,
      san: playedMove.san,
      branchKey: parentKey,
      alternatives,
    });

    parentKey = String(selectedNode.id);
    nodes = selectedNode.children;
  }

  return playedMoves;
}

function playMove(chess: Chess, move: MoveNode) {
  return chess.move({
    from: move.uci.slice(0, 2) as Square,
    to: move.uci.slice(2, 4) as Square,
    promotion: move.uci[4],
  });
}

function findPath(nodes: MoveNode[], moveId: number, path: MoveNode[] = []): MoveNode[] | null {
  for (const node of nodes) {
    const nextPath = [...path, node];

    if (node.id === moveId) return nextPath;

    const found = findPath(node.children, moveId, nextPath);
    if (found) return found;
  }

  return null;
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
