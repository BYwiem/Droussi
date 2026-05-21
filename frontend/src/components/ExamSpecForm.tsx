import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ExamSpec, QuestionType } from "../types";

const schema = z
  .object({
    difficulty: z.enum(["easy", "medium", "hard"]),
    question_types: z
      .array(z.enum(["mcq", "open"]))
      .min(1, "Pick at least one question type"),
    num_exercises: z.coerce.number().int().min(1).max(20),
    total_points: z.coerce.number().int().min(1).max(1000),
    per_exercise_points: z
      .array(z.object({ value: z.coerce.number().int().min(0) }))
      .min(1),
    export_format: z.enum(["pdf", "docx"]),
    extra_instructions: z.string().optional(),
  })
  .refine(
    (v) =>
      v.per_exercise_points.reduce((s, p) => s + (p.value || 0), 0) ===
      v.total_points,
    {
      message: "Per-exercise points must sum to the total points",
      path: ["per_exercise_points"],
    }
  );

type FormValues = z.input<typeof schema>;

interface Props {
  onSubmit: (spec: ExamSpec) => void | Promise<void>;
  submitting?: boolean;
}

function defaultPoints(count: number, total: number): { value: number }[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) => ({
    value: base + (i < remainder ? 1 : 0),
  }));
}

export default function ExamSpecForm({ onSubmit, submitting }: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      difficulty: "medium",
      question_types: ["mcq", "open"],
      num_exercises: 5,
      total_points: 20,
      per_exercise_points: defaultPoints(5, 20),
      export_format: "pdf",
      extra_instructions: "",
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "per_exercise_points",
  });

  const num = watch("num_exercises");
  const total = watch("total_points");

  useEffect(() => {
    replace(defaultPoints(Number(num) || 0, Number(total) || 0));
  }, [num, total, replace]);

  const currentSum = fields
    .map((_, i) => Number(watch(`per_exercise_points.${i}.value`)) || 0)
    .reduce((a, b) => a + b, 0);

  function submit(values: FormValues) {
    const spec: ExamSpec = {
      difficulty: values.difficulty,
      question_types: values.question_types as QuestionType[],
      num_exercises: Number(values.num_exercises),
      total_points: Number(values.total_points),
      per_exercise_points: values.per_exercise_points.map((p) => Number(p.value)),
      export_format: values.export_format,
      extra_instructions: values.extra_instructions || undefined,
    };
    void onSubmit(spec);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-5"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Difficulty
        </label>
        <div className="flex gap-3">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <label key={d} className="inline-flex items-center gap-2 text-sm">
              <input type="radio" value={d} {...register("difficulty")} />
              <span className="capitalize">{d}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Question types
        </label>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" value="mcq" {...register("question_types")} />
            MCQ (multiple choice)
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" value="open" {...register("question_types")} />
            Open-ended
          </label>
        </div>
        {errors.question_types && (
          <p className="mt-1 text-xs text-red-600">
            {errors.question_types.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Number of exercises
          </label>
          <input
            type="number"
            min={1}
            max={20}
            {...register("num_exercises")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Total points
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            {...register("total_points")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">
            Points per exercise
          </label>
          <button
            type="button"
            onClick={() =>
              replace(defaultPoints(Number(num) || 0, Number(total) || 0))
            }
            className="text-xs text-indigo-600 hover:underline"
          >
            Distribute evenly
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {fields.map((f, i) => (
            <Controller
              key={f.id}
              control={control}
              name={`per_exercise_points.${i}.value` as const}
              render={({ field }) => (
                <div>
                  <label className="block text-[10px] uppercase text-slate-400">
                    Ex {i + 1}
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                </div>
              )}
            />
          ))}
        </div>
        <p
          className={`mt-1 text-xs ${
            currentSum === Number(total) ? "text-slate-500" : "text-red-600"
          }`}
        >
          Sum: {currentSum} / {total}
        </p>
        {errors.per_exercise_points && (
          <p className="mt-1 text-xs text-red-600">
            {(errors.per_exercise_points as { message?: string }).message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Export format
        </label>
        <div className="flex gap-3">
          {(["pdf", "docx"] as const).map((f) => (
            <label key={f} className="inline-flex items-center gap-2 text-sm">
              <input type="radio" value={f} {...register("export_format")} />
              <span className="uppercase">{f}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Extra instructions (optional)
        </label>
        <textarea
          rows={3}
          {...register("extra_instructions")}
          placeholder="e.g. focus on chapter 2, include some application questions…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? "Generating…" : "Generate exam"}
      </button>
    </form>
  );
}
