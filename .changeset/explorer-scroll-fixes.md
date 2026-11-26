---
"@quartz-community/explorer": patch
---

Scrolling fixes:

- The scroll fade at the bottom of a long explorer works again: re-rendering the tree replaced the `overflow-end` marker the fade watches and put the tree after it (#16).
- SPA navigation keeps the explorer's scroll position also when the sidebar scrolls rather than the list (`layout.sidebars.left: scroll`): the position is saved and restored on whatever element scrolls the explorer (#14). With several explorers, each keeps its own.
- Opening a page directly scrolls only the explorer to the current page; it scrolled the page itself too, which then opened partway down (PR #15).
