import type { Move } from "@/db/schema/move";

type MovesPanelProps = {
  moves: Move[];
  onMoveClick?: (move: Move) => void;
};

export default function MovesPanel({ moves, onMoveClick }: MovesPanelProps) {
  return (
    <div className="h-full rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">Jugadas guardadas</h2>

      {moves.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay jugadas guardadas desde esta posición.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {moves.map((move) => (
            <button
              key={move.id}
              type="button"
              onClick={() => onMoveClick?.(move)}
              className="rounded-md border border-zinc-200 px-3 py-2 text-left transition hover:bg-zinc-100"
            >
              {move.uci}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
