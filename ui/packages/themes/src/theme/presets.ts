/**
 * 主题预设
 * 提供常用的主题配置和预设方案
 */

import type { ThemeConfig, ThemePreset, ThemeValidationResult, ThemeMixOptions } from "./types";

/**
 * 默认主题配置
 */
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: "#1976d2",
    secondary: "#dc004e",
    success: "#4caf50",
    warning: "#ff9800",
    danger: "#f44336",
    info: "#2196f3",
    white: "#ffffff",
    black: "#000000",

    // 扩展颜色
    gray: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },

    // 语义化颜色
    text: {
      primary: "#212121",
      secondary: "#757575",
      disabled: "#bdbdbd",
      hint: "#9e9e9e",
    },

    background: {
      default: "#ffffff",
      paper: "#fafafa",
      elevated: "#ffffff",
    },

    border: {
      light: "#e0e0e0",
      medium: "#bdbdbd",
      dark: "#757575",
    },
  },

  fontSizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },

  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeights: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    loose: 1.75,
    relaxed: 2,
  },

  spacings: {
    "0": "0",
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    base: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "2.5rem", // 40px
    "3xl": "3rem", // 48px
    "4xl": "4rem", // 64px
    "5xl": "5rem", // 80px
  },

  borderRadius: {
    none: "0",
    sm: "0.125rem", // 2px
    base: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    round: "9999px",
    circle: "50%",
  },

  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  zIndexes: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  },

  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },

  transitions: {
    duration: "0.2s",
    timing: "cubic-bezier(0.4, 0, 0.2, 1)",
    fast: "0.1s",
    slow: "0.3s",
  },
};

/**
 * 暗色主题配置
 */
export const darkTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,

    // 重写暗色模式的颜色
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
      disabled: "#666666",
      hint: "#999999",
    },

    background: {
      default: "#121212",
      paper: "#1e1e1e",
      elevated: "#2d2d2d",
    },

    border: {
      light: "#333333",
      medium: "#555555",
      dark: "#777777",
    },
  },
};

/**
 * 蓝色主题
 */
export const blueTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: "#2563eb",
    secondary: "#7c3aed",
    info: "#0ea5e9",
  },
};

/**
 * 绿色主题
 */
export const greenTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: "#059669",
    secondary: "#0d9488",
    success: "#10b981",
  },
};

/**
 * 紫色主题
 */
export const purpleTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: "#7c3aed",
    secondary: "#a855f7",
    info: "#8b5cf6",
  },
};

/**
 * 橙色主题
 */
export const orangeTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: "#ea580c",
    secondary: "#f59e0b",
    warning: "#f97316",
  },
};

/**
 * 粉色主题
 */
export const pinkTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: "#ec4899",
    secondary: "#f472b6",
    danger: "#f43f5e",
  },
};

/**
 * 预设主题列表
 */
export const themePresets: ThemePreset[] = [
  {
    name: "default",
    displayName: "默认主题",
    description: "经典的蓝色主题，适合大多数应用场景",
    config: defaultTheme,
    preview: {
      colors: ["#1976d2", "#dc004e", "#4caf50", "#ff9800", "#f44336"],
    },
  },
  {
    name: "dark",
    displayName: "暗色主题",
    description: "深色背景主题，减少眼部疲劳",
    config: darkTheme,
    preview: {
      colors: ["#1976d2", "#dc004e", "#4caf50", "#ff9800", "#f44336"],
    },
  },
  {
    name: "blue",
    displayName: "蓝色主题",
    description: "现代蓝色主题，专业且可信赖",
    config: blueTheme,
    preview: {
      colors: ["#2563eb", "#7c3aed", "#4caf50", "#ff9800", "#f44336"],
    },
  },
  {
    name: "green",
    displayName: "绿色主题",
    description: "自然绿色主题，清新且环保",
    config: greenTheme,
    preview: {
      colors: ["#059669", "#0d9488", "#10b981", "#ff9800", "#f44336"],
    },
  },
  {
    name: "purple",
    displayName: "紫色主题",
    description: "优雅紫色主题，创意且神秘",
    config: purpleTheme,
    preview: {
      colors: ["#7c3aed", "#a855f7", "#4caf50", "#ff9800", "#f44336"],
    },
  },
  {
    name: "orange",
    displayName: "橙色主题",
    description: "活力橙色主题，温暖且充满活力",
    config: orangeTheme,
    preview: {
      colors: ["#ea580c", "#f59e0b", "#4caf50", "#f97316", "#f44336"],
    },
  },
  {
    name: "pink",
    displayName: "粉色主题",
    description: "温柔粉色主题，浪漫且时尚",
    config: pinkTheme,
    preview: {
      colors: ["#ec4899", "#f472b6", "#4caf50", "#ff9800", "#f43f5e"],
    },
  },
];

