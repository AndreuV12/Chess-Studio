"use client";

import { useCallback, useState } from "react";

type UseActionOptions<TArgs extends unknown[], TResult> = {
  action: (...args: TArgs) => Promise<TResult>;
  onSuccess?: (params: { result: TResult; args: TArgs }) => void | Promise<void>;
  onError?: (error: unknown, ...args: TArgs) => void | Promise<void>;
  throwError?: boolean;
};

export function useAction<TArgs extends unknown[], TResult>({ action, onSuccess, onError, throwError = false }: UseActionOptions<TArgs, TResult>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await action(...args);

        await onSuccess?.({
          result,
          args,
        });

        return result;
      } catch (error) {
        setError(error);
        await onError?.(error, ...args);

        if (throwError) throw error;

        return null;
      } finally {
        setLoading(false);
      }
    },
    [action, onSuccess, onError, throwError],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
}
