// api/moves.ts
import type { CreateMove, Move } from "@/server/db/schema/move";
import { api } from "./client";

export async function getMoves(): Promise<Move[]> {
  const { data } = await api.get<Move[]>("/moves");
  return data;
}

export async function createMove(move: CreateMove): Promise<Move> {
  const { data } = await api.post<Move>("/moves", move);
  return data;
}

export async function updateMoveEvaluation(id: number, evaluation: number) {
  const { data } = await api.patch<Move>(`/moves/${id}`, {
    evaluation,
  });
  return data;
}
