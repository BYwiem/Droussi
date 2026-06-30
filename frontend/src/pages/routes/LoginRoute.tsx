import { Navigate } from "react-router-dom";

// Login is now a modal that pops over the landing page. Anything that still
// navigates to /login (e.g. the protected-route redirect) lands on the landing
// page with the login modal opened via the ?login flag.
export default function LoginRoute() {
  return <Navigate to="/?login=1" replace />;
}
