import type { User } from "@supabase/supabase-js";

export interface DisplayUser {
  name: string;
  email: string;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "U";
}

export function toDisplayUser(user: User): DisplayUser {
  const meta = user.user_metadata as Record<string, string | undefined>;
  return {
    name: meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "User",
    email: user.email ?? "",
  };
}
