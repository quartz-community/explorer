---
"@quartz-community/explorer": minor
---

New `sort` option: sort the explorer from `quartz.config.yaml` with a list of rules applied in sequence as tie-breakers, e.g. `sort: [folder, { by: date, direction: desc }, title]` (#6). Keys: `folder`, `title`, `name`, `date`, `tag` (tag lists compared tag by tag; `firstTagOnly: true` for the first tag only). `direction` is `asc`/`desc` (`ASC`/`DESC` and `property` for `by` are accepted too, as in Bases views). The default, `[folder, title]`, is the previous order. Sorting by `date` needs a Quartz version that writes page dates to `contentIndex.json`; without them the next rule decides. A folder's date is its index page's frontmatter date, else its newest page's. A `sortFn` set in TypeScript still replaces `sort`.
