---
"@quartz-community/explorer": minor
---

Several explorers on a page (#12): new `rootFolder` option to show only one folder's contents (e.g. `rootFolder: Notes`), for a second explorer listed as another plugin entry. Explorers now coexist: the explorer script runs once for all of them (each instance included a copy that rendered every explorer), each explorer uses its own templates (no duplicate ids), and each keeps its own scroll position.
