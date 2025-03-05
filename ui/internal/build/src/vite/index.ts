import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import dts from "vite-plugin-dts";
import type { Plugin, BuildOptions, CSSOptions, UserConfig } from "vite";

/**
 * 获取 Vite 插件配置
 * @param rootDir 根目录
 */
export const getVitePlugins = (rootDir: string = process.cwd()): Plugin[] => {
  return [
    vue(),
    vueJsx(),
    dts({
      include: [
        "packages/**/src/**/*.ts",
        "packages/**/src/**/*.tsx",
        "packages/**/src/**/*.vue",
        "xihan-ui/src/**/*.ts",
      ],
      exclude: ["packages/**/tests/*"],
      // 确保生成类型文件
      staticImport: true,
      // 插入版权信息
      insertTypesEntry: true,
      // 输出目录配置
      outDir: ["./dist"],
      // 生成类型文件后的钩子
      afterBuild: () => {
        console.log("\n✨ Type definitions generated successfully!");
      },
    }),
  ];
};

/**
 * 获取 CSS 预处理配置
 */
export const getCssOptions = (): CSSOptions => {
  return {
    preprocessorOptions: {
      scss: {},
    },
    devSourcemap: true,
  };
};

/**
 * 获取路径别名配置
 * @param packages 包配置
 */
export const getResolveOptions = (packages: Record<string, string>): UserConfig["resolve"] => {
  return {
    alias: {
      // 内部
      "@xihan-ui/build": resolve(packages.build, "src"),
      "@xihan-ui/dev": resolve(packages.dev, "src"),
      // 发布
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
  };
};

/**
 * 获取构建选项
 * @param entries 入口配置
 */
export const getBuildOptions = (entries: Record<string, string>): BuildOptions => {
  return {
    outDir: "dist",
    cssCodeSplit: true,
    minify: false,
    reportCompressedSize: false,
    lib: {
      entry: entries,
      name: "xihan-ui",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        if (format === "es") {
          return `${entryName}.mjs`;
        } else if (format === "cjs") {
          return `${entryName}.js`;
        }
        return `${entryName}.js`;
      },
    },
  };
};
