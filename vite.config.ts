import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import dts from "vite-plugin-dts";

// 获取所有子包的路径配置
const packages = {
  utils: resolve(__dirname, "packages/utils"),
  components: resolve(__dirname, "packages/components"),
  constants: resolve(__dirname, "packages/constants"),
  directives: resolve(__dirname, "packages/directives"),
  themes: resolve(__dirname, "packages/themes"),
};

export default defineConfig({
  plugins: [
    vue(),
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
      entry: {
        index: resolve(__dirname, "packages", "index.ts"),
        utils: resolve(packages.utils, "index.ts"),
        components: resolve(packages.components, "index.ts"),
        constants: resolve(packages.constants, "index.ts"),
        directives: resolve(packages.directives, "index.ts"),
        themes: resolve(packages.themes, "index.ts"),
      },
      name: "XihanUI",
    },
    rollupOptions: {
      external: ["vue", "vue-router"],
    },
  },
  resolve: {
    alias: {
      "@xihan-ui": resolve(__dirname, "packages"),
    },
  },
});