/**
 * 获取主题预设
 */
export function getThemePreset(name: string): ThemePreset | undefined {
  return themePresets.find(preset => preset.name === name);
}

/**
 * 获取主题配置
 */
export function getThemeConfig(name: string): ThemeConfig | undefined {
  const preset = getThemePreset(name);
  return preset?.config;
}

/**
 * 获取所有主题名称
 */
export function getThemeNames(): string[] {
  return themePresets.map(preset => preset.name);
}

/**
 * 检查主题是否存在
 */
export function hasTheme(name: string): boolean {
  return themePresets.some(preset => preset.name === name);
}

/**
 * 主题预设工具
 */
export const presetUtils = {
  /**
   * 创建主题变体
   */
  createVariant(baseTheme: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig {
    return {
      ...baseTheme,
      ...overrides,
      colors: {
        ...baseTheme.colors,
        ...overrides.colors,
      },
    };
  },

  /**
   * 混合两个主题
   */
  mixThemes(theme1: ThemeConfig, theme2: ThemeConfig, options: ThemeMixOptions = {}): ThemeConfig {
    const { ratio = 0.5, mixColors = true, mixSpacing = false, mixTypography = false } = options;

    // 简单的主题混合实现
    return {
      ...theme1,
      colors: mixColors
        ? {
            ...theme1.colors,
            // 这里可以实现更复杂的颜色混合逻辑
            primary: ratio > 0.5 ? theme2.colors.primary : theme1.colors.primary,
            secondary:
              ratio > 0.5
                ? theme2.colors.secondary || theme1.colors.secondary || theme1.colors.primary
                : theme1.colors.secondary || theme1.colors.primary,
          }
        : theme1.colors,
      spacings: mixSpacing ? { ...theme1.spacings, ...theme2.spacings } : theme1.spacings,
      fontSizes: mixTypography ? { ...theme1.fontSizes, ...theme2.fontSizes } : theme1.fontSizes,
      fontWeights: mixTypography ? { ...theme1.fontWeights, ...theme2.fontWeights } : theme1.fontWeights,
    };
  },

  /**
   * 生成主题的暗色版本
   */
  generateDarkVariant(lightTheme: ThemeConfig): ThemeConfig {
    return {
      ...lightTheme,
      colors: {
        ...lightTheme.colors,
        text: {
          primary: "#ffffff",
          secondary: "#b3b3b3",
          disabled: "#666666",
          hint: "#999999",
        },
        background: {
          default: "#121212",
          paper: "#1e1e1e",
          elevated: "#2d2d2d",
        },
        border: {
          light: "#333333",
          medium: "#555555",
          dark: "#777777",
        },
      },
    };
  },

  /**
   * 验证主题配置
   */
  validateTheme(theme: ThemeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查必需的颜色
    const requiredColors = ["primary", "secondary", "success", "warning", "danger", "info", "white", "black"];
    for (const color of requiredColors) {
      if (!theme.colors[color]) {
        errors.push(`缺少必需的颜色: ${color}`);
      }
    }

    // 检查字体大小
    if (!theme.fontSizes.base) {
      errors.push("缺少基础字体大小");
    }

    // 检查间距
    if (!theme.spacings.base) {
      errors.push("缺少基础间距");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// 默认导出
export default {
  presets: themePresets,
  default: defaultTheme,
  dark: darkTheme,
  blue: blueTheme,
  green: greenTheme,
  purple: purpleTheme,
  orange: orangeTheme,
  pink: pinkTheme,
  utils: presetUtils,
  getThemePreset,
  getThemeConfig,
  getThemeNames,
  hasTheme,
};
