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

// 包入口配置
const entries = {
  "@xihan-ui/utils": resolve(packages.utils, "src/index.ts"),
  "@xihan-ui/constants": resolve(packages.constants, "src/index.ts"),
  "@xihan-ui/hooks": resolve(packages.hooks, "src/index.ts"),
  "@xihan-ui/icons": resolve(packages.icons, "src/index.ts"),
  "@xihan-ui/directives": resolve(packages.directives, "src/index.ts"),
  "@xihan-ui/themes": resolve(packages.themes, "src/index.scss"),
  "@xihan-ui/locales": resolve(packages.locales, "src/index.ts"),
  "@xihan-ui/components": resolve(packages.components, "src/index.ts"),
  "xihan-ui": resolve(packages.xihanui, "src/index.ts"),
};

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      include: [
        "packages/**/src/**/*.ts",
        "packages/**/src/**/*.tsx",
        "packages/**/src/**/*.vue",
        "xihan-ui/src/**/*.ts",
      ],
      exclude: ["packages/**/demos/*", "packages/**/tests/*"],
      // 确保生成类型文件
      staticImport: true,
      // 插入版权信息
      insertTypesEntry: true,
      // 输出目录配置
      outDir: ["dist/es", "dist/lib"],
      // 生成类型文件后的钩子
      afterBuild: () => {
        console.log("\n✨ Type definitions generated successfully!");
      },
    }),
  ],
  resolve: {
    alias: {
      "@xihan-ui/utils": resolve(packages.utils, "src"),
      "@xihan-ui/constants": resolve(packages.constants, "src"),
      "@xihan-ui/hooks": resolve(packages.hooks, "src"),
      "@xihan-ui/icons": resolve(packages.icons, "src"),
      "@xihan-ui/directives": resolve(packages.directives, "src"),
      "@xihan-ui/themes": resolve(packages.themes, "src"),
      "@xihan-ui/locales": resolve(packages.locales, "src"),
      "@xihan-ui/components": resolve(packages.components, "src"),
      "xihan-ui": resolve(packages.xihanui, "src"),
    },
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue", ".scss", ".css"],
  },
  build: {
    outDir: "dist",
    cssCodeSplit: true,
    minify: false,
    reportCompressedSize: false,
    lib: {
      entry: entries,
      name: "xihan-ui",
    },
    rollupOptions: {
      external: ["vue"],
      input: entries,
      output: [
        {
          name: "xihan-ui",
          format: "es",
          dir: "dist/es",
          entryFileNames: `[name].mjs`,
          preserveModules: true,
          exports: "named",
          preserveModulesRoot: "",
          globals: {
            vue: "Vue",
          },
          assetFileNames: "assets/[name][extname]",
        },
        {
          name: "xihan-ui",
          format: "cjs",
          dir: "dist/lib",
          entryFileNames: `[name].js`,
          preserveModules: true,
          exports: "named",
          preserveModulesRoot: "",
          globals: {
            vue: "Vue",
          },
          assetFileNames: "assets/[name][extname]",
        },
      ],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
    devSourcemap: true,
  },
});
