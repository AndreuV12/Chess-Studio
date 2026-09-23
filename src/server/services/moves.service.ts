import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { moves, type CreateMove } from "@/server/db/schema/move";

export async function getMoves() {
  return db.select().from(moves);
}

export async function createMove(data: CreateMove) {
  const [move] = await db.insert(moves).values(data).returning();
  return move;
}

export async function updateMove(id: number, data: Partial<CreateMove>) {
  const [move] = await db.update(moves).set(data).where(eq(moves.id, id)).returning();

  return move;
}

export async function deleteMoveAndChildren(moveId: number): Promise<number[]> {
  const deletedIds: number[] = [];
  async function remove(id: number) {
    const children = await db.select({ id: moves.id }).from(moves).where(eq(moves.parentId, id));
    for (const child of children) {
      await remove(child.id);
    }
    await db.delete(moves).where(eq(moves.id, id));
    deletedIds.push(id);
  }
  await remove(moveId);
  return deletedIds;
}
