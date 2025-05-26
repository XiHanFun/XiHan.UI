/**
 * 响应式样式系统
 * 基于 @xihan-ui/utils/dom 的响应式功能构建样式生成系统
 *
 * 架构分层：
 * - @utils/dom/responsive: DOM 检测层（检测状态、监听变化）
 * - @themes/css-in-js/responsive: 样式生成层（生成响应式样式对象）
 */

import {
  mediaQuery as domMediaQuery,
  container as domContainer,
  responsive as domResponsive,
  type Breakpoint as DomBreakpoint,
} from "@xihan-ui/utils";
import type { StyleObject } from "./types";

// 复用 @utils/dom 的断点类型和配置
export type Breakpoint = DomBreakpoint;

// 默认断点配置（与 @utils/dom 保持一致）
export const defaultBreakpoints = {
  xs: "0px",
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
  xxl: "1400px",
} as const;

/**
 * 响应式样式配置
 */
export interface ResponsiveStyleConfig {
  breakpoints?: Record<string, string>;
  containerQueries?: boolean;
  mobileFirst?: boolean;
}

/**
 * 增强的响应式管理器
 * 基于 @utils/dom 的功能，扩展样式生成能力
 */
export class ResponsiveManager {
  private breakpoints: Record<string, string>;
  private containerQueries: boolean;
  private mobileFirst: boolean;

  constructor(config: ResponsiveStyleConfig = {}) {
    this.breakpoints = config.breakpoints || defaultBreakpoints;
    this.containerQueries = config.containerQueries ?? true;
    this.mobileFirst = config.mobileFirst ?? true;
  }

  /**
   * 生成媒体查询字符串
   * 优先使用 @utils/dom 的实现，扩展支持 "only" 模式
   */
  getMediaQuery(breakpoint: string, direction: "up" | "down" | "only" = "up"): string {
    // 如果是标准断点，优先使用 DOM 工具的实现
    if (this.isStandardBreakpoint(breakpoint)) {
      switch (direction) {
        case "up":
          return domMediaQuery.up(breakpoint as Breakpoint).replace("@media ", "");
        case "down":
          return domMediaQuery.down(breakpoint as Breakpoint).replace("@media ", "");
        case "only":
          const nextBreakpoint = this.getNextStandardBreakpoint(breakpoint);
          if (nextBreakpoint) {
            return domMediaQuery.between(breakpoint as Breakpoint, nextBreakpoint as Breakpoint).replace("@media ", "");
          }
          return domMediaQuery.up(breakpoint as Breakpoint).replace("@media ", "");
        default:
          return domMediaQuery.up(breakpoint as Breakpoint).replace("@media ", "");
      }
    }

    // 自定义断点的处理逻辑
    return this.getCustomMediaQuery(breakpoint, direction);
  }

  /**
   * 检查是否为标准断点
   */
  private isStandardBreakpoint(breakpoint: string): breakpoint is Breakpoint {
    return breakpoint in defaultBreakpoints;
  }

  /**
   * 获取下一个标准断点
   */
  private getNextStandardBreakpoint(current: string): Breakpoint | null {
    const breakpoints = Object.keys(defaultBreakpoints) as Breakpoint[];
    const currentIndex = breakpoints.indexOf(current as Breakpoint);

    if (currentIndex >= 0 && currentIndex < breakpoints.length - 1) {
      return breakpoints[currentIndex + 1];
    }
    return null;
  }

