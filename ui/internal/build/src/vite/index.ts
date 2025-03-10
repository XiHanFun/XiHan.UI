import { defineConfig } from "vite";
import type { BuildOptions } from "vite";

export function createLibConfig(options: {
  name: string;
  fileName: string;
  entry: string;
  external?: string[];
  globals?: Record<string, string>;
  buildOptions?: BuildOptions;
}) {
  return defineConfig({
    build: {
      lib: {
        entry: options.entry,
        name: options.name,
        fileName: options.fileName,
      },
      rollupOptions: {
        external: options.external || ["vue"],
        output: {
          globals: {
            vue: "Vue",
            ...options.globals,
          },
        },
      },
      ...options.buildOptions,
    },
  });
}
