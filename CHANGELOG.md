# Changelog

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
