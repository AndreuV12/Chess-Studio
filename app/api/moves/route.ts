import { db } from "@/db";
import { moves } from "@/db/schema/move";

export async function GET() {
  const data = await db.select().from(moves);
  return Response.json(data);
}
