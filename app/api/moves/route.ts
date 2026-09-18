import { db } from "@/db";
import { moves, type CreateMove } from "@/db/schema/move";

export async function GET() {
  const data = await db.select().from(moves);
  return Response.json(data);
}

export async function POST(request: Request) {
  const data: CreateMove = await request.json();
  const [move] = await db.insert(moves).values(data).returning();
  return Response.json(move, { status: 201 });
}
