"use client";

import { useOpeningNameResolver } from "@/ui/components/ChessWorkspace/hooks/useOpeningNameResolver";

type OpeningTitleProps = {
  fen: string;
};

export default function OpeningTitle({ fen }: OpeningTitleProps) {
  const getOpeningName = useOpeningNameResolver();
  const openingName = getOpeningName(fen);

  return (
    <div className="mx-auto mb-3 w-full max-w-150 lg:max-w-none">
      <h1 className="text-xl leading-tight font-semibold text-zinc-900 sm:text-2xl">{openingName ?? "Apertura desconocida"}</h1>
    </div>
  );
}
