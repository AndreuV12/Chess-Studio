"use client";

import { useOpeningNameResolver } from "@/ui/components/ChessWorkspace/hooks/useOpeningNameResolver";

type OpeningTitleProps = {
  fen: string;
};

export default function OpeningTitle({ fen }: OpeningTitleProps) {
  const getOpeningName = useOpeningNameResolver();
  const openingName = getOpeningName(fen);
  const title = openingName ?? "Apertura desconocida";

  return (
    <div className="mx-auto mb-3 w-full min-w-0 max-w-150 lg:max-w-none">
      <h1 className="truncate text-base leading-tight font-semibold text-zinc-900 sm:text-lg lg:text-xl" title={title}>
        {title}
      </h1>
    </div>
  );
}
