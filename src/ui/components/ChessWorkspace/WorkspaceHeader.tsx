"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export type WorkspaceUser = {
  name: string | null;
  email: string;
};

type WorkspaceHeaderProps = {
  user: WorkspaceUser;
};

type AccountMenuState = {
  isOpen: boolean;
  isSigningOut: boolean;
};

const initialState: AccountMenuState = {
  isOpen: false,
  isSigningOut: false,
};

export default function WorkspaceHeader({ user }: WorkspaceHeaderProps) {
  const [state, setState] = useState<AccountMenuState>(initialState);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setState((current) => ({ ...current, isOpen: false }));
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setState((current) => ({ ...current, isOpen: false }));
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.isOpen]);

  async function handleSignOut() {
    setState((current) => ({ ...current, isSigningOut: true }));

    try {
      await signOut({ redirect: false, redirectTo: "/login" });
      window.location.replace("/login");
    } catch {
      setState((current) => ({ ...current, isSigningOut: false }));
    }
  }

  return (
    <header className="mx-auto mb-5 flex w-full max-w-150 items-center justify-between border-b border-zinc-200 pb-4 lg:max-w-none">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Chess Studio" width={44} height={44} priority className="h-11 w-11 object-contain" />
        <div>
          <p className="font-semibold tracking-tight text-zinc-950">Chess Studio</p>
          <p className="text-xs text-zinc-500">Tu espacio de análisis</p>
        </div>
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setState((current) => ({ ...current, isOpen: !current.isOpen }))}
          className="flex max-w-48 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:max-w-64"
          aria-label="Abrir menú de usuario"
          aria-haspopup="menu"
          aria-expanded={state.isOpen}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">{user.name ?? user.email}</p>
            {user.name && <p className="hidden truncate text-xs text-zinc-500 sm:block">{user.email}</p>}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
        </button>

        {state.isOpen && (
          <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
            <div className="border-b border-zinc-200 px-4 py-3">
              <p className="truncate text-sm font-semibold text-zinc-900">{user.name ?? user.email}</p>
              <p className="mt-1 truncate text-sm text-zinc-500">{user.email}</p>
            </div>
            <div className="p-2">
              <button
                type="button"
                role="menuitem"
                onClick={() => void handleSignOut()}
                disabled={state.isSigningOut}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {state.isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
