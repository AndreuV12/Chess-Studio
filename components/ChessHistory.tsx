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
    <div className="mt-3 min-h-40 rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex flex-wrap gap-2">
        {rows.map((row) => (
          <button
            key={row.number}
            type="button"
            onClick={() => onMoveClick(row.black?.index || row.white.index)}
            className={`rounded-md px-2 py-1 text-sm transition hover:bg-zinc-200 ${
              currentIndex === row.white.index || currentIndex === row.black?.index ? "bg-zinc-200 text-zinc-950" : "bg-zinc-100 text-zinc-700"
            }`}
          >
            <span className="mr-1 text-zinc-500">{row.number}.</span>
            {row.white.san}
            {row.black && ` ${row.black.san}`}
          </button>
        ))}
      </div>
    </div>
  );
}
