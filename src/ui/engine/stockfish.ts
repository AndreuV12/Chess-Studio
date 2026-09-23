import type { AnalyzeOptions, EngineAnalysis } from "./types";

type PendingAnalysis = {
  turn: "w" | "b";
  resolve: (analysis: EngineAnalysis) => void;
  reject: (error: Error) => void;
  latest: EngineAnalysis;
};

export class Stockfish {
  private static instance: Stockfish | null = null;
  private worker: Worker;
  private ready = false;
  private readyListeners = new Set<(isReady: boolean) => void>();
  private currentAnalysis: PendingAnalysis | null = null;

  private constructor() {
    this.worker = new Worker("/stockfish/stockfish-19-single.js");

    this.worker.onmessage = (event) => {
      this.handleMessage(String(event.data));
    };

    this.worker.onerror = (event) => {
      console.error("[Stockfish] Worker error", event);
      this.currentAnalysis?.reject(new Error("Stockfish worker error"));
      this.currentAnalysis = null;
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

  subscribeToReady(listener: (isReady: boolean) => void) {
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
      console.log("[Stockfish] Ready");
      return;
    }

    if (!this.currentAnalysis) return;

    if (message.startsWith("info ")) {
      this.parseInfo(message);
      return;
    }

    if (message.startsWith("bestmove ")) {
      const bestMove = message.split(" ")[1] ?? null;
      this.currentAnalysis.latest.bestMove = bestMove;

      const result = this.currentAnalysis.latest;

      console.log("[Stockfish] Analysis completed", result);

      this.currentAnalysis.resolve(result);
      this.currentAnalysis = null;
    }
  }

  private parseInfo(message: string) {
    if (!this.currentAnalysis) return;

    const depthMatch = message.match(/\bdepth (\d+)/);
    const cpMatch = message.match(/\bscore cp (-?\d+)/);
    const mateMatch = message.match(/\bscore mate (-?\d+)/);
    const pvMatch = message.match(/\bpv (.+)$/);

    const multiplier = this.currentAnalysis.turn === "w" ? 1 : -1;

    if (depthMatch) {
      this.currentAnalysis.latest.depth = Number(depthMatch[1]);
    }

    if (cpMatch) {
      this.currentAnalysis.latest.evaluation = (Number(cpMatch[1]) / 100) * multiplier;
      this.currentAnalysis.latest.mate = null;
    }

    if (mateMatch) {
      this.currentAnalysis.latest.mate = Number(mateMatch[1]) * multiplier;
      this.currentAnalysis.latest.evaluation = null;
    }

    if (pvMatch) {
      this.currentAnalysis.latest.pv = pvMatch[1].split(" ");
    }
  }

  async analyze(fen: string, options: AnalyzeOptions = {}): Promise<EngineAnalysis> {
    if (!this.ready) {
      throw new Error("Stockfish is not ready");
    }

    if (this.currentAnalysis) {
      this.currentAnalysis.reject(new Error("Analysis cancelled"));
      this.currentAnalysis = null;
      this.worker.postMessage("stop");
    }

    const depth = options.depth ?? 18;
    const turn = fen.split(" ")[1] as "w" | "b";

    console.log("[Stockfish] Starting analysis", {
      fen,
      depth,
      turn,
    });

    return await new Promise((resolve, reject) => {
      this.currentAnalysis = {
        turn,
        resolve,
        reject,
        latest: {
          depth: 0,
          evaluation: null,
          mate: null,
          bestMove: null,
          pv: [],
        },
      };

      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${depth}`);
    });
  }

  stop() {
    if (!this.currentAnalysis) return;

    this.currentAnalysis.reject(new Error("Analysis cancelled"));
    this.currentAnalysis = null;
    this.worker.postMessage("stop");
  }

  destroy() {
    this.stop();
    this.worker.terminate();
    this.setReady(false);
    this.readyListeners.clear();
    Stockfish.instance = null;
  }
}
