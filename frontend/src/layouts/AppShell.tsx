import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UsageProvider } from "../hooks/useUsage";
import { MeProvider, useMe } from "../hooks/useMe";
import { NavBar } from "../components/droussi/NavBar";
import { toDisplayUser } from "../lib/userDisplay";

const PAGE_ROUTES: Record<string, string> = {
  dashboard: "/dashboard",
  upload: "/upload",
  exam: "/exam",
  repository: "/repository",
  outputs: "/outputs",
  pricing: "/pricing",
  admin: "/admin",
};

function routeToPage(pathname: string): string {
  if (pathname.startsWith("/upload")) return "upload";
  if (pathname.startsWith("/exam")) return "exam";
  if (pathname.startsWith("/repository")) return "repository";
  if (pathname.startsWith("/outputs")) return "outputs";
  if (pathname.startsWith("/pricing")) return "pricing";
  if (pathname.startsWith("/documents")) return "repository";
  if (pathname.startsWith("/admin")) return "admin";
  return "dashboard";
}

function AppShellInner() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, me } = useMe();

  if (!user) return null;

  const displayUser = toDisplayUser(user);
  const currentPage = routeToPage(location.pathname);
  const plan = me?.plan === "pro" ? "pro" : "free";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        fontFamily: "'Geist','Inter',sans-serif",
      }}
    >
      <NavBar
        user={displayUser}
        currentPage={currentPage}
        isAdmin={isAdmin}
        plan={plan}
        onNavigate={(page) => navigate(PAGE_ROUTES[page] ?? "/dashboard")}
        onLogout={() => void signOut()}
      />
      {/* Keyed by pathname so each navigation replays one clean fade-up. */}
      <div key={location.pathname} className="dr-page">
        <Outlet />
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <MeProvider>
      <UsageProvider>
        <AppShellInner />
      </UsageProvider>
    </MeProvider>
  );
}
