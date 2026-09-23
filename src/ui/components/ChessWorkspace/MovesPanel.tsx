import { useMemo } from "react";
import { Chess, type Square } from "chess.js";
import { Trash2 } from "lucide-react";
import type { Move } from "@/server/db/schema/move";
// import { deleteMoveBranch } from "@/api/moves";

type MovesPanelProps = {
  fen: string;
  moves: Move[];
  onMoveClick?: (move: Move) => void;
  onDeleted?: (ids: number[]) => void;
};

export default function MovesPanel({ fen, moves, onMoveClick, onDeleted }: MovesPanelProps) {
  const availableMoves = useMemo(() => moves.filter((move) => move.fenFrom === fen), [moves, fen]);

  const movesByFen = useMemo(() => {
    const map = new Map<string, Move[]>();

    for (const move of moves) {
      const children = map.get(move.fenFrom) ?? [];
      children.push(move);
      map.set(move.fenFrom, children);
    }

    return map;
  }, [moves]);

  function getSan(move: Move) {
    const chess = new Chess(move.fenFrom);
    const chessMove = chess.move({
      from: move.uci.slice(0, 2) as Square,
      to: move.uci.slice(2, 4) as Square,
      promotion: move.uci[4],
    });

    return chessMove.san;
  }

  function getDescendantCount(move: Move) {
    const visited = new Set<number>();

    function walk(current: Move) {
      if (visited.has(current.id)) return;
      visited.add(current.id);

      const children = movesByFen.get(current.fenTo) ?? [];

      for (const child of children) {
        walk(child);
      }
    }

    walk(move);

    return visited.size - 1;
  }

  function formatEvaluation(evaluation: number) {
    return evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
  }

  async function handleDelete(move: Move) {
    // const deletedIds = await deleteMoveBranch(move.id);
    // onDeleted?.(deletedIds);
  }

  return (
    <div className="h-full rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">Jugadas guardadas</h2>

      {availableMoves.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay jugadas guardadas desde esta posición.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {availableMoves.map((move) => {
            const descendants = getDescendantCount(move);

            return (
              <div key={move.id} className="flex overflow-hidden rounded-md border border-zinc-200">
                <button
                  type="button"
                  onClick={() => onMoveClick?.(move)}
                  className="flex flex-1 items-center justify-between px-3 py-2 text-left transition hover:bg-zinc-100"
                >
                  <div>
                    <span className="font-medium">{getSan(move)}</span>
                    {descendants > 0 && (
                      <span className="ml-2 text-xs text-zinc-400">
                        +{descendants} {descendants === 1 ? "jugada" : "jugadas"}
                      </span>
                    )}
                  </div>

                  {move.evaluation !== null && <span className="text-sm font-medium text-zinc-500">{formatEvaluation(move.evaluation)}</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(move)}
                  className="flex w-10 items-center justify-center border-l border-zinc-200 text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Eliminar variante"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
