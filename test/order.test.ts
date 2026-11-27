import { describe, expect, it, vi } from "vitest";
import { processTrie, resolveOrder } from "../src/components/scripts/order";

function recorder() {
  const calls: string[] = [];
  const trie = {
    filter: () => calls.push("filter"),
    map: () => calls.push("map"),
    sort: () => calls.push("sort"),
  };
  const fns = { filterFn: () => true, mapFn: () => undefined, sortFn: () => 0 };
  return { calls, trie, fns };
}

describe("order", () => {
  it("defaults to filter, map, sort", () => {
    const { calls, trie, fns } = recorder();
    processTrie(trie, fns);
    expect(calls).toEqual(["filter", "map", "sort"]);
  });

  it("applies the steps in the configured order (#3)", () => {
    const { calls, trie, fns } = recorder();
    processTrie(trie, fns, ["filter", "sort", "map"]);
    expect(calls).toEqual(["filter", "sort", "map"]);
  });

  it("skips steps without a function and steps left out of the order", () => {
    const { calls, trie, fns } = recorder();
    processTrie(trie, { ...fns, mapFn: null }, ["sort", "map"]);
    expect(calls).toEqual(["sort"]);
  });

  it("falls back to the default for a missing, empty or unusable order", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveOrder(undefined)).toEqual(["filter", "map", "sort"]);
    expect(resolveOrder([])).toEqual(["filter", "map", "sort"]);
    expect(resolveOrder("sort")).toEqual(["filter", "map", "sort"]);
    expect(resolveOrder(["bogus"])).toEqual(["filter", "map", "sort"]);
    expect(resolveOrder(["sort", "bogus", "filter"])).toEqual(["sort", "filter"]);
    expect(warn.mock.calls.map((c) => c[0])).toEqual([
      '[Explorer] unknown step in "order": "bogus"',
      '[Explorer] unknown step in "order": "bogus"',
    ]);
    warn.mockRestore();
  });
});
