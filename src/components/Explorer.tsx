import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";
import OverflowListFactory from "./OverflowList";
import { classNames } from "../util/lang";
import { i18n } from "../i18n";
import style from "./styles/explorer.scss";
// @ts-ignore
import script from "./scripts/explorer.inline.ts";

export interface FileTrieNode {
  slugSegments: string[];
  data: any | null;
  children: FileTrieNode[];
  isFolder: boolean;
  fileSegmentHint?: string;
}

export interface ExplorerOptions {
  title?: string;
  folderDefaultState: "collapsed" | "open";
  folderClickBehavior: "collapse" | "link";
  useSavedState: boolean;
  sortFn?: (a: FileTrieNode, b: FileTrieNode) => number;
  filterFn?: (node: FileTrieNode) => boolean;
  mapFn?: (node: FileTrieNode) => void;
  order?: Array<"filter" | "map" | "sort">;
}

type OrderEntries = "filter" | "map" | "sort";

const defaultOptions: ExplorerOptions = {
  folderDefaultState: "collapsed",
  folderClickBehavior: "link",
  useSavedState: true,
  mapFn: (node) => {
    return node;
  },
  sortFn: (a, b) => {
    const aName = a.slugSegments[a.slugSegments.length - 1] || "";
    const bName = b.slugSegments[b.slugSegments.length - 1] || "";
    if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
      return aName.localeCompare(bName, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    }
    if (!a.isFolder && b.isFolder) {
      return 1;
    } else {
      return -1;
    }
  },
  filterFn: (node) => node.slugSegments[0] !== "tags",
  order: ["filter", "map", "sort"],
};

let numExplorers = 0;

function concatenateResources(...resources: (string | undefined)[]): string {
  return resources.filter((r): r is string => !!r).join("\n");
}

export default ((userOpts?: Partial<ExplorerOptions>) => {
  const opts: ExplorerOptions = { ...defaultOptions, ...userOpts };
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory();

  const ExplorerComponent: QuartzComponent = ({ cfg, displayClass }: QuartzComponentProps) => {
    const id = `explorer-${numExplorers++}`;
    const locale = cfg?.locale ?? "en-US";
    const title = opts.title ?? i18n(locale).components.explorer.title;

    return (
      <div
        class={classNames(displayClass, "explorer")}
        data-behavior={opts.folderClickBehavior}
        data-collapsed={opts.folderDefaultState}
        data-savestate={opts.useSavedState}
        id={id}
      >
        <button
          class={classNames("mobile-explorer", opts.folderDefaultState === "open" ? "collapsed" : null)}
        >
          <h2>{title}</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="fold"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <button
          class={classNames("desktop-explorer", opts.folderDefaultState === "open" ? null : "collapsed")}
        >
          <h2>{title}</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="fold"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class={classNames("explorer-content", opts.folderDefaultState === "collapsed" ? "hide-until-loaded" : null)}>
          <OverflowList />
        </div>
      </div>
    );
  };

  ExplorerComponent.css = style;
  ExplorerComponent.afterDOMLoaded = concatenateResources(
    script,
    overflowListAfterDOMLoaded,
  );

  return ExplorerComponent;
}) satisfies QuartzComponentConstructor;
