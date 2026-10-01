"use client";

import { useState } from "react";

type UseFormOptions<TPayload extends object, TResponse> = {
  initialValues: TPayload;
  submit: (payload: TPayload) => Promise<TResponse>;
};

export function useForm<TPayload extends object, TResponse = unknown>({ initialValues, submit }: UseFormOptions<TPayload, TResponse>) {
  const [payload, setPayload] = useState<TPayload>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  async function submitForm(): Promise<TResponse> {
    setLoading(true);
    setError(null);

    try {
      return await submit(payload);
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function fill(values: Partial<TPayload>) {
    setPayload((current) => ({
      ...current,
      ...values,
    }));
  }

  function setField<K extends keyof TPayload>(key: K, value: TPayload[K]) {
    setPayload((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function reset() {
    setPayload(initialValues);
    setError(null);
  }

  return {
    payload,
    loading,
    error,
    submit: submitForm,
    fill,
    setField,
    reset,
  };
}
