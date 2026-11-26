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

  /** Custom sort function for entries */
  sortFn?: (a: FileTrieNode, b: FileTrieNode) => number;

  /** Custom filter function for entries */
  filterFn?: (node: FileTrieNode) => boolean;

  /** Custom map function for transforming entries; returns the (modified) node */
  mapFn?: (node: FileTrieNode) => FileTrieNode;

  /** Order in which to apply filter, map, and sort (default: ["filter", "map", "sort"]) */
  order?: Array<"filter" | "map" | "sort">;
}
```

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
- Sorts folders first, then files alphabetically (with numeric ordering)

## Development

This is a first-party Quartz community plugin. It serves as both:

1. A production-ready Explorer component
2. A reference implementation for building Quartz community plugins

## Documentation

See the [plugin page](https://quartz.jzhao.xyz/plugins/Explorer) and the [Explorer feature page](https://quartz.jzhao.xyz/features/explorer) in the Quartz documentation.

## License

MIT
