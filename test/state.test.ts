import { describe, expect, it } from "vitest";
import {
  folderStartsCollapsed,
  folderStateOptions,
  readFolderStates,
  writeFolderState,
} from "../src/components/scripts/state";

// what the explorer stores under `fileTree` after a reader opened `notes` and closed `notes/daily`
const stored = JSON.stringify([
  { path: "notes/index", collapsed: false },
  { path: "notes/daily/index", collapsed: true },
]);

describe("folderStateOptions (data-collapsed / data-savestate)", () => {
  it("reads the attributes Explorer.tsx renders", () => {
    expect(folderStateOptions({ collapsed: "open", savestate: "false" })).toEqual({
      folderDefaultState: "open",
      useSavedState: false,
    });
    expect(folderStateOptions({ collapsed: "collapsed", savestate: "true" })).toEqual({
      folderDefaultState: "collapsed",
      useSavedState: true,
    });
  });

  it("falls back to the defaults (collapsed, saved state used) without them", () => {
    expect(folderStateOptions({})).toEqual({
      folderDefaultState: "collapsed",
      useSavedState: true,
    });
  });
});

describe("folderStartsCollapsed", () => {
  it("folderDefaultState: open opens folders without a remembered state", () => {
    const states = readFolderStates(null, true);
    expect(folderStartsCollapsed(states, "notes/index", "open")).toBe(false);
    expect(folderStartsCollapsed(states, "notes/index", "collapsed")).toBe(true);
  });

  it("a remembered state wins over folderDefaultState", () => {
    const states = readFolderStates(stored, true);
    expect(folderStartsCollapsed(states, "notes/index", "collapsed")).toBe(false);
    expect(folderStartsCollapsed(states, "notes/daily/index", "open")).toBe(true);
    expect(folderStartsCollapsed(states, "other/index", "open")).toBe(false);
  });

  it("useSavedState: false ignores the remembered state", () => {
    const states = readFolderStates(stored, false);
    expect(states.size).toBe(0);
    expect(folderStartsCollapsed(states, "notes/index", "collapsed")).toBe(true);
    expect(folderStartsCollapsed(states, "notes/daily/index", "open")).toBe(false);
  });
});

describe("readFolderStates", () => {
  it("maps each stored folder to its collapsed state", () => {
    expect([...readFolderStates(stored, true)]).toEqual([
      ["notes/index", false],
      ["notes/daily/index", true],
    ]);
  });

  it("ignores a missing, unreadable or malformed entry", () => {
    expect(readFolderStates(null, true).size).toBe(0);
    expect(readFolderStates("{not json", true).size).toBe(0);
    expect(readFolderStates('{"path":"a/index"}', true).size).toBe(0);
    expect([
      ...readFolderStates('[{"path":"a/index"},{"path":"b/index","collapsed":true}]', true),
    ]).toEqual([["b/index", true]]);
  });
});

describe("writeFolderState", () => {
  it("updates a remembered folder and adds a new one", () => {
    expect(JSON.parse(writeFolderState(stored, true, "notes/index", true)!)).toEqual([
      { path: "notes/index", collapsed: true },
      { path: "notes/daily/index", collapsed: true },
    ]);
    expect(JSON.parse(writeFolderState(null, true, "new/index", false)!)).toEqual([
      { path: "new/index", collapsed: false },
    ]);
  });

  it("writes nothing with useSavedState: false", () => {
    expect(writeFolderState(stored, false, "notes/index", true)).toBeNull();
  });
});
