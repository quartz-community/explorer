// Obsidian's `data-path` on explorer rows: the vault path of a file (with extension) or folder.
// Themes key folder icons and colours on it (`.nav-folder-title[data-path^="Notes"]`).

/** A contentIndex entry, as far as the vault path goes. */
export interface PathData {
  slug?: string;
  filePath?: string;
}

interface TrieNode {
  data: PathData | null | undefined;
  slugSegments: string[];
  children: TrieNode[];
}

/**
 * Whether the entry is a page Quartz generated (a virtual page, e.g. a folder page from
 * folder-page): Quartz gives such a page the file path `<slug>.md`, built from its slug, so it
 * says nothing about the names in the vault (`notes/daily-notes/index.md` for `Notes/Daily Notes`).
 */
function isGenerated(data: PathData): boolean {
  return !!data.slug && data.filePath === `${data.slug}.md`;
}

/** The vault path of a page (`Notes/Daily Notes/2026-11-26.md`), if it has a source file. */
export function vaultPath(data: PathData | null | undefined): string | undefined {
  const parts = (data?.filePath ?? "").split("/").filter(Boolean);
  if (!parts.length) return undefined;
  // filePath may be relative to the repository rather than the content folder.
  const depth = (data?.slug ?? "").split("/").filter(Boolean).length;
  return parts.slice(Math.max(0, parts.length - depth)).join("/");
}

/**
 * The vault path of a folder (`Notes/Daily Notes`), from the first source file found under it
 * (breadth-first, the folder's own index note first). Generated pages are skipped: a folder page
 * from folder-page would give the folder's slug instead (`notes/daily-notes`). A page whose file
 * name is already its slug gives the same path either way.
 */
export function folderVaultPath(node: TrieNode): string | undefined {
  const stack: TrieNode[] = [node];
  while (stack.length) {
    const n = stack.shift()!;
    const p = n.data && !isGenerated(n.data) ? vaultPath(n.data) : undefined;
    if (p) return p.split("/").slice(0, node.slugSegments.length).join("/");
    stack.push(...n.children);
  }
  return undefined;
}
