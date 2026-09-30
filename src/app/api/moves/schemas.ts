import { z } from "zod";

const moveFields = {
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  parentId: z.number().int().positive().nullable(),
  fenFrom: z.string().min(1).max(100),
  fenTo: z.string().min(1).max(100),
  uci: z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/),
  evaluation: z.number().finite().nullable(),
};

export const moveParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const moveResponseSchema = z.object(moveFields);

export const createMoveRequestSchema = z
  .object({
    parentId: moveFields.parentId,
    fenFrom: moveFields.fenFrom,
    fenTo: moveFields.fenTo,
    uci: moveFields.uci,
    evaluation: moveFields.evaluation,
  })
  .strict();

export const updateMoveRequestSchema = z
  .object({
    evaluation: z.number().finite(),
  })
  .strict();

export const deleteMoveResponseSchema = z.object({
  deletedIds: z.array(z.number().int().positive()),
});

export type MoveResponse = z.infer<typeof moveResponseSchema>;
export type CreateMoveRequest = z.infer<typeof createMoveRequestSchema>;
export type UpdateMoveRequest = z.infer<typeof updateMoveRequestSchema>;
export type DeleteMoveResponse = z.infer<typeof deleteMoveResponseSchema>;
