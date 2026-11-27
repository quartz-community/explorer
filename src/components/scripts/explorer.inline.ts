// @ts-nocheck - Required for inline scripts that run in browser context
import { simplifySlug, resolveBasePath } from "@quartz-community/utils/path";
import { processTrie } from "./order";
import { compileSort } from "./sort";
import { findRootFolder } from "./root";
import { eventSlug } from "./slug";
import { folderVaultPath, vaultPath } from "./vaultPath";
import { FileTrieNode } from "./trie";
import {
  STORAGE_KEY,
  folderStartsCollapsed,
  folderStateOptions,
  readFolderStates,
  writeFolderState,
} from "./state";
import {
  clearList,
  restoreScrollPosition,
  saveScrollPositions,
  scrollPositions,
  takeSavedScrollPositions,
} from "./scroll";

const defaultFilterFn = (node) => node.slugSegment !== "tags";

// Build trie from content index data
async function buildFileTrie(dataFns, rootFolder) {
  try {
    const data = await fetchData;

    if (!data) {
      console.error("[Explorer] No data received");
      return null;
    }

    // Handle both formats: { "slug": {...} } or { "content": { "slug": {...} } }
    const contentData = data.content || data;
    const entries = Object.entries(contentData);

    if (entries.length === 0) {
      console.warn("[Explorer] No content entries found");
      return null;
    }

    // `rootFolder`: show only that folder's contents
    const trie = findRootFolder(FileTrieNode.fromEntries(entries), rootFolder);
    if (!trie) {
      console.warn(`[Explorer] rootFolder "${rootFolder}": no such folder`);
      return null;
    }

    // Parse data functions from string if provided
    let sortFn = compileSort(undefined);
    let filterFn = defaultFilterFn;
    let mapFn = null;
    let order;

    if (dataFns) {
      try {
        const parsed = JSON.parse(dataFns);
        order = parsed.order;
        // a sortFn (TypeScript) replaces the `sort` rules
        sortFn = compileSort(parsed.sort);
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

    return processTrie(trie, { sortFn, filterFn, mapFn }, order);
  } catch (e) {
    console.error("Error building file trie:", e);
    return null;
  }
}

/** Mirror Quartz's `.open` folder state as Obsidian's `is-collapsed` (for Obsidian themes). */
function syncCollapsed(folderContainer) {
  const outer = folderContainer?.nextElementSibling;
  const item = folderContainer?.parentElement;
  if (!outer || !item) return;
  const collapsed = !outer.classList.contains("open");
  item.classList.toggle("is-collapsed", collapsed);
  folderContainer.querySelector(".folder-icon")?.classList.toggle("is-collapsed", collapsed);
}

/** Open or close a folder and remember its state (unless `useSavedState` is off). */
function toggleFolder(folderContainer) {
  const childFolderContainer = folderContainer?.nextElementSibling;
  if (!childFolderContainer) return;
  childFolderContainer.classList.toggle("open");
  syncCollapsed(folderContainer);
  const isCollapsed = !childFolderContainer.classList.contains("open");
  const folderPath = folderContainer.dataset.folderpath;
  const { useSavedState } = folderStateOptions(folderContainer.closest(".explorer")?.dataset ?? {});
  try {
    const next = writeFolderState(
      localStorage.getItem(STORAGE_KEY),
      useSavedState,
      folderPath,
      isCollapsed,
    );
    if (next !== null) localStorage.setItem(STORAGE_KEY, next);
  } catch (e) {
    console.error("[Explorer] Error saving folder state:", e);
  }
}

/** Whether a theme hid or covered the collapse icon (as themes with folder icons may). */
function indicatorHidden(folderContainer) {
  const icon = folderContainer.querySelector(".folder-icon");
  if (!icon || icon.getClientRects().length === 0) return true;
  const svg = icon.querySelector("svg");
  const style = getComputedStyle(icon);
  if (style.visibility === "hidden") return true;
  // A theme may hide the chevron and draw its own (`::before`) in the indicator.
  const svgShown =
    svg && svg.getClientRects().length > 0 && getComputedStyle(svg).visibility !== "hidden";
  const before = getComputedStyle(icon, "::before");
  const ownIcon =
    before.content !== "none" && before.content !== "normal" && before.content !== '"\u200b"';
  if (!svgShown && !ownIcon) return true;
  // Some themes draw the folder title over it (Blue Topaz's folder icons).
  const r = icon.getBoundingClientRect();
  const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return !!hit && !icon.contains(hit) && folderContainer.contains(hit);
}

// Render generation to prevent race conditions
let currentRenderGeneration = 0;

// Render the file tree
function renderTree(
  node,
  container,
  currentSlug,
  folderBehavior,
  folderState,
  pathPrefix = "",
  templates,
) {
  // each explorer has its own templates (several explorers may be on a page)
  const folderTemplate = templates?.folder;
  const fileTemplate = templates?.file;

  if (!folderTemplate || !fileTemplate) return;

  const currentPath = pathPrefix ? pathPrefix + "/" + node.slugSegment : node.slugSegment;
  const simplifiedCurrentSlug = simplifySlug(currentSlug);

  if (node.isFolder) {
    const clone = folderTemplate.content.cloneNode(true);
    const folderContainer = clone.querySelector(".folder-container");
    let folderButton = clone.querySelector(".folder-button");
    const folderTitle = clone.querySelector(".folder-title");
    const folderOuter = clone.querySelector(".folder-outer");
    const contentUl = clone.querySelector(".content");

    if (folderTitle) folderTitle.textContent = node.displayName || node.slugSegment;
    if (folderContainer) {
      folderContainer.dataset.folderpath = node.slug;
      folderContainer.dataset.path = folderVaultPath(node) ?? currentPath;
    }

    if (folderBehavior === "link" && folderButton) {
      const folderLink = document.createElement("a");
      folderLink.className = folderButton.className;
      const folderHref = simplifySlug(node.slug);
      folderLink.href = resolveBasePath(folderHref || "");
      if (folderTitle) {
        folderLink.appendChild(folderTitle);
      } else {
        folderLink.textContent = node.displayName || node.slugSegment;
      }
      folderButton.replaceWith(folderLink);
      folderButton = folderLink;
    }

    // the remembered state, else `folderDefaultState`
    const isCollapsed = folderStartsCollapsed(
      folderState.states,
      node.slug,
      folderState.folderDefaultState,
    );

    // if this folder is a prefix of the current path we want to open it anyways
    const simpleFolderPath = simplifySlug(node.slug);
    const folderIsPrefixOfCurrentSlug =
      simpleFolderPath &&
      simpleFolderPath === simplifiedCurrentSlug.slice(0, simpleFolderPath.length);

    if ((!isCollapsed || folderIsPrefixOfCurrentSlug) && folderOuter) {
      folderOuter.classList.add("open");
    }
    syncCollapsed(folderContainer);

    // Render children
    if (node.children && node.children.length > 0 && contentUl) {
      for (const child of node.children) {
        renderTree(
          child,
          contentUl,
          currentSlug,
          folderBehavior,
          folderState,
          currentPath,
          templates,
        );
      }
    }

    container.appendChild(clone);
  } else if (node.data) {
    const clone = fileTemplate.content.cloneNode(true);
    const link = clone.querySelector("a");
    if (link) {
      link.href = resolveBasePath(node.data.slug);
      const path = vaultPath(node.data);
      if (path) link.dataset.path = path;
      const linkText = link.querySelector(".nav-file-title-content") ?? link;
      linkText.textContent = node.displayName || node.slugSegment;
      if (node.data.slug === currentSlug) {
        link.classList.add("active", "is-active");
      }
    }
    container.appendChild(clone);
  }
}

async function handleNavOrRender(e) {
  const thisGeneration = ++currentRenderGeneration;
  try {
    const currentSlug = eventSlug(e.detail?.url, document.body?.dataset?.slug);
    const allExplorers = document.querySelectorAll("div.explorer");
    // After an SPA navigation: where the explorers were on the previous page. A re-render of
    // the same page ("render") keeps them where they are.
    const scrollTo =
      e.type === "render"
        ? scrollPositions(Array.from(allExplorers, (x) => x.querySelector(".explorer-ul")))
        : takeSavedScrollPositions();

    let storedFolderStates = null;
    try {
      storedFolderStates = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      console.error("[Explorer] Error loading saved state:", e);
    }

    for (const [explorerIndex, explorer] of Array.from(allExplorers).entries()) {
      const explorerUl = explorer.querySelector(".explorer-ul");
      if (!explorerUl) {
        console.warn("[Explorer] No explorer-ul found");
        continue;
      }

      // Clear existing content. The `.overflow-end` marker stays, last: the scroll fade
      // (OverflowList) observes it, and replacing it left the fade watching a detached one (#16).
      clearList(explorerUl);

      // Get data functions configuration
      const dataFns = explorer.dataset.dataFns;
      const folderBehavior = explorer.dataset.behavior || "collapse";
      const { folderDefaultState, useSavedState } = folderStateOptions(explorer.dataset);
      const folderState = {
        states: readFolderStates(storedFolderStates, useSavedState),
        folderDefaultState,
      };
      const templates = {
        folder: explorer.querySelector("template.template-folder"),
        file: explorer.querySelector("template.template-file"),
      };

      // Build and render the tree
      const trie = await buildFileTrie(dataFns, explorer.dataset.rootFolder);

      // Check if another nav event started while we were fetching
      if (thisGeneration === currentRenderGeneration) {
        if (trie && trie.children && trie.children.length > 0) {
          // Clear again before rendering to ensure clean state
          const end = clearList(explorerUl);

          const tree = document.createDocumentFragment();
          for (const child of trie.children) {
            renderTree(child, tree, currentSlug, folderBehavior, folderState, "", templates);
          }
          end.before(tree);
        } else {
          console.warn("[Explorer] No trie or empty children");
        }

        // restore the scroll position, or bring the current page into view
        restoreScrollPosition(explorerUl, scrollTo[explorerIndex]);
      }
      // (a newer nav event started while fetching: it renders the tree instead)

      // Always set up event listeners, regardless of render generation
      const cleanupHandlers = [];

      const explorerButtons = explorer.getElementsByClassName("explorer-toggle");
      for (const button of explorerButtons) {
        const clickHandler = function () {
          const nearestExplorer = this.closest(".explorer");
          if (!nearestExplorer) return;
          const explorerCollapsed = nearestExplorer.classList.toggle("collapsed");
          setToggleExpanded(nearestExplorer, !explorerCollapsed);

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
        const iconClickHandler = function (evt) {
          evt.stopPropagation();
          evt.preventDefault();
          toggleFolder(this.closest(".folder-container"));
        };
        icon.addEventListener("click", iconClickHandler);
        cleanupHandlers.push(() => icon.removeEventListener("click", iconClickHandler));
      }

      const folderButtons = explorer.getElementsByClassName("folder-button");
      for (const button of folderButtons) {
        const buttonClickHandler = function (evt) {
          const folderContainer = this.closest(".folder-container");
          if (!folderContainer) return;

          const folderBehavior = explorer.dataset.behavior || "collapse";

          if (folderBehavior === "link") {
            // When folderBehavior is "link", the <button> has been replaced with an <a> tag
            // that has the correct absolute href (e.g. "/features/"). Let the <a> tag's
            // native click propagate to the SPA router — don't navigate imperatively here,
            // as that would use a relative URL and break SPA navigation.
            return;
          } else {
            evt.stopPropagation();
            toggleFolder(folderContainer);
          }
        };
        button.addEventListener("click", buttonClickHandler);
        cleanupHandlers.push(() => button.removeEventListener("click", buttonClickHandler));
      }

      // In Obsidian the whole row toggles a folder. Here the row outside the title does;
      // so does the title when the theme hid the collapse indicator (otherwise a folder
      // with "link" behaviour couldn't be opened at all).
      const folderRows = explorer.getElementsByClassName("folder-container");
      for (const row of folderRows) {
        const rowClickHandler = function (evt) {
          const link = evt.target.closest?.("a.folder-button");
          if (link && !indicatorHidden(this)) return;
          if (evt.ctrlKey || evt.metaKey || evt.shiftKey) return;
          evt.preventDefault();
          evt.stopPropagation();
          toggleFolder(this);
        };
        row.addEventListener("click", rowClickHandler);
        cleanupHandlers.push(() => row.removeEventListener("click", rowClickHandler));
      }

      if (typeof window !== "undefined" && window.addCleanup) {
        window.addCleanup(() => cleanupHandlers.forEach((fn) => fn()));
      }
    }

    for (const explorer of document.getElementsByClassName("explorer")) {
      const mobileExplorer = explorer.querySelector(".mobile-explorer");
      if (!mobileExplorer) continue;

      mobileExplorer.classList.remove("hide-until-loaded");

      if (mobileExplorer.checkVisibility && mobileExplorer.checkVisibility()) {
        explorer.classList.add("collapsed");
        setToggleExpanded(explorer, false);
        document.documentElement.classList.remove("mobile-no-scroll");
      }
    }
  } catch (err) {
    console.error("[Explorer] Fatal error in nav handler:", err);
  }
}

// `aria-expanded` belongs on the buttons that open and close the explorer (it
// isn't allowed on the explorer's plain div).
function setToggleExpanded(explorer, expanded) {
  for (const toggle of explorer.querySelectorAll(".explorer-toggle")) {
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  }
}

document.addEventListener("nav", handleNavOrRender);
document.addEventListener("render", handleNavOrRender);

document.addEventListener("prenav", () => {
  const explorers = document.querySelectorAll("div.explorer");
  saveScrollPositions(Array.from(explorers, (x) => x.querySelector(".explorer-ul")));
});
