# @quartz-community/explorer

The Explorer component for Quartz - navigate your digital garden with an interactive file tree.

## Features

- 📁 Interactive folder tree with collapse/expand functionality
- 📱 Mobile-friendly slide-out navigation
- 💾 Persistent state (remembers open/closed folders)
- 🔗 Configurable folder click behavior (link or collapse)
- ⚡ Built-in search and overflow handling

## Installation

```bash
npx quartz plugin add @quartz-community/explorer
```

## Usage

This plugin is already enabled in the default `quartz.config.yaml`:

```yaml title="quartz.config.yaml"
plugins:
  - source: "@quartz-community/explorer"
    enabled: true
    options:
      folderClickBehavior: link
      folderDefaultState: collapsed
      useSavedState: true
    layout:
      position: left
      priority: 50
```

Callback options (`sortFn`, `filterFn`, `mapFn`) can't be expressed in YAML. Set them in a TypeScript override:

```ts title="quartz.ts (override)"
import * as ExternalPlugin from "./.quartz/plugins";

// Must be placed before loadQuartzConfig()
ExternalPlugin.Explorer({
  mapFn: (node) => {
    node.displayName = node.displayName.toUpperCase();
    return node;
  },
});
```

## Configuration Options

```typescript
interface ExplorerOptions {
  /** Title displayed above the explorer (default: the localized "Explorer") */
  title?: string;

  /** Default state for folders: "collapsed" or "open" (default: "collapsed") */
  folderDefaultState: "collapsed" | "open";

  /** Behavior when clicking folders: "collapse" to toggle, "link" to navigate (default: "link") */
  folderClickBehavior: "collapse" | "link";

  /** Whether to persist folder state in localStorage (default: true) */
  useSavedState: boolean;

  /** Sort rules, applied in sequence as tie-breakers (default: folders first, then by title) */
  sort?: Array<SortKey | { by: SortKey; direction?: "asc" | "desc" }>;

  /** Custom sort function for entries (TypeScript only); replaces `sort` */
  sortFn?: (a: FileTrieNode, b: FileTrieNode) => number;

  /** Custom filter function for entries */
  filterFn?: (node: FileTrieNode) => boolean;

  /** Custom map function for transforming entries; returns the (modified) node */
  mapFn?: (node: FileTrieNode) => FileTrieNode;

  /** Order in which to apply filter, map, and sort (default: ["filter", "map", "sort"]) */
  order?: Array<"filter" | "map" | "sort">;
}
```

### Sorting

`sort` is a list of rules. Each folder's entries are sorted by the first rule; entries it considers equal are sorted by the next one, and so on. A rule is `{ by: <key>, direction: asc | desc }` (`direction` defaults to `asc`), or just the key.

| `by`     | Sorts by                                                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `folder` | Folders before files (`desc`: files before folders)                                                                                                                               |
| `title`  | The displayed name (the page title), in natural order: `Note 2` before `Note 10`, case-insensitive                                                                                |
| `name`   | The file or folder name, whatever the title or `mapFn` (e.g. numbered names: `10 Research`)                                                                                       |
| `date`   | The page's date (as Quartz picks it: `defaultDateType`); a folder's is its index page's, else its newest page's. Needs a Quartz version that writes `date` to `contentIndex.json` |
| `tag`    | The page's first tag                                                                                                                                                              |

Entries without a date or tag come after the others, in either direction. The default is folders first, then by title:

```yaml title="quartz.config.yaml"
- source: "@quartz-community/explorer"
  enabled: true
  options:
    sort:
      - folder
      - title
```

Newest first, folders still on top (a folder counts as new as its newest page):

```yaml
sort:
  - folder
  - { by: date, direction: desc }
  - title
```

Grouped by first tag, newest first within a tag:

```yaml
sort:
  - by: tag
  - by: date
    direction: desc
```

On a Quartz version without dates in the content index, the `date` rule finds no dates and the next rule decides. A `sortFn` set in TypeScript replaces `sort`. Sorting runs at the `sort` step of `order` (below), so with the default order it sees the names `mapFn` set.

### Order of filter, map and sort

`order` sets the order in which `filterFn`, `mapFn` and `sortFn` run (default `["filter", "map", "sort"]`). It can be set in YAML. Sort before mapping when `mapFn` changes the names the sort compares, for example to strip [Johnny.Decimal](https://johnnydecimal.com/) prefixes (`10 Research` → `Research`) while keeping the numbered order:

```yaml title="quartz.config.yaml"
- source: "@quartz-community/explorer"
  enabled: true
  options:
    order: [filter, sort, map]
```

```ts title="quartz.ts (override)"
ExternalPlugin.Explorer({
  mapFn: (node) => {
    node.displayName = node.displayName.replace(/^\d+\s+/, "");
    return node;
  },
});
```

## Default Behavior

By default, the Explorer:

- Shows folders in a collapsed state
- Opens folders when clicked (navigates to index page)
- Saves folder states between sessions
- Excludes the "tags" folder from the tree
- Sorts folders first, then files alphabetically (with numeric ordering): `sort: [folder, title]`

## Development

This is a first-party Quartz community plugin. It serves as both:

1. A production-ready Explorer component
2. A reference implementation for building Quartz community plugins

## Documentation

See the [plugin page](https://quartz.jzhao.xyz/plugins/Explorer) and the [Explorer feature page](https://quartz.jzhao.xyz/features/explorer) in the Quartz documentation.

## License

MIT
