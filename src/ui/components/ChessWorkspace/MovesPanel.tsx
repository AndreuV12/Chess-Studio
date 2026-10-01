import { Chess } from "chess.js";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useOpeningNameResolver } from "@/ui/components/ChessWorkspace/hooks/useOpeningNameResolver";
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
  const getOpeningName = useOpeningNameResolver();

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
    <section className="h-full min-w-0 rounded-lg border border-zinc-200 bg-white p-3">
      <h2 className="mb-2 text-base font-semibold text-zinc-900">Jugadas guardadas</h2>

      {moves.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay jugadas guardadas desde esta posición.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {sortedMoves.map((move) => {
            const descendants = getDescendantCount(move);
            const isDeleting = deletingMoveId === move.id;
            const openingName = getOpeningName(move.fenTo);
            const quality = getMoveQuality(evaluation, move.evaluation, new Chess(move.fenFrom).turn());
            const qualityInfo = quality ? moveQualityConfig[quality] : null;
            const QualityIcon = qualityInfo?.icon;

            return (
              <div key={move.id} className="flex overflow-hidden rounded-md border border-zinc-200">
                <button
                  type="button"
                  onClick={() => onMoveClick?.(move)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2.5 py-1.5 text-left transition hover:bg-zinc-100"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {qualityInfo && QualityIcon && (
                        <span
                          className={`flex p-2 shrink-0 items-center justify-center rounded-full ${qualityInfo.className}`}
                          title={qualityInfo.label}
                          aria-label={qualityInfo.label}
                        >
                          <QualityIcon size={15} strokeWidth={2.5} />
                        </span>
                      )}

                      <span className="font-medium text-zinc-900">{getMoveSan(move)}</span>

                      {move.evaluation !== null && (
                        <span className="ml-auto shrink-0 text-sm font-semibold text-zinc-500">{formatEvaluation(move.evaluation)}</span>
                      )}
                    </div>

                    {(openingName || descendants > 0) && (
                      <div className="mt-0.5 flex justify-between min-w-0 items-center gap-2 text-xs text-zinc-400">
                        {openingName && (
                          <span className="truncate" title={openingName}>
                            {openingName}
                          </span>
                        )}

                        {descendants > 0 && <span className="shrink-0">(+{descendants} jugadas)</span>}
                      </div>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteRequest?.(move)}
                  disabled={deletingMoveId !== null}
                  className="flex w-9 shrink-0 items-center justify-center border-l border-zinc-200 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                  title={isDeleting ? "Eliminando variante" : "Eliminar variante"}
                  aria-label={isDeleting ? "Eliminando variante" : "Eliminar variante"}
                >
                  {isDeleting ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Trash2 size={15} aria-hidden="true" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
