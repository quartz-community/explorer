---
"@quartz-community/explorer": patch
---

Bundles `@quartz-community/utils` 1.3, so `configuration.slugs.stripDiacritics` (Quartz 5.3) also applies to the tree in the browser, so folders and pages with accents land where the build put them (needs Quartz 5.3, which passes the setting to the browser). Before, the plugin bundled an older utils that ignored the option, and its slugs kept their diacritics.