  /**
   * 处理自定义断点的媒体查询
   */
  private getCustomMediaQuery(breakpoint: string, direction: "up" | "down" | "only"): string {
    const breakpointValue = this.breakpoints[breakpoint];
    if (!breakpointValue) {
      throw new Error(`Breakpoint "${breakpoint}" not found`);
    }

    const value = parseInt(breakpointValue);

    switch (direction) {
      case "up":
        return `(min-width: ${value}px)`;
      case "down":
        const nextBreakpoint = this.getNextCustomBreakpoint(breakpoint);
        if (nextBreakpoint) {
          const nextValue = parseInt(this.breakpoints[nextBreakpoint]);
          return `(max-width: ${nextValue - 0.02}px)`;
        }
        return `(max-width: 9999px)`;
      case "only":
        const next = this.getNextCustomBreakpoint(breakpoint);
        if (next) {
          const nextValue = parseInt(this.breakpoints[next]);
          return `(min-width: ${value}px) and (max-width: ${nextValue - 0.02}px)`;
        }
        return `(min-width: ${value}px)`;
      default:
        return `(min-width: ${value}px)`;
    }
  }

  /**
   * 获取下一个自定义断点
   */
  private getNextCustomBreakpoint(current: string): string | null {
    const breakpointEntries = Object.entries(this.breakpoints).sort(([, a], [, b]) => parseInt(a) - parseInt(b));
    const currentIndex = breakpointEntries.findIndex(([key]) => key === current);

    if (currentIndex >= 0 && currentIndex < breakpointEntries.length - 1) {
      return breakpointEntries[currentIndex + 1][0];
    }
    return null;
  }

  /**
   * 检查断点是否匹配
   * 优先使用 @utils/dom 的实现
   */
  matches(breakpoint: string, direction: "up" | "down" | "only" = "up"): boolean {
    if (typeof window === "undefined") return false;

    // 如果是标准断点且是 up 方向，直接使用 DOM 工具
    if (this.isStandardBreakpoint(breakpoint) && direction === "up") {
      return domMediaQuery.matches(breakpoint as Breakpoint);
    }

    // 其他情况使用自定义逻辑
    const query = this.getMediaQuery(breakpoint, direction);
    return window.matchMedia(query).matches;
  }

  /**
   * 监听断点变化
   * 优先使用 @utils/dom 的实现
   */
  onChange(
    breakpoint: string,
    callback: (matches: boolean) => void,
    direction: "up" | "down" | "only" = "up",
  ): () => void {
    if (typeof window === "undefined") {
      return () => {};
    }

    // 如果是标准断点且是 up 方向，直接使用 DOM 工具
    if (this.isStandardBreakpoint(breakpoint) && direction === "up") {
      return domMediaQuery.onChange(breakpoint as Breakpoint, callback);
    }

    // 其他情况使用自定义逻辑
    const query = this.getMediaQuery(breakpoint, direction);
    const mql = window.matchMedia(query);

    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    mql.addEventListener("change", handler);

    // 立即调用一次
    callback(mql.matches);

    return () => {
      mql.removeEventListener("change", handler);
    };
  }

  /**
   * 获取当前匹配的断点
   * 直接使用 @utils/dom 的响应式值选择器
   */
  getCurrentBreakpoint(): string {
    const currentBreakpoint = domResponsive({
      xs: "xs" as const,
      sm: "sm" as const,
      md: "md" as const,
      lg: "lg" as const,
      xl: "xl" as const,
      xxl: "xxl" as const,
    });

    return currentBreakpoint || "xs";
  }

  /**
   * 获取所有断点
   */
  getBreakpoints(): Record<string, string> {
    return { ...this.breakpoints };
  }

  /**
   * 添加断点
   */
  addBreakpoint(name: string, value: string): void {
    this.breakpoints[name] = value;
  }

  /**
   * 移除断点
   */
  removeBreakpoint(name: string): void {
    delete this.breakpoints[name];
  }

  /**
   * 检查容器是否匹配指定宽度
   * 直接使用 @utils/dom 的容器查询功能
   */
  containerMatches(element: HTMLElement, minWidth: number): boolean {
    return domContainer.matches(element, minWidth);
  }

  /**
   * 监听容器宽度变化
   * 直接使用 @utils/dom 的容器观察功能
   */
  observeContainer(element: HTMLElement, callback: (entry: ResizeObserverEntry) => void): () => void {
    return domContainer.observe(element, callback);
  }
}

