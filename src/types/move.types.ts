import type { Move as DbMove } from "@/server/db/schema/move";

export type Move = Omit<DbMove, "userId">;
export type CreateMove = {
  parentId: number | null;
  fenFrom: string;
  fenTo: string;
  uci: string;
  evaluation: number | null;
};

export type DeleteMoveResponse = {
  deletedIds: number[];
};
