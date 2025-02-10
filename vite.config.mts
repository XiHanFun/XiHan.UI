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
  directives: resolve(__dirname, "packages/directives"),
  themes: resolve(__dirname, "packages/themes"),
  locales: resolve(__dirname, "packages/locales"),
  components: resolve(__dirname, "packages/components"),
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
      // 生成类型文件之前清空目录
      cleanVueFileName: true,
      // 生成类型文件后的钩子
      afterBuild: () => {
        console.log("Type definitions generated successfully!");
      },
      // 插入版权信息
      insertTypesEntry: true,
      // 生成类型声明入口
      entryRoot: "packages",
    }),
  ],
  build: {
    lib: {
      name: "XihanUI",
      formats: ["es", "cjs"],
      entry: {
        "utils/index": resolve(packages.utils, "index.ts"),
        "constants/index": resolve(packages.constants, "index.ts"),
        "hooks/index": resolve(packages.hooks, "index.ts"),
        "directives/index": resolve(packages.directives, "index.ts"),
        "themes/index": resolve(packages.themes, "index.ts"),
        "locales/index": resolve(packages.locales, "index.ts"),
        "components/index": resolve(packages.components, "index.ts"),
      },
    },
    rollupOptions: {
      external: ["vue", "vue-router"],
      output: {
        dir: "dist",
        entryFileNames: ({ name }) => {
          // 根据格式生成不同后缀
          return `${name}.js`;
        },
        exports: "named",
        preserveModules: true,
        preserveModulesRoot: "packages",
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
        },
      },
    },
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@xihan-ui/*": resolve(__dirname, "packages/*"),
      "@xihan-ui/playground/*": resolve(__dirname, "playground/*"),
      "xihan-ui": resolve(__dirname, "packages/xihan-ui"),
    },
  },
});
