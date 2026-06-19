import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../lib/api";
import type { UsageInfo } from "../types";

interface UsageContextValue {
  usage: UsageInfo | null;
  loading: boolean;
  atLimit: boolean;
  refresh: () => Promise<void>;
}

const UsageContext = createContext<UsageContextValue | null>(null);

export function UsageProvider({ children }: { children: ReactNode }) {
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<UsageInfo>("/api/usage");
      setUsage(data);
    } catch (e) {
      console.error("Failed to load usage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const atLimit = usage ? usage.remaining <= 0 : false;

  const value = useMemo(
    () => ({ usage, loading, atLimit, refresh }),
    [usage, loading, atLimit, refresh]
  );

  return (
    <UsageContext.Provider value={value}>{children}</UsageContext.Provider>
  );
}

export function useUsage() {
  const ctx = useContext(UsageContext);
  if (!ctx) {
    throw new Error("useUsage must be used within UsageProvider");
  }
  return ctx;
}
