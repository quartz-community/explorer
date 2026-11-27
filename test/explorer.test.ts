import { describe, expect, it } from "vitest";
import Explorer from "../src/components/Explorer";
import inlineScript from "./__mocks__/scriptMock";

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
    const a = Explorer({});
    const b = Explorer({ rootFolder: "notes" });
    const [scriptA, fadeA] = a.afterDOMLoaded as string[];
    const [scriptB, fadeB] = b.afterDOMLoaded as string[];
    // Quartz includes identical resources once: the explorer script (the inline script as is,
    // options come from the markup) then runs once
    expect(scriptA).toBe(inlineScript);
    expect(scriptB).toBe(inlineScript);
    // each scroll-fade script watches the list its own instance renders
    for (const [component, fade] of [
      [a, fadeA],
      [b, fadeB],
    ] as const) {
      const list = find(
        render(component),
        (props) => props.class === "explorer-ul nav-files-container overflow",
      );
      expect(list?.id).toMatch(/^explorer-list-\d+$/);
      expect(fade).toContain(`document.getElementById("${list!.id}")`);
    }
    expect(fadeA).not.toBe(fadeB);
  });
});

/** Render a component to its vnode tree, calling function components. */
function render(component: ReturnType<typeof Explorer>): unknown {
  const expand = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(expand);
    if (!node || typeof node !== "object") return node;
    const vnode = node as { type: unknown; props: Record<string, unknown> };
    if (typeof vnode.type === "function")
      return expand((vnode.type as (p: unknown) => unknown)(vnode.props));
    return { ...vnode, props: { ...vnode.props, children: expand(vnode.props.children) } };
  };
  return expand(component({ cfg: { locale: "en-US" }, fileData: {} } as never));
}

/** The props of the first element matching `test`. */
function find(
  node: unknown,
  test: (props: Record<string, unknown>) => boolean,
): Record<string, unknown> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = find(child, test);
      if (found) return found;
    }
    return undefined;
  }
  if (!node || typeof node !== "object") return undefined;
  const props = (node as { props?: Record<string, unknown> }).props ?? {};
  return test(props) ? props : find(props.children, test);
}

describe("Explorer options in the markup (read by the explorer script)", () => {
  const root = (opts: Parameters<typeof Explorer>[0]) =>
    find(render(Explorer(opts)), (props) => typeof props["data-data-fns"] === "string")!;

  it("renders rootFolder and the sort rules", () => {
    const props = root({ rootFolder: "Notes", sort: ["date"] });
    expect(props["data-root-folder"]).toBe("Notes");
    expect(JSON.parse(props["data-data-fns"] as string)).toMatchObject({
      order: ["filter", "map", "sort"],
      sort: ["date"],
    });
  });

  it("leaves data-root-folder out without a rootFolder", () => {
    expect(root({})["data-root-folder"]).toBeUndefined();
    expect(root({ rootFolder: "" })["data-root-folder"]).toBeUndefined();
  });

  it("renders folderDefaultState and useSavedState", () => {
    expect(root({})).toMatchObject({ "data-collapsed": "collapsed", "data-savestate": true });
    expect(root({ folderDefaultState: "open", useSavedState: false })).toMatchObject({
      "data-collapsed": "open",
      "data-savestate": false,
    });
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

describe("Explorer markup for several explorers", () => {
  it("gives each explorer's list its own id, which its phone button controls", () => {
    const ids = [Explorer({}), Explorer({})].map((component) => {
      const tree = render(component);
      const content = find(tree, (props) => props.class === "explorer-content")!;
      const button = find(tree, (props) => props["data-mobile"] === true)!;
      expect(button["aria-controls"]).toBe(content.id);
      return content.id as string;
    });
    expect(ids[0]).toMatch(/^explorer-\d+$/);
    expect(ids[1]).not.toBe(ids[0]);
  });
});

describe("Explorer default data functions (run by the explorer script)", () => {
  const fns = () => {
    const props = find(render(Explorer({})), (p) => typeof p["data-data-fns"] === "string")!;
    return JSON.parse(props["data-data-fns"] as string) as Record<string, string>;
  };

  it("leaves out the tags folder and keeps the others", () => {
    // as the script builds it from the markup
    const filterFn = new Function("node", "return (" + fns().filterFn + ")(node)");
    expect(filterFn({ slugSegment: "tags" })).toBe(false);
    expect(filterFn({ slugSegment: "notes" })).toBe(true);
  });
});
