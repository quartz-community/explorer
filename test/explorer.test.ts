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
    expect(typeof component.afterDOMLoaded).toBe("string");
  });
});

describe("Explorer Manifest", () => {
  it("should export a valid plugin manifest", async () => {
    const { manifest } = await import("../src/manifest");

    expect(manifest).toBeDefined();
    expect(manifest.name).toBe("@quartz-community/explorer");
    expect(manifest.version).toBeDefined();
    expect(manifest.components).toBeDefined();
    expect(typeof manifest.components).toBe("object");
    const explorerComponent = manifest.components?.Explorer;
    expect(explorerComponent).toBeDefined();
    expect(explorerComponent?.name).toBe("Explorer");
  });
});
