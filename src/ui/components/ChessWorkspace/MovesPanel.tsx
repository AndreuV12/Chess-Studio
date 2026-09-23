import { Chess, type Square } from "chess.js";
import { Trash2 } from "lucide-react";
import type { MoveNode } from "@/ui/utils/moveTree";

type MovesPanelProps = {
  moves: MoveNode[];
  onMoveClick?: (move: MoveNode) => void;
  onDeleted?: (moveId: number) => void;
};

export default function MovesPanel({ moves, onMoveClick, onDeleted }: MovesPanelProps) {
  function getSan(move: MoveNode) {
    const chess = new Chess(move.fenFrom);
    const chessMove = chess.move({
      from: move.uci.slice(0, 2) as Square,
      to: move.uci.slice(2, 4) as Square,
      promotion: move.uci[4],
    });

    return chessMove.san;
  }

  function getDescendantCount(move: MoveNode): number {
    return move.children.reduce((total, child) => total + 1 + getDescendantCount(child), 0);
  }

  function formatEvaluation(evaluation: number) {
    return evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
  }

  async function handleDelete(move: MoveNode) {
    onDeleted?.(move.id);
  }

  return (
    <div className="h-full rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">Jugadas guardadas</h2>

      {moves.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay jugadas guardadas desde esta posición.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {moves.map((move) => {
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
