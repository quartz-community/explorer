---
"@quartz-community/explorer": patch
---

Remove leftover debug `console.log` calls that fired on every navigation, and coalesce the `nav`/`render` event handlers so the file tree is rebuilt once per navigation instead of twice.
