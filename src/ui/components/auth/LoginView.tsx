"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import type { LoginRequest } from "@/app/api/auth/schemas";
import AuthCard from "./AuthCard";
import LoginForm from "./LoginForm";

type LoginViewProps = {
  callbackUrl: string;
};

type LoginState = {
  fields: LoginRequest;
  isSubmitting: boolean;
  error: string | null;
};

const initialState: LoginState = {
  fields: {
    email: "",
    password: "",
  },
  isSubmitting: false,
  error: null,
};

export default function LoginView({ callbackUrl }: LoginViewProps) {
  const router = useRouter();
  const [state, setState] = useState<LoginState>(initialState);

  function updateField(field: keyof LoginRequest, value: string) {
    setState((current) => ({
      ...current,
      fields: { ...current.fields, [field]: value },
      error: null,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState((current) => ({ ...current, isSubmitting: true, error: null }));

    try {
      const result = await signIn("credentials", {
        email: state.fields.email,
        password: state.fields.password,
        redirect: false,
      });

      if (!result.ok) {
        setState((current) => ({
          ...current,
          isSubmitting: false,
          error: "El correo o la contraseña no son correctos.",
        }));
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setState((current) => ({
        ...current,
        isSubmitting: false,
        error: "No se ha podido iniciar sesión. Inténtalo de nuevo.",
      }));
    }
  }

  const registerHref = callbackUrl === "/" ? "/register" : `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <AuthCard title="Bienvenido de nuevo" description="Inicia sesión para continuar con tu repertorio y tus análisis.">
      <LoginForm
        fields={state.fields}
        isSubmitting={state.isSubmitting}
        error={state.error}
        registerHref={registerHref}
        onFieldChange={updateField}
        onSubmit={handleSubmit}
      />
    </AuthCard>
  );
}
