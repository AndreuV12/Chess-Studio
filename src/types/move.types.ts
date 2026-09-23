import type { Move as DbMove, CreateMove as DbCreateMove } from "@/server/db/schema/move";

export type Move = Omit<DbMove, "userId">;
export type CreateMove = Omit<DbCreateMove, "id" | "userId">;

export type DeleteMoveResponse = {
  deletedIds: number[];
};
