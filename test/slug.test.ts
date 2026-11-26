import { describe, expect, it } from "vitest";
import { eventSlug } from "../src/components/scripts/slug";

describe("eventSlug", () => {
  it("is the slug a nav or render event names", () => {
    expect(eventSlug("notes/a", "index")).toBe("notes/a");
    expect(eventSlug("/notes/a", undefined)).toBe("notes/a");
  });

  it("is the current page's for an event without detail (encrypted-pages' render)", () => {
    expect(eventSlug(undefined, "notes/secret")).toBe("notes/secret");
    expect(eventSlug("", "notes/secret")).toBe("notes/secret");
    expect(eventSlug(undefined, undefined)).toBe("");
  });
});
