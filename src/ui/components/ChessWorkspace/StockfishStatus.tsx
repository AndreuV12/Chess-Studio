type StockfishStatusProps = {
  isReady: boolean;
};

export default function StockfishStatus({ isReady }: StockfishStatusProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
        isReady ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      <span className="relative flex size-2" aria-hidden="true">
        {!isReady && <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />}
        <span className={`relative inline-flex size-2 rounded-full ${isReady ? "bg-emerald-500" : "bg-amber-500"}`} />
      </span>
      {isReady ? "Stockfish preparado" : "Iniciando Stockfish"}
    </div>
  );
}
