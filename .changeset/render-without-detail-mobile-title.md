---
"@quartz-community/explorer": patch
---

- A `render` event without detail (encrypted-pages sends one after decrypting a page) keeps the current page's entry active and its folders open; the explorer lost both.
- The button that opens an explorer on phones is named after the explorer's `title`: with several explorers, each phone header had an identical "Explorer" button.

Bundles `@quartz-community/utils` 1.3.1.
