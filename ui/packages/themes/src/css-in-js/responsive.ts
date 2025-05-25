import type { StyleObject } from "./types";

// 默认断点配置
export const defaultBreakpoints = {
  xs: "0px",
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
  xxl: "1400px",
} as const;

export type Breakpoint = keyof typeof defaultBreakpoints;

/**
 * 响应式断点管理器
 */
export class ResponsiveManager {
  private breakpoints: Record<string, string>;

  constructor(breakpoints: Record<string, string> = defaultBreakpoints) {
    this.breakpoints = breakpoints;
  }

  /**
   * 获取断点值
   * @param breakpoint 断点名称
   * @returns 断点值
   */
  getBreakpoint(breakpoint: string): string {
    return this.breakpoints[breakpoint] || "0px";
  }

  /**
   * 设置断点值
   * @param breakpoint 断点名称
   * @param value 断点值
   */
  setBreakpoint(breakpoint: string, value: string): void {
    this.breakpoints[breakpoint] = value;
  }

  /**
   * 获取所有断点
   * @returns 所有断点
   */
  getAllBreakpoints(): Record<string, string> {
    return { ...this.breakpoints };
  }

  /**
   * 生成向上媒体查询
   * @param breakpoint 断点名称
   * @returns 媒体查询字符串
   */
  up(breakpoint: string): string {
    const value = this.getBreakpoint(breakpoint);
    return `@media (min-width: ${value})`;
  }

  /**
   * 生成向下媒体查询
   * @param breakpoint 断点名称
   * @returns 媒体查询字符串
   */
  down(breakpoint: string): string {
    const breakpointEntries = Object.entries(this.breakpoints);
    const currentIndex = breakpointEntries.findIndex(([key]) => key === breakpoint);

    if (currentIndex === -1 || currentIndex === breakpointEntries.length - 1) {
      return "";
    }

    const nextBreakpoint = breakpointEntries[currentIndex + 1][1];
    const maxWidth = parseFloat(nextBreakpoint) - 0.02;
    return `@media (max-width: ${maxWidth}px)`;
  }

  /**
   * 生成区间媒体查询
   * @param start 开始断点
   * @param end 结束断点
   * @returns 媒体查询字符串
   */
  between(start: string, end: string): string {
    const startValue = this.getBreakpoint(start);
    const endValue = this.getBreakpoint(end);
    const maxWidth = parseFloat(endValue) - 0.02;
    return `@media (min-width: ${startValue}) and (max-width: ${maxWidth}px)`;
  }

  /**
   * 生成仅在指定断点的媒体查询
   * @param breakpoint 断点名称
   * @returns 媒体查询字符串
   */
  only(breakpoint: string): string {
    const breakpointEntries = Object.entries(this.breakpoints);
    const currentIndex = breakpointEntries.findIndex(([key]) => key === breakpoint);

    if (currentIndex === -1) return "";

    const currentValue = breakpointEntries[currentIndex][1];

    if (currentIndex === breakpointEntries.length - 1) {
      // 最后一个断点，只需要 min-width
      return `@media (min-width: ${currentValue})`;
    }

    const nextValue = breakpointEntries[currentIndex + 1][1];
    const maxWidth = parseFloat(nextValue) - 0.02;
    return `@media (min-width: ${currentValue}) and (max-width: ${maxWidth}px)`;
  }

  /**
   * 检查当前是否匹配指定断点
   * @param breakpoint 断点名称
   * @returns 是否匹配
   */
  matches(breakpoint: string): boolean {
    if (typeof window === "undefined") return false;

    const value = this.getBreakpoint(breakpoint);
    return window.matchMedia(`(min-width: ${value})`).matches;
  }

  /**
   * 监听断点变化
   * @param breakpoint 断点名称
   * @param callback 回调函数
   * @returns 取消监听函数
   */
  onChange(breakpoint: string, callback: (matches: boolean) => void): () => void {
    if (typeof window === "undefined") {
      return () => {};
    }

    const value = this.getBreakpoint(breakpoint);
    const mql = window.matchMedia(`(min-width: ${value})`);
    const handler = (e: MediaQueryListEvent) => callback(e.matches);

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }
}

/**
 * 默认响应式管理器实例
 */
export const responsiveManager = new ResponsiveManager();

/**
 * 媒体查询工具函数
 */
