import { ArrowRight, BookOpen, Download, FileText, FolderOpen, GraduationCap, Sparkles, Upload, Users, Zap } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

const FEATURES = [
  {
    icon: <Upload size={22} color="#0069e0" />,
    iconBg: "#cce7ff",
    title: "Upload Any Material",
    description: "Drag and drop PDFs, DOCX, PPTX, or text files. Droussi reads your lectures, notes, and slides so you don't have to type a single question.",
    tint: "linear-gradient(rgb(229, 246, 255) 0%, rgb(194, 233, 255) 100%)",
  },
  {
    icon: <Sparkles size={22} color="#9552e0" />,
    iconBg: "#f1e6ff",
    title: "AI Exam Generation",
    description: "Choose the number of MCQs, short answers, and essays. Set the difficulty and duration — Droussi crafts a complete, ready-to-use exam in seconds.",
    tint: "linear-gradient(rgb(244, 235, 255) 0%, rgb(228, 204, 255) 100%)",
  },
  {
    icon: <Download size={22} color="#e05a00" />,
    iconBg: "#ffd1b8",
    title: "Download in PDF or DOCX",
    description: "Export every generated exam to a formatted PDF or an editable DOCX file — ready to print, share, or upload to your LMS.",
    tint: "linear-gradient(rgb(255, 242, 235) 0%, rgb(255, 209, 184) 100%)",
  },
  {
    icon: <FolderOpen size={22} color="#1aa06d" />,
    iconBg: "#d3f6e3",
    title: "Smart Repository",
    description: "Every file you upload lives in your personal repository. Find it by subject, tag, or keyword — and regenerate a fresh exam anytime without re-uploading.",
    tint: "linear-gradient(rgb(220, 252, 231) 0%, rgb(187, 247, 208) 100%)",
  },
  {
    icon: <FileText size={22} color="#bb9915" />,
    iconBg: "#fff2be",
    title: "Output History",
    description: "All your generated exams are saved and searchable. Preview any exam, filter by format, and re-download whenever you need it.",
    tint: "linear-gradient(rgb(255, 249, 224) 0%, rgb(255, 236, 163) 100%)",
  },
  {
    icon: <Users size={22} color="#535862" />,
    iconBg: "#f6f7f8",
    title: "For Teachers & Students",
    description: "Teachers build exams from course materials. Students use practice mode to generate self-quizzes and prepare for real exams — same platform, different superpowers.",
    tint: "linear-gradient(rgb(246, 247, 248) 0%, rgb(236, 237, 240) 100%)",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Sign in with Google", body: "One click to get started — no passwords, no forms, no friction." },
  { step: "02", title: "Upload your material", body: "Add any lecture notes, slides, or textbook chapters you want to test on." },
  { step: "03", title: "Configure your exam", body: "Pick question types, difficulty, duration, and how many of each type you want." },
  { step: "04", title: "Download and share", body: "Get a polished PDF or DOCX exam file in seconds and distribute it however you like." },
];

const PERSONAS = [
  {
    role: "Teachers",
    icon: <GraduationCap size={24} color="#0069e0" />,
    bg: "#cce7ff",
    color: "#0069e0",
    points: [
      "Turn a lecture PDF into a full exam in under a minute",
      "Maintain a library of all your course materials",
      "Regenerate variations of the same exam for different classes",
      "Export to PDF or DOCX — ready for printing or LMS upload",
    ],
  },
  {
    role: "Students",
    icon: <BookOpen size={24} color="#9552e0" />,
    bg: "#f1e6ff",
    color: "#9552e0",
    points: [
      "Upload your own notes and generate practice quizzes",
      "Test yourself with AI-crafted questions before exams",
      "Adjust difficulty from easy warm-ups to hard challenges",
      "Keep all your practice sets organized by subject",
    ],
  },
];

function Blob({ x, y, color, size }: { x: string; y: string; color: string; size: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", backgroundColor: color, opacity: 0.12, pointerEvents: "none", filter: "blur(2px)" }} />
  );
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div style={{ backgroundColor: "#ebf5ff", fontFamily: "'Geist','Inter',sans-serif", overflowX: "hidden" }}>

      {/* ── Nav ── */}
      <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "linear-gradient(135deg, #479dff 11%, #0069e0 78%)", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 20, color: "#0a0d12", letterSpacing: "-0.03em" }}>Droussi</span>
        </div>
        <button
          onClick={onGetStarted}
          style={{ backgroundColor: "#181d27", color: "#fff", borderRadius: 9999, padding: "9px 22px", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", letterSpacing: "-0.01em" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d3444")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#181d27")}
        >
          Sign in
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", textAlign: "center", padding: "72px 24px 96px", overflow: "hidden" }}>
        <Blob x="5%" y="0%" color="#4fbeff" size={260} />
        <Blob x="75%" y="10%" color="#9552e0" size={200} />
        <Blob x="60%" y="60%" color="#f26110" size={160} />
        <Blob x="0%" y="55%" color="#bb9915" size={140} />

        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, backgroundColor: "#cce7ff", borderRadius: 9999, padding: "6px 16px", marginBottom: 28 }}>
            <Sparkles size={13} color="#0069e0" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0069e0", letterSpacing: "-0.01em" }}>AI-powered exam generation</span>
          </div>

          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 24 }}>
            Turn your lessons into{" "}
            <span style={{ background: "linear-gradient(135deg, #479dff 11%, #0069e0 78%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              ready-to-use exams
            </span>
          </h1>

          <p style={{ fontSize: 18, color: "#535862", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.6, marginBottom: 40, maxWidth: 520, margin: "0 auto 40px" }}>
            Upload your lecture notes, slides, or textbooks — Droussi generates complete, configurable exams in seconds and exports them to PDF or DOCX.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={onGetStarted}
              style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#181d27", color: "#fff", borderRadius: 9999, padding: "14px 32px", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", letterSpacing: "-0.01em", transition: "background-color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d3444")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#181d27")}
            >
              Get started free <ArrowRight size={16} />
            </button>
            <button
              onClick={onGetStarted}
              style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#fafdff", color: "#0a0d12", borderRadius: 9999, padding: "14px 32px", fontSize: 15, fontWeight: 600, border: "1px solid rgba(83,88,98,0.2)", cursor: "pointer", letterSpacing: "-0.01em" }}
            >
              View demo
            </button>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex" }}>
              {["#4fbeff", "#f26110", "#9552e0", "#bb9915", "#1aa06d"].map((c, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: c, border: "2.5px solid #ebf5ff", marginLeft: i === 0 ? 0 : -10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14 }}>{["👩‍🏫", "👨‍🎓", "👩‍🎓", "👨‍🏫", "🧑‍🎓"][i]}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: "#535862", fontWeight: 500 }}>
              Trusted by <strong style={{ color: "#0a0d12" }}>2,400+</strong> teachers and students
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "80px 24px", backgroundColor: "#fafdff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#0069e0", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.04em", lineHeight: 1.15 }}>
              From upload to exam in four steps
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{ position: "relative" }}>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{ position: "absolute", top: 22, left: "calc(100% - 10px)", width: 20, height: 2, backgroundColor: "rgba(83,88,98,0.15)", display: "none" }} className="hidden lg:block" />
                )}
                <div style={{ backgroundColor: "#ebf5ff", borderRadius: 24, padding: "28px 24px", height: "100%" }}>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 32, fontWeight: 700, color: "#cce7ff", letterSpacing: "-0.04em", display: "block", marginBottom: 16 }}>{step.step}</span>
                  <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.02em", marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#535862", lineHeight: 1.6, letterSpacing: "-0.01em" }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9552e0", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Everything you need</p>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.04em", lineHeight: 1.15 }}>
              Built for educators who value their time
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{ background: f.tint, borderRadius: 28, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16, transition: "transform 0.18s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: f.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.03em", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "#535862", lineHeight: 1.65, letterSpacing: "-0.01em" }}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is it for ── */}
      <section style={{ padding: "80px 24px", backgroundColor: "#fafdff" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#f26110", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Who it's for</p>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.04em", lineHeight: 1.15 }}>
              One platform, two superpowers
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {PERSONAS.map((p) => (
              <div
                key={p.role}
                style={{ backgroundColor: "#fafdff", borderRadius: 32, border: "1px solid rgba(83,88,98,0.12)", padding: "36px 32px", boxShadow: "rgba(4,69,144,0.06) 0px 8px 20px 0px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: p.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p.icon}
                  </div>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.03em" }}>{p.role}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {p.points.map((point) => (
                    <li key={point} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: p.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <Zap size={10} color={p.color} />
                      </div>
                      <span style={{ fontSize: 14, color: "#535862", lineHeight: 1.55, letterSpacing: "-0.01em" }}>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{ background: "linear-gradient(135deg, #479dff 11%, #0069e0 78%)", borderRadius: 32, padding: "56px 48px", position: "relative", overflow: "hidden" }}
          >
            <Blob x="70%" y="-10%" color="#fff" size={180} />
            <Blob x="-10%" y="40%" color="#fff" size={140} />
            <div style={{ position: "relative" }}>
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: 16 }}>
                Ready to build your first exam?
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 36, letterSpacing: "-0.01em" }}>
                Sign in with Google and go from uploaded notes to a finished exam in under two minutes.
              </p>
              <button
                onClick={onGetStarted}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "#fff", color: "#181d27", borderRadius: 9999, padding: "14px 36px", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", letterSpacing: "-0.02em", transition: "opacity 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Get started — it's free <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(83,88,98,0.1)", padding: "28px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ background: "linear-gradient(135deg, #479dff 11%, #0069e0 78%)", borderRadius: 8, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={12} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: "#0a0d12", letterSpacing: "-0.02em" }}>Droussi</span>
        </div>
        <p style={{ fontSize: 13, color: "#93979f" }}>AI-powered exam generation for educators and students.</p>
      </footer>
    </div>
  );
}
