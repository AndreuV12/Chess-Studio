"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { LoginRequest } from "@/app/api/auth/schemas";
import type { ApiErrorResponse } from "@/app/api/schemas";
import { AuthApi } from "@/ui/api/auth";
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
      await AuthApi.login(state.fields);

      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      const message = axios.isAxiosError<ApiErrorResponse>(error)
        ? error.response?.data.error
        : undefined;

      setState((current) => ({
        ...current,
        isSubmitting: false,
        error: message ?? "No se ha podido iniciar sesión. Inténtalo de nuevo.",
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
