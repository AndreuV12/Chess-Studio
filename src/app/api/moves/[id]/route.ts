import { NextResponse } from "next/server";
import { sessionUserIdSchema } from "@/app/api/auth/schemas";
import { auth } from "@/server/auth";
import type { CreateMove } from "@/server/db/schema/move";
import { ApiValidationService } from "@/server/services/apiValidation.service";
import { updateMove, deleteMoveAndChildren } from "@/server/services/moves.service";
import {
  moveParamsSchema,
  updateMoveRequestSchema,
  type DeleteMoveResponse,
  type MoveResponse,
} from "../schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userIdResult = sessionUserIdSchema.safeParse(session?.user?.id);
  if (!userIdResult.success) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { data: parsedParams, errorResponse: paramsError } = ApiValidationService.validate(
    moveParamsSchema,
    await params,
  );
  if (paramsError) return paramsError;

  const { data, errorResponse: bodyError } = await ApiValidationService.validateJson(updateMoveRequestSchema, request);
  if (bodyError) return bodyError;

  const update: Pick<CreateMove, "evaluation"> = data;
  const move = await updateMove(userIdResult.data, parsedParams.id, update);

  if (!move) return NextResponse.json({ error: "La jugada no existe." }, { status: 404 });

  return NextResponse.json<MoveResponse>(move);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userIdResult = sessionUserIdSchema.safeParse(session?.user?.id);
  if (!userIdResult.success) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { data: parsedParams, errorResponse } = ApiValidationService.validate(moveParamsSchema, await params);
  if (errorResponse) return errorResponse;

  const deletedIds = await deleteMoveAndChildren(userIdResult.data, parsedParams.id);
  if (deletedIds.length === 0) return NextResponse.json({ error: "La jugada no existe." }, { status: 404 });

  return NextResponse.json<DeleteMoveResponse>({ deletedIds });
}
