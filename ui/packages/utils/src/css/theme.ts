/**
 * 主题样式常量
 */
export const ThemeStyle = {
  LIGHT: "light",
  DARK: "dark",
} as const;

export type ThemeStyleType = (typeof ThemeStyle)[keyof typeof ThemeStyle];

/**
 * 主题模式常量
 */
export const ThemeMode = {
  ...ThemeStyle,
  SYSTEM: "system",
  AUTO: "auto",
} as const;

export type ThemeModeType = (typeof ThemeMode)[keyof typeof ThemeMode];

/**
 * CSS 变量前缀
 */
export const CSS_VAR_PREFIX = "--xihan";

/**
 * 主题变量接口
 */
export interface ThemeVars {
  [key: string]: string | number | ThemeVars;
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string;
  /** 主题模式 */
  mode: ThemeModeType;
  /** 主题变量 */
  vars: ThemeVars;
  /** 主色 */
  primaryColor?: string;
  /** 主题描述 */
  description?: string;
  /** 是否为内置主题 */
  builtin?: boolean;
  /** 主题作者 */
  author?: string;
}

/**
 * 主题变化事件监听器
 */
export type ThemeChangeListener = (theme: ThemeConfig) => void;

/**
 * 检测系统主题
 * @returns 系统主题
 */
export const getSystemTheme = (): ThemeStyleType => {
  if (typeof window === "undefined") return ThemeStyle.LIGHT;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? ThemeStyle.DARK : ThemeStyle.LIGHT;
};

/**
 * 监听系统主题变化
 * @param callback 回调函数
 * @returns 取消监听函数
 */
export const watchSystemTheme = (callback: (theme: ThemeStyleType) => void): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e: MediaQueryListEvent) => callback(e.matches ? ThemeStyle.DARK : ThemeStyle.LIGHT);

  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
};

/**
 * 将嵌套的主题变量对象转换为扁平化的 CSS 变量格式
 * @param vars 主题变量对象
 * @param prefix CSS 变量前缀
 * @returns 扁平化的 CSS 变量对象
 */
export const flattenThemeVars = (vars: ThemeVars, prefix: string = CSS_VAR_PREFIX): Record<string, string> => {
  const result: Record<string, string> = {};

  const process = (obj: ThemeVars, path: string) => {
    Object.entries(obj).forEach(([key, value]) => {
      const varPath = path ? `${path}-${key}` : key;

      if (typeof value === "object") {
        process(value as ThemeVars, varPath);
      } else {
        result[`${prefix}-${varPath}`] = String(value);
      }
    });
  };

  process(vars, "");
  return result;
};

/**
 * 生成 CSS 变量字符串
 * @param vars 主题变量对象
 * @param prefix CSS 变量前缀
 * @returns CSS 变量字符串
 */
