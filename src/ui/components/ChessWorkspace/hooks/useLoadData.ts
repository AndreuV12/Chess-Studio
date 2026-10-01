"use client";

import { useCallback, useEffect, useState } from "react";

type UseLoadDataOptions<TData> = {
  loader: () => Promise<TData>;
  initialValue: TData;
  immediate?: boolean;
};

type LoadDataCallOptions = {
  showLoading?: boolean;
};

export function useLoadData<TData>({ loader, initialValue, immediate = false }: UseLoadDataOptions<TData>) {
  const [data, setData] = useState<TData>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const loadData = useCallback(
    async ({ showLoading = true }: LoadDataCallOptions = {}): Promise<TData> => {
      if (showLoading) setLoading(true);
      setError(null);

      try {
        const data = await loader();
        setData(data);
        return data;
      } catch (error) {
        setError(error);
        throw error;
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [loader],
  );

  useEffect(() => {
    if (immediate) {
      void loadData().catch(() => undefined);
    }
  }, [immediate, loadData]);

  return {
    data,
    loading,
    error,
    loadData,
    setData,
  };
}
