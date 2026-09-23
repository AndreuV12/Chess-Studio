// app/api/moves/[id]/route.ts
import { type CreateMove } from "@/server/db/schema/move";
import { updateMove, deleteMoveAndChildren } from "@/server/services/moves.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data: Partial<CreateMove> = await request.json();
  const move = await updateMove(Number(id), data);

  if (!move) {
    return Response.json({ error: "Move not found" }, { status: 404 });
  }

  return Response.json(move);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deletedIds = await deleteMoveAndChildren(Number(id));
  return Response.json({ deletedIds });
}
