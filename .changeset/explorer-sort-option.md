---
"@quartz-community/explorer": minor
---

New `sort` option: sort the explorer from `quartz.config.yaml` with a list of rules applied in sequence as tie-breakers, e.g. `sort: [folder, { by: date, direction: desc }, title]` (#6). Keys: `folder`, `title`, `name`, `date`, `tag`. The default, `[folder, title]`, is the previous order. Sorting by `date` needs a Quartz version that writes page dates to `contentIndex.json`; without them the next rule decides. A `sortFn` set in TypeScript still replaces it.
