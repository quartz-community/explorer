import { defineConfig } from "tsup";
import * as esbuild from "esbuild";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    types: "src/types.ts",
    "components/index": "src/components/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  splitting: false,
  outDir: "dist",
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.jsxImportSource = "preact";
  },
  esbuildPlugins: [
    {
      name: "text-loader",
      setup(build) {
        build.onLoad({ filter: /\.scss$/ }, async (args) => {
          const fs = await import("fs");
          const text = await fs.promises.readFile(args.path, "utf8");
          return {
            contents: text,
            loader: "text",
          };
        });

        build.onLoad({ filter: /\.inline\.ts$/ }, async (args) => {
          const result = await esbuild.build({
            entryPoints: [args.path],
            bundle: true,
            write: false,
            format: "iife",
            target: "es2022",
            minify: false,
            platform: "browser",
          });
          const code = result.outputFiles?.[0]?.text ?? "";
          return {
            contents: `export default ${JSON.stringify(code)};`,
            loader: "ts",
          };
        });
      },
    },
  ],
});
