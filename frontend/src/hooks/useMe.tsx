import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../lib/api";
import type { MeInfo } from "../types";

interface MeContextValue {
  me: MeInfo | null;
  loading: boolean;
  isAdmin: boolean;
}

const MeContext = createContext<MeContextValue | null>(null);

export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch<MeInfo>("/api/me")
      .then((data) => active && setMe(data))
      .catch((e) => console.error("Failed to load /api/me", e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      me: me
        ? { ...me, plan: me.plan === "pro" ? ("pro" as const) : ("free" as const) }
        : null,
      loading,
      isAdmin: me?.is_admin ?? false,
    }),
    [me, loading]
  );

  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

export function useMe() {
  const ctx = useContext(MeContext);
  if (!ctx) throw new Error("useMe must be used within MeProvider");
  return ctx;
}
