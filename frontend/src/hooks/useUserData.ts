import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../lib/supabase";
import type { DocumentRow, ExamRow } from "../types";

export function useUserData() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [docRes, examRes] = await Promise.all([
      supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("exams")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    if (!docRes.error && docRes.data) setDocs(docRes.data as DocumentRow[]);
    if (!examRes.error && examRes.data) setExams(examRes.data as ExamRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const readyExams = useMemo(
    () => exams.filter((e) => e.status === "ready"),
    [exams]
  );

  const examCountByDoc = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of exams) {
      if (e.document_id && e.status === "ready") {
        map.set(e.document_id, (map.get(e.document_id) ?? 0) + 1);
      }
    }
    return map;
  }, [exams]);

  return { docs, exams, readyExams, examCountByDoc, loading, reload };
}
