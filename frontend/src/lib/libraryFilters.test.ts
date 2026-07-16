import { describe, expect, it } from "vitest";
import {
  compareBySort,
  groupBySubject,
  matchesDateFilter,
} from "./libraryFilters";

describe("matchesDateFilter", () => {
  it("accepts all when preset is all", () => {
    expect(matchesDateFilter("2020-01-01", { preset: "all" })).toBe(true);
  });

  it("filters custom range inclusively", () => {
    expect(
      matchesDateFilter("2026-03-15", { preset: "custom", from: "2026-03-01", to: "2026-03-31" })
    ).toBe(true);
    expect(
      matchesDateFilter("2026-04-01", { preset: "custom", from: "2026-03-01", to: "2026-03-31" })
    ).toBe(false);
  });
});

describe("compareBySort", () => {
  it("sorts newest first", () => {
    const a = { name: "a", date: "2026-01-01" };
    const b = { name: "b", date: "2026-06-01" };
    expect(compareBySort(a, b, "newest")).toBeGreaterThan(0);
    expect(compareBySort(a, b, "oldest")).toBeLessThan(0);
  });
});

describe("groupBySubject", () => {
  it("groups and respects order", () => {
    const items = [
      { subject: "Biology", id: 1 },
      { subject: "Mathematics", id: 2 },
      { subject: "Biology", id: 3 },
    ];
    const groups = groupBySubject(items, ["Mathematics", "Biology"]);
    expect(groups.map((g) => g.subject)).toEqual(["Mathematics", "Biology"]);
    expect(groups[1].items).toHaveLength(2);
  });
});
