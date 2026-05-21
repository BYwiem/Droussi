export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "mcq" | "open";
export type ExportFormat = "pdf" | "docx";

export interface ExamSpec {
  difficulty: Difficulty;
  question_types: QuestionType[];
  num_exercises: number;
  total_points: number;
  per_exercise_points: number[];
  export_format: ExportFormat;
  extra_instructions?: string;
}

export interface DocumentRow {
  id: string;
  filename: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface Exercise {
  type: QuestionType;
  question: string;
  choices?: string[];
  answer: string;
  explanation?: string;
  points: number;
}

export interface ExamContent {
  title: string;
  total_points: number;
  exercises: Exercise[];
}

export interface ExamRow {
  id: string;
  document_id: string | null;
  title: string | null;
  spec: ExamSpec;
  content: ExamContent | null;
  export_format: ExportFormat | null;
  export_path: string | null;
  status: "pending" | "generating" | "ready" | "error";
  created_at: string;
}

export interface ChatMessage {
  id: string;
  scope: "document" | "exam";
  scope_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}
