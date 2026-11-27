import { describe, expect, it } from "vitest";
import { folderVaultPath, vaultPath, type PathData } from "../src/components/scripts/vaultPath";

interface Node {
  data: PathData | null;
  slugSegments: string[];
  children: Node[];
}
const node = (slug: string, data: PathData | null = null, children: Node[] = []): Node => ({
  data,
  slugSegments: slug.split("/"),
  children,
});
const page = (slug: string, filePath: string): Node => node(slug, { slug, filePath });

// content/Notes/Ideas.md, content/Notes/Daily Notes/2026-11-26.md
const daily = (own: PathData | null) =>
  node("notes/daily-notes", own, [
    page("notes/daily-notes/2026-11-26", "Notes/Daily Notes/2026-11-26.md"),
  ]);
const notes = (own: PathData | null, dailyOwn: PathData | null) =>
  node("notes", own, [daily(dailyOwn), page("notes/ideas", "Notes/Ideas.md")]);
// the folder pages folder-page generates: Quartz builds their file path from the slug
const folderPage = (folder: string): PathData => ({
  slug: `${folder}/index`,
  filePath: `${folder}/index.md`,
});

describe("vaultPath", () => {
  it("is the source file's path inside the content folder", () => {
    expect(vaultPath({ slug: "notes/ideas", filePath: "Notes/Ideas.md" })).toBe("Notes/Ideas.md");
    expect(vaultPath({ slug: "notes/ideas", filePath: "content/Notes/Ideas.md" })).toBe(
      "Notes/Ideas.md",
    );
    expect(vaultPath({ slug: "x" })).toBeUndefined();
    expect(vaultPath(null)).toBeUndefined();
  });
});

describe("folderVaultPath", () => {
  it("is the folder's vault path without folder pages", () => {
    expect(folderVaultPath(daily(null))).toBe("Notes/Daily Notes");
    expect(folderVaultPath(notes(null, null))).toBe("Notes");
  });

  it("is the same with folder-page's generated folder pages", () => {
    expect(folderVaultPath(daily(folderPage("notes/daily-notes")))).toBe("Notes/Daily Notes");
    expect(folderVaultPath(notes(folderPage("notes"), folderPage("notes/daily-notes")))).toBe(
      "Notes",
    );
  });

  it("takes a real folder note's path", () => {
    const own = { slug: "notes/daily-notes/index", filePath: "Notes/Daily Notes/index.md" };
    expect(folderVaultPath(node("notes/daily-notes", own))).toBe("Notes/Daily Notes");
  });

  it("is undefined for a folder of generated pages only", () => {
    expect(folderVaultPath(node("empty", folderPage("empty")))).toBeUndefined();
  });
});
