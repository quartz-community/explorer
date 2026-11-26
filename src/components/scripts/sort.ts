// Built-in sorting for the explorer, configurable from YAML (#6).

/** What to compare. */
export type SortKey = "folder" | "title" | "name" | "date" | "tag";
/** `ASC` / `DESC` (as in Bases views) are accepted too. */
export type SortDirection = "asc" | "desc" | "ASC" | "DESC";

/**
 * One sort rule. Rules apply in sequence: each later rule only orders entries the earlier
 * ones consider equal.
 *
 * - `folder`: folders before files (`desc`: files before folders)
 * - `title`: the displayed name (the page title), natural order: "Note 2" before "Note 10"
 * - `name`: the file or folder name, unaffected by titles or `mapFn`
 * - `date`: the page's date. A folder's is its index page's when that date comes from the
 *   index page's frontmatter (`dateFromFrontmatter` in the content index), else its newest
 *   page's.
 * - `tag`: the page's tags, compared in the order they are written: first tags, then (on a
 *   tie) second tags, and so on; a list that is a prefix of the other comes first. With
 *   `firstTagOnly`, only the first tags are compared.
 *
 * Entries without a date or tags come after the others, in either direction. `direction` is
 * also accepted in capitals (`ASC`/`DESC`) and `by` as `property`, as in Bases views.
 */
export interface SortRule {
  by: SortKey;
  direction?: SortDirection;
  /** `tag` only: compare just the first tag. */
  firstTagOnly?: boolean;
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
    const raw: Record<string, unknown> =
      typeof item === "string"
        ? { by: item }
        : item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};
    const by = raw.by ?? raw.property;
    const direction =
      typeof raw.direction === "string" ? raw.direction.toLowerCase() : (raw.direction ?? "asc");
    if (!sortKeys.includes(by as SortKey) || (direction !== "asc" && direction !== "desc")) {
      console.warn(
        `[Explorer] ignoring sort rule ${JSON.stringify(item)}: "by" is one of ${sortKeys.join(
          ", ",
        )}; "direction" is asc or desc`,
      );
      continue;
    }
    const rule: SortRule = { by: by as SortKey, direction };
    if (by === "tag" && raw.firstTagOnly === true) rule.firstTagOnly = true;
    rules.push(rule);
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

function tagsOf(node: SortableNode): string[] | undefined {
  const tags = node.data?.tags;
  if (!Array.isArray(tags)) return undefined;
  const strings = tags.filter((t): t is string => typeof t === "string");
  return strings.length > 0 ? strings : undefined;
}

/** Tag lists compared element by element; a prefix comes first. */
function compareTags(a: string[], b: string[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const result = collator.compare(a[i]!, b[i]!);
    if (result !== 0) return result;
  }
  return a.length - b.length;
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
    if (!node.isFolder) return parseDate(node.data?.date);
    // a folder: its index page's date if set in its frontmatter, else its newest page's
    if (node.data?.dateFromFrontmatter === true) {
      const own = parseDate(node.data.date);
      if (own !== undefined) return own;
    }
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
    for (const { by, direction = "asc", firstTagOnly } of rules) {
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
        const tags = (node: SortableNode) => {
          const list = tagsOf(node);
          return list && firstTagOnly ? list.slice(0, 1) : list;
        };
        result = compareOptional(tags(a), tags(b), direction, compareTags);
      }
      if (result !== 0) return result;
    }
    return 0;
  };
}
