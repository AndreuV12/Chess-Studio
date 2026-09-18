import ChessBoard from "@/components/ChessBoard";

const QUEENS_GAMBIT_FEN = "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2";

export default function ChessWorkspace() {
  return (
    <div className="flex min-h-screen flex-col p-6">
      <div className="w-full max-w-2xl">
        <ChessBoard fen={QUEENS_GAMBIT_FEN} />
      </div>
    </div>
  );
}
