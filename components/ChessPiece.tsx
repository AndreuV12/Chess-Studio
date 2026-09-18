import type { Color, PieceSymbol } from "chess.js";

type ChessPieceProps = {
  type: PieceSymbol;
  color: Color;
  className?: string;
};

const pieceNames: Record<PieceSymbol, string> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

export default function ChessPiece({ type, color, className }: ChessPieceProps) {
  const pieceColor = color === "w" ? "white" : "black";
  const src = `/pieces/${pieceColor}-${pieceNames[type]}.svg`;

  return <img src={src} alt={`${pieceColor} ${pieceNames[type]}`} className={className} />;
}
