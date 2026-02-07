# @quartz-community/explorer

The Explorer component for Quartz - navigate your digital garden with an interactive file tree.

This is the first first-party community plugin for Quartz, demonstrating the new plugin system that allows components to be distributed as npm packages.

## Features

- 📁 Interactive folder tree with collapse/expand functionality
- 📱 Mobile-friendly slide-out navigation
- 💾 Persistent state (remembers open/closed folders)
- 🔗 Configurable folder click behavior (link or collapse)
- ⚡ Built-in search and overflow handling

## Installation

### From GitHub (Recommended for now)

```bash
npm install github:quartz-community/explorer --legacy-peer-deps
```

### From NPM (when published)

```bash
npm install @quartz-community/explorer
```

## Usage

### 1. Configure in quartz.config.ts

Add the plugin to your externalPlugins array:

```typescript
// quartz.config.ts
import { QuartzConfig } from "./quartz/cfg";

const config: QuartzConfig = {
  configuration: {
    // ... your configuration
  },
  plugins: {
    // ... your existing plugins
  },
  externalPlugins: ["@quartz-community/explorer"],
};

export default config;
```

### 2. Import in your layout

```typescript
// quartz.layout.ts
import { Explorer } from "@quartz-community/explorer";

// Create the Explorer component once and reuse it across layouts
const explorerComponent = Explorer({
  title: "Explorer",
  folderDefaultState: "collapsed",
  folderClickBehavior: "link",
  useSavedState: true,
});

export const defaultContentPageLayout: PageLayout = {
  left: [
    explorerComponent,
    // ... other components
  ],
  right: [
    // ... other components
  ],
};

export const defaultListPageLayout: PageLayout = {
  left: [
    explorerComponent, // Reuse the same component instance
    // ... other components
  ],
  right: [
    // ... other components
  ],
};
```

## Configuration Options

```typescript
interface ExplorerOptions {
  /** Title displayed above the explorer */
  title?: string;

  /** Default state for folders: "collapsed" or "open" */
  folderDefaultState: "collapsed" | "open";

  /** Behavior when clicking folders: "collapse" to toggle, "link" to navigate */
  folderClickBehavior: "collapse" | "link";

  /** Whether to persist folder state in localStorage */
  useSavedState: boolean;

  /** Custom sort function for entries */
  sortFn?: (a: FileTrieNode, b: FileTrieNode) => number;

  /** Custom filter function for entries */
  filterFn?: (node: FileTrieNode) => boolean;

  /** Custom map function for transforming entries */
  mapFn?: (node: FileTrieNode) => void;

  /** Order in which to apply filter, map, and sort */
  order?: Array<"filter" | "map" | "sort">;
}
```

## Default Behavior

By default, the Explorer:

- Shows folders in a collapsed state
- Opens folders when clicked (navigates to index page)
- Saves folder states between sessions
- Excludes the "tags" folder from the tree
- Sorts folders first, then files alphabetically

## Development

This is a first-party Quartz community plugin. It serves as both:

1. A production-ready Explorer component
2. A reference implementation for building Quartz community plugins

## License

MIT
