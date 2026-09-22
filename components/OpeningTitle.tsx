"use client";

import { useEffect, useState } from "react";
import { findOpening, openingBook, type Opening } from "@chess-openings/eco.json";

type OpeningTitleProps = {
  fen: string;
};

export default function OpeningTitle({ fen }: OpeningTitleProps) {
  const [opening, setOpening] = useState<Opening>();

  useEffect(() => {
    openingBook().then((book) => {
      setOpening(findOpening(book, fen));
    });
  }, [fen]);

  return (
    <div className="mb-3">
      <h1 className="text-xl font-semibold text-zinc-900">{opening?.name ?? "Apertura desconocida"}</h1>
    </div>
  );
}
