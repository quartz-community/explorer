import type { VNode, JSX } from "preact";
import OverflowListFactory from "./OverflowList";

// Local type definitions to match Quartz interfaces
// These mirror the types from @jackyzha0/quartz for build-time checking

type GlobalConfiguration = {
  pageTitle: string;
  pageTitleSuffix?: string;
  enableSPA: boolean;
  enablePopovers: boolean;
  analytics: any;
  ignorePatterns: string[];
  defaultDateType: string;
  baseUrl?: string;
  theme: any;
  locale: string;
  [key: string]: any;
};

type QuartzConfig = {
  configuration: GlobalConfiguration;
  plugins: any;
  externalPlugins?: string[];
};

type QuartzPluginData = {
  slug: string;
  title: string;
  filePath: string;
  [key: string]: any;
};

type BuildCtx = {
  cfg: QuartzConfig;
  allFiles: QuartzPluginData[];
  [key: string]: any;
};

type StaticResources = {
  css: Array<{ content: string }>;
  js: Array<{ src?: string; content?: string; loadTime: string; moduleType?: string }>;
};

type StringResource = string | undefined;

export type QuartzComponentProps = {
  ctx: BuildCtx;
  externalResources: StaticResources;
  fileData: QuartzPluginData;
  cfg: GlobalConfiguration;
  children: any[];
  tree: any;
  allFiles: QuartzPluginData[];
  displayClass?: "mobile-only" | "desktop-only";
} & JSX.IntrinsicAttributes & {
    [key: string]: any;
  };

export type QuartzComponent = ((props: QuartzComponentProps) => VNode) & {
  css?: StringResource;
  beforeDOMLoaded?: StringResource;
  afterDOMLoaded?: StringResource;
};

export type QuartzComponentConstructor<Options extends object | undefined = undefined> = (
  opts: Options,
) => QuartzComponent;

// Simplified FileTrieNode interface for the external component
interface FileTrieNode {
  isFolder: boolean;
  children: FileTrieNode[];
  data: QuartzPluginData | null;
  slugSegment: string;
  displayName: string;
  slug: string;
  filter(filterFn: (node: FileTrieNode) => boolean): void;
  map(mapFn: (node: FileTrieNode) => void): void;
  sort(sortFn: (a: FileTrieNode, b: FileTrieNode) => number): void;
}

export function concatenateResources(...resources: (string | undefined)[]): string {
  return resources.filter((r): r is string => !!r).join("\n");
}

export function classNames(
  displayClass?: "mobile-only" | "desktop-only",
  ...classes: string[]
): string {
  if (displayClass) {
    classes.push(displayClass);
  }
  return classes.join(" ");
}

type OrderEntries = "sort" | "filter" | "map";

export interface ExplorerOptions {
  title?: string;
  folderDefaultState: "collapsed" | "open";
  folderClickBehavior: "collapse" | "link";
  useSavedState: boolean;
  sortFn: (a: FileTrieNode, b: FileTrieNode) => number;
  filterFn: (node: FileTrieNode) => boolean;
  mapFn: (node: FileTrieNode) => void;
  order: OrderEntries[];
}

