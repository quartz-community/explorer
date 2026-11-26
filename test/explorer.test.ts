import { describe, expect, it } from "vitest";
import Explorer from "../src/components/Explorer";

describe("Explorer Component", () => {
  it("should create an Explorer component with default options", () => {
    const component = Explorer({});

    expect(component).toBeDefined();
    expect(typeof component).toBe("function");
  });

  it("should create an Explorer component with custom options", () => {
    const component = Explorer({
      title: "Custom Explorer",
      folderDefaultState: "open",
      folderClickBehavior: "collapse",
      useSavedState: false,
    });

    expect(component).toBeDefined();
    expect(typeof component).toBe("function");
  });

  it("should export component with css property", () => {
    const component = Explorer({});

    expect(component.css).toBeDefined();
    expect(typeof component.css).toBe("string");
  });

  it("should export component with afterDOMLoaded script", () => {
    const component = Explorer({});

    expect(component.afterDOMLoaded).toBeDefined();
    expect(Array.isArray(component.afterDOMLoaded)).toBe(true);
  });

  it("shares the explorer script between instances, not the scroll-fade script (#12)", () => {
    const [scriptA, fadeA] = Explorer({}).afterDOMLoaded as string[];
    const [scriptB, fadeB] = Explorer({ rootFolder: "notes" }).afterDOMLoaded as string[];
    // Quartz includes identical resources once: the explorer script then runs once
    expect(scriptA).toBe(scriptB);
    expect(fadeA).not.toBe(fadeB);
  });
});
