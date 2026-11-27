---
"@quartz-community/explorer": patch
---

`folderDefaultState` and `useSavedState` work: with `folderDefaultState: open` folders the reader hasn't opened or closed start open, and with `useSavedState: false` the explorer neither reads nor writes the remembered folder state (`fileTree` in localStorage). Both options had no effect since 1.0.0; folders always started collapsed and their state was always remembered.
