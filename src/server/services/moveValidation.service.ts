import type { CreateMove } from "@/types/move.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: string[]): boolean {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

export class MoveValidationService {
  static validateUserId(value: string | undefined): number | null {
    if (!value || !/^\d+$/.test(value)) return null;

    const userId = Number(value);
    return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
  }

  static validateMoveId(value: string): number | null {
    if (!/^\d+$/.test(value)) return null;

    const moveId = Number(value);
    return Number.isSafeInteger(moveId) && moveId > 0 ? moveId : null;
  }

  static validateCreateMove(value: unknown): CreateMove | null {
    if (!isRecord(value) || !hasOnlyKeys(value, ["parentId", "fenFrom", "fenTo", "uci", "evaluation"])) return null;

    const { parentId, fenFrom, fenTo, uci, evaluation } = value;
    const validParentId = parentId === null || (typeof parentId === "number" && Number.isSafeInteger(parentId) && parentId > 0);
    const validEvaluation = evaluation === null || (typeof evaluation === "number" && Number.isFinite(evaluation));

    if (
      !validParentId ||
      typeof fenFrom !== "string" ||
      fenFrom.length < 1 ||
      typeof fenTo !== "string" ||
      fenTo.length < 1 ||
      typeof uci !== "string" ||
      !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci) ||
      !validEvaluation
    ) {
      return null;
    }

    return { parentId, fenFrom, fenTo, uci, evaluation };
  }

  static validateEvaluationUpdate(value: unknown): { evaluation: number } | null {
    if (!isRecord(value) || !hasOnlyKeys(value, ["evaluation"]) || Object.keys(value).length !== 1) return null;
    if (typeof value.evaluation !== "number" || !Number.isFinite(value.evaluation)) return null;

    return { evaluation: value.evaluation };
  }
}
