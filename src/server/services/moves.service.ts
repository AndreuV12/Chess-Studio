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
