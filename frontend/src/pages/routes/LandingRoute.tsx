import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LandingPage } from "../../components/droussi/LandingPage";

export default function LandingRoute() {
  const { session, loading, signInWithGoogle } = useAuth();

  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;

  return <LandingPage onGoogleSignIn={() => void signInWithGoogle()} />;
}
