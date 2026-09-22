import { eq } from "drizzle-orm";
import { db } from "@/db";
import { moves, type CreateMove } from "@/db/schema/move";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data: Partial<CreateMove> = await request.json();

  const [move] = await db
    .update(moves)
    .set(data)
    .where(eq(moves.id, Number(id)))
    .returning();

  if (!move) {
    return Response.json({ error: "Move not found" }, { status: 404 });
  }

  return Response.json(move);
}
