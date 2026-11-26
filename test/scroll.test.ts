import { describe, expect, it } from "vitest";
import { parseScrollPositions } from "../src/components/scripts/scroll";

describe("saved scroll positions", () => {
  it("reads one position per explorer", () => {
    expect(parseScrollPositions("[120,null,0]")).toEqual([120, null, 0]);
  });

  it("reads a plain number (older versions) as the first explorer's", () => {
    expect(parseScrollPositions("340")).toEqual([340]);
  });

  it("ignores missing or unreadable values", () => {
    expect(parseScrollPositions(null)).toEqual([]);
    expect(parseScrollPositions("not json")).toEqual([]);
    expect(parseScrollPositions('{"a":1}')).toEqual([]);
    expect(parseScrollPositions('[1,"x"]')).toEqual([1, null]);
  });
});
