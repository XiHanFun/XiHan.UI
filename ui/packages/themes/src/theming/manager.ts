/**
 * 主题管理器
 * 统一处理主题配置、CSS变量生成和主题切换
 */

import { XH_PREFIX } from "@xihan-ui/constants";
import type { ThemeTokens, ThemeConfig, CSSVarName, StyleObject, ThemeContext, ThemeUtils } from "../foundation/types";
import { generateId, deepClone, mergeStyleObjects, createCSSVar, useCSSVar, toKebabCase } from "../foundation/utils";
import { createEventEmitter, globalEvents } from "../foundation/events";

// 简单的深度合并实现
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || ({} as any), source[key] as any);
    } else if (source[key] !== undefined) {
      result[key] = source[key] as any;
    }
  }
  return result;
}

// 主题事件映射
interface ThemeEventMap {
  "theme-registered": { name: string; tokens: ThemeTokens };
  "theme-changed": ThemeChangeEvent;
  "theme-removed": { name: string };
  "themes-cleared": {};
}

const themeEvents = createEventEmitter<ThemeEventMap>();

/**
 * 主题变化事件
 */
export interface ThemeChangeEvent {
  theme: string;
  tokens: ThemeTokens;
  previousTheme?: string;
}

/**
 * 主题管理器配置
 */
export interface ThemeManagerConfig {
  prefix: string;
  defaultTheme: string;
  enableSystemTheme: boolean;
  enableStorage: boolean;
  storageKey: string;
  cssVariableScope: "root" | "body" | string;
}

/**
 * 主题管理器实现
 */
export class ThemeManager {
  private themes = new Map<string, ThemeTokens>();
  private currentTheme: string;
  private config: Required<ThemeManagerConfig>;
  private systemThemeMediaQuery?: MediaQueryList;
  private injectedStyleElement?: HTMLStyleElement;

  constructor(config: Partial<ThemeManagerConfig> = {}) {
    this.config = {
      prefix: XH_PREFIX,
      defaultTheme: "light",
      enableSystemTheme: true,
      enableStorage: true,
      storageKey: "xihan-theme",
      cssVariableScope: "root",
      ...config,
    };

    this.currentTheme = this.loadStoredTheme() || this.config.defaultTheme;
    this.setupSystemThemeDetection();
  }

  /**
   * 注册主题
   */
  registerTheme(name: string, tokens: ThemeTokens): void {
    this.themes.set(name, deepClone(tokens));
    globalEvents.emit("theme-registered", { name, tokens: deepClone(tokens) });
  }

  /**
   * 注册多个主题
   */
  registerThemes(themes: Record<string, ThemeTokens>): void {
    for (const [name, tokens] of Object.entries(themes)) {
      this.registerTheme(name, tokens);
    }
  }

  /**
   * 切换主题
   */
  setTheme(themeName: string): void {
    if (!this.themes.has(themeName)) {
      throw new Error(`Theme "${themeName}" not found`);
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = themeName;

    // 应用主题
    this.applyTheme(themeName);

    // 存储主题选择
    if (this.config.enableStorage) {
      this.storeTheme(themeName);
    }

    // 触发主题变更事件
    globalEvents.emit("theme-changed", {
      theme: themeName,
      tokens: deepClone(this.themes.get(themeName)!),
      previousTheme,
    });
  }

  /**
   * 获取当前主题名称
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  /**
   * 获取当前主题令牌
   */
  getCurrentTokens(): ThemeTokens | undefined {
    return this.themes.get(this.currentTheme);
  }

  /**
   * 获取主题令牌
   */
  getThemeTokens(themeName: string): ThemeTokens | undefined {
    return this.themes.get(themeName);
  }

  /**
   * 获取所有主题名称
   */
  getThemeNames(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * 检查主题是否存在
   */
  hasTheme(themeName: string): boolean {
    return this.themes.has(themeName);
  }

  /**
   * 生成主题CSS变量
   */
  generateThemeCSS(themeName?: string): string {
    const theme = themeName || this.currentTheme;
    const tokens = this.themes.get(theme);

    if (!tokens) {
      return "";
    }

    const cssVars = this.generateCSSVariables(tokens);
    const scope = this.config.cssVariableScope;

    return `${scope} {\n${cssVars}\n}`;
  }

  /**
   * 获取CSS变量名
   */
  getCSSVar(tokenPath: string): CSSVarName {
    return createCSSVar(`${this.config.prefix}-${toKebabCase(tokenPath)}`) as CSSVarName;
  }

  /**
   * 获取令牌值
   */
  getTokenValue(tokenPath: string, fallback?: string): string {
    const tokens = this.getCurrentTokens();
    if (!tokens) {
      return fallback || "";
    }

    const keys = tokenPath.split(".");
    let value: any = tokens;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return fallback || "";
      }
    }

    return typeof value === "string" ? value : fallback || "";
  }

