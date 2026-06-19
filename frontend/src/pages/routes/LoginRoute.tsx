import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoginPage } from "../../components/droussi/LoginPage";

export default function LoginRoute() {
  const { session, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ebf5ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#93979f",
          fontFamily: "'Geist','Inter',sans-serif",
        }}
      >
        Loading…
      </div>
    );
  }

  if (session) return <Navigate to="/dashboard" replace />;

  return <LoginPage onGoogleSignIn={() => void signInWithGoogle()} />;
}
