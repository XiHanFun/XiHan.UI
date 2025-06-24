/**
 * XiHan UI 主题系统
 * 简化版主题管理，专注于组件样式支持
 */

import { createThemeManager, themeUtils } from "@xihan-ui/themes";
import type { ThemeTokens } from "@xihan-ui/themes";

// 扩展主题令牌，添加按钮组件专用令牌
export interface XiHanThemeTokens extends ThemeTokens {}

// 创建主题管理器
export const themeManager = createThemeManager({
  defaultTheme: "light",
  enableSystemTheme: true,
  enableStorage: true,
  storageKey: "xihan-ui-theme",
  cssVariableScope: ":root",
});

// 创建增强的主题令牌
const createEnhancedTheme = (baseTokens: ThemeTokens): XiHanThemeTokens => ({
  ...baseTokens,
});

// 注册预设主题
const registerPresetThemes = () => {
  const presets = themeUtils.createThemePresets();

  Object.entries(presets).forEach(([name, tokens]) => {
    const enhancedTokens = createEnhancedTheme(tokens);
    themeManager.registerTheme(name, enhancedTokens);
  });
};

// 初始化主题系统
export const initTheme = () => {
  // 注册预设主题
  registerPresetThemes();

  // 设置默认主题
  themeManager.setTheme("light");
};

// 获取当前主题令牌
export const getThemeTokens = (): XiHanThemeTokens | undefined => {
  return themeManager.getCurrentTokens() as XiHanThemeTokens;
};

// 主题切换
export const switchTheme = (themeName: string) => {
  if (themeManager.hasTheme(themeName)) {
    themeManager.setTheme(themeName);
  } else {
    console.warn(`主题 "${themeName}" 不存在`);
  }
};

// 获取当前主题名称
export const getCurrentTheme = () => {
  return themeManager.getCurrentTheme();
};

// 导出主题工具
export { themeUtils };
