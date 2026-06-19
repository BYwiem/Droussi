import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LandingPage } from "../../components/droussi/LandingPage";

export default function LandingRoute() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;

  return <LandingPage onGetStarted={() => navigate("/login")} />;
}
