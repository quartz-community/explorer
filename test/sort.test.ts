import { describe, expect, it, vi } from "vitest";
import {
  compileSort,
  defaultSort,
  resolveSort,
  type SortableNode,
} from "../src/components/scripts/sort";

function file(name: string, data: Record<string, unknown> = {}): SortableNode {
  return {
    isFolder: false,
    displayName: (data.title as string) ?? name,
    slugSegment: name.toLowerCase().replace(/ /g, "-"),
    data: { filePath: `content/${name}.md`, ...data },
    children: [],
  };
}

function folder(
  name: string,
  children: SortableNode[],
  data: Record<string, unknown> | null = null,
): SortableNode {
  return {
    isFolder: true,
    displayName: name,
    slugSegment: name.toLowerCase(),
    fileSegmentHint: name,
    data,
    children,
  };
}

const names = (nodes: SortableNode[]) => nodes.map((n) => n.displayName);
const sorted = (nodes: SortableNode[], option?: unknown) => [...nodes].sort(compileSort(option));

describe("sort option", () => {
  it("defaults to folders first, then natural title order (the previous sortFn)", () => {
    const nodes = [file("Note 10"), folder("B", []), file("note 2"), folder("a", [])];
    expect(names(sorted(nodes))).toEqual(["a", "B", "note 2", "Note 10"]);
    expect(resolveSort(undefined)).toBe(defaultSort);
  });

  it("applies rules in sequence as tie-breakers", () => {
    const nodes = [
      file("C", { tags: ["b"], date: "2026-01-01" }),
      file("A", { tags: ["a"], date: "2025-01-01" }),
      file("B", { tags: ["b"], date: "2026-06-01" }),
      file("D", { tags: ["a"], date: "2026-03-01" }),
    ];
    expect(names(sorted(nodes, [{ by: "tag" }, { by: "date", direction: "desc" }]))).toEqual([
      "D",
      "A",
      "B",
      "C",
    ]);
  });

  it("sorts by date; entries without a date come last in either direction", () => {
    const nodes = [
      file("Old", { date: "2024-05-01" }),
      file("None"),
      file("New", { date: "2026-05-01T10:00:00Z" }),
    ];
    expect(names(sorted(nodes, [{ by: "date" }]))).toEqual(["Old", "New", "None"]);
    expect(names(sorted(nodes, [{ by: "date", direction: "desc" }]))).toEqual([
      "New",
      "Old",
      "None",
    ]);
  });

  it("without dates in the content index (older Quartz), date ties and the next rule decides", () => {
    const nodes = [file("b"), file("a")];
    expect(names(sorted(nodes, [{ by: "date", direction: "desc" }, "title"]))).toEqual(["a", "b"]);
  });

  it("dates a folder by its index page's frontmatter date, else its newest page", () => {
    const fromFrontmatter = folder("Indexed", [file("x", { date: "2026-09-01" })], {
      date: "2020-01-01",
      dateFromFrontmatter: true,
    });
    // the index page's date did not come from frontmatter (or older Quartz without the flag)
    const notFromFrontmatter = folder("Unflagged", [file("w", { date: "2024-01-01" })], {
      date: "2027-01-01",
    });
    const withoutIndex = folder("Plain", [
      file("y", { date: "2025-01-01" }),
      file("z", { date: "2026-01-01" }),
    ]);
    const loose = file("Loose", { date: "2025-06-01" });
    expect(
      names(
        sorted(
          [fromFrontmatter, notFromFrontmatter, withoutIndex, loose],
          [{ by: "date", direction: "desc" }],
        ),
      ),
    ).toEqual(["Plain", "Loose", "Unflagged", "Indexed"]);
  });

  it("compares tag lists element by element; firstTagOnly compares the first tag", () => {
    const nodes = [
      file("A", { tags: ["news", "tech"] }),
      file("B", { tags: ["news"] }),
      file("C", { tags: ["news", "art"] }),
      file("D", { tags: ["guide", "zoo"] }),
      file("E"),
    ];
    expect(names(sorted(nodes, ["tag"]))).toEqual(["D", "B", "C", "A", "E"]);
    expect(names(sorted(nodes, [{ by: "tag", direction: "desc" }]))).toEqual([
      "A",
      "C",
      "B",
      "D",
      "E",
    ]);
    // only the first tag: news ties, the next rule (title, desc) decides
    expect(
      names(
        sorted(nodes, [
          { by: "tag", firstTagOnly: true },
          { by: "title", direction: "desc" },
        ]),
      ),
    ).toEqual(["D", "C", "B", "A", "E"]);
  });

  it("accepts Bases-style spellings: ASC/DESC and property", () => {
    expect(
      resolveSort([
        { property: "date", direction: "DESC" },
        { by: "title", direction: "ASC" },
      ]),
    ).toEqual([
      { by: "date", direction: "desc" },
      { by: "title", direction: "asc" },
    ]);
  });

  it("sorts by file name, unaffected by titles", () => {
    const nodes = [file("10 Zebra", { title: "Zebra" }), file("2 Apple", { title: "Apple" })];
    expect(names(sorted(nodes, ["name"]))).toEqual(["Apple", "Zebra"]);
    expect(names(sorted(nodes, ["title"]))).toEqual(["Apple", "Zebra"]);
    expect(names(sorted(nodes, [{ by: "name", direction: "desc" }]))).toEqual(["Zebra", "Apple"]);
  });

  it("puts files first with folder desc, and reverses titles with title desc", () => {
    const nodes = [folder("F", []), file("b"), file("a")];
    expect(
      names(
        sorted(nodes, [
          { by: "folder", direction: "desc" },
          { by: "title", direction: "desc" },
        ]),
      ),
    ).toEqual(["b", "a", "F"]);
  });

  it("drops unusable rules with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveSort([{ by: "size" }, { by: "date", direction: "down" }, "title"])).toEqual([
      { by: "title", direction: "asc" },
    ]);
    expect(resolveSort(["bogus"])).toBe(defaultSort);
    expect(warn).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });
});
