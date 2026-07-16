export type DatePreset = "all" | "today" | "week" | "month" | "year" | "custom";

export type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

export interface DateFilter {
  preset: DatePreset;
  /** YYYY-MM-DD — used when preset is "custom" */
  from?: string;
  to?: string;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseItemDate(isoOrYmd: string): Date | null {
  if (!isoOrYmd) return null;
  // Accept YYYY-MM-DD or full ISO
  const d = new Date(isoOrYmd.length === 10 ? `${isoOrYmd}T12:00:00` : isoOrYmd);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Inclusive date-range match against an item's created/uploaded date string. */
export function matchesDateFilter(dateStr: string, filter: DateFilter): boolean {
  if (filter.preset === "all") return true;
  const item = parseItemDate(dateStr);
  if (!item) return true;

  const now = new Date();
  const today = startOfDay(now);

  if (filter.preset === "today") {
    return item >= today;
  }
  if (filter.preset === "week") {
    const from = new Date(today);
    from.setDate(from.getDate() - 7);
    return item >= from;
  }
  if (filter.preset === "month") {
    const from = new Date(today);
    from.setDate(from.getDate() - 30);
    return item >= from;
  }
  if (filter.preset === "year") {
    const from = new Date(today);
    from.setFullYear(from.getFullYear() - 1);
    return item >= from;
  }
  // custom
  if (filter.from) {
    const from = parseItemDate(filter.from);
    if (from && item < startOfDay(from)) return false;
  }
  if (filter.to) {
    const to = parseItemDate(filter.to);
    if (to) {
      const end = startOfDay(to);
      end.setHours(23, 59, 59, 999);
      if (item > end) return false;
    }
  }
  return true;
}

export function compareBySort<T extends { name?: string; title?: string; date: string }>(
  a: T,
  b: T,
  sort: SortOption
): number {
  const nameA = (a.name ?? a.title ?? "").toLowerCase();
  const nameB = (b.name ?? b.title ?? "").toLowerCase();
  switch (sort) {
    case "oldest":
      return a.date.localeCompare(b.date) || nameA.localeCompare(nameB);
    case "name_asc":
      return nameA.localeCompare(nameB);
    case "name_desc":
      return nameB.localeCompare(nameA);
    case "newest":
    default:
      return b.date.localeCompare(a.date) || nameA.localeCompare(nameB);
  }
}

export function groupBySubject<T extends { subject: string }>(
  items: T[],
  subjectOrder: string[]
): { subject: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = item.subject || "General";
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  const ordered: { subject: string; items: T[] }[] = [];
  for (const s of subjectOrder) {
    const itemsFor = map.get(s);
    if (itemsFor?.length) ordered.push({ subject: s, items: itemsFor });
    map.delete(s);
  }
  // Any leftover subjects (shouldn't happen if order is complete)
  for (const [subject, itemsFor] of map) {
    if (itemsFor.length) ordered.push({ subject, items: itemsFor });
  }
  return ordered;
}
