import { describe, expect, it, vi } from "vitest";
import {
  compileSort,
  defaultSort,
  resolveSort,
  type SortableNode,
} from "../src/components/scripts/sort";

/** A page as the content index has it (every entry has `tags`, `[]` without any). */
function file(name: string, data: Record<string, unknown> = {}): SortableNode {
  const slug = (data.slug as string | undefined) ?? name.toLowerCase().replace(/ /g, "-");
  return {
    isFolder: false,
    displayName: (data.title as string) ?? name,
    slugSegment: slug.split("/").pop()!,
    data: { slug, filePath: `content/${name}.md`, title: name, links: [], tags: [], ...data },
    children: [],
  };
}

function folder(
  name: string,
  children: SortableNode[],
  data: Record<string, unknown> | null = null,
  slugSegment = name.toLowerCase(),
): SortableNode {
  return {
    isFolder: true,
    displayName: name,
    slugSegment,
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

  it("puts a folder before a file by default, whatever their titles", () => {
    expect(names(sorted([file("A"), folder("Z", [])]))).toEqual(["Z", "A"]);
  });

  it("uses the default without warning for a missing sort option", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveSort(undefined)).toBe(defaultSort);
    expect(resolveSort(null)).toBe(defaultSort);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
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
    // the newest page is not the last child
    const withoutIndex = folder("Plain", [
      file("z", { date: "2026-01-01" }),
      file("y", { date: "2025-01-01" }),
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

  it("dates a folder by its newest page when its index page's frontmatter date is unparsable", () => {
    const unparsable = folder("Bad", [file("x", { date: "2026-02-01" })], {
      date: "not a date",
      dateFromFrontmatter: true,
    });
    const loose = file("Loose", { date: "2025-06-01" });
    expect(names(sorted([loose, unparsable], [{ by: "date", direction: "desc" }]))).toEqual([
      "Bad",
      "Loose",
    ]);
  });

  it("sorts untagged pages (tags: []) after tagged ones in either direction", () => {
    const nodes = [file("A", { tags: ["b"] }), file("B", { tags: [] }), file("C", { tags: ["a"] })];
    expect(names(sorted(nodes, ["tag"]))).toEqual(["C", "A", "B"]);
    expect(names(sorted(nodes, [{ by: "tag", direction: "desc" }]))).toEqual(["A", "C", "B"]);
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

  it("sorts a page with a permalink by its file name, not its slug", () => {
    const nodes = [file("Zebra", { slug: "2024040414012730" }), file("Apple")];
    expect(names(sorted(nodes, ["name"]))).toEqual(["Apple", "Zebra"]);
  });

  it("strips only the extension from a file name with dots", () => {
    const nodes = [file("2024.10 Log"), file("2024.9 Log")];
    expect(names(sorted(nodes, ["name"]))).toEqual(["2024.9 Log", "2024.10 Log"]);
    // with ".md" left on, "Note.md" would come after "Note 2.md"
    expect(names(sorted([file("Note 2"), file("Note")], ["name"]))).toEqual(["Note", "Note 2"]);
  });

  it("sorts a folder by its name, not its slug", () => {
    const nodes = [folder("Zeta", [], null, "a-zeta"), folder("Beta", [])];
    expect(names(sorted(nodes, ["name"]))).toEqual(["Beta", "Zeta"]);
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

  it("drops rules that are neither a key nor an object, without throwing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveSort([null, 5, "title"])).toEqual([{ by: "title", direction: "asc" }]);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls.map((c) => c[0])).toEqual([
      '[Explorer] ignoring sort rule null: "by" is one of folder, title, name, date, tag; "direction" is asc or desc',
      '[Explorer] ignoring sort rule 5: "by" is one of folder, title, name, date, tag; "direction" is asc or desc',
    ]);
    warn.mockRestore();
  });
});
