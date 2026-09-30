import { NextResponse } from "next/server";
import { sessionUserIdSchema } from "@/app/api/auth/schemas";
import { auth } from "@/server/auth";
import type { CreateMove } from "@/server/db/schema/move";
import { ApiValidationService } from "@/server/services/apiValidation.service";
import { createMove, getMoves } from "@/server/services/moves.service";
import { createMoveRequestSchema, type MoveResponse } from "./schemas";

export async function GET() {
  const session = await auth();
  const userIdResult = sessionUserIdSchema.safeParse(session?.user?.id);
  if (!userIdResult.success) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const moves = await getMoves(userIdResult.data);
  return NextResponse.json<MoveResponse[]>(moves);
}

export async function POST(request: Request) {
  const session = await auth();
  const userIdResult = sessionUserIdSchema.safeParse(session?.user?.id);
  if (!userIdResult.success) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { data, errorResponse } = await ApiValidationService.validateJson(createMoveRequestSchema, request);
  if (errorResponse) return errorResponse;

  const newMove: CreateMove = {
    ...data,
    userId: userIdResult.data,
  };

  const move = await createMove(newMove);
  if (!move) return NextResponse.json({ error: "La jugada padre no existe." }, { status: 404 });

  return NextResponse.json<MoveResponse>(move, { status: 201 });
}
