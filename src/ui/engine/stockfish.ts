import type { AnalyzeOptions, EngineAnalysis, EngineBestMove, PendingAnalysis } from "./types";
const MAX_EVALUATION = 100;

const createEmptyAnalysis = (): EngineAnalysis => ({
  depth: 0,
  evaluation: null,
  mate: null,
  bestMove: null,
  pv: [],
  bestMoves: [],
});

export class Stockfish {
  private static instance: Stockfish | null = null;

  private worker: Worker;
  private ready = false;
  private readyListeners = new Set<(isReady: boolean) => void>();

  private currentAnalysis: PendingAnalysis | null = null;
  private waitingForStop = false;
  private queuedStart: (() => void) | null = null;

  private constructor() {
    this.worker = new Worker("/stockfish/stockfish-19-single.js");

    this.worker.onmessage = (event) => {
      this.handleMessage(String(event.data));
    };

    this.worker.onerror = (event) => {
      console.error("[Stockfish] Worker error", event);

      this.currentAnalysis?.reject(new Error("Stockfish worker error"));

      this.currentAnalysis = null;
      this.waitingForStop = false;
      this.queuedStart = null;
      this.setReady(false);
    };

    this.worker.postMessage("uci");
  }

  static getInstance() {
    if (!Stockfish.instance) {
      Stockfish.instance = new Stockfish();
    }

    return Stockfish.instance;
  }

  isReady() {
    return this.ready;
  }

  subscribeToReadyState(listener: (isReady: boolean) => void) {
    this.readyListeners.add(listener);
    listener(this.ready);

    return () => {
      this.readyListeners.delete(listener);
    };
  }

  private setReady(isReady: boolean) {
    if (this.ready === isReady) return;

    this.ready = isReady;
    this.readyListeners.forEach((listener) => listener(isReady));
  }

  private handleMessage(message: string) {
    if (message === "uciok") {
      this.worker.postMessage("isready");
      return;
    }

    if (message === "readyok") {
      this.setReady(true);
      return;
    }

    if (message.startsWith("bestmove ")) {
      this.handleBestMove(message);
      return;
    }

    if (message.startsWith("info ") && this.currentAnalysis && !this.currentAnalysis.cancelled) {
      this.parseInfo(message);
    }
  }

  private handleBestMove(message: string) {
    const pending = this.currentAnalysis;

    this.currentAnalysis = null;

    if (pending && !pending.cancelled) {
      const bestMove = message.split(" ")[1] ?? null;

      pending.latest.bestMove = bestMove === "(none)" ? null : bestMove;

      this.finalizeLines(pending);

      pending.resolve(pending.latest);

      console.log("[Stockfish] Analysis completed", pending.latest);
    }

    if (this.waitingForStop) {
      this.waitingForStop = false;
    }
    const next = this.queuedStart;
    this.queuedStart = null;
    next?.();
  }

  private parseInfo(message: string) {
    const pending = this.currentAnalysis;
    if (!pending) return;

    const depthMatch = message.match(/\bdepth (\d+)/);
    const multiPVMatch = message.match(/\bmultipv (\d+)/);
    const cpMatch = message.match(/\bscore cp (-?\d+)/);
    const mateMatch = message.match(/\bscore mate (-?\d+)/);
    const pvMatch = message.match(/\bpv (.+)$/);

    if (!depthMatch || !pvMatch) return;
    if (!cpMatch && !mateMatch) return;

    const depth = Number(depthMatch[1]);
    const rank = multiPVMatch ? Number(multiPVMatch[1]) : 1;

    if (rank > pending.multiPV) return;

    const multiplier = pending.turn === "w" ? 1 : -1;

    let evaluation: number | null = null;
    let mate: number | null = null;

    if (cpMatch) {
      evaluation = (Number(cpMatch[1]) / 100) * multiplier;
    }

    if (mateMatch) {
      mate = Number(mateMatch[1]) * multiplier;
      evaluation = Math.sign(mate) * MAX_EVALUATION;
    }

    const pv = pvMatch[1].trim().split(/\s+/);

    const line: EngineBestMove = {
      rank,
      move: pv[0],
      evaluation,
      mate,
      pv,
    };

    if (!pending.lines.has(depth)) {
      pending.lines.set(depth, new Map());
    }

    pending.lines.get(depth)!.set(rank, line);

    this.updateLatestLines(pending);
  }

  private updateLatestLines(pending: PendingAnalysis) {
    // Buscamos la profundidad más alta que tenga
    // todas las alternativas solicitadas.
    const depths = [...pending.lines.keys()].sort((a, b) => b - a);

    const completeDepth = depths.find((depth) => {
      const lines = pending.lines.get(depth)!;

      return Array.from({ length: pending.multiPV }, (_, index) => index + 1).every((rank) => lines.has(rank));
    });

    if (completeDepth === undefined) return;

    const lines = pending.lines.get(completeDepth)!;

    const bestMoves = [...lines.values()].sort((a, b) => a.rank - b.rank);

    const best = bestMoves[0];

    pending.latest = {
      ...pending.latest,
      depth: completeDepth,
      evaluation: best.evaluation,
      mate: best.mate,
      pv: best.pv,
      bestMoves,
    };

    // Conservamos únicamente las profundidades
    // recientes para evitar acumular resultados.
    for (const depth of pending.lines.keys()) {
      if (depth < completeDepth) {
        pending.lines.delete(depth);
      }
    }
  }

  private finalizeLines(pending: PendingAnalysis) {
    this.updateLatestLines(pending);
  }

  async analyze(fen: string, options: AnalyzeOptions = {}): Promise<EngineAnalysis | null> {
    if (!this.ready) return null;
    const depth = options.depth ?? 18;
    const multiPV = options.multiPV ?? 1;
    const turn = fen.split(" ")[1] as "w" | "b";
    this.stop();

    return new Promise<EngineAnalysis>((resolve, reject) => {
      const pending: PendingAnalysis = {
        turn,
        resolve,
        reject,
        latest: createEmptyAnalysis(),
        lines: new Map(),
        requestedDepth: depth,
        multiPV,
        cancelled: false,
      };

      const start = () => {
        if (pending.cancelled) return;
        this.currentAnalysis = pending;
        console.log("[Stockfish] Starting analysis", {
          fen,
          depth,
          multiPV,
        });
        this.worker.postMessage(`setoption name MultiPV value ${multiPV}`);
        this.worker.postMessage(`position fen ${fen}`);
        this.worker.postMessage(`go depth ${depth}`);
      };

      if (this.waitingForStop) {
        this.queuedStart = start;
      } else {
        start();
      }
    });
  }

  stop() {
    if (this.queuedStart) {
      this.queuedStart = null;
    }
    const pending = this.currentAnalysis;
    if (!pending || pending.cancelled) return;
    pending.cancelled = true;
    pending.reject(new Error("Analysis cancelled"));
    this.waitingForStop = true;
    this.worker.postMessage("stop");
  }

  destroy() {
    this.stop();

    this.worker.terminate();
    this.currentAnalysis = null;
    this.queuedStart = null;
    this.waitingForStop = false;

    this.setReady(false);
    this.readyListeners.clear();

    Stockfish.instance = null;
  }
}
