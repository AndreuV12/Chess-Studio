"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export type AlternativeMove = {
  id: number;
  san: string;
};

export type PlayedMove = {
  id: number;
  san: string;
  branchKey: string;
  alternatives: AlternativeMove[];
};

type MoveButtonProps = {
  move: PlayedMove;
  active: boolean;
  open: boolean;
  onMoveClick: (moveId: number) => void;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (moveId: number) => void;
};

export default function MoveButton({ move, active, open, onMoveClick, onToggle, onClose, onSelect }: MoveButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAlternatives = move.alternatives.length > 1;
  const baseClass = active ? "bg-zinc-200 text-zinc-950" : "text-zinc-700 hover:bg-zinc-200";

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!hasAlternatives) {
    return (
      <button type="button" onClick={() => onMoveClick(move.id)} className={`min-h-6 rounded px-1 py-1 text-sm transition ${baseClass}`}>
        {move.san}
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative flex">
      <button type="button" onClick={() => onMoveClick(move.id)} className={`min-h-6 rounded-l px-1 py-0.5 text-sm transition ${baseClass}`}>
        {move.san}
      </button>

      <button type="button" onClick={onToggle} className={`flex min-h-6 items-center rounded-r pe-1 transition ${baseClass}`} aria-label="Seleccionar variant">
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-28 rounded-md border border-zinc-200 bg-white p-1 shadow-lg">
          {move.alternatives.map((alternative) => (
            <button
              key={alternative.id}
              type="button"
              onClick={() => onSelect(alternative.id)}
              className={`flex w-full items-center rounded px-0.5 py-2 text-left text-sm transition hover:bg-zinc-100 ${
                alternative.id === move.id ? "bg-zinc-100 font-medium text-zinc-950" : "text-zinc-700"
              }`}
            >
              {alternative.san}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
