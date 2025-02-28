import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";
import dts from "vite-plugin-dts";

// 获取所有子包的路径配置
const packages = {
  utils: resolve(__dirname, "packages/utils"),
  constants: resolve(__dirname, "packages/constants"),
  hooks: resolve(__dirname, "packages/hooks"),
  icons: resolve(__dirname, "packages/icons"),
  directives: resolve(__dirname, "packages/directives"),
  locales: resolve(__dirname, "packages/locales"),
  components: resolve(__dirname, "packages/components"),
  themes: resolve(__dirname, "packages/themes"),
  xihanui: resolve(__dirname, "xihan-ui"),
};

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      include: ["packages/**/*.ts", "packages/**/*.tsx", "packages/**/*.vue"],
      exclude: ["packages/**/demos/*", "packages/**/tests/*"],
      // 确保生成类型文件
      staticImport: true,
      // 插入版权信息
      insertTypesEntry: true,
      // 生成类型文件后的钩子
      afterBuild: () => {
        console.log("\n✨ Type definitions generated successfully!");
      },
    }),
  ],
  resolve: {
    alias: {
      "@xihan-ui/utils": resolve(packages.utils),
      "@xihan-ui/constants": resolve(packages.constants),
      "@xihan-ui/hooks": resolve(packages.hooks),
      "@xihan-ui/icons": resolve(packages.icons),
      "@xihan-ui/directives": resolve(packages.directives),
      "@xihan-ui/themes": resolve(packages.themes),
      "@xihan-ui/locales": resolve(packages.locales),
      "@xihan-ui/components": resolve(packages.components),
      "xihan-ui": resolve(packages.xihanui),
    },
  },
  build: {
    outDir: "dist",
    cssCodeSplit: true,
    lib: {
      name: "xihan-ui",
      entry: {
        "@xihan-ui/utils": resolve(packages.utils, "index.ts"),
        "@xihan-ui/constants": resolve(packages.constants, "index.ts"),
        "@xihan-ui/hooks": resolve(packages.hooks, "index.ts"),
        "@xihan-ui/icons": resolve(packages.icons, "index.ts"),
        "@xihan-ui/directives": resolve(packages.directives, "index.ts"),
        "@xihan-ui/themes": resolve(packages.themes, "index.scss"),
        "@xihan-ui/locales": resolve(packages.locales, "index.ts"),
        "@xihan-ui/components": resolve(packages.components, "index.ts"),
        "xihan-ui": resolve(packages.xihanui, "index.ts"),
      },
    },
    rollupOptions: {
      external: ["vue"],
      input: {
        "@xihan-ui/utils": resolve(packages.utils, "index.ts"),
        "@xihan-ui/constants": resolve(packages.constants, "index.ts"),
        "@xihan-ui/hooks": resolve(packages.hooks, "index.ts"),
        "@xihan-ui/icons": resolve(packages.icons, "index.ts"),
        "@xihan-ui/directives": resolve(packages.directives, "index.ts"),
        "@xihan-ui/themes": resolve(packages.themes, "index.scss"),
        "@xihan-ui/locales": resolve(packages.locales, "index.ts"),
        "@xihan-ui/components": resolve(packages.components, "index.ts"),
        "xihan-ui": resolve(packages.xihanui, "index.ts"),
      },
      output: [
        {
          name: "xihan-ui",
          format: "es",
          dir: "dist/es",
          entryFileNames: `[name].mjs`,
          preserveModules: true,
          exports: "named",
          preserveModulesRoot: "xihan-ui",
          globals: {
            vue: "Vue",
          },
        },
        {
          name: "xihan-ui",
          format: "cjs",
          dir: "dist/lib",
          entryFileNames: `[name].js`,
          preserveModules: true,
          exports: "named",
          preserveModulesRoot: "xihan-ui",
          globals: {
            vue: "Vue",
          },
        },
      ],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
});