  /**
   * 创建主题样式对象
   */
  createThemeStyles(styles: Record<string, any>): StyleObject {
    const result: StyleObject = {};
    const tokens = this.getCurrentTokens();

    if (!tokens) {
      return result;
    }

    // 使用 CSS 变量替换主题令牌
    for (const [key, value] of Object.entries(styles)) {
      if (typeof value === "string" && value.startsWith("$")) {
        const tokenPath = value.slice(1);
        const cssVar = this.getCSSVar(tokenPath);
        result[key] = useCSSVar(cssVar);
      } else if (typeof value === "object" && value !== null) {
        result[key] = this.createThemeStyles(value);
      } else {
        result[key] = value;
      }
    }

    return mergeStyleObjects(result);
  }

  /**
   * 监听主题变化
   */
  onThemeChange(callback: (event: ThemeChangeEvent) => void): () => void {
    return themeEvents.on("theme-changed", callback);
  }

  /**
   * 切换到系统主题
   */
  setSystemTheme(): void {
    if (!this.config.enableSystemTheme) {
      return;
    }

    const prefersDark = this.getSystemThemePreference();
    const systemTheme = prefersDark ? "dark" : "light";

    if (this.hasTheme(systemTheme)) {
      this.setTheme(systemTheme);
    }
  }

  /**
   * 检查是否为系统主题
   */
  isSystemTheme(): boolean {
    if (!this.config.enableSystemTheme) {
      return false;
    }

    const prefersDark = this.getSystemThemePreference();
    const systemTheme = prefersDark ? "dark" : "light";
    return this.currentTheme === systemTheme;
  }

  /**
   * 扩展主题（基于现有主题创建变体）
   */
  extendTheme(baseName: string, newName: string, overrides: Partial<ThemeTokens>): void {
    const baseTheme = this.themes.get(baseName);
    if (!baseTheme) {
      throw new Error(`Base theme "${baseName}" not found`);
    }

    const extendedTheme = deepMerge(baseTheme, overrides) as ThemeTokens;
    this.registerTheme(newName, extendedTheme);
  }

  /**
   * 删除主题
   */
  removeTheme(themeName: string): boolean {
    if (themeName === this.currentTheme) {
      console.warn(`Cannot remove current theme "${themeName}"`);
      return false;
    }

    const deleted = this.themes.delete(themeName);
    if (deleted) {
      themeEvents.emit("theme-removed", { name: themeName });
    }

    return deleted;
  }

  /**
   * 清除所有主题
   */
  clearThemes(): void {
    const currentTokens = this.getCurrentTokens();
    this.themes.clear();

    // 保留当前主题，避免样式丢失
    if (currentTokens) {
      this.themes.set(this.currentTheme, currentTokens);
    }

    themeEvents.emit("themes-cleared", {});
  }

  /**
   * 获取主题统计信息
   */
  getStats() {
    return {
      totalThemes: this.themes.size,
      currentTheme: this.currentTheme,
      themes: this.getThemeNames(),
      systemThemeEnabled: this.config.enableSystemTheme,
      storageEnabled: this.config.enableStorage,
    };
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    // 清理系统主题监听
    if (this.systemThemeMediaQuery) {
      this.systemThemeMediaQuery.removeEventListener("change", this.handleSystemThemeChange);
    }

    // 移除注入的样式
    if (this.injectedStyleElement && this.injectedStyleElement.parentNode) {
      this.injectedStyleElement.parentNode.removeChild(this.injectedStyleElement);
    }

    this.themes.clear();
  }

  /**
   * 应用主题
   */
  private applyTheme(themeName: string): void {
    const tokens = this.themes.get(themeName);
    if (!tokens) {
      return;
    }

    const css = this.generateThemeCSS(themeName);
    this.injectCSS(css);
  }

  /**
   * 生成CSS变量
   */
  private generateCSSVariables(tokens: ThemeTokens): string {
    const flattenTokens = this.flattenTokens(tokens);
    const cssVars: string[] = [];

    for (const [path, value] of Object.entries(flattenTokens)) {
      const cssVarName = `--${this.config.prefix}-${toKebabCase(path)}`;
      cssVars.push(`  ${cssVarName}: ${value};`);
    }

    return cssVars.join("\n");
  }

  /**
   * 扁平化令牌对象
   */
  private flattenTokens(
    tokens: Record<string, any>,
    prefix: string = "",
    result: Record<string, string> = {},
  ): Record<string, string> {
    for (const [key, value] of Object.entries(tokens)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        this.flattenTokens(value, path, result);
      } else if (typeof value === "string") {
        result[path] = value;
      }
    }

