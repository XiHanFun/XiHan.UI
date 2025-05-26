/**
 * 主题系统
 * 基于 @utils/dom 构建的完整主题管理系统
 */

import { ref, reactive, computed, inject, provide, watch, type InjectionKey, type Ref, defineComponent } from "vue";
import type {
  ThemeConfig,
  Theme,
  ThemeMode,
  ThemeContext,
  SimpleTheme,
  SimpleStyleFunction,
  ThemeUtils,
} from "./types";

/**
 * 默认简化主题
 */
export const simpleDefaultTheme: SimpleTheme = {
  colors: {
    primary: "#409eff",
    success: "#67c23a",
    warning: "#e6a23c",
    danger: "#f56c6c",
    info: "#909399",
    white: "#ffffff",
    black: "#000000",
  },
  fontSizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
  },
  spacings: {
    xs: "4px",
    sm: "8px",
    base: "12px",
    lg: "16px",
    xl: "24px",
  },
  borderRadius: {
    sm: "2px",
    base: "4px",
    lg: "8px",
    round: "20px",
  },
};

/**
 * 简化主题注入键
 */
export const SIMPLE_THEME_KEY: InjectionKey<Ref<SimpleTheme>> = Symbol("simpleTheme");

/**
 * 提供简化主题
 */
export function provideSimpleTheme(theme: Ref<SimpleTheme>): void {
  provide(SIMPLE_THEME_KEY, theme);
}

/**
 * 使用简化主题
 */
export function useSimpleTheme(): Ref<SimpleTheme> {
  const theme = inject(SIMPLE_THEME_KEY);
  if (!theme) {
    return ref(simpleDefaultTheme);
  }
  return theme;
}

/**
 * 创建简化主题
 */
export function createSimpleTheme(config: Partial<SimpleTheme>): SimpleTheme {
  return {
    ...simpleDefaultTheme,
    ...config,
    colors: { ...simpleDefaultTheme.colors, ...config.colors },
    fontSizes: { ...simpleDefaultTheme.fontSizes, ...config.fontSizes },
    spacings: { ...simpleDefaultTheme.spacings, ...config.spacings },
    borderRadius: { ...simpleDefaultTheme.borderRadius, ...config.borderRadius },
  };
}

/**
 * 创建简化样式函数
 */
export function createSimpleStyleFunction<T = any>(styleFunction: SimpleStyleFunction<T>) {
  return (props?: T) => {
    const theme = useSimpleTheme();

    return computed(() => {
      const styles = styleFunction(theme.value, props);
      // 这里需要导入 css 函数，但为了避免循环依赖，我们返回样式对象
      return styles;
    });
  };
}

/**
 * 简化主题工具函数
 */
export const simpleThemeUtils = {
  /**
   * 获取主题颜色
   */
  getColor(theme: SimpleTheme, colorName: string): string {
    return theme.colors[colorName] || colorName;
  },

  /**
   * 获取主题字体大小
   */
  getFontSize(theme: SimpleTheme, sizeName: string): string {
    return theme.fontSizes[sizeName] || sizeName;
  },

  /**
   * 获取主题间距
   */
  getSpacing(theme: SimpleTheme, spacingName: string): string {
    return theme.spacings[spacingName] || spacingName;
  },

  /**
   * 获取主题圆角
   */
  getBorderRadius(theme: SimpleTheme, radiusName: string): string {
    return theme.borderRadius[radiusName] || radiusName;
  },

  /**
   * 创建主题变量
   */
  createThemeVars(theme: SimpleTheme, prefix = "xh"): Record<string, string> {
    const vars: Record<string, string> = {};

    // 颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      vars[`--${prefix}-color-${key}`] = value;
    });

    // 字体大小变量
    Object.entries(theme.fontSizes).forEach(([key, value]) => {
      vars[`--${prefix}-font-size-${key}`] = value;
    });

    // 间距变量
    Object.entries(theme.spacings).forEach(([key, value]) => {
      vars[`--${prefix}-spacing-${key}`] = value;
    });

    // 圆角变量
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      vars[`--${prefix}-border-radius-${key}`] = value;
    });

    return vars;
  },

  /**
   * 注入主题变量到 DOM
   */
  injectThemeVars(theme: SimpleTheme, target: HTMLElement = document.documentElement, prefix = "xh"): void {
    const vars = this.createThemeVars(theme, prefix);
    Object.entries(vars).forEach(([key, value]) => {
      target.style.setProperty(key, value);
    });
  },
};

/**
 * 默认主题配置
 */
