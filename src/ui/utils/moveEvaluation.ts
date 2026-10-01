import { Check, CircleAlert, Star, TriangleAlert, X, type LucideIcon } from "lucide-react";

export type MoveQuality = "excellent" | "good" | "inaccuracy" | "mistake" | "blunder";

type MoveQualityConfig = {
  label: string;
  icon: LucideIcon;
  className: string;
};

export const moveQualityConfig: Record<MoveQuality, MoveQualityConfig> = {
  excellent: {
    label: "Excelente",
    icon: Star,
    className: "bg-emerald-100 text-emerald-700",
  },
  good: {
    label: "Buena",
    icon: Check,
    className: "bg-blue-100 text-blue-700",
  },
  inaccuracy: {
    label: "Imprecisión",
    icon: CircleAlert,
    className: "bg-yellow-100 text-yellow-700",
  },
  mistake: {
    label: "Error",
    icon: TriangleAlert,
    className: "bg-orange-100 text-orange-700",
  },
  blunder: {
    label: "Error grave",
    icon: X,
    className: "bg-red-100 text-red-700",
  },
};

export function getMoveQuality(previousEvaluation: number | null | undefined, evaluation: number | null | undefined, turn: "w" | "b"): MoveQuality | null {
  if (previousEvaluation == null || evaluation == null) return null;

  const loss = turn === "w" ? previousEvaluation - evaluation : evaluation - previousEvaluation;

  if (loss <= 0.15) return "excellent";
  if (loss <= 0.4) return "good";
  if (loss <= 0.8) return "inaccuracy";
  if (loss <= 1.5) return "mistake";

  return "blunder";
}
