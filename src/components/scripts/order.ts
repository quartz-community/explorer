export type TrieStep = "filter" | "map" | "sort";

export const defaultOrder: TrieStep[] = ["filter", "map", "sort"];

interface ProcessableTrie {
  filter(fn: (node: never) => boolean): void;
  map(fn: (node: never) => unknown): void;
  sort(fn: (a: never, b: never) => number): void;
}

/**
 * The steps to apply, in the user's `order`. Unknown steps are dropped (with a warning) and a
 * missing or empty `order` falls back to filter → map → sort. A step listed twice runs twice.
 */
export function resolveOrder(order: unknown): TrieStep[] {
  if (!Array.isArray(order) || order.length === 0) return defaultOrder;
  const steps = order.filter((step): step is TrieStep => {
    const known = step === "filter" || step === "map" || step === "sort";
    if (!known) console.warn(`[Explorer] unknown step in "order": ${JSON.stringify(step)}`);
    return known;
  });
  return steps.length > 0 ? steps : defaultOrder;
}

/** Filter, map and sort the trie in the configured `order`. */
export function processTrie<T extends ProcessableTrie>(
  trie: T,
  fns: {
    sortFn?: ((a: never, b: never) => number) | null;
    filterFn?: ((node: never) => boolean) | null;
    mapFn?: ((node: never) => unknown) | null;
  },
  order: unknown = defaultOrder,
): T {
  for (const step of resolveOrder(order)) {
    if (step === "filter" && fns.filterFn) trie.filter(fns.filterFn);
    else if (step === "map" && fns.mapFn) trie.map(fns.mapFn);
    else if (step === "sort" && fns.sortFn) trie.sort(fns.sortFn);
  }
  return trie;
}
