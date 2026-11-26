---
"@quartz-community/explorer": patch
---

The `order` option is applied: `filterFn`, `mapFn` and `sortFn` now run in the configured order (it was ignored, always filter → map → sort). Sorting before mapping keeps the original names for the sort, e.g. Johnny.Decimal prefixes stripped by `mapFn` (#3). `order` can be set in `quartz.config.yaml`.
