// app/api/moves/[id]/route.ts
import { type CreateMove } from "@/server/db/schema/move";
import { updateMove } from "@/server/services/moves.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data: Partial<CreateMove> = await request.json();
  const move = await updateMove(Number(id), data);

  if (!move) {
    return Response.json({ error: "Move not found" }, { status: 404 });
  }

  return Response.json(move);
}
