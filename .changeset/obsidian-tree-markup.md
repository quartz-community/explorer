---
"@quartz-community/explorer": patch
---

Folder rows use Obsidian's current markup, so Obsidian themes style the explorer as they do in Obsidian: the chevron is a `div.tree-item-icon.collapse-icon` around `svg.svg-icon.right-triangle` (themes' chevron rules, sizes and alignment apply), rows are `is-clickable` / `mod-collapsible`, and files and folders carry Obsidian's `data-path` (the vault path), which themes use for folder icons and colours. The pre-1.0 `nav-folder-collapse-indicator` class is gone: Obsidian no longer renders it, and themes' leftover rules for it hid the only way to open a folder.

Clicking a folder row outside its title toggles the folder, as in Obsidian. When a theme hides or covers the chevron, clicking the title toggles too, instead of opening the folder page.

A folder's colour and type are set on its row, which the title inherits, so Obsidian themes' folder colours (`.nav-folder-title`) reach the folder names. Without a theme the explorer looks the same.
