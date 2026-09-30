import { auth } from "@/server/auth";
import { updateMove, deleteMoveAndChildren } from "@/server/services/moves.service";
import { MoveValidationService } from "@/server/services/moveValidation.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = MoveValidationService.validateUserId(session?.user?.id);
  if (!userId) return Response.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const moveId = MoveValidationService.validateMoveId(id);
  if (!moveId) return Response.json({ error: "El identificador de jugada no es válido." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "La solicitud no contiene un JSON válido." }, { status: 400 });
  }

  const data = MoveValidationService.validateEvaluationUpdate(body);
  if (!data) return Response.json({ error: "La evaluación no es válida." }, { status: 400 });

  const move = await updateMove(userId, moveId, data);

  if (!move) {
    return Response.json({ error: "La jugada no existe." }, { status: 404 });
  }

  return Response.json(move);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = MoveValidationService.validateUserId(session?.user?.id);
  if (!userId) return Response.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const moveId = MoveValidationService.validateMoveId(id);
  if (!moveId) return Response.json({ error: "El identificador de jugada no es válido." }, { status: 400 });

  const deletedIds = await deleteMoveAndChildren(userId, moveId);
  if (deletedIds.length === 0) return Response.json({ error: "La jugada no existe." }, { status: 404 });

  return Response.json({ deletedIds });
}
