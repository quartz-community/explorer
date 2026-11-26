// Scroll handling for the explorer's list (browser only).

const STORAGE_KEY = "explorerScrollTop";

function scrolls(el: Element): boolean {
  const overflowY = getComputedStyle(el).overflowY;
  return (
    (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
    el.scrollHeight > el.clientHeight + 1
  );
}

/**
 * The element that scrolls the explorer's list: the list itself in a one-screen sidebar (`fit`),
 * the sidebar in a `scroll` sidebar, … (#14). `null` when only the page scrolls: the explorer
 * then leaves the scroll position to the page.
 */
export function findScrollContainer(el: Element | null): HTMLElement | null {
  for (let node = el; node && node !== document.body && node !== document.documentElement;) {
    if (scrolls(node)) return node as HTMLElement;
    node = node.parentElement;
  }
  return null;
}

/** Empty the list but keep its `.overflow-end` marker (observed for the scroll fade), last. */
export function clearList(ul: HTMLElement): HTMLElement {
  let end = ul.querySelector<HTMLElement>(":scope > .overflow-end");
  for (const child of Array.from(ul.children)) {
    if (child !== end) child.remove();
  }
  if (!end) {
    end = document.createElement("li");
    end.className = "overflow-end";
    ul.appendChild(end);
  }
  return end;
}

/** Where each explorer's list is scrolled to (`null`: it does not scroll). */
export function scrollPositions(lists: Array<HTMLElement | null>): Array<number | null> {
  return lists.map((ul) => (ul ? (findScrollContainer(ul)?.scrollTop ?? null) : null));
}

/**
 * Saved as a JSON array, one entry per explorer (by position on the page); a plain number,
 * saved by older versions, is read as the first explorer's.
 */
export function parseScrollPositions(raw: string | null): Array<number | null> {
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "number") return [parsed];
    if (Array.isArray(parsed)) return parsed.map((v) => (typeof v === "number" ? v : null));
  } catch {
    // ignore
  }
  return [];
}

/** Before an SPA navigation: remember the scroll positions for the next page. */
export function saveScrollPositions(lists: Array<HTMLElement | null>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scrollPositions(lists)));
  } catch {
    // storage unavailable
  }
}

/** The positions saved before this navigation, if it was an SPA one. Read once. */
export function takeSavedScrollPositions(): Array<number | null> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return parseScrollPositions(raw);
  } catch {
    return [];
  }
}

/**
 * Restore an explorer's scroll position (`saved`), or else (a page opened directly) bring the
 * current page into view. Only the explorer's scroll container moves: `scrollIntoView` also
 * scrolled the page itself, which then opened partway down (PR #15).
 */
export function restoreScrollPosition(ul: HTMLElement, saved: number | null | undefined): void {
  const container = findScrollContainer(ul);
  if (!container) return;
  if (typeof saved === "number") {
    container.scrollTop = saved;
    return;
  }
  const active = ul.querySelector(".active");
  if (!active) return;
  const box = container.getBoundingClientRect();
  const item = active.getBoundingClientRect();
  if (item.top >= box.top && item.bottom <= box.bottom) return;
  container.scrollTop += item.top - box.top - container.clientHeight / 3;
}
