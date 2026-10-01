"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { ApiErrorResponse } from "@/app/api/schemas";
import type { RegisterRequest } from "@/app/api/register/schemas";
import { AuthApi } from "@/ui/api/auth";
import AuthCard from "./AuthCard";
import RegisterForm from "./RegisterForm";

type RegisterViewProps = {
  callbackUrl: string;
};

type RegisterState = {
  fields: RegisterRequest;
  isSubmitting: boolean;
  error: string | null;
};

const initialState: RegisterState = {
  fields: {
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  },
  isSubmitting: false,
  error: null,
};

export default function RegisterView({ callbackUrl }: RegisterViewProps) {
  const router = useRouter();
  const [state, setState] = useState<RegisterState>(initialState);

  function updateField(field: keyof RegisterRequest, value: string) {
    setState((current) => ({
      ...current,
      fields: { ...current.fields, [field]: value },
      error: null,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (state.fields.password !== state.fields.passwordConfirmation) {
      setState((current) => ({ ...current, error: "Las contraseñas no coinciden." }));
      return;
    }

    setState((current) => ({ ...current, isSubmitting: true, error: null }));
    let accountCreated = false;

    try {
      await AuthApi.register(state.fields);
      accountCreated = true;

      await AuthApi.login({
        email: state.fields.email,
        password: state.fields.password,
      });

      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      const responseMessage = axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data.error : undefined;
      const message = accountCreated
        ? "La cuenta se ha creado, pero no se pudo iniciar sesión. Accede desde la pantalla de login."
        : responseMessage;

      setState((current) => ({
        ...current,
        isSubmitting: false,
        error: message ?? "No se ha podido crear la cuenta. Inténtalo de nuevo.",
      }));
    }
  }

  const loginHref = callbackUrl === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <AuthCard title="Crea tu cuenta" description="Guarda tus líneas y análisis en un espacio personal.">
      <RegisterForm
        fields={state.fields}
        isSubmitting={state.isSubmitting}
        error={state.error}
        loginHref={loginHref}
        onFieldChange={updateField}
        onSubmit={handleSubmit}
      />
    </AuthCard>
  );
}
