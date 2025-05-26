import { ref, reactive, computed, inject, provide, watch, type InjectionKey, type Ref } from "vue";
import type { Theme, ThemeConfig } from "../css-in-js/types";
import { createCSSVars, flattenObject } from "../css-in-js/utils";

// 主题注入键
export const THEME_KEY: InjectionKey<ThemeContext> = Symbol("theme");

// 默认主题配置
export const defaultThemeConfig: ThemeConfig = {
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
    "2xl": "24px",
    "3xl": "28px",
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
    xs: "4px",
    sm: "8px",
    base: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "48px",
  },
  borderRadius: {
    none: "0",
    sm: "2px",
    base: "4px",
    lg: "8px",
    xl: "12px",
    round: "20px",
    circle: "50%",
  },
  breakpoints: {
    xs: "480px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
    "2xl": "1400px",
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
    duration: "0.3s",
    timing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

// 暗色主题配置
export const darkThemeConfig: Partial<ThemeConfig> = {
  colors: {
    primary: "#409eff",
    success: "#67c23a",
    warning: "#e6a23c",
    danger: "#f56c6c",
    info: "#909399",
    white: "#1f1f1f",
    black: "#ffffff",
  },
};

// 主题上下文
export interface ThemeContext {
  theme: Ref<Theme>;
  setTheme: (config: Partial<ThemeConfig>) => void;
  setMode: (mode: "light" | "dark") => void;
  toggleMode: () => void;
}

// 创建主题
export function createTheme(config: Partial<ThemeConfig> = {}, mode: "light" | "dark" = "light"): Theme {
  const mergedConfig = { ...defaultThemeConfig, ...config };

  // 如果是暗色模式，合并暗色主题配置
  if (mode === "dark") {
    Object.assign(mergedConfig, darkThemeConfig);
  }

  // 生成 CSS 变量
  const flattenedVars = flattenObject(mergedConfig);
  const cssVars = createCSSVars(flattenedVars, "xh");

  return {
    ...mergedConfig,
    mode,
    cssVars,
  };
}

// 应用主题到 DOM
function applyThemeToDOM(theme: Theme): void {
  const root = document.documentElement;

  // 清除旧的 CSS 变量
  const existingVars = Array.from(root.style).filter(prop => prop.startsWith("--xh-"));
  existingVars.forEach(prop => {
    root.style.removeProperty(prop);
  });

  // 应用新的 CSS 变量
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // 设置主题模式类名
  root.classList.remove("xh-theme-light", "xh-theme-dark");
  root.classList.add(`xh-theme-${theme.mode}`);
}

// 创建主题上下文
export function createThemeContext(initialConfig?: Partial<ThemeConfig>, initialMode?: "light" | "dark"): ThemeContext {
  const theme = ref(createTheme(initialConfig, initialMode));

  // 监听主题变化并应用到 DOM
  watch(
    theme,
    newTheme => {
      applyThemeToDOM(newTheme);
    },
    { immediate: true },
  );

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

// 使用主题
export function useTheme(): ThemeContext {
  const themeContext = inject(THEME_KEY);
  if (!themeContext) {
    throw new Error("Theme not provided. Make sure to call provideTheme first.");
  }
  return themeContext;
}

// 提供主题
export function provideTheme(themeContext: ThemeContext): void {
  provide(THEME_KEY, themeContext);
}

// 主题提供者组件
export const ThemeProvider = {
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

    // 监听 props 变化
    watch(
      () => props.theme,
      newTheme => {
        themeContext.setTheme(newTheme);
      },
    );

    watch(
      () => props.mode,
      newMode => {
        themeContext.setMode(newMode);
      },
    );

    return () => slots.default?.();
  },
};
