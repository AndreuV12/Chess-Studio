"use client";

import { useCallback, useEffect, useState } from "react";
import { findOpening, openingBook } from "@chess-openings/eco.json";

type OpeningBook = Awaited<ReturnType<typeof openingBook>>;
let openingBookPromise: Promise<OpeningBook> | undefined;

function loadOpeningBook() {
  openingBookPromise ??= openingBook();
  return openingBookPromise;
}

export function useOpeningNameResolver() {
  const [book, setBook] = useState<OpeningBook>();

  useEffect(() => {
    let isActive = true;

    loadOpeningBook()
      .then((loadedBook) => {
        if (isActive) setBook(loadedBook);
      })
      .catch(console.error);

    return () => {
      isActive = false;
    };
  }, []);

  return useCallback(
    (fen: string) => {
      if (!book) return undefined;
      return findOpening(book, fen)?.name;
    },
    [book],
  );
}
