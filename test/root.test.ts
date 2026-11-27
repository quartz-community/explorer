import { describe, expect, it } from "vitest";
import { findRootFolder, rootFolderSegments } from "../src/components/scripts/root";

interface Node {
  isFolder: boolean;
  slugSegment: string;
  children: Node[];
}
const folder = (slugSegment: string, children: Node[] = []): Node => ({
  isFolder: true,
  slugSegment,
  children,
});
const file = (slugSegment: string): Node => ({ isFolder: false, slugSegment, children: [] });

const daily = folder("daily-notes", [file("2026-11-26")]);
const notes = folder("notes", [daily, file("todo")]);
const trie = folder("", [notes, file("notes-file"), folder("Projects", [file("x")])]);

describe("rootFolder", () => {
  it("reads vault paths and slugs alike", () => {
    expect(rootFolderSegments("Notes/Daily Notes")).toEqual(["notes", "daily-notes"]);
    expect(rootFolderSegments("/notes/daily-notes/")).toEqual(["notes", "daily-notes"]);
    expect(rootFolderSegments("")).toEqual([]);
    expect(rootFolderSegments(undefined)).toEqual([]);
  });

  it("keeps folders named index, or starting with it", () => {
    expect(rootFolderSegments("Index Notes")).toEqual(["index-notes"]);
    expect(rootFolderSegments("Notes/Index")).toEqual(["notes", "index"]);
    expect(rootFolderSegments("//Notes//")).toEqual(["notes"]);
  });

  it("prefers the folder whose slug matches exactly over one differing in case", () => {
    const lower = folder("projects");
    const upper = folder("Projects");
    expect(findRootFolder(folder("", [upper, lower]), "projects")).toBe(lower);
  });

  it("finds the folder to show", () => {
    expect(findRootFolder(trie, "Notes")).toBe(notes);
    expect(findRootFolder(trie, "Notes/Daily Notes")).toBe(daily);
    expect(findRootFolder(trie, "projects")?.slugSegment).toBe("Projects");
  });

  it("shows the whole tree without one, nothing for a missing folder", () => {
    expect(findRootFolder(trie, undefined)).toBe(trie);
    expect(findRootFolder(trie, "/")).toBe(trie);
    expect(findRootFolder(trie, "missing")).toBeNull();
    // a file is not a folder
    expect(findRootFolder(trie, "notes/todo")).toBeNull();
  });
});
