import Link from "next/link";
import type { FormEvent } from "react";
import type { RegisterRequest } from "@/app/api/register/schemas";

type RegisterFormProps = {
  fields: RegisterRequest;
  isSubmitting: boolean;
  error: string | null;
  loginHref: string;
  onFieldChange: (field: keyof RegisterRequest, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-zinc-100";

export default function RegisterForm({ fields, isSubmitting, error, loginHref, onFieldChange, onSubmit }: RegisterFormProps) {
  return (
    <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-700">Nombre</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={255}
          value={fields.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
          disabled={isSubmitting}
          className={inputClassName}
        />
      </label>

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
          className={inputClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-700">Contraseña</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          value={fields.password}
          onChange={(event) => onFieldChange("password", event.target.value)}
          disabled={isSubmitting}
          className={inputClassName}
        />
        <span className="mt-1.5 block text-xs text-zinc-500">Debe tener entre 8 y 72 caracteres.</span>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-700">Repite la contraseña</span>
        <input
          type="password"
          name="passwordConfirmation"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          value={fields.passwordConfirmation}
          onChange={(event) => onFieldChange("passwordConfirmation", event.target.value)}
          disabled={isSubmitting}
          className={inputClassName}
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
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        ¿Ya tienes cuenta?{" "}
        <Link href={loginHref} className="font-semibold text-blue-700 hover:text-blue-800 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