const defaultOptions: ExplorerOptions = {
  folderDefaultState: "collapsed",
  folderClickBehavior: "link",
  useSavedState: true,
  mapFn: (node) => {
    return node;
  },
  sortFn: (a, b) => {
    if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
      return a.displayName.localeCompare(b.displayName, undefined, {
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
  filterFn: (node) => node.slugSegment !== "tags",
  order: ["filter", "map", "sort"],
};

let numExplorers = 0;

const explorerCSS = `
@media all and (max-width: 800px) {
  .page > #quartz-body > :not(.sidebar.left:has(.explorer)) {
    transition: transform 300ms ease-in-out;
  }
  .page > #quartz-body.lock-scroll > :not(.sidebar.left:has(.explorer)) {
    transform: translateX(100dvw);
    transition: transform 300ms ease-in-out;
  }
  .page > #quartz-body .sidebar.left:has(.explorer) {
    box-sizing: border-box;
    position: sticky;
    background-color: var(--light);
    padding: 1rem 0 1rem 0;
    margin: 0;
  }
  .page > #quartz-body .hide-until-loaded ~ .explorer-content {
    display: none;
  }
}

.explorer {
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  min-height: 1.2rem;
  flex: 0 1 auto;
}
.explorer.collapsed {
  flex: 0 1 1.2rem;
}
.explorer.collapsed .fold {
  transform: rotateZ(-90deg);
}
.explorer .fold {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
  opacity: 0.8;
}
@media all and (max-width: 800px) {
  .explorer {
    order: -1;
    height: initial;
    overflow: hidden;
    flex-shrink: 0;
    align-self: flex-start;
    margin-top: auto;
    margin-bottom: auto;
  }
}
.explorer button.mobile-explorer {
  display: none;
}
.explorer button.desktop-explorer {
  display: flex;
}
@media all and (max-width: 800px) {
  .explorer button.mobile-explorer {
    display: flex;
  }
  .explorer button.desktop-explorer {
    display: none;
  }
}
.explorer svg {
  pointer-events: all;
  transition: transform 0.35s ease;
}
.explorer svg > polyline {
  pointer-events: none;
}

button.mobile-explorer,
button.desktop-explorer {
  background-color: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  padding: 0;
  color: var(--dark);
  display: flex;
  align-items: center;
}
button.mobile-explorer h2,
button.desktop-explorer h2 {
  font-size: 1rem;
  display: inline-block;
  margin: 0;
}

.explorer-content {
  list-style: none;
  overflow: hidden;
  overflow-y: auto;
  margin-top: 0.5rem;
}
.explorer-content ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.explorer-content ul.explorer-ul {
  overscroll-behavior: contain;
}
.explorer-content ul li > a {
  color: var(--dark);
  opacity: 0.75;
  pointer-events: all;
}
.explorer-content ul li > a.active {
  opacity: 1;
  color: var(--tertiary);
}
.explorer-content .folder-outer {
  visibility: collapse;
  display: grid;
  grid-template-rows: 0fr;
  transition-property: grid-template-rows, visibility;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
}
.explorer-content .folder-outer.open {
  visibility: visible;
  grid-template-rows: 1fr;
}
.explorer-content .folder-outer > ul {
  overflow: hidden;
  margin-left: 6px;
  padding-left: 0.8rem;
  border-left: 1px solid var(--lightgray);
}

.folder-container {
  flex-direction: row;
  display: flex;
  align-items: center;
  user-select: none;
}
.folder-container div > a {
  color: var(--secondary);
  font-family: var(--headerFont);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.5rem;
  display: inline-block;
}
.folder-container div > a:hover {
  color: var(--tertiary);
}
.folder-container div > button {
  color: var(--dark);
  background-color: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  padding-left: 0;
  padding-right: 0;
  display: flex;
  align-items: center;
  font-family: var(--headerFont);
}
.folder-container div > button span {
  font-size: 0.95rem;
  display: inline-block;
  color: var(--secondary);
  font-weight: 600;
  margin: 0;
  line-height: 1.5rem;
  pointer-events: none;
}

.folder-icon {
  margin-right: 5px;
  color: var(--secondary);
  cursor: pointer;
  transition: transform 0.3s ease;
  backface-visibility: visible;
  flex-shrink: 0;
}
li:has(> .folder-outer:not(.open)) > .folder-container > svg {
  transform: rotate(-90deg);
}
.folder-icon:hover {
  color: var(--tertiary);
}

@media all and (max-width: 800px) {
  .explorer.collapsed {
    flex: 0 0 34px;
  }
  .explorer.collapsed > .explorer-content {
    transform: translateX(-100vw);
    visibility: hidden;
  }
  .explorer:not(.collapsed) {
    flex: 0 0 34px;
  }
  .explorer:not(.collapsed) > .explorer-content {
    transform: translateX(0);
    visibility: visible;
  }
  .explorer .explorer-content {
    box-sizing: border-box;
    z-index: 100;
    position: absolute;
    top: 0;
    left: 0;
    margin-top: 0;
    background-color: var(--light);
    max-width: 100vw;
    width: 100vw;
    transform: translateX(-100vw);
    transition: transform 200ms ease, visibility 200ms ease;
    overflow: hidden;
    padding: 4rem 0 2rem 0;
    height: 100dvh;
    max-height: 100dvh;
    visibility: hidden;
  }
  .explorer .mobile-explorer {
    margin: 0;
    padding: 5px;
    z-index: 101;
  }
  .explorer .mobile-explorer.hide-until-loaded {
    display: none;
  }
  .explorer .mobile-explorer .lucide-menu {
    stroke: var(--darkgray);
  }
}

@media all and (max-width: 800px) {
  .mobile-no-scroll .explorer-content > .explorer-ul {
    overscroll-behavior: contain;
  }
}
`;

const explorerScript = `
// Simple trie node implementation for client-side
class FileTrieNode {
  constructor(segments, data) {
    this.children = [];
    this.slugSegments = segments;
    this.data = data || null;
    this.isFolder = false;
    this.fileSegmentHint = null;
  }

  get displayName() {
    const nonIndexTitle = this.data?.title === "index" ? undefined : this.data?.title;
    return nonIndexTitle || this.fileSegmentHint || this.slugSegment || "";
  }

  get slug() {
    const path = this.slugSegments.join("/");
    return this.isFolder ? path + "/index" : path;
  }

  get slugSegment() {
    return this.slugSegments[this.slugSegments.length - 1] || "";
  }

  makeChild(path, file) {
    const fullPath = [...this.slugSegments, path[0]];
    const child = new FileTrieNode(fullPath, file);
    this.children.push(child);
    return child;
  }

  insert(path, file) {
    if (path.length === 0) return;
    this.isFolder = true;
    const segment = path[0];
    if (path.length === 1) {
      if (segment === "index") {
        if (!this.data) this.data = file;
      } else {
        this.makeChild(path, file);
      }
    } else {
      let child = this.children.find(c => c.slugSegment === segment);
      if (!child) {
        child = this.makeChild(path, undefined);
      }
      const fileParts = file.filePath.split("/");
      child.fileSegmentHint = fileParts[fileParts.length - path.length];
      child.insert(path.slice(1), file);
    }
  }

  add(file) {
    this.insert(file.slug.split("/"), file);
  }

  sort(sortFn) {
    this.children.sort(sortFn);
    this.children.forEach(c => c.sort(sortFn));
  }

  filter(filterFn) {
    this.children = this.children.filter(filterFn);
    this.children.forEach(c => c.filter(filterFn));
  }

  map(mapFn) {
    mapFn(this);
    this.children.forEach(c => c.map(mapFn));
  }

  static fromEntries(entries) {
    const trie = new FileTrieNode([], null);
    entries.forEach(([, entry]) => trie.add(entry));
    return trie;
  }
}

// Helper to join segments safely
function joinSegments(...segments) {
  return segments.filter(Boolean).join("/");
}

// Process and sort nodes
const defaultSortFn = (a, b) => {
  if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
    return a.displayName.localeCompare(b.displayName, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }
  if (!a.isFolder && b.isFolder) return 1;
  return -1;
};

const defaultFilterFn = (node) => node.slugSegment !== "tags";

function processTrie(trie, sortFn, filterFn, mapFn) {
  if (filterFn) trie.filter(filterFn);
  if (mapFn) trie.map(mapFn);
  if (sortFn) trie.sort(sortFn);
  return trie;
}

// Build trie from content index data
async function buildFileTrie(dataFns) {
  try {
    // Always fetch directly from the content index using absolute path from root
    console.log("[Explorer] Fetching content index...");
    const response = await fetch("/static/contentIndex.json");
    const data = await response.json();
    console.log("[Explorer] Fetched data keys:", Object.keys(data).slice(0, 5));
    
    if (!data) {
      console.error("[Explorer] No data received");
      return null;
    }
    
    // Handle both formats: { "slug": {...} } or { "content": { "slug": {...} } }
    const contentData = data.content || data;
    const entries = Object.entries(contentData);
    
    console.log("[Explorer] Entry count:", entries.length);
    
    if (entries.length === 0) {
      console.warn("[Explorer] No content entries found");
      return null;
    }
    
    const trie = FileTrieNode.fromEntries(entries);
    console.log("[Explorer] Trie root children:", trie.children.length);
    
    // Parse data functions from string if provided
    let sortFn = defaultSortFn;
    let filterFn = defaultFilterFn;
    let mapFn = null;
    
    if (dataFns) {
      try {
        const parsed = JSON.parse(dataFns);
        if (parsed.sortFn) {
          sortFn = new Function("a", "b", "return (" + parsed.sortFn + ")(a, b)");
        }
        if (parsed.filterFn) {
          filterFn = new Function("node", "return (" + parsed.filterFn + ")(node)");
        }
        if (parsed.mapFn) {
          mapFn = new Function("node", "(" + parsed.mapFn + ")(node)");
        }
      } catch (e) {
        console.error("Error parsing data functions:", e);
      }
    }
    
    return processTrie(trie, sortFn, filterFn, mapFn);
  } catch (e) {
    console.error("Error building file trie:", e);
    return null;
  }
}

// Render the file tree
function renderTree(node, container, currentSlug, folderBehavior, savedState, pathPrefix = "") {
  const folderTemplate = document.getElementById("template-folder");
  const fileTemplate = document.getElementById("template-file");
  
  if (!folderTemplate || !fileTemplate) return;
  
  const currentPath = pathPrefix ? pathPrefix + "/" + node.slugSegment : node.slugSegment;
  
  if (node.isFolder) {
    const clone = folderTemplate.content.cloneNode(true);
    const folderContainer = clone.querySelector(".folder-container");
    const folderButton = clone.querySelector(".folder-button");
    const folderTitle = clone.querySelector(".folder-title");
    const folderOuter = clone.querySelector(".folder-outer");
    const contentUl = clone.querySelector(".content");
    
    if (folderTitle) folderTitle.textContent = node.displayName || node.slugSegment;
    if (folderContainer) folderContainer.dataset.folderpath = node.slug;
    
    // Check saved state for collapsed status
    const isCollapsed = savedState[node.slug] !== undefined 
      ? savedState[node.slug] 
      : true; // Default collapsed
    
    if (!isCollapsed && folderOuter) {
      folderOuter.classList.add("open");
    }
    
    // Render children
    if (node.children && node.children.length > 0 && contentUl) {
      for (const child of node.children) {
        renderTree(child, contentUl, currentSlug, folderBehavior, savedState, currentPath);
      }
    }
    
    container.appendChild(clone);
  } else if (node.data) {
    const clone = fileTemplate.content.cloneNode(true);
    const link = clone.querySelector("a");
    if (link) {
      // Use absolute path for consistent navigation from any page
      link.href = "/" + node.data.slug;
      link.textContent = node.displayName || node.slugSegment;
      if (node.data.slug === currentSlug) {
        link.classList.add("active");
      }
    }
    container.appendChild(clone);
  }
}

document.addEventListener("nav", async (e) => {
  try {
    console.log("[Explorer] Nav event received");
    const currentSlug = e.detail?.url || "";
    const allExplorers = document.querySelectorAll("div.explorer");
    console.log("[Explorer] Found", allExplorers.length, "explorers");
    
    // Load saved folder states
    let savedState = {};
    try {
      const saved = JSON.parse(localStorage.getItem("fileTree") || "[]");
      saved.forEach(item => {
        savedState[item.path] = item.collapsed;
      });
    } catch (e) {
      console.error("[Explorer] Error loading saved state:", e);
    }
    
  for (const explorer of allExplorers) {
    const explorerUl = explorer.querySelector(".explorer-ul");
    if (!explorerUl) {
      console.warn("[Explorer] No explorer-ul found");
      continue;
    }
    
    // Clear existing content
    explorerUl.innerHTML = '<li class="overflow-end"></li>';
      
      // Get data functions configuration
      const dataFns = explorer.dataset.dataFns;
      const folderBehavior = explorer.dataset.behavior || "collapse";
      
      // Build and render the tree
      console.log("[Explorer] Starting tree build...");
      const trie = await buildFileTrie(dataFns);
      console.log("[Explorer] Trie result:", trie ? "success" : "null");
      if (trie && trie.children && trie.children.length > 0) {
        console.log("[Explorer] Rendering", trie.children.length, "children");
        for (const child of trie.children) {
          renderTree(child, explorerUl, currentSlug, folderBehavior, savedState, "");
        }
        console.log("[Explorer] Render complete, final list length:", explorerUl.children.length);
      } else {
        console.warn("[Explorer] No trie or empty children");
      }
    
    const cleanupHandlers = [];
    
    const explorerButtons = explorer.getElementsByClassName("explorer-toggle");
    for (const button of explorerButtons) {
      const clickHandler = function(evt) {
        const nearestExplorer = this.closest(".explorer");
        if (!nearestExplorer) return;
        const explorerCollapsed = nearestExplorer.classList.toggle("collapsed");
        nearestExplorer.setAttribute("aria-expanded", explorerCollapsed ? "false" : "true");
        
        if (!explorerCollapsed) {
          document.documentElement.classList.add("mobile-no-scroll");
        } else {
          document.documentElement.classList.remove("mobile-no-scroll");
        }
      };
      button.addEventListener("click", clickHandler);
      cleanupHandlers.push(() => button.removeEventListener("click", clickHandler));
    }
    
    const folderIcons = explorer.getElementsByClassName("folder-icon");
    for (const icon of folderIcons) {
      const iconClickHandler = function(evt) {
        evt.stopPropagation();
        const folderContainer = this.parentElement;
        if (!folderContainer) return;
        const childFolderContainer = folderContainer.nextElementSibling;
        if (!childFolderContainer) return;
        
        childFolderContainer.classList.toggle("open");
        const isCollapsed = !childFolderContainer.classList.contains("open");
        
        const folderPath = folderContainer.dataset.folderpath;
        const savedState = JSON.parse(localStorage.getItem("fileTree") || "[]");
        const existingIndex = savedState.findIndex(item => item.path === folderPath);
        
        if (existingIndex >= 0) {
          savedState[existingIndex].collapsed = isCollapsed;
        } else {
          savedState.push({ path: folderPath, collapsed: isCollapsed });
        }
        localStorage.setItem("fileTree", JSON.stringify(savedState));
      };
      icon.addEventListener("click", iconClickHandler);
      cleanupHandlers.push(() => icon.removeEventListener("click", iconClickHandler));
    }
    
    if (typeof window !== "undefined" && window.addCleanup) {
      window.addCleanup(() => cleanupHandlers.forEach(fn => fn()));
    }
  }
  
  for (const explorer of document.getElementsByClassName("explorer")) {
    const mobileExplorer = explorer.querySelector(".mobile-explorer");
    if (!mobileExplorer) continue;
    
    mobileExplorer.classList.remove("hide-until-loaded");
    
    if (mobileExplorer.checkVisibility && mobileExplorer.checkVisibility()) {
      explorer.classList.add("collapsed");
      explorer.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("mobile-no-scroll");
    }
  }
  
  // Restore scroll position
  const savedScrollTop = sessionStorage.getItem("explorerScrollTop");
  if (savedScrollTop) {
    const explorerUl = document.querySelector(".explorer-ul");
    if (explorerUl) {
      explorerUl.scrollTop = parseInt(savedScrollTop, 10);
    }
  }
  } catch (err) {
    console.error("[Explorer] Fatal error in nav handler:", err);
  }
});

document.addEventListener("prenav", () => {
  const explorer = document.querySelector(".explorer-ul");
  if (!explorer) return;
  sessionStorage.setItem("explorerScrollTop", explorer.scrollTop.toString());
});
`;

const Explorer: QuartzComponentConstructor = (userOpts?: Partial<ExplorerOptions>) => {
  const opts: ExplorerOptions = { ...defaultOptions, ...userOpts };
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory();

  const ExplorerComponent: QuartzComponent = ({ cfg, displayClass }: QuartzComponentProps) => {
    const id = `explorer-${numExplorers++}`;
    const locale = cfg?.locale ?? "en-US";

    const translations: Record<string, string> = {
      "ar-SA": "المستعرض",
      "ca-ES": "Explorador",
      "cs-CZ": "Procházet",
      "de-DE": "Explorer",
      "en-GB": "Explorer",
      "en-US": "Explorer",
      "es-ES": "Explorador",
      "fa-IR": "مطالب",
      "fi-FI": "Selain",
      "fr-FR": "Explorateur",
      "he-IL": "סייר",
      "hu-HU": "Fájlböngésző",
      "id-ID": "Penjelajah",
      "it-IT": "Esplora",
      "ja-JP": "エクスプローラー",
      "kk-KZ": "Зерттеуші",
      "ko-KR": "탐색기",
      "lt-LT": "Naršyklė",
      "nb-NO": "Utforsker",
      "nl-NL": "Verkenner",
      "pl-PL": "Przeglądaj",
      "pt-BR": "Explorador",
      "ro-RO": "Explorator",
      "ru-RU": "Проводник",
      "th-TH": "รายการหน้า",
      "tr-TR": "Gezgin",
      "uk-UA": "Провідник",
      "vi-VN": "Nội dung",
      "zh-CN": "探索",
      "zh-TW": "探索",
    };

    const title = opts.title ?? translations[locale] ?? "Explorer";

    return (
      <div
        class={classNames(displayClass, "explorer")}
        data-behavior={opts.folderClickBehavior}
        data-collapsed={opts.folderDefaultState}
        data-savestate={opts.useSavedState}
        data-data-fns={JSON.stringify({
          order: opts.order,
          sortFn: opts.sortFn.toString(),
          filterFn: opts.filterFn.toString(),
          mapFn: opts.mapFn.toString(),
        })}
      >
        <button
          type="button"
          class="explorer-toggle mobile-explorer hide-until-loaded"
          data-mobile={true}
          aria-controls={id}
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
        <div id={id} class="explorer-content" aria-expanded={false} role="group">
          <OverflowList class="explorer-ul" />
        </div>
        <template id="template-file">
          <li>
            <a href="#"></a>
          </li>
        </template>
        <template id="template-folder">
          <li>
            <div class="folder-container">
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
                class="folder-icon"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <div>
                <button class="folder-button">
                  <span class="folder-title"></span>
                </button>
              </div>
            </div>
            <div class="folder-outer">
              <ul class="content"></ul>
            </div>
          </li>
        </template>
      </div>
    );
  };

  ExplorerComponent.css = explorerCSS;
  ExplorerComponent.afterDOMLoaded = concatenateResources(
    explorerScript,
    overflowListAfterDOMLoaded,
  );
  return ExplorerComponent;
};

export { Explorer };
export default Explorer;
