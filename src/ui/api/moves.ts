// api/moves.ts
import type { Move, CreateMove, DeleteMoveResponse } from "@/types/move.types";
import { api } from "./client";

export const MovesApi = {
  async getAll(): Promise<Move[]> {
    const { data } = await api.get<Move[]>("/moves");
    return data;
  },

  async create(move: CreateMove): Promise<Move> {
    const { data } = await api.post<Move>("/moves", move);
    return data;
  },

  async updateEvaluation(id: number, evaluation: number): Promise<Move> {
    const { data } = await api.patch<Move>(`/moves/${id}`, { evaluation });
    return data;
  },

  async deleteWithChildren(id: number): Promise<DeleteMoveResponse> {
    const { data } = await api.delete<DeleteMoveResponse>(`/moves/${id}`);
    return data;
  },
};