// 全局响应式管理器实例
export const responsiveManager = new ResponsiveManager();

/**
 * 媒体查询工具函数
 * 核心功能：将 DOM 层的媒体查询转换为样式对象
 */
export function mediaQuery(
  breakpoint: string,
  styles: StyleObject,
  direction: "up" | "down" | "only" = "up",
): StyleObject {
  const query = responsiveManager.getMediaQuery(breakpoint, direction);
  return {
    [`@media ${query}`]: styles,
  } as StyleObject;
}

/**
 * 容器查询工具函数
 * 生成容器查询样式对象
 */
export function containerQuery(condition: string, styles: StyleObject): StyleObject {
  return {
    [`@container ${condition}`]: styles,
  } as StyleObject;
}

/**
 * 响应式样式生成器
 * 核心功能：将响应式值映射转换为包含媒体查询的样式对象
 */
export function responsive<T>(values: Partial<Record<Breakpoint, T>>): StyleObject {
  const styles: StyleObject = {};

  Object.entries(values).forEach(([breakpoint, value]) => {
    if (value !== undefined) {
      const query = responsiveManager.getMediaQuery(breakpoint, "up");
      (styles as any)[`@media ${query}`] = value;
    }
  });

  return styles;
}

/**
 * 创建响应式样式
 */
export function createResponsiveStyles(
  baseStyles: StyleObject,
  responsiveStyles: Partial<Record<Breakpoint, StyleObject>>,
): StyleObject {
  const result: StyleObject = { ...baseStyles };

  Object.entries(responsiveStyles).forEach(([breakpoint, styles]) => {
    if (styles) {
      const query = responsiveManager.getMediaQuery(breakpoint, "up");
      (result as any)[`@media ${query}`] = styles;
    }
  });

  return result;
}

/**
 * 响应式值选择器
 * 直接使用 @utils/dom 的响应式值选择功能
 */
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  if (typeof window === "undefined") {
    // SSR 环境下返回最小断点的值
    const sortedBreakpoints = Object.keys(defaultBreakpoints).sort(
      (a, b) => parseInt(defaultBreakpoints[a as Breakpoint]) - parseInt(defaultBreakpoints[b as Breakpoint]),
    );

    for (const breakpoint of sortedBreakpoints) {
      if (values[breakpoint as Breakpoint] !== undefined) {
        return values[breakpoint as Breakpoint];
      }
    }
    return undefined;
  }

  // 直接使用 DOM 工具的响应式值选择器
  return domResponsive(values);
}

/**
 * 创建响应式管理器
 */
export function createResponsiveManager(config?: ResponsiveStyleConfig): ResponsiveManager {
  return new ResponsiveManager(config);
}

/**
 * 响应式工具函数集合
 * 基于 @utils/dom 的功能，提供样式层面的设备类型检测
 */
