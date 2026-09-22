import { Chess, DEFAULT_POSITION, type Square } from "chess.js";
import type { Move } from "@/db/schema/move";

type ChessHistoryProps = {
  history: Move[];
  currentIndex: number;
  onMoveClick: (index: number) => void;
};

export default function ChessHistory({ history, currentIndex, onMoveClick }: ChessHistoryProps) {
  const chess = new Chess(DEFAULT_POSITION);

  const playedMoves = history.map((move, index) => {
    const chessMove = chess.move({
      from: move.uci.slice(0, 2) as Square,
      to: move.uci.slice(2, 4) as Square,
      promotion: move.uci[4],
    });

    return {
      index,
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
    <div className="mt-3 rounded-lg border border-zinc-200 p-3">
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.number} className="grid grid-cols-[40px_1fr_1fr] items-center gap-2">
            <span className="text-sm text-zinc-500">{row.number}.</span>

            <button
              type="button"
              onClick={() => onMoveClick(row.white.index)}
              className={currentIndex === row.white.index ? "rounded bg-zinc-200 px-2 py-1 text-left" : "rounded px-2 py-1 text-left hover:bg-zinc-100"}
            >
              {row.white.san}
            </button>

            {row.black && (
              <button
                type="button"
                onClick={() => onMoveClick(row.black.index)}
                className={currentIndex === row.black.index ? "rounded bg-zinc-200 px-2 py-1 text-left" : "rounded px-2 py-1 text-left hover:bg-zinc-100"}
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