export const generateCSSVars = (vars: ThemeVars, prefix: string = CSS_VAR_PREFIX): string => {
  const flatVars = flattenThemeVars(vars, prefix);
  return Object.entries(flatVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n");
};

/**
 * 主题管理类
 * @example
 * const themeManager = new ThemeManager();
 * themeManager.register({
 *   name: "default",
 *   mode: ThemeMode.LIGHT,
 *   vars: { color: { primary: "#1890ff" } },
 * });
 * themeManager.apply("default");
 */
export class ThemeManager {
  /** 主题配置映射 */
  private themes: Map<string, ThemeConfig>;
  /** 当前激活的主题名称 */
  private activeTheme: string;
  /** 暗黑模式媒体查询 */
  private darkModeMediaQuery: MediaQueryList | null;
  /** 暗黑模式监听器 */
  private darkModeListener?: (e: MediaQueryListEvent) => void;
  /** 主题变更监听器集合 */
  private changeListeners: Set<ThemeChangeListener>;
  /** 默认主题名称 */
  private defaultTheme: string;
  /** 是否在 SSR 环境 */
  private isSSR: boolean;

  /**
   * 构造函数
   * @param defaultThemeName 默认主题名称
   */
  constructor(defaultThemeName: string = "default") {
    this.themes = new Map();
    this.activeTheme = defaultThemeName;
    this.defaultTheme = defaultThemeName;
    this.changeListeners = new Set();
    this.isSSR = typeof window === "undefined";

    // 只在浏览器环境下初始化
    this.darkModeMediaQuery = this.isSSR ? null : window.matchMedia("(prefers-color-scheme: dark)");

    // 注册默认主题
    this.registerBuiltinThemes();
  }

  /**
   * 注册内置主题
   */
  private registerBuiltinThemes(): void {
    // 注册默认亮色主题
    this.register({
      name: this.defaultTheme,
      mode: ThemeMode.LIGHT,
      vars: {
        color: {
          primary: "#1890ff",
          success: "#52c41a",
          warning: "#faad14",
          error: "#f5222d",
          info: "#1890ff",
          text: {
            primary: "rgba(0, 0, 0, 0.85)",
            secondary: "rgba(0, 0, 0, 0.65)",
            disabled: "rgba(0, 0, 0, 0.45)",
          },
          background: {
            base: "#ffffff",
            paper: "#f5f5f5",
          },
        },
        font: {
          size: {
            base: "14px",
            small: "12px",
            large: "16px",
          },
          family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        spacing: {
          xs: "4px",
          sm: "8px",
          md: "16px",
          lg: "24px",
          xl: "32px",
        },
        radius: {
          sm: "2px",
          md: "4px",
          lg: "8px",
          round: "50%",
        },
        shadow: {
          sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
          md: "0 2px 4px rgba(0, 0, 0, 0.1)",
          lg: "0 4px 8px rgba(0, 0, 0, 0.1)",
        },
        transition: {
          fast: "0.1s",
          base: "0.2s",
          slow: "0.3s",
        },
        zIndex: {
          dropdown: 1000,
          fixed: 1100,
          modal: 1200,
          popup: 1300,
          toast: 1400,
        },
      },
      primaryColor: "#1890ff",
      description: "默认亮色主题",
      builtin: true,
    });

    // 注册默认暗色主题
    this.register({
      name: "dark",
      mode: ThemeMode.DARK,
      vars: {
        color: {
          primary: "#177ddc",
          success: "#49aa19",
          warning: "#d89614",
          error: "#d32029",
          info: "#177ddc",
          text: {
            primary: "rgba(255, 255, 255, 0.85)",
            secondary: "rgba(255, 255, 255, 0.65)",
            disabled: "rgba(255, 255, 255, 0.45)",
          },
          background: {
            base: "#141414",
            paper: "#1f1f1f",
          },
        },
        font: {
          size: {
            base: "14px",
            small: "12px",
            large: "16px",
          },
          family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        spacing: {
          xs: "4px",
          sm: "8px",
          md: "16px",
          lg: "24px",
          xl: "32px",
        },
        radius: {
          sm: "2px",
          md: "4px",
          lg: "8px",
          round: "50%",
        },
        shadow: {
          sm: "0 1px 2px rgba(0, 0, 0, 0.6)",
          md: "0 2px 4px rgba(0, 0, 0, 0.6)",
          lg: "0 4px 8px rgba(0, 0, 0, 0.6)",
        },
        transition: {
          fast: "0.1s",
          base: "0.2s",
          slow: "0.3s",
        },
        zIndex: {
          dropdown: 1000,
          fixed: 1100,
          modal: 1200,
          popup: 1300,
          toast: 1400,
        },
      },
      primaryColor: "#177ddc",
      description: "默认暗色主题",
      builtin: true,
    });
  }

  /**
   * 注册主题
   * @param config 主题配置
   */
  register(config: ThemeConfig): void {
    this.themes.set(config.name, config);
  }

  /**
   * 应用主题
   * @param name 主题名称
   * @returns 是否应用成功
   */
  apply(name: string): boolean {
    const theme = this.themes.get(name);
    if (!theme) return false;

    this.activeTheme = name;

    // 在浏览器环境下才应用 DOM 操作
    if (!this.isSSR) {
      this.applyThemeVars(theme.vars);
      document.documentElement.setAttribute("data-theme", name);
      document.documentElement.setAttribute("data-theme-mode", theme.mode);

      if (theme.primaryColor) {
        document.documentElement.style.setProperty(`${CSS_VAR_PREFIX}-color-primary`, theme.primaryColor);
      }
    }

    // 触发变更事件
    this.notifyListeners(theme);

    return true;
  }

  /**
   * 应用主题变量
   * @param vars 主题变量
   */
  private applyThemeVars(vars: ThemeVars): void {
    const flatVars = flattenThemeVars(vars);
    Object.entries(flatVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }

  /**
   * 获取当前主题
   * @returns 当前主题
   */
  getActive(): ThemeConfig | undefined {
    return this.themes.get(this.activeTheme);
  }

  /**
   * 获取主题变量
   * @param path 变量路径，使用点表示法，如: 'color.primary'
   * @returns 变量值
   */
  getVar(path: string): string {
    const theme = this.getActive();
    if (!theme) return "";

    const parts = path.split(".");
    let value: any = theme.vars;

    for (const part of parts) {
      if (value == null || typeof value !== "object") return "";
      value = value[part];
    }

    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  }

  /**
   * 获取 CSS 变量名
   * @param path 变量路径，使用点表示法，如: 'color.primary'
   * @returns CSS 变量名
   */
  getCSSVar(path: string): string {
    const parts = path.split(".");
    return `${CSS_VAR_PREFIX}-${parts.join("-")}`;
  }

  /**
   * 启用自动暗黑模式
   * @param darkTheme 暗黑主题名称
   * @param lightTheme 亮色主题名称
   * @returns 是否启用成功
   */
  enableAutoDarkMode(darkTheme: string, lightTheme: string): boolean {
    if (this.isSSR || !this.darkModeMediaQuery) return false;

    if (!this.themes.has(darkTheme) || !this.themes.has(lightTheme)) {
      return false;
    }

    this.disableAutoDarkMode();

    this.darkModeListener = (e: MediaQueryListEvent) => {
      this.apply(e.matches ? darkTheme : lightTheme);
    };

    this.darkModeMediaQuery.addEventListener("change", this.darkModeListener);

    // 立即应用当前系统主题
    this.apply(this.darkModeMediaQuery.matches ? darkTheme : lightTheme);

    return true;
  }

  /**
   * 禁用自动暗黑模式
   */
  disableAutoDarkMode(): void {
    if (this.isSSR || !this.darkModeMediaQuery || !this.darkModeListener) return;

    this.darkModeMediaQuery.removeEventListener("change", this.darkModeListener);

    this.darkModeListener = undefined;
  }

  /**
   * 添加主题变更监听器
   * @param listener 监听器函数
   * @returns 取消监听的函数
   */
  onChange(listener: ThemeChangeListener): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  /**
   * 通知所有监听器
   * @param theme 变更后的主题
   */
  private notifyListeners(theme: ThemeConfig): void {
    this.changeListeners.forEach(listener => listener(theme));
  }

  /**
   * 导出主题配置
   * @returns 主题配置对象
   */
  export(): Record<string, ThemeConfig> {
    return Object.fromEntries(this.themes.entries());
  }

  /**
   * 导入主题配置
   * @param themes 主题配置对象
   */
  import(themes: Record<string, ThemeConfig>): void {
    Object.entries(themes).forEach(([_, config]) => {
      this.register(config);
    });
  }

  /**
   * 删除主题
   * @param name 主题名称
   * @returns 是否删除成功
   */
  remove(name: string): boolean {
    // 不能删除当前激活的主题
    if (name === this.activeTheme) return false;

    // 不能删除内置主题
    const theme = this.themes.get(name);
    if (theme?.builtin) return false;

    return this.themes.delete(name);
  }

  /**
   * 获取主题列表
   * @param includeBuiltin 是否包含内置主题
   * @returns 主题配置数组
   */
  getThemes(includeBuiltin: boolean = true): ThemeConfig[] {
    const themes = Array.from(this.themes.values());
    return includeBuiltin ? themes : themes.filter(theme => !theme.builtin);
  }

  /**
   * 重置为默认主题
   * @returns 是否重置成功
   */
  reset(): boolean {
    return this.apply(this.defaultTheme);
  }

  /**
   * 生成主题的 CSS 变量样式表
   * @param name 主题名称
   * @returns CSS 样式表字符串
   */
  generateThemeStylesheet(name: string): string {
    const theme = this.themes.get(name);
    if (!theme) return "";

    const cssVars = generateCSSVars(theme.vars);
    return `[data-theme="${name}"] {\n${cssVars}\n}`;
  }
}

/**
 * 创建并返回一个全局主题管理器实例
 */
export const createThemeManager = (defaultTheme: string = "default"): ThemeManager => {
  return new ThemeManager(defaultTheme);
};

// 默认导出
export const themeUtils = {
  ThemeStyle,
  ThemeMode,
  getSystemTheme,
  watchSystemTheme,
  flattenThemeVars,
  generateCSSVars,
  createThemeManager,
  CSS_VAR_PREFIX,
};

export default themeUtils;
