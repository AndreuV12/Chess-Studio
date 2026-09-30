import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { moves } from "@/server/db/schema/move";
import type { CreateMove as CreateMoveInput } from "@/types/move.types";

const publicMoveFields = {
  id: moves.id,
  parentId: moves.parentId,
  fenFrom: moves.fenFrom,
  fenTo: moves.fenTo,
  uci: moves.uci,
  evaluation: moves.evaluation,
};

export async function getMoves(userId: number) {
  return db.select(publicMoveFields).from(moves).where(eq(moves.userId, userId));
}

export async function createMove(userId: number, data: CreateMoveInput) {
  if (data.parentId !== null) {
    const [parentMove] = await db
      .select({ id: moves.id })
      .from(moves)
      .where(and(eq(moves.id, data.parentId), eq(moves.userId, userId)))
      .limit(1);

    if (!parentMove) return null;
  }

  const [move] = await db.insert(moves).values({ ...data, userId }).returning(publicMoveFields);
  return move;
}

export async function updateMove(userId: number, id: number, data: Pick<CreateMoveInput, "evaluation">) {
  const [move] = await db
    .update(moves)
    .set(data)
    .where(and(eq(moves.id, id), eq(moves.userId, userId)))
    .returning(publicMoveFields);

  return move;
}

export async function deleteMoveAndChildren(userId: number, moveId: number): Promise<number[]> {
  const [rootMove] = await db
    .select({ id: moves.id })
    .from(moves)
    .where(and(eq(moves.id, moveId), eq(moves.userId, userId)))
    .limit(1);

  if (!rootMove) return [];

  const deletedIds: number[] = [];

  async function remove(id: number) {
    const children = await db
      .select({ id: moves.id })
      .from(moves)
      .where(and(eq(moves.parentId, id), eq(moves.userId, userId)));

    for (const child of children) {
      await remove(child.id);
    }

    await db.delete(moves).where(and(eq(moves.id, id), eq(moves.userId, userId)));
    deletedIds.push(id);
  }

  await remove(moveId);
  return deletedIds;
}
