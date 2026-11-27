import { describe, expect, it } from "vitest";
import { FileTrieNode, type TrieEntry } from "../src/components/scripts/trie";

/** A content index entry: `filePath` is relative to the content folder. */
const page = (filePath: string, extra: Partial<TrieEntry> = {}): [string, TrieEntry] => {
  const slug =
    extra.slug ??
    filePath
      .replace(/\.md$/, "")
      .split("/")
      .map((s) => s.toLowerCase().replace(/ /g, "-"))
      .join("/");
  return [
    slug,
    { slug, filePath, title: filePath.split("/").pop()!.replace(/\.md$/, ""), ...extra },
  ];
};

/** The tree as nested `displayName`s (folders as `[name, children]`). */
const shape = (node: FileTrieNode): unknown[] =>
  node.children.map((c) => (c.isFolder ? [c.displayName, shape(c)] : c.displayName));

describe("the explorer's file tree", () => {
  it("nests pages in their folders, named as in the vault", () => {
    const trie = FileTrieNode.fromEntries([
      page("Notes/Daily Notes/2026-11-26.md"),
      page("Notes/todo.md"),
      page("readme.md"),
    ]);
    expect(shape(trie)).toEqual([["Notes", [["Daily Notes", ["2026-11-26"]], "todo"]], "readme"]);
    const daily = trie.children[0]!.children[0]!;
    expect(daily.slug).toBe("notes/daily-notes/index");
    expect(daily.slugSegment).toBe("daily-notes");
    expect(daily.children[0]!.slug).toBe("notes/daily-notes/2026-11-26");
  });

  it("gives a folder its index page's title, not the title `index`", () => {
    const trie = FileTrieNode.fromEntries([
      page("Projects/index.md", { title: "All projects" }),
      page("Projects/x.md"),
      page("Archive/index.md", { title: "index" }),
      page("Archive/y.md"),
    ]);
    expect(shape(trie)).toEqual([
      ["All projects", ["x"]],
      ["Archive", ["y"]],
    ]);
    // the index page is the folder's data, not a child of its own
    expect(trie.children[0]!.data?.slug).toBe("projects/index");
  });

  it("keeps the first index page of a folder", () => {
    const trie = FileTrieNode.fromEntries([
      page("a/index.md", { title: "First" }),
      page("a/index.md", { title: "Second", slug: "a/index" }),
      page("a/x.md"),
    ]);
    expect(trie.children[0]!.displayName).toBe("First");
  });

  it("places a page with a permalink in its folder, keeping its slug", () => {
    const trie = FileTrieNode.fromEntries([
      page("Notes/moved.md", { slug: "elsewhere/moved" }),
      page("Notes/other.md"),
    ]);
    expect(shape(trie)).toEqual([["Notes", ["moved", "other"]]]);
    expect(trie.children[0]!.children[0]!.data?.slug).toBe("elsewhere/moved");
  });

  it("places an entry without a file path by its slug", () => {
    const trie = FileTrieNode.fromEntries([["tags/x", { slug: "tags/x", title: "x" }]]);
    expect(shape(trie)).toEqual([["tags", ["x"]]]);
  });

  it("falls back to the slug segment for a page without a title", () => {
    const trie = FileTrieNode.fromEntries([page("a/b.md", { title: "" })]);
    expect(trie.children[0]!.children[0]!.displayName).toBe("b");
    trie.children[0]!.displayName = "Renamed";
    expect(trie.children[0]!.displayName).toBe("Renamed");
  });

  it("filters, maps and sorts every level", () => {
    const trie = FileTrieNode.fromEntries([
      page("b/z.md"),
      page("b/a.md"),
      page("b/tags/u.md"),
      page("tags/t.md"),
      page("c.md"),
    ]);
    trie.filter((n) => n.slugSegment !== "tags");
    trie.map((n) => {
      if (!n.isFolder && n.data) n.displayName = n.displayName.toUpperCase();
    });
    trie.sort((x, y) => x.displayName.localeCompare(y.displayName));
    expect(shape(trie)).toEqual([["b", ["A", "Z"]], "C"]);
  });

  // bug: a page `notes.md` beside a folder `notes/` becomes that folder's page (and leaves the
  // explorer) when the content index lists it before the folder's pages; listed after them, it
  // is shown beside the folder. Obsidian shows both.
  it.fails("shows a page beside a folder of the same name, whatever the order", () => {
    const after = FileTrieNode.fromEntries([page("notes/x.md"), page("notes.md")]);
    expect(shape(after)).toEqual([["notes", ["x"]], "notes"]);
    const before = FileTrieNode.fromEntries([page("notes.md"), page("notes/x.md")]);
    expect(shape(before)).toEqual(expect.arrayContaining([["notes", ["x"]], "notes"]));
  });
});