export const responsiveUtils = {
  /**
   * 检查是否为移动设备
   * 基于 @utils/dom 的断点检测
   */
  isMobile(): boolean {
    return !domMediaQuery.matches("md");
  },

  /**
   * 检查是否为平板设备
   * 基于 @utils/dom 的断点检测
   */
  isTablet(): boolean {
    return domMediaQuery.matches("md") && !domMediaQuery.matches("lg");
  },

  /**
   * 检查是否为桌面设备
   * 基于 @utils/dom 的断点检测
   */
  isDesktop(): boolean {
    return domMediaQuery.matches("lg");
  },

  /**
   * 获取设备类型
   */
  getDeviceType(): "mobile" | "tablet" | "desktop" {
    if (this.isDesktop()) return "desktop";
    if (this.isTablet()) return "tablet";
    return "mobile";
  },

  /**
   * 监听设备类型变化
   * 基于 @utils/dom 的断点监听
   */
  onDeviceTypeChange(callback: (deviceType: "mobile" | "tablet" | "desktop") => void): () => void {
    const unsubscribers: Array<() => void> = [];

    // 监听关键断点，使用 DOM 工具的监听器
    unsubscribers.push(
      domMediaQuery.onChange("md", () => {
        callback(this.getDeviceType());
      }),
      domMediaQuery.onChange("lg", () => {
        callback(this.getDeviceType());
      }),
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  },
};

/**
 * 预设的响应式样式模式
 * 这是样式层独有的功能，基于 DOM 层的断点系统构建
 */
export const responsivePresets = {
  /**
   * 隐藏在指定断点以下
   */
  hideBelow(breakpoint: Breakpoint): StyleObject {
    return mediaQuery(breakpoint, { display: "none" }, "down");
  },

  /**
   * 隐藏在指定断点以上
   */
  hideAbove(breakpoint: Breakpoint): StyleObject {
    return mediaQuery(breakpoint, { display: "none" }, "up");
  },

  /**
   * 只在指定断点显示
   */
  showOnly(breakpoint: Breakpoint): StyleObject {
    return mediaQuery(breakpoint, { display: "block" }, "only");
  },

  /**
   * 响应式文字大小
   */
  responsiveText(): StyleObject {
    return responsive({
      xs: { fontSize: "14px" },
      sm: { fontSize: "16px" },
      md: { fontSize: "18px" },
      lg: { fontSize: "20px" },
      xl: { fontSize: "22px" },
    });
  },

  /**
   * 响应式间距
   */
  responsiveSpacing(): StyleObject {
    return responsive({
      xs: { padding: "8px" },
      sm: { padding: "12px" },
      md: { padding: "16px" },
      lg: { padding: "20px" },
      xl: { padding: "24px" },
    });
  },

  /**
   * 响应式网格
   */
  responsiveGrid(columns: Partial<Record<Breakpoint, number>>): StyleObject {
    const styles: StyleObject = {
      display: "grid",
      gap: "1rem",
    };

    Object.entries(columns).forEach(([breakpoint, cols]) => {
      if (cols) {
        const query = responsiveManager.getMediaQuery(breakpoint, "up");
        styles[`@media ${query}`] = {
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        };
      }
    });

    return styles;
  },

  /**
   * 响应式 Flexbox
   */
  responsiveFlex(directions: Partial<Record<Breakpoint, "row" | "column">>): StyleObject {
    const styles: StyleObject = {
      display: "flex",
    };

    Object.entries(directions).forEach(([breakpoint, direction]) => {
      if (direction) {
        const query = responsiveManager.getMediaQuery(breakpoint, "up");
        styles[`@media ${query}`] = {
          flexDirection: direction,
        };
      }
    });

    return styles;
  },
};

/**
 * 使用示例和最佳实践
 *
 * @example
 * // 1. 基础响应式样式生成
 * const cardStyles = responsive({
 *   sm: { width: '100%' },
 *   md: { width: '50%' },
 *   lg: { width: '33.33%' }
 * });
 *
 * @example
 * // 2. 媒体查询样式包装
 * const largeScreenStyles = mediaQuery('lg', {
 *   fontSize: '18px',
 *   padding: '20px'
 * });
 *
 * @example
 * // 3. 设备类型检测（基于 @utils/dom）
 * if (responsiveUtils.isMobile()) {
 *   // 移动端特殊处理
 * }
 *
 * @example
 * // 4. 响应式值选择（基于 @utils/dom）
 * const columns = useResponsiveValue({
 *   sm: 1,
 *   md: 2,
 *   lg: 3
 * }); // 返回当前匹配的数值
 *
 * @example
 * // 5. 容器查询（基于 @utils/dom）
 * const containerStyles = containerQuery('(min-width: 500px)', {
 *   display: 'grid',
 *   gridTemplateColumns: 'repeat(2, 1fr)'
 * });
 *
 * @example
 * // 6. 预设样式模式
 * const hideOnMobile = responsivePresets.hideBelow('md');
 * const responsiveGrid = responsivePresets.responsiveGrid({
 *   sm: 1,
 *   md: 2,
 *   lg: 3
 * });
 */
