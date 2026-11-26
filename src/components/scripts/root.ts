import { slugifyFilePath, type FilePath } from "@quartz-community/utils/path";

interface TrieNode {
  isFolder: boolean;
  slugSegment: string;
  children: TrieNode[];
}

/**
 * The slug segments of a `rootFolder` option: a folder path as in the vault (`Notes/Daily
 * Notes`) or as a slug (`notes/daily-notes`); leading and trailing slashes are ignored.
 */
export function rootFolderSegments(rootFolder: unknown): string[] {
  if (typeof rootFolder !== "string") return [];
  const path = rootFolder.trim().replace(/^\/+|\/+$/g, "");
  if (!path) return [];
  return slugifyFilePath(`${path}/index.md` as FilePath)
    .replace(/(^|\/)index$/, "")
    .split("/")
    .filter(Boolean);
}

/**
 * The folder to show for `rootFolder` (the whole tree without one), or `null` when the site has
 * no such folder.
 */
export function findRootFolder<T extends TrieNode>(trie: T, rootFolder: unknown): T | null {
  let node: T = trie;
  for (const segment of rootFolderSegments(rootFolder)) {
    const folders = node.children.filter((child) => child.isFolder) as T[];
    const next =
      folders.find((child) => child.slugSegment === segment) ??
      folders.find((child) => child.slugSegment.toLowerCase() === segment.toLowerCase());
    if (!next) return null;
    node = next;
  }
  return node;
}
