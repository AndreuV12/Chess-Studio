// src/app/api/moves/route.ts
import type { CreateMove } from "@/types/move.types";
import { createMove, getMoves } from "@/server/services/moves.service";

export async function GET() {
  const moves = await getMoves();
  return Response.json(moves);
}

export async function POST(request: Request) {
  const data: CreateMove = await request.json();

  const move = await createMove({
    userId: 1,
    ...data,
  });

  return Response.json(move, { status: 201 });
}
