type EvalBarProps = {
  evaluation: number | null;
  mate?: number | null;
};

export default function EvalBar({ evaluation, mate = null }: EvalBarProps) {
  const score = evaluation ?? 0;

  const whitePercent = mate !== null ? (mate > 0 ? 100 : 0) : 50 + Math.max(-10, Math.min(10, score)) * 5;

  const whiteAdvantage = mate !== null ? mate > 0 : score >= 0;

  const label = mate !== null ? `M${Math.abs(mate)}` : score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);

  return (
    <div className="relative w-10 self-stretch overflow-hidden rounded-lg border border-zinc-300 bg-zinc-900">
      <div className="absolute bottom-0 left-0 w-full bg-zinc-100 transition-all duration-300" style={{ height: `${whitePercent}%` }} />

      <span className={`absolute left-1/2 -translate-x-1/2 text-xs font-semibold ${whiteAdvantage ? "bottom-2 text-zinc-900" : "top-2 text-white"}`}>
        {label}
      </span>
    </div>
  );
}
