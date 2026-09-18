import { Chess, DEFAULT_POSITION, type Square } from "chess.js";

export const INITIAL_FEN = DEFAULT_POSITION;

export function createChess(fen = INITIAL_FEN) {
  return new Chess(fen);
}

export function makeMove(fen: string, from: Square, to: Square, promotion = "q") {
  const chess = new Chess(fen);
  const move = chess.move({ from, to, promotion });
  return {
    fen: chess.fen(),
    move,
  };
}

export function getLegalMoves(fen: string, square?: Square) {
  const chess = new Chess(fen);
  return chess.moves({
    square,
    verbose: true,
  });
}

export function getBoard(fen: string) {
  return new Chess(fen).board();
}
