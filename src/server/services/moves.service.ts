import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { moves, type CreateMove, type Move } from "@/server/db/schema/move";
import type { User } from "@/server/db/schema/user";

export async function getMoves(userId: User["id"]): Promise<Move[]> {
  return db.select().from(moves).where(eq(moves.userId, userId));
}

export async function createMove(data: CreateMove): Promise<Move | null> {
  if (data.parentId != null) {
    const [parentMove] = await db
      .select({ id: moves.id })
      .from(moves)
      .where(and(eq(moves.id, data.parentId), eq(moves.userId, data.userId)))
      .limit(1);

    if (!parentMove) return null;
  }

  const [move] = await db.insert(moves).values(data).returning();
  return move;
}

export async function updateMove(
  userId: User["id"],
  id: Move["id"],
  data: Pick<CreateMove, "evaluation">,
): Promise<Move | null> {
  const [move] = await db
    .update(moves)
    .set(data)
    .where(and(eq(moves.id, id), eq(moves.userId, userId)))
    .returning();

  return move ?? null;
}

export async function deleteMoveAndChildren(userId: User["id"], moveId: Move["id"]): Promise<Move["id"][]> {
  const [rootMove] = await db
    .select({ id: moves.id })
    .from(moves)
    .where(and(eq(moves.id, moveId), eq(moves.userId, userId)))
    .limit(1);

  if (!rootMove) return [];

  const deletedIds: Move["id"][] = [];

  async function remove(id: Move["id"]) {
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
