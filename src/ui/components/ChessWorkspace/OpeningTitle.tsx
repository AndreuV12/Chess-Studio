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
    <div className="mx-auto mb-3 w-full max-w-150 lg:max-w-none">
      <h1 className="text-xl leading-tight font-semibold text-zinc-900 sm:text-2xl">{opening?.name ?? "Apertura desconocida"}</h1>
    </div>
  );
}
