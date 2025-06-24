import { ref, computed, watch } from "vue";
import type { Ref, ComputedRef } from "vue";
import type { ThemeTokens } from "@xihan-ui/themes";
import { createThemeManager } from "@xihan-ui/themes";

export interface UseThemeOptions {
  /** 主题前缀 */
  prefix?: string;
  /** 默认主题 */
  defaultTheme?: string;
  /** 是否启用系统主题 */
  enableSystemTheme?: boolean;
  /** 是否启用主题存储 */
  enableStorage?: boolean;
  /** 存储键名 */
  storageKey?: string;
  /** CSS 变量作用域 */
  cssVariableScope?: "root" | "body" | string;
}

export interface UseThemeReturn<T extends ThemeTokens = ThemeTokens> {
  /** 当前主题名 */
  currentTheme: Ref<string>;
  /** 当前主题配置 */
  currentTokens: ComputedRef<T | undefined>;
  /** 所有主题名列表 */
  themeNames: ComputedRef<string[]>;
  /** 切换主题 */
  setTheme: (themeName: string) => void;
  /** 注册主题 */
  registerTheme: (name: string, tokens: T) => void;
  /** 注册多个主题 */
  registerThemes: (themes: Record<string, T>) => void;
  /** 获取主题配置 */
  getThemeTokens: (themeName: string) => T | undefined;
  /** 使用系统主题 */
  setSystemTheme: () => void;
  /** 是否为系统主题 */
  isSystemTheme: () => boolean;
  /** 扩展主题 */
  extendTheme: (baseName: string, newName: string, overrides: Partial<T>) => void;
  /** 移除主题 */
  removeTheme: (themeName: string) => boolean;
  /** 清空所有主题 */
  clearThemes: () => void;
}

export function useTheme<T extends ThemeTokens = ThemeTokens>(options: UseThemeOptions = {}): UseThemeReturn<T> {
  const themeManager = createThemeManager(options);

  const currentTheme = ref(themeManager.getCurrentTheme());
  const currentTokens = computed(() => themeManager.getCurrentTokens() as T | undefined);
  const themeNames = computed(() => themeManager.getThemeNames());

  // 监听主题变化
  watch(currentTheme, newTheme => {
    themeManager.setTheme(newTheme);
  });

  return {
    currentTheme,
    currentTokens,
    themeNames,
    setTheme: (themeName: string) => {
      currentTheme.value = themeName;
    },
    registerTheme: (name: string, tokens: T) => {
      themeManager.registerTheme(name, tokens);
    },
    registerThemes: (themes: Record<string, T>) => {
      themeManager.registerThemes(themes);
    },
    getThemeTokens: (themeName: string) => {
      return themeManager.getThemeTokens(themeName) as T | undefined;
    },
    setSystemTheme: () => {
      themeManager.setSystemTheme();
    },
    isSystemTheme: () => {
      return themeManager.isSystemTheme();
    },
    extendTheme: (baseName: string, newName: string, overrides: Partial<T>) => {
      themeManager.extendTheme(baseName, newName, overrides);
    },
    removeTheme: (themeName: string) => {
      return themeManager.removeTheme(themeName);
    },
    clearThemes: () => {
      themeManager.clearThemes();
    },
  };
}
