import { BookOpen, GraduationCap, Sparkles, Users } from "lucide-react";

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; avatar: string; role: string }) => void;
}

const MOCK_USERS = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@school.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=4fbeff",
    role: "teacher",
  },
  {
    name: "Ahmed Droussi",
    email: "ahmed.droussi@student.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed&backgroundColor=9552e0",
    role: "student",
  },
];

const FloatingDot = ({ x, y, color, size }: { x: string; y: string; color: string; size: number }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: color,
      opacity: 0.18,
      pointerEvents: "none",
    }}
  />
);

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div
      style={{ backgroundColor: "#ebf5ff", minHeight: "100vh", fontFamily: "'Geist','Inter',sans-serif" }}
      className="relative flex flex-col items-center justify-center overflow-hidden px-4"
    >
      {/* Floating decorative dots */}
      <FloatingDot x="8%" y="12%" color="#4fbeff" size={80} />
      <FloatingDot x="85%" y="8%" color="#9552e0" size={56} />
      <FloatingDot x="3%" y="60%" color="#f26110" size={48} />
      <FloatingDot x="90%" y="55%" color="#bb9915" size={72} />
      <FloatingDot x="50%" y="5%" color="#4fbeff" size={32} />
      <FloatingDot x="15%" y="85%" color="#9552e0" size={40} />
      <FloatingDot x="78%" y="88%" color="#f26110" size={52} />

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          style={{
            background: "linear-gradient(135deg, #479dff 11%, #0069e0 78%)",
            borderRadius: 20,
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "rgba(4,69,144,0.2) 0px 14px 24px 4px",
          }}
        >
          <BookOpen size={28} color="#fff" strokeWidth={2} />
        </div>
        <span
          style={{
            fontFamily: "'Inter',sans-serif",
            fontWeight: 700,
            fontSize: 32,
            color: "#0a0d12",
            letterSpacing: "-0.04em",
          }}
        >
          Droussi
        </span>
        <p style={{ fontSize: 16, color: "#535862", fontWeight: 500, letterSpacing: "-0.01em", textAlign: "center", maxWidth: 340 }}>
          AI-powered exam generation for educators and students
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "#fafdff",
          borderRadius: 32,
          border: "1px solid rgba(83,88,98,0.15)",
          boxShadow: "rgba(4,69,144,0.08) 0px 14px 20px 4px",
          padding: "40px 40px",
          width: "100%",
          maxWidth: 440,
        }}
      >
        <h2
          style={{
            fontFamily: "'Inter',sans-serif",
            fontWeight: 600,
            fontSize: 22,
            color: "#0a0d12",
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Welcome back
        </h2>
        <p style={{ fontSize: 14, color: "#93979f", marginBottom: 28, letterSpacing: "-0.01em" }}>
          Sign in with your Google account to continue
        </p>

        {/* Google SSO Button */}
        <button
          onClick={() => onLogin(MOCK_USERS[0])}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            backgroundColor: "#181d27",
            color: "#ffffff",
            borderRadius: 9999,
            padding: "13px 24px",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            marginBottom: 12,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d3444")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#181d27")}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 12, color: "#93979f" }}>— or try a demo account —</span>
        </div>

        <div className="flex flex-col gap-3">
          {MOCK_USERS.map((u) => (
            <button
              key={u.email}
              onClick={() => onLogin(u)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: u.role === "teacher" ? "#cce7ff" : "#f1e6ff",
                borderRadius: 16,
                padding: "12px 16px",
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.15s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: u.role === "teacher" ? "#4fbeff" : "#9552e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {u.role === "teacher" ? <GraduationCap size={18} color="#fff" /> : <Users size={18} color="#fff" />}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.01em" }}>{u.name}</p>
                <p style={{ fontSize: 12, color: "#535862" }}>{u.role === "teacher" ? "Teacher account" : "Student account"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature pills */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {[
          { icon: <Sparkles size={14} />, label: "AI Exam Generation", color: "#cce7ff" },
          { icon: <BookOpen size={14} />, label: "Smart Repository", color: "#d3f6e3" },
          { icon: <GraduationCap size={14} />, label: "For Educators", color: "#f1e6ff" },
        ].map((pill) => (
          <div
            key={pill.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: pill.color,
              borderRadius: 9999,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: "#0a0d12",
              letterSpacing: "-0.01em",
            }}
          >
            {pill.icon}
            {pill.label}
          </div>
        ))}
      </div>
    </div>
  );
}
