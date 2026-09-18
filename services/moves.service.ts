import { prisma } from "@/lib/prisma";
import type { CreateMove } from "@/types/move.types";

export function getMovesByFen(fenFrom: string) {
  return prisma.move.findMany({
    where: { fenFrom },
  });
}

export function createMove(data: CreateMove) {
  return prisma.move.create({
    data,
  });
}

export function deleteMove(id: number) {
  return prisma.move.delete({
    where: { id },
  });
}
