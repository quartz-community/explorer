import type { PluginManifest } from "@jackyzha0/quartz/plugins/loader/types";

export const manifest: PluginManifest = {
  name: "@quartz-community/explorer",
  displayName: "Explorer",
  description: "Interactive file tree navigation component for Quartz",
  version: "0.1.0",
  category: "transformer",
  quartzVersion: "^4.5.0",
  components: {
    Explorer: {
      name: "Explorer",
      displayName: "Explorer",
      description: "Navigate your content with an interactive file tree",
      version: "0.1.0",
    },
  },
};
