import { auth } from "@/server/auth";
import { createMove, getMoves } from "@/server/services/moves.service";
import { MoveValidationService } from "@/server/services/moveValidation.service";

export async function GET() {
  const session = await auth();
  const userId = MoveValidationService.validateUserId(session?.user?.id);
  if (!userId) return Response.json({ error: "No autorizado." }, { status: 401 });

  const moves = await getMoves(userId);
  return Response.json(moves);
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = MoveValidationService.validateUserId(session?.user?.id);
  if (!userId) return Response.json({ error: "No autorizado." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "La solicitud no contiene un JSON válido." }, { status: 400 });
  }

  const data = MoveValidationService.validateCreateMove(body);
  if (!data) return Response.json({ error: "Los datos de la jugada no son válidos." }, { status: 400 });

  const move = await createMove(userId, data);
  if (!move) return Response.json({ error: "La jugada padre no existe." }, { status: 404 });

  return Response.json(move, { status: 201 });
}
