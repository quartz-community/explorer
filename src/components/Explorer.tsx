import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";
import OverflowListFactory from "./OverflowList";
import { classNames } from "../util/lang";
import { i18n } from "../i18n";
import style from "./styles/explorer.scss";
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import script from "./scripts/explorer.inline.ts";
import { defaultSort, type SortOption } from "./scripts/sort";

export type { SortKey, SortDirection, SortRule, SortOption } from "./scripts/sort";

interface FileTrieNode {
  slugSegment?: string;
  slugSegments?: string[];
  displayName?: string;
  isFolder: boolean;
  data: Record<string, unknown> | null;
  children: FileTrieNode[];
}

export interface ExplorerOptions {
  title?: string;
  /**
   * Show only this folder's contents (a folder path, e.g. `Notes/Daily`, or its slug), e.g.
   * for a second explorer next to the full one.
   */
  rootFolder?: string;
  folderDefaultState: "collapsed" | "open";
  folderClickBehavior: "collapse" | "link";
  useSavedState: boolean;
  /**
   * How to sort each folder's entries: rules applied in sequence, each breaking the ties of the
   * ones before it (default: folders first, then by title). Settable in YAML; see the README.
   */
  sort?: SortOption;
  /** Custom sort function (TypeScript only); replaces `sort`. */
  sortFn?: (a: FileTrieNode, b: FileTrieNode) => number;
  filterFn?: (node: FileTrieNode) => boolean;
  mapFn?: (node: FileTrieNode) => FileTrieNode;
  order?: Array<"filter" | "map" | "sort">;
}

const defaultOptions: ExplorerOptions = {
  folderDefaultState: "collapsed",
  folderClickBehavior: "link",
  useSavedState: true,
  mapFn: (node: FileTrieNode) => {
    return node;
  },
  sort: defaultSort,
  filterFn: (node: FileTrieNode) => node.slugSegment !== "tags",
  order: ["filter", "map", "sort"],
};

let numExplorers = 0;

export default ((userOpts?: Partial<ExplorerOptions>) => {
  const opts: ExplorerOptions = { ...defaultOptions, ...userOpts };
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory();

  const ExplorerComponent: QuartzComponent = (props: QuartzComponentProps) => {
    const { cfg } = props;
    const displayClass = (props as { displayClass?: "mobile-only" | "desktop-only" }).displayClass;
    const id = `explorer-${numExplorers++}`;
    const locale = cfg?.locale ?? "en-US";

    const title = opts.title ?? i18n(locale).components.explorer.title;

    return (
      <div
        class={classNames(displayClass, "explorer")}
        data-behavior={opts.folderClickBehavior}
        data-collapsed={opts.folderDefaultState}
        data-savestate={opts.useSavedState}
        data-root-folder={opts.rootFolder || undefined}
        data-data-fns={JSON.stringify({
          order: opts.order,
          sort: opts.sort,
          sortFn: opts.sortFn?.toString(),
          filterFn: opts.filterFn?.toString(),
          mapFn: opts.mapFn?.toString(),
        })}
      >
        <button
          type="button"
          class="explorer-toggle mobile-explorer hide-until-loaded"
          data-mobile={true}
          aria-controls={id}
          aria-label={i18n(cfg?.locale ?? "en-US").components.explorer.title}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide-menu"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          class="title-button explorer-toggle desktop-explorer"
          data-mobile={false}
          aria-expanded={true}
        >
          <h2>{title}</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="5 8 14 8"
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
        <div id={id} class="explorer-content" role="group">
          {/* Obsidian's .nav-files-container is the scrolling list of tree items, not the panel
              with the header buttons: on the panel, themes padded the mobile toggle away. */}
          <OverflowList class="explorer-ul nav-files-container" />
        </div>
        {/* Obsidian's explorer classes (tree-item, nav-file, nav-folder, …) are kept alongside
            Quartz's so Obsidian themes apply. */}
        <template class="template-file">
          <li class="tree-item nav-file">
            <a href="#" class="nav-file-title tree-item-self tappable is-clickable">
              <span class="tree-item-inner nav-file-title-content"></span>
            </a>
          </li>
        </template>
        <template class="template-folder">
          <li class="tree-item nav-folder">
            {/* Obsidian's markup (1.x): the collapse icon is a div around the chevron, so
                theme rules for `.tree-item-icon` and `.collapse-icon svg` apply. Not the
                pre-1.0 `.nav-folder-collapse-indicator`: rules for it are dead in Obsidian
                (Catppuccin's would hide the chevron, the only way to open a folder). */}
            <div class="folder-container nav-folder-title tree-item-self is-clickable mod-collapsible">
              <div class="folder-icon tree-item-icon collapse-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="5 8 14 8"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="svg-icon right-triangle"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div>
                <button class="folder-button">
                  <span class="folder-title tree-item-inner nav-folder-title-content"></span>
                </button>
              </div>
            </div>
            <div class="folder-outer">
              {/* Obsidian starts every children container with an empty spacer; themes
                  count on it (`> :only-child` is an empty folder, `:nth-child()`). */}
              <ul class="content tree-item-children nav-folder-children">
                <li class="tree-item-spacer" aria-hidden="true"></li>
              </ul>
            </div>
          </li>
        </template>
      </div>
    );
  };

  ExplorerComponent.css = style;
  // Separate resources: Quartz includes identical scripts once, so with several explorers the
  // explorer's script (which renders every explorer on the page) runs once, while each list
  // keeps its own scroll-fade script.
  ExplorerComponent.afterDOMLoaded = [script, overflowListAfterDOMLoaded];
  return ExplorerComponent;
}) satisfies QuartzComponentConstructor;
