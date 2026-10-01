import { Chess } from "chess.js";
import { LoaderCircle, Trash2 } from "lucide-react";
import { getMoveSan } from "@/ui/utils/chess";
import { getMoveQuality, moveQualityConfig } from "@/ui/utils/moveEvaluation";
import { getDescendantCount, type MoveNode } from "@/ui/utils/moveTree";

type MovesPanelProps = {
  moves: MoveNode[];
  evaluation: number | null;
  deletingMoveId: number | null;
  onMoveClick?: (move: MoveNode) => void;
  onDeleteRequest?: (move: MoveNode) => void;
};

export default function MovesPanel({ moves, evaluation, deletingMoveId, onMoveClick, onDeleteRequest }: MovesPanelProps) {
  function formatEvaluation(evaluation: number) {
    return evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
  }

  const sortedMoves = [...moves].sort((a, b) => {
    const aEvaluation = a.evaluation;
    const bEvaluation = b.evaluation;
    if (aEvaluation == null && bEvaluation == null) return 0;
    if (aEvaluation == null) return 1;
    if (bEvaluation == null) return -1;
    const turn = new Chess(a.fenFrom).turn();
    return turn === "w" ? bEvaluation - aEvaluation : aEvaluation - bEvaluation;
  });

  return (
    <section className="h-full min-w-0 rounded-lg border border-zinc-200 bg-white p-3 sm:p-4">
      <h2 className="mb-3 text-base font-semibold text-zinc-900 sm:mb-4 sm:text-lg">Jugadas guardadas</h2>

      {moves.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay jugadas guardadas desde esta posición.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedMoves.map((move) => {
            const descendants = getDescendantCount(move);
            const isDeleting = deletingMoveId === move.id;
            const quality = getMoveQuality(evaluation, move.evaluation, new Chess(move.fenFrom).turn());
            const qualityInfo = quality ? moveQualityConfig[quality] : null;
            const QualityIcon = qualityInfo?.icon;

            return (
              <div key={move.id} className="flex overflow-hidden rounded-md border border-zinc-200">
                <button
                  type="button"
                  onClick={() => onMoveClick?.(move)}
                  className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-zinc-100"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {qualityInfo && QualityIcon && (
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full ${qualityInfo.className}`}
                          title={qualityInfo.label}
                          aria-label={qualityInfo.label}
                        >
                          <QualityIcon size={14} strokeWidth={2.5} />
                        </span>
                      )}
                      <span className="font-medium text-zinc-900">{getMoveSan(move)}</span>
                    </div>

                    {descendants > 0 && (
                      <span className="text-xs text-zinc-400">
                        +{descendants} {descendants === 1 ? "jugada" : "jugadas"}
                      </span>
                    )}
                  </div>

                  {move.evaluation !== null && (
                    <span className="shrink-0 text-xs font-medium text-zinc-500 sm:text-sm">{formatEvaluation(move.evaluation)}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteRequest?.(move)}
                  disabled={deletingMoveId !== null}
                  className="flex w-11 shrink-0 items-center justify-center border-l border-zinc-200 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                  title={isDeleting ? "Eliminando variante" : "Eliminar variante"}
                  aria-label={isDeleting ? "Eliminando variante" : "Eliminar variante"}
                >
                  {isDeleting ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
