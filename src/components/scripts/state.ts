// Folder open/closed state: the `folderDefaultState` and `useSavedState` options, and the
// `fileTree` entry in localStorage that remembers folders the reader opened or closed.

export const STORAGE_KEY = "fileTree";

/** A remembered folder, as stored under `fileTree` (`path` is the folder's `…/index` slug). */
export interface FolderState {
  path: string;
  collapsed: boolean;
}

export interface FolderStateOptions {
  folderDefaultState: "collapsed" | "open";
  useSavedState: boolean;
}

/**
 * The options from the explorer's `data-collapsed` and `data-savestate` attributes. Without
 * them (markup from an older component) folders start collapsed and the saved state is used,
 * as the defaults say.
 */
export function folderStateOptions(dataset: {
  collapsed?: string;
  savestate?: string;
}): FolderStateOptions {
  return {
    folderDefaultState: dataset.collapsed === "open" ? "open" : "collapsed",
    useSavedState: dataset.savestate !== "false",
  };
}

/**
 * The remembered state of each folder (folder slug → collapsed) from the `fileTree` entry:
 * nothing when `useSavedState` is off, or the entry is missing or unreadable.
 */
export function readFolderStates(
  raw: string | null | undefined,
  useSavedState: boolean,
): Map<string, boolean> {
  const states = new Map<string, boolean>();
  if (!useSavedState || !raw) return states;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return states;
  }
  if (!Array.isArray(parsed)) return states;
  for (const item of parsed) {
    if (item && typeof item.path === "string" && typeof item.collapsed === "boolean") {
      states.set(item.path, item.collapsed);
    }
  }
  return states;
}

/**
 * Whether a folder starts collapsed: as remembered, else as `folderDefaultState` says. A folder
 * holding the current page is opened anyway (by the caller).
 */
export function folderStartsCollapsed(
  states: Map<string, boolean>,
  folderSlug: string,
  folderDefaultState: FolderStateOptions["folderDefaultState"],
): boolean {
  return states.get(folderSlug) ?? folderDefaultState === "collapsed";
}

/**
 * The new `fileTree` entry after the reader opened or closed a folder, or `null` when nothing
 * is to be written (`useSavedState` off).
 */
export function writeFolderState(
  raw: string | null | undefined,
  useSavedState: boolean,
  folderSlug: string,
  collapsed: boolean,
): string | null {
  if (!useSavedState) return null;
  const states = readFolderStates(raw, true);
  states.set(folderSlug, collapsed);
  const list: FolderState[] = Array.from(states, ([path, isCollapsed]) => ({
    path,
    collapsed: isCollapsed,
  }));
  return JSON.stringify(list);
}
