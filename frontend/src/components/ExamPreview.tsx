import type { ExamContent } from "../types";

export default function ExamPreview({ exam }: { exam: ExamContent }) {
  return (
    <article className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <header className="flex items-start justify-between border-b border-slate-200 pb-3">
        <h1 className="text-lg font-semibold text-slate-900">{exam.title}</h1>
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
          Total: {exam.total_points} pts
        </span>
      </header>
      <ol className="space-y-5">
        {exam.exercises.map((ex, i) => (
          <li key={i} className="border-l-2 border-indigo-200 pl-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                Exercise {i + 1}{" "}
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  ({ex.type === "mcq" ? "MCQ" : "Open"})
                </span>
              </span>
              <span className="text-xs font-medium text-slate-600">
                {ex.points} pts
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-800">
              {ex.question}
            </p>
            {ex.type === "mcq" && ex.choices && (
              <ul className="ml-4 mt-2 list-disc text-sm text-slate-700">
                {ex.choices.map((c, j) => (
                  <li key={j}>{c}</li>
                ))}
              </ul>
            )}
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-xs font-medium text-indigo-600">
                Show answer
              </summary>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">
                <strong>Answer:</strong> {ex.answer}
              </p>
              {ex.explanation && (
                <p className="mt-1 whitespace-pre-wrap text-slate-500">
                  <strong>Explanation:</strong> {ex.explanation}
                </p>
              )}
            </details>
          </li>
        ))}
      </ol>
    </article>
  );
}