    return result;
  }

  /**
   * 注入CSS到页面
   */
  private injectCSS(css: string): void {
    if (!this.injectedStyleElement) {
      this.injectedStyleElement = document.createElement("style");
      this.injectedStyleElement.setAttribute("data-xh-theme", "variables");
      document.head.appendChild(this.injectedStyleElement);
    }

    this.injectedStyleElement.textContent = css;
  }

  /**
   * 获取系统主题偏好
   */
  private getSystemThemePreference(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  /**
   * 设置系统主题检测
   */
  private setupSystemThemeDetection(): void {
    if (!this.config.enableSystemTheme || typeof window === "undefined") {
      return;
    }

    this.systemThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.systemThemeMediaQuery.addEventListener("change", this.handleSystemThemeChange);
  }

  /**
   * 处理系统主题变化
   */
  private handleSystemThemeChange = (e: MediaQueryListEvent): void => {
    if (this.isSystemTheme()) {
      const systemTheme = e.matches ? "dark" : "light";
      if (this.hasTheme(systemTheme)) {
        this.setTheme(systemTheme);
      }
    }
  };

  /**
   * 加载存储的主题
   */
  private loadStoredTheme(): string | null {
    if (!this.config.enableStorage || typeof localStorage === "undefined") {
      return null;
    }

    try {
      return localStorage.getItem(this.config.storageKey);
    } catch {
      return null;
    }
  }

  /**
   * 存储主题到本地
   */
  private storeTheme(themeName: string): void {
    if (!this.config.enableStorage || typeof localStorage === "undefined") {
      return;
    }

    try {
      localStorage.setItem(this.config.storageKey, themeName);
    } catch {
      // 忽略存储错误
    }
  }
}

/**
 * 创建主题管理器
 */
export function createThemeManager(config?: Partial<ThemeManagerConfig>): ThemeManager {
  return new ThemeManager(config);
}

/**
 * 默认主题管理器实例
 */
export const defaultThemeManager = createThemeManager();

/**
 * 主题工具函数
 */
export const themeUtils = {
  /**
   * 创建浅色主题
   */
  createLightTheme(overrides: Partial<ThemeTokens> = {}): ThemeTokens {
    const baseTheme: ThemeTokens = {
      color: {
        primary: "#3b82f6",
        secondary: "#6366f1",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#06b6d4",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#1f2937",
        textSecondary: "#6b7280",
        border: "#e5e7eb",
        ...overrides.color,
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        ...overrides.fontSize,
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        ...overrides.spacing,
      },
      borderRadius: {
        none: "0",
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
        ...overrides.borderRadius,
      },
      shadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
        ...overrides.shadow,
      },
      zIndex: {
        dropdown: 1000,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
        ...overrides.zIndex,
      },
      transition: {
        fast: "150ms ease",
        normal: "300ms ease",
        slow: "500ms ease",
        ...overrides.transition,
      },
      breakpoint: {
        xs: "0px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        ...overrides.breakpoint,
      },
    };

    return deepMerge(baseTheme, overrides) as ThemeTokens;
  },

  /**
   * 创建深色主题
   */
  createDarkTheme(overrides: Partial<ThemeTokens> = {}): ThemeTokens {
    const baseTheme = this.createLightTheme({
      color: {
        primary: "#60a5fa",
        secondary: "#818cf8",
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f1f5f9",
        textSecondary: "#cbd5e1",
        border: "#334155",
        ...overrides.color,
      },
    });

    return deepMerge(baseTheme, overrides) as ThemeTokens;
  },

  /**
   * 创建主题预设
   */
  createThemePresets(): Record<string, ThemeTokens> {
    return {
      light: this.createLightTheme(),
      dark: this.createDarkTheme(),
      blue: this.createLightTheme({
        color: { primary: "#2563eb", secondary: "#3b82f6" },
      }),
      green: this.createLightTheme({
        color: { primary: "#059669", secondary: "#10b981" },
      }),
      purple: this.createLightTheme({
        color: { primary: "#7c3aed", secondary: "#8b5cf6" },
      }),
    };
  },

  /**
   * 验证主题令牌
   */
  validateTheme(tokens: ThemeTokens): boolean {
    const requiredKeys = [
      "color",
      "fontSize",
      "spacing",
      "borderRadius",
      "shadow",
      "zIndex",
      "transition",
      "breakpoint",
    ];

    for (const key of requiredKeys) {
      if (!(key in tokens) || typeof tokens[key as keyof ThemeTokens] !== "object") {
        return false;
      }
    }

    return true;
  },

  /**
   * 生成主题对比色
   */
  generateContrastColors(baseColor: string): Record<string, string> {
    // 简化的对比色生成（实际项目中可能需要更复杂的算法）
    return {
      50: baseColor + "0d", // 5% opacity
      100: baseColor + "1a", // 10% opacity
      200: baseColor + "33", // 20% opacity
      300: baseColor + "4d", // 30% opacity
      400: baseColor + "66", // 40% opacity
      500: baseColor, // base color
      600: baseColor + "cc", // darker
      700: baseColor + "99", // darker
      800: baseColor + "66", // darker
      900: baseColor + "33", // darkest
    };
  },
};
