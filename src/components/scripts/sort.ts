// Built-in sorting for the explorer, configurable from YAML (#6).

/** What to compare. */
export type SortKey = "folder" | "title" | "name" | "date" | "tag";
export type SortDirection = "asc" | "desc";

/**
 * One sort rule. Rules apply in sequence: each later rule only orders entries the earlier
 * ones consider equal.
 *
 * - `folder`: folders before files (`desc`: files before folders)
 * - `title`: the displayed name (the page title), natural order: "Note 2" before "Note 10"
 * - `name`: the file or folder name, unaffected by titles or `mapFn`
 * - `date`: the page's date; a folder's is its index page's, else its newest page's
 * - `tag`: the page's first tag
 *
 * Entries without a date or tag come after the others, in either direction.
 */
export interface SortRule {
  by: SortKey;
  direction?: SortDirection;
}

/** A rule, or just its key (ascending). */
export type SortOption = Array<SortRule | SortKey>;

export const defaultSort: SortRule[] = [{ by: "folder" }, { by: "title" }];

const sortKeys: SortKey[] = ["folder", "title", "name", "date", "tag"];

/** The parts of a trie node the rules look at (the explorer's client-side FileTrieNode). */
export interface SortableNode {
  isFolder: boolean;
  displayName: string;
  slugSegment: string;
  fileSegmentHint?: string | null;
  data: Record<string, unknown> | null;
  children: SortableNode[];
}

/** Read the `sort` option; unusable rules are dropped with a warning. */
export function resolveSort(option: unknown): SortRule[] {
  if (option === undefined || option === null) return defaultSort;
  const list = Array.isArray(option) ? option : [option];
  const rules: SortRule[] = [];
  for (const item of list) {
    const rule: Partial<SortRule> =
      typeof item === "string" ? { by: item as SortKey } : ((item as Partial<SortRule>) ?? {});
    const direction = rule.direction ?? "asc";
    if (!sortKeys.includes(rule.by as SortKey) || (direction !== "asc" && direction !== "desc")) {
      console.warn(
        `[Explorer] ignoring sort rule ${JSON.stringify(item)}: "by" is one of ${sortKeys.join(
          ", ",
        )}; "direction" is asc or desc`,
      );
      continue;
    }
    rules.push({ by: rule.by as SortKey, direction });
  }
  return rules.length > 0 ? rules : defaultSort;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function fileName(node: SortableNode): string {
  if (node.isFolder) return node.fileSegmentHint || node.slugSegment;
  const filePath = typeof node.data?.filePath === "string" ? node.data.filePath : "";
  const base = filePath.split("/").pop() ?? "";
  return base.replace(/\.[^.]+$/, "") || node.slugSegment;
}

function parseDate(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" || value instanceof Date) {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? undefined : time;
  }
  return undefined;
}

function firstTag(node: SortableNode): string | undefined {
  const tags = node.data?.tags;
  return Array.isArray(tags) && typeof tags[0] === "string" ? tags[0] : undefined;
}

/** Compare two present values; a missing one sorts last whatever the direction. */
function compareOptional<T>(
  a: T | undefined,
  b: T | undefined,
  direction: SortDirection,
  compare: (a: T, b: T) => number,
): number {
  if (a === undefined || b === undefined) {
    if (a === undefined && b === undefined) return 0;
    return a === undefined ? 1 : -1;
  }
  const result = compare(a, b);
  return direction === "desc" ? -result : result;
}

/** A comparator for the trie's `sort` from the `sort` option. */
export function compileSort(option: unknown): (a: SortableNode, b: SortableNode) => number {
  const rules = resolveSort(option);
  const folderDates = new WeakMap<SortableNode, number | undefined>();
  const dateOf = (node: SortableNode): number | undefined => {
    const own = parseDate(node.data?.date);
    if (own !== undefined || !node.isFolder) return own;
    if (folderDates.has(node)) return folderDates.get(node);
    let newest: number | undefined;
    for (const child of node.children) {
      const date = dateOf(child);
      if (date !== undefined && (newest === undefined || date > newest)) newest = date;
    }
    folderDates.set(node, newest);
    return newest;
  };

  return (a, b) => {
    for (const { by, direction = "asc" } of rules) {
      let result = 0;
      if (by === "folder") {
        result = a.isFolder === b.isFolder ? 0 : a.isFolder ? -1 : 1;
        if (direction === "desc") result = -result;
      } else if (by === "title") {
        result = collator.compare(a.displayName || "", b.displayName || "");
        if (direction === "desc") result = -result;
      } else if (by === "name") {
        result = collator.compare(fileName(a), fileName(b));
        if (direction === "desc") result = -result;
      } else if (by === "date") {
        result = compareOptional(dateOf(a), dateOf(b), direction, (x, y) => x - y);
      } else if (by === "tag") {
        result = compareOptional(firstTag(a), firstTag(b), direction, collator.compare);
      }
      if (result !== 0) return result;
    }
    return 0;
  };
}
