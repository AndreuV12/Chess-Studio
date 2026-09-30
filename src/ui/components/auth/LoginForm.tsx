import Link from "next/link";
import type { FormEvent } from "react";
import type { LoginFields } from "@/types/auth.types";

type LoginFormProps = {
  fields: LoginFields;
  isSubmitting: boolean;
  error: string | null;
  registerHref: string;
  onFieldChange: (field: keyof LoginFields, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export default function LoginForm({ fields, isSubmitting, error, registerHref, onFieldChange, onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-700">Correo electrónico</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={255}
          value={fields.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-zinc-100"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-700">Contraseña</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          maxLength={72}
          value={fields.password}
          onChange={(event) => onFieldChange("password", event.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-zinc-100"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        ¿Todavía no tienes cuenta?{" "}
        <Link href={registerHref} className="font-semibold text-blue-700 hover:text-blue-800 hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
