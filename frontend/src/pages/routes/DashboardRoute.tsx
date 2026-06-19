import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserData } from "../../hooks/useUserData";
import { Dashboard } from "../../components/droussi/Dashboard";
import { toDisplayUser } from "../../lib/userDisplay";
import { buildRecentActivity } from "../../lib/droussiData";

const PAGE_ROUTES: Record<string, string> = {
  upload: "/upload",
  exam: "/exam",
  repository: "/repository",
  outputs: "/outputs",
};

export default function DashboardRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { docs, readyExams, loading } = useUserData();

  if (!user) return null;

  return (
    <Dashboard
      user={toDisplayUser(user)}
      stats={{
        uploads: docs.length,
        exams: readyExams.length,
        downloads: readyExams.filter((e) => e.export_path).length,
      }}
      recentActivity={loading ? [] : buildRecentActivity(docs, readyExams)}
      onNavigate={(page) => navigate(PAGE_ROUTES[page] ?? "/dashboard")}
    />
  );
}
