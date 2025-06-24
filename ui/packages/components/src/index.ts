/**
 * XiHan UI Components
 * 企业级 Vue 3 组件库主入口
 */

// 导出所有组件
export * from "./components";

// 导出组件创建工具
export * from "./create";

// 导出主题系统
export * from "./theme";

// 导出基础类型和工具
export type { ThemeTokens, ThemeConfig, StyleObject, CompiledStyle, StyleEngine } from "@xihan-ui/themes";

// 导出样式引擎
export { createStyleEngine, createThemeManager, themeUtils, cB, cE, cM, cNotM, cS } from "@xihan-ui/themes";

// 自动初始化主题系统（在浏览器环境中）
import { initTheme } from "./theme";

// 检查是否在浏览器环境中
if (typeof window !== "undefined" && typeof document !== "undefined") {
  // 延迟初始化，确保DOM已准备好
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    // DOM已就绪，立即初始化
    setTimeout(initTheme, 0);
  }
}

// 版本信息
export const version = "1.0.0";

// 组件库元信息
export const XiHanUIInfo = {
  name: "XiHan UI",
  version: "1.0.0",
  description: "企业级 Vue 3 组件库",
  author: "XiHan Team",
  repository: "https://github.com/XiHanFun/XiHan.UI",
} as const;
