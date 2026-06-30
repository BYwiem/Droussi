import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useMe } from "../../hooks/useMe";
import { apiFetch } from "../../lib/api";
import { AdminDashboard } from "../../components/droussi/AdminDashboard";
import type { AdminOverview } from "../../types";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#ebf5ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#93979f",
        fontFamily: "'Geist','Inter',sans-serif",
      }}
    >
      {children}
    </div>
  );
}

export default function AdminRoute() {
  const { isAdmin, loading: meLoading } = useMe();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    apiFetch<AdminOverview>("/api/admin/overview")
      .then(setData)
      .catch((e) => setError(String(e)));
  }, [isAdmin]);

  if (meLoading) return <Centered>Loading…</Centered>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  if (error) return <Centered>Could not load admin data: {error}</Centered>;
  if (!data) return <Centered>Loading admin data…</Centered>;

  return <AdminDashboard data={data} />;
}
