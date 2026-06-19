import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UsageProvider } from "../hooks/useUsage";
import UsageGauge from "../components/UsageGauge";
import { NavBar } from "../components/droussi/NavBar";
import { toDisplayUser } from "../lib/userDisplay";

const PAGE_ROUTES: Record<string, string> = {
  dashboard: "/dashboard",
  upload: "/upload",
  exam: "/exam",
  repository: "/repository",
  outputs: "/outputs",
};

function routeToPage(pathname: string): string {
  if (pathname.startsWith("/upload")) return "upload";
  if (pathname.startsWith("/exam")) return "exam";
  if (pathname.startsWith("/repository")) return "repository";
  if (pathname.startsWith("/outputs")) return "outputs";
  if (pathname.startsWith("/documents")) return "repository";
  return "dashboard";
}

export default function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const displayUser = toDisplayUser(user);
  const currentPage = routeToPage(location.pathname);

  return (
    <UsageProvider>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ebf5ff",
          fontFamily: "'Geist','Inter',sans-serif",
        }}
      >
        <NavBar
          user={displayUser}
          currentPage={currentPage}
          onNavigate={(page) => navigate(PAGE_ROUTES[page] ?? "/dashboard")}
          onLogout={() => void signOut()}
          extra={<UsageGauge />}
        />
        <Outlet />
      </div>
    </UsageProvider>
  );
}
