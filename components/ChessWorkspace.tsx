"use client";

import { useState } from "react";
import { DEFAULT_POSITION } from "chess.js";
import InteractiveBoard from "@/components/InteractiveBoard";

export default function ChessWorkspace() {
  const [fen, setFen] = useState(DEFAULT_POSITION);

  return (
    <div className="w-full max-w-2xl p-6">
      <InteractiveBoard
        fen={fen}
        onMove={(move, newFen) => {
          console.log(move);
          setFen(newFen);
        }}
      />
    </div>
  );
}
