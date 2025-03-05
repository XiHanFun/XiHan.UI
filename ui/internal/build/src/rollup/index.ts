import type { OutputOptions } from "rollup";
import type { LibraryFormats } from "vite";

/**
 * 生成文件名称
 * @param format 模块格式
 * @param entryName 入口名称
 */
export const generateFileName = (format: LibraryFormats, entryName: string): string => {
  if (format === "es") {
    return `${entryName}.mjs`;
  } else if (format === "cjs") {
    return `${entryName}.js`;
  }
  return `${entryName}.js`;
};

/**
 * 获取 Rollup 输出配置
 * @param outputDir 输出目录
 */
export const getRollupOutput = (outputDir: string = "dist"): OutputOptions[] => {
  return [
    {
      name: "xihan-ui",
      format: "es",
      dir: outputDir,
      entryFileNames: `[name].mjs`,
      exports: "named",
      preserveModulesRoot: "",
      globals: {
        vue: "Vue",
      },
    },
    {
      name: "xihan-ui",
      format: "cjs",
      dir: outputDir,
      entryFileNames: `[name].js`,
      exports: "named",
      preserveModulesRoot: "",
      globals: {
        vue: "Vue",
      },
    },
  ];
};

/**
 * 获取外部依赖配置
 */
export const getExternal = (): string[] => {
  return ["vue"];
};
