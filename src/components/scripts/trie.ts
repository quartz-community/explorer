import { slugifyFilePath, type FilePath } from "@quartz-community/utils/path";

/** The parts of a content index entry the explorer's tree uses. */
export interface TrieEntry {
  slug: string;
  filePath?: string;
  title?: string;
  [key: string]: unknown;
}

/**
 * The explorer's tree of folders and pages, built in the browser from the content index (the
 * nodes `sortFn`, `filterFn` and `mapFn` receive).
 */
export class FileTrieNode {
  children: FileTrieNode[];
  slugSegments: string[];
  data: TrieEntry | null;
  isFolder: boolean;
  /** The folder's name as in the vault (`Daily Notes` for `daily-notes`). */
  fileSegmentHint: string | null | undefined;
  displayNameOverride: string | undefined;

  constructor(segments: string[], data?: TrieEntry) {
    this.children = [];
    this.slugSegments = segments;
    this.data = data || null;
    this.isFolder = false;
    this.fileSegmentHint = null;
    this.displayNameOverride = undefined;
  }

  get displayName(): string {
    if (this.displayNameOverride !== undefined) return this.displayNameOverride;
    const nonIndexTitle = this.data?.title === "index" ? undefined : this.data?.title;
    return nonIndexTitle || this.fileSegmentHint || this.slugSegment || "";
  }

  set displayName(name: string) {
    this.displayNameOverride = name;
  }

  get slug(): string {
    const path = this.slugSegments.join("/");
    return this.isFolder ? path + "/index" : path;
  }

  get slugSegment(): string {
    return this.slugSegments[this.slugSegments.length - 1] || "";
  }

  makeChild(path: string[], file: TrieEntry | undefined): FileTrieNode {
    const fullPath = [...this.slugSegments, path[0]!];
    const child = new FileTrieNode(fullPath, file);
    this.children.push(child);
    return child;
  }

  insert(path: string[], file: TrieEntry): void {
    if (path.length === 0) return;
    this.isFolder = true;
    const segment = path[0];
    if (path.length === 1) {
      if (segment === "index") {
        if (!this.data) this.data = file;
      } else {
        this.makeChild(path, file);
      }
    } else {
      let child = this.children.find((c) => c.slugSegment === segment);
      if (!child) {
        child = this.makeChild(path, undefined);
      }
      const fileParts = (file.filePath || file.slug || "").split("/");
      child.fileSegmentHint = fileParts[fileParts.length - path.length];
      child.insert(path.slice(1), file);
    }
  }

  add(file: TrieEntry): void {
    // Place a page by its file path, link to it by its slug: a note with a permalink (published
    // somewhere else) stays in its folder, as in Obsidian Publish.
    const position = file.filePath ? slugifyFilePath(file.filePath as FilePath) : file.slug;
    this.insert(position.split("/"), file);
  }

  sort(sortFn: (a: FileTrieNode, b: FileTrieNode) => number): void {
    this.children.sort(sortFn);
    this.children.forEach((c) => c.sort(sortFn));
  }

  filter(filterFn: (node: FileTrieNode) => boolean): void {
    this.children = this.children.filter(filterFn);
    this.children.forEach((c) => c.filter(filterFn));
  }

  map(mapFn: (node: FileTrieNode) => unknown): void {
    mapFn(this);
    this.children.forEach((c) => c.map(mapFn));
  }

  static fromEntries(entries: Array<[string, TrieEntry]>): FileTrieNode {
    const trie = new FileTrieNode([], undefined);
    entries.forEach(([, entry]) => trie.add(entry));
    return trie;
  }
}