export const mediaQuery = {
  /**
   * 生成向上媒体查询
   * @param breakpoint 断点名称或值
   * @returns 媒体查询字符串
   */
  up(breakpoint: string): string {
    if (breakpoint in defaultBreakpoints) {
      return responsiveManager.up(breakpoint);
    }
    return `@media (min-width: ${breakpoint})`;
  },

  /**
   * 生成向下媒体查询
   * @param breakpoint 断点名称或值
   * @returns 媒体查询字符串
   */
  down(breakpoint: string): string {
    if (breakpoint in defaultBreakpoints) {
      return responsiveManager.down(breakpoint);
    }
    const maxWidth = parseFloat(breakpoint) - 0.02;
    return `@media (max-width: ${maxWidth}px)`;
  },

  /**
   * 生成区间媒体查询
   * @param start 开始断点
   * @param end 结束断点
   * @returns 媒体查询字符串
   */
  between(start: string, end: string): string {
    return responsiveManager.between(start, end);
  },

  /**
   * 生成仅在指定断点的媒体查询
   * @param breakpoint 断点名称
   * @returns 媒体查询字符串
   */
  only(breakpoint: string): string {
    return responsiveManager.only(breakpoint);
  },

  /**
   * 检查是否匹配断点
   * @param breakpoint 断点名称或值
   * @returns 是否匹配
   */
  matches(breakpoint: string): boolean {
    if (breakpoint in defaultBreakpoints) {
      return responsiveManager.matches(breakpoint);
    }

    if (typeof window === "undefined") return false;
    return window.matchMedia(`(min-width: ${breakpoint})`).matches;
  },

  /**
   * 监听断点变化
   * @param breakpoint 断点名称或值
   * @param callback 回调函数
   * @returns 取消监听函数
   */
  onChange(breakpoint: string, callback: (matches: boolean) => void): () => void {
    if (breakpoint in defaultBreakpoints) {
      return responsiveManager.onChange(breakpoint, callback);
    }

    if (typeof window === "undefined") {
      return () => {};
    }

    const mql = window.matchMedia(`(min-width: ${breakpoint})`);
    const handler = (e: MediaQueryListEvent) => callback(e.matches);

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  },
};

/**
 * 容器查询工具
 */
export const containerQuery = {
  /**
   * 检查元素是否符合指定宽度条件
   * @param element 元素
   * @param minWidth 最小宽度
   * @returns 是否符合条件
   */
  matches(element: HTMLElement, minWidth: number): boolean {
    return element.getBoundingClientRect().width >= minWidth;
  },

  /**
   * 监听元素尺寸变化
   * @param element 元素
   * @param callback 回调函数
   * @returns 取消监听函数
   */
  observe(element: HTMLElement, callback: (entry: ResizeObserverEntry) => void): () => void {
    if (typeof ResizeObserver === "undefined") {
      console.warn("ResizeObserver is not supported");
      return () => {};
    }

    const observer = new ResizeObserver(entries => {
      callback(entries[0]);
    });

    observer.observe(element);
    return () => observer.disconnect();
  },

  /**
   * 生成容器查询样式
   * @param condition 查询条件
   * @param styles 样式对象
   * @returns 样式对象
   */
  query(condition: string, styles: StyleObject): StyleObject {
    return {
      [`@container ${condition}`]: styles,
    } as StyleObject;
  },
};

/**
 * 响应式值选择器
 * @param values 断点值映射
 * @returns 当前断点对应的值
 */
export function responsive<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  if (typeof window === "undefined") {
    // SSR 环境下返回默认值
    return values.md || values.lg || values.sm || values.xs;
  }

  const breakpointEntries = Object.entries(defaultBreakpoints);
  const sortedBreakpoints = breakpointEntries.sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));

  for (const [key, width] of sortedBreakpoints) {
    if (window.innerWidth >= parseFloat(width) && key in values) {
      return values[key as Breakpoint];
    }
  }

  return undefined;
}

/**
 * 创建响应式样式对象
 * @param styles 断点样式映射
 * @returns 样式对象
 */
export function createResponsiveStyles(styles: Partial<Record<Breakpoint, StyleObject>>): StyleObject {
  const result: StyleObject = {};

  Object.entries(styles).forEach(([breakpoint, style]) => {
    if (breakpoint === "xs") {
      // xs 断点作为基础样式
      Object.assign(result, style);
    } else {
      // 其他断点使用媒体查询
      const mediaQueryStr = mediaQuery.up(breakpoint);
      result[mediaQueryStr] = style;
    }
  });

  return result;
}

/**
 * 创建自定义响应式管理器
 * @param breakpoints 自定义断点配置
 * @returns 响应式管理器实例
 */
export function createResponsiveManager(breakpoints: Record<string, string>): ResponsiveManager {
  return new ResponsiveManager(breakpoints);
}
