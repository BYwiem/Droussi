import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

/** Legacy deep link — redirects to the new exam generator with document pre-selected. */
export default function ExamBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) navigate(`/exam?doc=${id}`, { replace: true });
    else navigate("/exam", { replace: true });
  }, [id, navigate]);

  return (
    <div
      style={{
        backgroundColor: "#ebf5ff",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Geist','Inter',sans-serif",
        color: "#93979f",
        fontSize: 14,
      }}
    >
      Redirecting…{" "}
      <Link to="/exam" style={{ marginLeft: 4, color: "#0069e0" }}>
        Open exam generator
      </Link>
    </div>
  );
}
