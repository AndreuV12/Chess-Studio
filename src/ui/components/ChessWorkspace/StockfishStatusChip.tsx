type StockfishStatusChipProps = {
  isReady: boolean;
};

export default function StockfishStatusChip({ isReady }: StockfishStatusChipProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        isReady
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {!isReady && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${isReady ? "bg-emerald-500" : "bg-amber-500"}`} />
      </span>
      {isReady ? "Stockfish listo" : "Iniciando Stockfish"}
    </div>
  );
}
