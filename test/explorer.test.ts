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

describe("Explorer phone header button", () => {
  /** The aria-label of the button that opens the explorer on phones. */
  const mobileLabel = (opts: Parameters<typeof Explorer>[0]) => {
    const vnode = Explorer(opts)({ cfg: { locale: "en-US" }, fileData: {} } as never) as unknown;
    let label: string | undefined;
    const walk = (node: unknown) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== "object") return;
      const props = (node as { props?: Record<string, unknown> }).props ?? {};
      if (props["data-mobile"] === true) label = props["aria-label"] as string;
      walk(props.children);
    };
    walk(vnode);
    return label;
  };

  it("is named after the explorer's title, so several explorers can be told apart", () => {
    expect(mobileLabel({ title: "Café" })).toBe("Café");
    expect(mobileLabel({ title: "Daily" })).toBe("Daily");
  });

  it("is named Explorer without a title", () => {
    expect(mobileLabel({})).toBe("Explorer");
  });
});
