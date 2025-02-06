// 主题相关工具

interface ThemeVars {
  [key: string]: string;
}

interface ThemeConfig {
  name: string;
  vars: ThemeVars;
  darkMode?: boolean;
}

/**
 * 主题管理工具
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
    Object.entries(theme.vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    // 更新body的data-theme属性
    document.body.dataset.theme = name;
  }

  /**
   * 获取当前主题名称
   */
  getActive(): string {
    return this.activeTheme;
  }

  /**
   * 获取主题变量值
   */
  getVar(name: string): string {
    const theme = this.themes.get(this.activeTheme);
    return theme ? theme.vars[name] : "";
  }

  /**
   * 启用自动暗黑模式
   */
  enableAutoDarkMode(darkTheme: string, lightTheme: string): void {
    this.darkModeListener = (e: MediaQueryListEvent) => {
      this.apply(e.matches ? darkTheme : lightTheme);
    };
    this.darkModeMediaQuery.addEventListener("change", this.darkModeListener);
    // 初始应用
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
