import { supabase } from "./supabase";

const API_URL = (
  (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8000"
).replace(/\/+$/, "");

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await authHeader()),
    ...((fetchOptions.headers as Record<string, string>) ?? {}),
  };

  const controller = timeoutMs ? new AbortController() : null;
  const timer =
    controller &&
    window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: controller?.signal,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API ${res.status}: ${body}`);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error(
        `Request timed out after ${Math.round((timeoutMs ?? 0) / 1000)}s`
      );
    }
    throw e;
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}
