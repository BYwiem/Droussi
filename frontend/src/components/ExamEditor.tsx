import { useMemo, useState } from "react";
import type { ExamContent, Exercise } from "../types";

interface Props {
  exam: ExamContent;
  saving?: boolean;
  onSave: (content: { title: string; exercises: Exercise[] }) => void;
  onCancel: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(83,88,98,0.25)",
  backgroundColor: "#fff",
  fontSize: 13,
  color: "#0a0d12",
  fontFamily: "'Geist','Inter',sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#93979f",
  display: "block",
  marginBottom: 4,
};

export default function ExamEditor({ exam, saving, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(exam.title);
  const [exercises, setExercises] = useState<Exercise[]>(
    exam.exercises.map((ex) => ({ ...ex, choices: ex.choices ? [...ex.choices] : ex.choices }))
  );

  const totalMarks = useMemo(
    () => exercises.reduce((sum, ex) => sum + (Number(ex.points) || 0), 0),
    [exercises]
  );

  function patch(index: number, changes: Partial<Exercise>) {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, ...changes } : ex)));
  }

  function patchChoice(exIndex: number, choiceIndex: number, value: string) {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex || !ex.choices) return ex;
        const choices = ex.choices.map((c, j) => (j === choiceIndex ? value : c));
        return { ...ex, choices };
      })
    );
  }

  return (
    <div style={{ fontFamily: "'Geist','Inter',sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Exam title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ ...inputStyle, fontSize: 15, fontWeight: 600 }} />
        </div>
        <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: 11, color: "#93979f", display: "block" }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#0a0d12", fontVariantNumeric: "tabular-nums" }}>{totalMarks} pts</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {exercises.map((ex, i) => (
          <div key={i} style={{ border: "1px solid rgba(83,88,98,0.15)", borderRadius: 14, padding: 16, backgroundColor: "#fafdff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#535862" }}>
                Exercise {i + 1}{" "}
                <span style={{ fontSize: 11, fontWeight: 600, color: "#93979f", textTransform: "uppercase" }}>
                  ({ex.type === "mcq" ? "MCQ" : "Open"})
                </span>
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#93979f" }}>Marks</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={ex.points}
                  onChange={(e) => patch(i, { points: +e.target.value })}
                  style={{ ...inputStyle, width: 72, textAlign: "center", fontWeight: 600 }}
                />
              </div>
            </div>

            <label style={labelStyle}>Question</label>
            <textarea
              value={ex.question}
              onChange={(e) => patch(i, { question: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: "vertical", marginBottom: 10 }}
            />

            {ex.type === "mcq" && ex.choices && (
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Choices</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {ex.choices.map((c, j) => (
                    <input
                      key={j}
                      value={c}
                      onChange={(e) => patchChoice(i, j, e.target.value)}
                      style={inputStyle}
                    />
                  ))}
                </div>
              </div>
            )}

            <label style={labelStyle}>Answer</label>
            <input value={ex.answer} onChange={(e) => patch(i, { answer: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />

            <label style={labelStyle}>Explanation (optional)</label>
            <textarea
              value={ex.explanation ?? ""}
              onChange={(e) => patch(i, { explanation: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
        <button
          onClick={onCancel}
          disabled={saving}
          style={{ borderRadius: 9999, padding: "9px 18px", fontSize: 13, fontWeight: 600, border: "1px solid rgba(83,88,98,0.25)", backgroundColor: "#fff", color: "#535862", cursor: saving ? "not-allowed" : "pointer" }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ title, exercises })}
          disabled={saving}
          style={{ borderRadius: 9999, padding: "9px 18px", fontSize: 13, fontWeight: 600, border: "none", backgroundColor: saving ? "#93979f" : "#181d27", color: "#fff", cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
