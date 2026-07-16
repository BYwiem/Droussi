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
  language?: "en" | "fr";
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

export type Plan = "free" | "pro";

export interface UsageInfo {
  exams_used: number;
  exams_limit: number;
  remaining: number;
  percent: number;
  cost_usd_today: number;
  usage_date: string;
  resets_at: string;
  plan?: Plan;
}

export interface MeInfo {
  id: string;
  email: string | null;
  is_admin: boolean;
  plan: Plan;
  subscription_status?: string | null;
  current_period_end?: string | null;
}

export interface AdminUserUsage {
  user_id: string;
  email: string | null;
  exams_today: number;
  exams_total: number;
  cost_usd_today: number;
  cost_usd_total: number;
}

export interface AdminOverview {
  user_count: number;
  exams_today: number;
  exams_total: number;
  cost_usd_today: number;
  cost_usd_total: number;
  per_user_exam_limit: number;
  global_daily_cost_limit_usd: number;
  account_usage_usd: number | null;
  account_limit_usd: number | null;
  account_remaining_usd: number | null;
  account_is_free_tier: boolean | null;
  rankings: AdminUserUsage[];
}
