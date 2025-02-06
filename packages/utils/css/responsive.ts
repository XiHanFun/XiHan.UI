/**
 * 响应式工具
 */

// 默认断点配置
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

type Breakpoint = keyof typeof breakpoints;

// 媒体查询工具
export const mediaQuery = {
  /**
   * 生成媒体查询字符串
   */
  up(breakpoint: Breakpoint): string {
    return `@media (min-width: ${breakpoints[breakpoint]}px)`;
  },

  down(breakpoint: Breakpoint): string {
    const next = Object.entries(breakpoints).find(([_, value]) => value > breakpoints[breakpoint]);
    return next ? `@media (max-width: ${next[1] - 0.02}px)` : "";
  },

  between(start: Breakpoint, end: Breakpoint): string {
    return `@media (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 0.02}px)`;
  },

  /**
   * 检查是否匹配断点
   */
  matches(breakpoint: Breakpoint): boolean {
    return window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`).matches;
  },

  /**
   * 监听断点变化
   */
  onChange(breakpoint: Breakpoint, callback: (matches: boolean) => void): () => void {
    const mql = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  },
};

/**
 * 响应式值选择器
 */
export function responsive<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const sorted = Object.entries(breakpoints).sort((a, b) => b[1] - a[1]);
  for (const [key, width] of sorted) {
    if (window.innerWidth >= width && key in values) {
      return values[key as Breakpoint];
    }
  }
  return undefined;
}

/**
 * 响应式容器查询
 */
export const container = {
  /**
   * 检查元素是否符合指定宽度条件
   */
  matches(element: HTMLElement, minWidth: number): boolean {
    return element.getBoundingClientRect().width >= minWidth;
  },

  /**
   * 监听元素宽度变化
   */
  observe(element: HTMLElement, callback: (entry: ResizeObserverEntry) => void): () => void {
    const observer = new ResizeObserver(entries => {
      callback(entries[0]);
    });
    observer.observe(element);
    return () => observer.disconnect();
  },
};
