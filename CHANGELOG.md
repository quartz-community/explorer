# Changelog

## 1.2.0

### Minor Changes

- e7fa5e5: Several explorers on a page (#12): new `rootFolder` option to show only one folder's contents (e.g. `rootFolder: Notes`), for a second explorer listed as another plugin entry. Explorers now coexist: the explorer script runs once for all of them (each instance included a copy that rendered every explorer), each explorer uses its own templates (no duplicate ids), and each keeps its own scroll position.
- 2e2e624: New `sort` option: sort the explorer from `quartz.config.yaml` with a list of rules applied in sequence as tie-breakers, e.g. `sort: [folder, { by: date, direction: desc }, title]` (#6). Keys: `folder`, `title`, `name`, `date`, `tag` (tag lists compared tag by tag; `firstTagOnly: true` for the first tag only). `direction` is `asc`/`desc` (`ASC`/`DESC` and `property` for `by` are accepted too, as in Bases views). The default, `[folder, title]`, is the previous order. Sorting by `date` needs a Quartz version that writes page dates to `contentIndex.json`; without them the next rule decides. A folder's date is its index page's frontmatter date, else its newest page's. A `sortFn` set in TypeScript still replaces `sort`.

### Patch Changes

- 3de5ed9: The `order` option is applied: `filterFn`, `mapFn` and `sortFn` now run in the configured order (it was ignored, always filter → map → sort). Sorting before mapping keeps the original names for the sort, e.g. Johnny.Decimal prefixes stripped by `mapFn` (#3). `order` can be set in `quartz.config.yaml`.
- 3fb8602: Scrolling fixes:

  - The scroll fade at the bottom of a long explorer works again: re-rendering the tree replaced the `overflow-end` marker the fade watches and put the tree after it (#16).
  - SPA navigation keeps the explorer's scroll position also when the sidebar scrolls rather than the list (`layout.sidebars.left: scroll`): the position is saved and restored on whatever element scrolls the explorer (#14). With several explorers, each keeps its own.
  - Opening a page directly scrolls only the explorer to the current page; it scrolled the page itself too, which then opened partway down (PR #15).

## 1.1.3

### Patch Changes

- 1bf87a6: `aria-expanded` is on the buttons that open and close the explorer, not on its `div` (where it isn't allowed), and the explorer's list id is `explorer-list-<n>` instead of the `list-0` that the table of contents and backlinks also used.

## 1.1.2

### Patch Changes

- 2c55c05: Folder rows use Obsidian's current markup, so Obsidian themes style the explorer as they do in Obsidian: the chevron is a `div.tree-item-icon.collapse-icon` around `svg.svg-icon.right-triangle` (themes' chevron rules, sizes and alignment apply), rows are `is-clickable` / `mod-collapsible`, and files and folders carry Obsidian's `data-path` (the vault path), which themes use for folder icons and colours. The pre-1.0 `nav-folder-collapse-indicator` class is gone: Obsidian no longer renders it, and themes' leftover rules for it hid the only way to open a folder.

  Clicking a folder row outside its title toggles the folder, as in Obsidian. When a theme hides or covers the chevron, clicking the title toggles too, instead of opening the folder page.

  A folder's colour and type are set on its row, which the title inherits, so Obsidian themes' folder colours (`.nav-folder-title`) reach the folder names. Without a theme the explorer looks the same.

  Every folder's list of children starts with a hidden spacer item, as Obsidian's does: themes count on it (`> :only-child` means an empty folder; Lemons hid the only file of a folder).

## 1.1.1

### Patch Changes

- e2f382e: Obsidian's `nav-files-container` class is on the explorer's list of files instead of the whole explorer panel, as in Obsidian. On the panel, Obsidian themes padded it, which hid the mobile menu button (10px wide, icon invisible) and made the phone header taller.

## 1.1.0

### Minor Changes

- 62a797c: Explorer items carry Obsidian's classes (`tree-item`, `nav-file`, `nav-folder`, `nav-folder-children`, `nav-file-title-content`, `nav-folder-title-content`) and `is-collapsed` follows the folder state, so Obsidian themes style the explorer.

## 1.0.4

### Patch Changes

- 873abb3: In a sidebar that is one screen tall, the explorer now shrinks and scrolls before the components below it, such as recent notes, which otherwise got squeezed into a small scroll area of their own.

## 1.0.3

### Patch Changes

- 5873990: Uses Quartz's own `preact` instead of bundling a second copy (`noExternal` in the build overrode the externals). Components now share one Preact instance with Quartz and other plugins, so hooks and context work across them, and the bundle is smaller.

## 1.0.2

### Patch Changes

- 5fd3f8d: Bundles `@quartz-community/utils` 1.1.0: a short wikilink to an Obsidian folder note (`[[Topic]]` for `Topic/Topic.md`) reaches the folder page, and anchors to headings use the same slug as heading ids. `github-slugger` is no longer a dependency of this plugin.

## 1.0.1

### Patch Changes

- f912254: On phones, the explorer's slide-in panel no longer makes every page scroll sideways. It was positioned from the sidebar (16px in) at full screen width, which widened the page's layout viewport by 16px even while hidden; it is now fixed to the screen, with the same inset inside.
- 87e44de: A note with a frontmatter `permalink` (published at its permalink, Quartz 5.1+) stays in its folder in the explorer, as in Obsidian Publish: pages are placed by their file path and linked by their address.
- b7cfd61: Remove debug logging: the explorer no longer prints "[Explorer] …" messages to the browser console on every page load and navigation. Warnings and errors are kept.
- fa78995: Fix the collapsed desktop Explorer clipping its "Explorer" title when a theme uses a larger heading font-size or line-height: the collapsed explorer now sizes to its title instead of a fixed 1.2rem (jackyzha0/quartz#2532).

## 1.0.0

### Major Changes

- Stable 1.0 release. All `@quartz-community/*` dependencies now use `^1.0.0` ranges.

  Pre-1.0 caret ranges pinned the minor version (`^0.2.1` means `>=0.2.1 <0.3.0`), so
  published fixes to shared packages could never be resolved by dependents. Moving the
  ecosystem to 1.0 makes caret ranges behave conventionally.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial Quartz community plugin template.
