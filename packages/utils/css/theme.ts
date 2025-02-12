// 主题相关类型定义
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeVars {
  [key: string]: string;
}

export interface ThemeConfig {
  name: string;
  mode: ThemeMode;
  vars: ThemeVars;
  primaryColor?: string;
}

/**
 * 检测系统主题
 */
export const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * 监听系统主题变化
 */
export const watchSystemTheme = (callback: (theme: "light" | "dark") => void): (() => void) => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e: MediaQueryListEvent) => callback(e.matches ? "dark" : "light");
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
};

/**
 * 主题管理类
 */
export class ThemeManager {
  private themes: Map<string, ThemeConfig>;
  private activeTheme: string;
  private darkModeMediaQuery: MediaQueryList;
  private darkModeListener?: (e: MediaQueryListEvent) => void;

  constructor() {
    this.themes = new Map();
    this.activeTheme = "default";
    this.darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  }

  /**
   * 注册主题
   */
  register(config: ThemeConfig): void {
    this.themes.set(config.name, config);
  }

  /**
   * 应用主题
   */
  apply(name: string): void {
    const theme = this.themes.get(name);
    if (!theme) return;

    this.activeTheme = name;
    this.applyThemeVars(theme.vars);
    document.documentElement.setAttribute("data-theme", name);
  }

  /**
   * 应用主题变量
   */
  private applyThemeVars(vars: ThemeVars): void {
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }

  /**
   * 获取当前主题
   */
  getActive(): ThemeConfig | undefined {
    return this.themes.get(this.activeTheme);
  }

  /**
   * 获取主题变量
   */
  getVar(name: string): string {
    const theme = this.getActive();
    return theme?.vars[name] || "";
  }

  /**
   * 启用自动暗黑模式
   */
  enableAutoDarkMode(darkTheme: string, lightTheme: string): void {
    this.darkModeListener = (e: MediaQueryListEvent) => {
      this.apply(e.matches ? darkTheme : lightTheme);
    };
    this.darkModeMediaQuery.addEventListener("change", this.darkModeListener);
    this.apply(this.darkModeMediaQuery.matches ? darkTheme : lightTheme);
  }

  /**
   * 禁用自动暗黑模式
   */
  disableAutoDarkMode(): void {
    if (this.darkModeListener) {
      this.darkModeMediaQuery.removeEventListener("change", this.darkModeListener);
      this.darkModeListener = undefined;
    }
  }

  /**
   * 导出主题配置
   */
  export(): Record<string, ThemeConfig> {
    return Object.fromEntries(this.themes.entries());
  }

  /**
   * 导入主题配置
   */
  import(themes: Record<string, ThemeConfig>): void {
    Object.entries(themes).forEach(([name, config]) => {
      this.register({ ...config, name });
    });
  }
}
