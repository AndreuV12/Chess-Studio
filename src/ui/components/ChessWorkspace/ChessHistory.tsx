import { Chess, DEFAULT_POSITION, type Square } from "chess.js";
import type { MoveNode } from "@/ui/utils/moveTree";

type ChessHistoryProps = {
  tree: MoveNode[];
  currentMoveId: number | null;
  onMoveClick: (moveId: number) => void;
};

export default function ChessHistory({ tree, currentMoveId, onMoveClick }: ChessHistoryProps) {
  const line = buildVisibleLine(tree, currentMoveId);
  const chess = new Chess(DEFAULT_POSITION);

  const playedMoves = line.map((move) => {
    const chessMove = chess.move({
      from: move.uci.slice(0, 2) as Square,
      to: move.uci.slice(2, 4) as Square,
      promotion: move.uci[4],
    });

    return {
      id: move.id,
      san: chessMove.san,
    };
  });

  const rows = [];

  for (let i = 0; i < playedMoves.length; i += 2) {
    rows.push({
      number: i / 2 + 1,
      white: playedMoves[i],
      black: playedMoves[i + 1],
    });
  }

  return (
    <div className="mx-auto mt-3 min-h-28 w-full max-w-150 rounded-lg border border-zinc-200 bg-white p-2 sm:min-h-32 sm:p-3 lg:max-w-none lg:min-h-40">
      <div className="flex flex-wrap gap-x-2 gap-y-1">
        {rows.map((row) => (
          <div key={row.number} className="flex items-center gap-1">
            <span className="text-xs text-zinc-500 sm:text-sm">{row.number}.</span>

            <button
              type="button"
              onClick={() => onMoveClick(row.white.id)}
              className={`min-h-10 rounded px-2 py-1 text-sm transition hover:bg-zinc-200 ${
                currentMoveId === row.white.id ? "bg-zinc-200 text-zinc-950" : "text-zinc-700"
              }`}
            >
              {row.white.san}
            </button>

            {row.black && (
              <button
                type="button"
                onClick={() => onMoveClick(row.black.id)}
                className={`min-h-10 rounded px-2 py-1 text-sm transition hover:bg-zinc-200 ${
                  currentMoveId === row.black.id ? "bg-zinc-200 text-zinc-950" : "text-zinc-700"
                }`}
              >
                {row.black.san}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function buildVisibleLine(tree: MoveNode[], currentMoveId: number | null): MoveNode[] {
  if (tree.length === 0) return [];

  if (currentMoveId === null) {
    const root = getLongestNode(tree);
    return root ? [root, ...getLongestContinuation(root)] : [];
  }

  const path = findPath(tree, currentMoveId);
  if (!path) return [];

  const currentMove = path[path.length - 1];

  return [...path, ...getLongestContinuation(currentMove)];
}

function findPath(nodes: MoveNode[], moveId: number, path: MoveNode[] = []): MoveNode[] | null {
  for (const node of nodes) {
    const nextPath = [...path, node];

    if (node.id === moveId) {
      return nextPath;
    }

    const found = findPath(node.children, moveId, nextPath);

    if (found) {
      return found;
    }
  }

  return null;
}

function getLongestContinuation(node: MoveNode): MoveNode[] {
  if (node.children.length === 0) return [];

  const child = getLongestNode(node.children);

  if (!child) return [];

  return [child, ...getLongestContinuation(child)];
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