const defaultThemeConfig: ThemeConfig = {
  colors: {
    primary: "#409eff",
    success: "#67c23a",
    warning: "#e6a23c",
    danger: "#f56c6c",
    info: "#909399",
    white: "#ffffff",
    black: "#000000",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    loose: 2,
  },
  spacings: {
    "0": "0",
    xs: "0.25rem",
    sm: "0.5rem",
    base: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    base: "0.25rem",
    lg: "0.5rem",
    xl: "1rem",
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
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  transitions: {
    duration: "0.2s",
    timing: "ease-in-out",
  },
};

/**
 * 创建主题
 */
export function createTheme(config: Partial<ThemeConfig> = {}, mode: "light" | "dark" = "light"): Theme {
  const mergedConfig = {
    ...defaultThemeConfig,
    ...config,
    colors: { ...defaultThemeConfig.colors, ...config.colors },
    fontSizes: { ...defaultThemeConfig.fontSizes, ...config.fontSizes },
    fontWeights: { ...defaultThemeConfig.fontWeights, ...config.fontWeights },
    lineHeights: { ...defaultThemeConfig.lineHeights, ...config.lineHeights },
    spacings: { ...defaultThemeConfig.spacings, ...config.spacings },
    borderRadius: { ...defaultThemeConfig.borderRadius, ...config.borderRadius },
    breakpoints: { ...defaultThemeConfig.breakpoints, ...config.breakpoints },
    zIndexes: { ...defaultThemeConfig.zIndexes, ...config.zIndexes },
    shadows: { ...defaultThemeConfig.shadows, ...config.shadows },
    transitions: { ...defaultThemeConfig.transitions, ...config.transitions },
  };

  const theme: Theme = {
    ...mergedConfig,
    mode,
    cssVars: generateCSSVars(mergedConfig),
  };

  // 应用主题到 DOM
  applyThemeToDOM(theme);

  return theme;
}

function generateCSSVars(config: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {};

  // 生成颜色变量（支持嵌套）
  Object.entries(config.colors).forEach(([key, value]) => {
    if (typeof value === "string") {
      vars[`--xh-color-${key}`] = value;
    } else if (typeof value === "object" && value !== null) {
      // 处理嵌套颜色对象
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue) {
          vars[`--xh-color-${key}-${nestedKey}`] = nestedValue;
        }
      });
    }
  });

  // 生成字体大小变量
  Object.entries(config.fontSizes).forEach(([key, value]) => {
    if (value) {
      vars[`--xh-font-size-${key}`] = value;
    }
  });

  // 生成字体权重变量
  Object.entries(config.fontWeights).forEach(([key, value]) => {
    if (value !== undefined) {
      vars[`--xh-font-weight-${key}`] = value.toString();
    }
  });

  // 生成行高变量
  Object.entries(config.lineHeights).forEach(([key, value]) => {
    if (value !== undefined) {
      vars[`--xh-line-height-${key}`] = value.toString();
    }
  });

  // 生成间距变量
  Object.entries(config.spacings).forEach(([key, value]) => {
    if (value) {
      vars[`--xh-spacing-${key}`] = value;
    }
  });

  // 生成圆角变量
  Object.entries(config.borderRadius).forEach(([key, value]) => {
    if (value) {
      vars[`--xh-border-radius-${key}`] = value;
    }
  });

  // 生成断点变量
  Object.entries(config.breakpoints).forEach(([key, value]) => {
    if (value) {
      vars[`--xh-breakpoint-${key}`] = value;
    }
  });

  // 生成层级变量
  Object.entries(config.zIndexes).forEach(([key, value]) => {
    if (value !== undefined) {
      vars[`--xh-z-index-${key}`] = value.toString();
    }
  });

  // 生成阴影变量
  Object.entries(config.shadows).forEach(([key, value]) => {
    if (value) {
      vars[`--xh-shadow-${key}`] = value;
    }
  });

  // 生成过渡变量
  Object.entries(config.transitions).forEach(([key, value]) => {
    if (value) {
      vars[`--xh-transition-${key}`] = value;
    }
  });

  return vars;
}

function applyThemeToDOM(theme: Theme): void {
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
}

/**
 * 主题注入键
 */
export const THEME_KEY: InjectionKey<ThemeContext> = Symbol("theme");

/**
 * 创建主题上下文
 */
export function createThemeContext(initialConfig?: Partial<ThemeConfig>, initialMode?: "light" | "dark"): ThemeContext {
  const theme = ref(createTheme(initialConfig, initialMode));

  const setTheme = (config: Partial<ThemeConfig>) => {
    theme.value = createTheme(config, theme.value.mode);
  };

  const setMode = (mode: "light" | "dark") => {
    const currentConfig = { ...theme.value };
    delete (currentConfig as any).mode;
    delete (currentConfig as any).cssVars;
    theme.value = createTheme(currentConfig, mode);
  };

  const toggleMode = () => {
    setMode(theme.value.mode === "light" ? "dark" : "light");
  };

  return {
    theme,
    setTheme,
    setMode,
    toggleMode,
  };
}

/**
 * 使用主题
 */
export function useTheme(): ThemeContext {
  const context = inject(THEME_KEY);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * 提供主题
 */
export function provideTheme(themeContext: ThemeContext): void {
  provide(THEME_KEY, themeContext);
}

/**
 * 主题提供者组件
 */
export const ThemeProvider = defineComponent({
  name: "ThemeProvider",
  props: {
    theme: {
      type: Object as () => Partial<ThemeConfig>,
      default: () => ({}),
    },
    mode: {
      type: String as () => "light" | "dark",
      default: "light",
    },
  },
  setup(props: any, { slots }: any) {
    const themeContext = createThemeContext(props.theme, props.mode);
    provideTheme(themeContext);

    return () => slots.default?.();
  },
});
