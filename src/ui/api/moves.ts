import type {
  CreateMoveRequest,
  DeleteMoveResponse,
  MoveResponse,
  UpdateMoveRequest,
} from "@/app/api/moves/schemas";
import { api } from "./client";

export const MovesApi = {
  async getAll(): Promise<MoveResponse[]> {
    const { data } = await api.get<MoveResponse[]>("/moves");
    return data;
  },

  async create(move: CreateMoveRequest): Promise<MoveResponse> {
    const { data } = await api.post<MoveResponse>("/moves", move);
    return data;
  },

  async updateEvaluation(id: number, evaluation: number): Promise<MoveResponse> {
    const request: UpdateMoveRequest = { evaluation };
    const { data } = await api.patch<MoveResponse>(`/moves/${id}`, request);
    return data;
  },

  async deleteWithChildren(id: number): Promise<DeleteMoveResponse> {
    const { data } = await api.delete<DeleteMoveResponse>(`/moves/${id}`);
    return data;
  },
};
