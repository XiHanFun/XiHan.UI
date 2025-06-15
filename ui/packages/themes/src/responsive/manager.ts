/**
 * 响应式管理器
 * 统一处理断点、媒体查询和响应式样式
 */

import type { Breakpoints, ResponsiveValue, MediaQueryConfig, StyleObject } from "../foundation/types";
import { createEventEmitter } from "../foundation/events";
import { debounce, generateId, deepClone, mergeStyleObjects } from "../foundation/utils";
import { globalEvents } from "../foundation/events";

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
  breakpoints: Breakpoints;
  defaultBreakpoint: keyof Breakpoints;
  enableContainerQueries: boolean;
  enableOrientationQueries: boolean;
  enablePrintQueries: boolean;
}

/**
 * 媒体查询监听器
 */
export interface MediaQueryListener {
  query: string;
  handler: (matches: boolean) => void;
  mediaQueryList: MediaQueryList;
}

/**
 * 断点变化事件
 */
export interface BreakpointChangeEvent {
  current: keyof Breakpoints;
  previous: keyof Breakpoints;
  width: number;
  height: number;
}

/**
 * 响应式事件映射
 */
interface ResponsiveEventMap {
  "breakpoint-changed": BreakpointChangeEvent;
}

/**
 * 全局响应式事件发射器
 */
const responsiveEvents = createEventEmitter<ResponsiveEventMap>();

/**
 * 响应式管理器实现
 */
export class ResponsiveManager {
  private config: Required<ResponsiveConfig>;
  private listeners = new Map<string, MediaQueryListener>();
  private currentBreakpoint: keyof Breakpoints;
  private resizeObserver?: ResizeObserver;

  // 默认断点配置
  private static readonly DEFAULT_BREAKPOINTS: Breakpoints = {
    xs: "0px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  };

  constructor(config: Partial<ResponsiveConfig> = {}) {
    this.config = {
      breakpoints: ResponsiveManager.DEFAULT_BREAKPOINTS,
      defaultBreakpoint: "md",
      enableContainerQueries: true,
      enableOrientationQueries: true,
      enablePrintQueries: true,
      ...config,
    };

    this.currentBreakpoint = this.config.defaultBreakpoint;
    this.setupBreakpointMonitoring();
  }

  /**
   * 获取当前断点
   */
  getCurrentBreakpoint(): keyof Breakpoints {
    if (typeof window === "undefined") {
      return this.config.defaultBreakpoint;
    }

    const width = window.innerWidth;
    const breakpointEntries = Object.entries(this.config.breakpoints)
      .map(([name, value]) => [name, parseInt(value, 10)] as const)
      .sort(([, a], [, b]) => b - a); // 从大到小排序

    for (const [name, minWidth] of breakpointEntries) {
      if (width >= minWidth) {
        return name as keyof Breakpoints;
      }
    }

    return this.config.defaultBreakpoint;
  }

  /**
   * 检查断点是否匹配
   */
  matches(breakpoint: keyof Breakpoints, direction: "up" | "down" | "only" = "up"): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    const query = this.getMediaQuery(breakpoint, direction);
    return window.matchMedia(query).matches;
  }

  /**
   * 生成媒体查询字符串
   */
  getMediaQuery(breakpoint: keyof Breakpoints, direction: "up" | "down" | "only" = "up"): string {
    const breakpointValue = this.config.breakpoints[breakpoint];
    const minWidth = parseInt(breakpointValue, 10);

    switch (direction) {
      case "up":
        return `(min-width: ${minWidth}px)`;

      case "down": {
        const nextBreakpoint = this.getNextBreakpoint(breakpoint);
        if (nextBreakpoint) {
          const nextValue = parseInt(this.config.breakpoints[nextBreakpoint], 10);
          return `(max-width: ${nextValue - 1}px)`;
        }
        return `(max-width: ${minWidth - 1}px)`;
      }

      case "only": {
        const nextBreakpoint = this.getNextBreakpoint(breakpoint);
        if (nextBreakpoint) {
          const nextValue = parseInt(this.config.breakpoints[nextBreakpoint], 10);
          return `(min-width: ${minWidth}px) and (max-width: ${nextValue - 1}px)`;
        }
        return `(min-width: ${minWidth}px)`;
      }

      default:
        return `(min-width: ${minWidth}px)`;
    }
  }

  /**
   * 监听断点变化
   */
  onBreakpointChange(callback: (event: BreakpointChangeEvent) => void): () => void {
    return responsiveEvents.on("breakpoint-changed", callback);
  }

  /**
   * 监听媒体查询变化
   */
  onMediaQuery(query: string, callback: (matches: boolean) => void, immediate: boolean = true): () => void {
    if (typeof window === "undefined") {
      return () => {};
    }

    const listenerId = `${query}-${Date.now()}`;
    const mediaQueryList = window.matchMedia(query);

    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches);
    };

    const listener: MediaQueryListener = {
      query,
      handler: callback,
      mediaQueryList,
    };

    mediaQueryList.addEventListener("change", handler);
    this.listeners.set(listenerId, listener);

    // 立即执行一次
    if (immediate) {
      callback(mediaQueryList.matches);
    }

    return () => {
      mediaQueryList.removeEventListener("change", handler);
      this.listeners.delete(listenerId);
    };
  }

  /**
   * 解析响应式值
   */
  resolveResponsiveValue<T>(value: ResponsiveValue<T>): T {
    if (typeof value !== "object" || value === null) {
      return value;
    }

    const breakpoint = this.getCurrentBreakpoint();
    const breakpoints = Object.keys(this.config.breakpoints) as Array<keyof Breakpoints>;
    const currentIndex = breakpoints.indexOf(breakpoint);

    // 从当前断点开始向上查找
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpoints[i];
      if (bp in value && typeof value === "object") {
        return deepClone((value as Record<keyof Breakpoints, T>)[bp]);
      }
    }

    // 如果没有找到匹配的值，返回默认值
    return deepClone((value as Record<keyof Breakpoints, T>)[breakpoints[0]]);
  }

  /**
   * 创建响应式样式
   */
  createResponsiveStyles(values: ResponsiveValue<StyleObject>): StyleObject {
    if (typeof values !== "object" || values === null) {
      return {};
    }

    const result: StyleObject = {};
    const breakpoints = Object.entries(this.config.breakpoints);

    for (const [breakpoint, query] of breakpoints) {
      if (breakpoint in values) {
        const styles = values[breakpoint as keyof typeof values];
        if (styles) {
          result[`@media ${query}`] = deepClone(styles);
        }
      }
    }

    return mergeStyleObjects(result);
  }

  /**
   * 容器查询支持
   */
  createContainerQuery(condition: string, styles: StyleObject): StyleObject {
    if (!this.config.enableContainerQueries) {
      return styles;
    }

    return {
      [`@container ${condition}`]: styles,
    };
  }

  /**
   * 方向查询
   */
  createOrientationQuery(orientation: "portrait" | "landscape", styles: StyleObject): StyleObject {
    if (!this.config.enableOrientationQueries) {
      return styles;
    }

    return {
      [`@media (orientation: ${orientation})`]: styles,
    };
  }

  /**
   * 打印样式
   */
  createPrintStyles(styles: StyleObject): StyleObject {
    if (!this.config.enablePrintQueries) {
      return styles;
    }

    return {
      "@media print": styles,
    };
  }

  /**
   * 深色模式查询
   */
  createDarkModeQuery(styles: StyleObject): StyleObject {
    return {
      "@media (prefers-color-scheme: dark)": styles,
    };
  }

  /**
   * 减少动画查询
   */
  createReducedMotionQuery(styles: StyleObject): StyleObject {
    return {
      "@media (prefers-reduced-motion: reduce)": styles,
    };
  }

  /**
   * 高对比度查询
   */
  createHighContrastQuery(styles: StyleObject): StyleObject {
    return {
      "@media (prefers-contrast: high)": styles,
    };
  }

  /**
   * 触摸设备查询
   */
  createTouchQuery(styles: StyleObject): StyleObject {
    return {
      "@media (hover: none) and (pointer: coarse)": styles,
    };
  }

  /**
   * 设备像素比查询
   */
  createPixelRatioQuery(ratio: number, styles: StyleObject): StyleObject {
    return {
      [`@media (-webkit-min-device-pixel-ratio: ${ratio}), (min-resolution: ${ratio * 96}dpi)`]: styles,
    };
  }

  /**
   * 监听容器大小变化
   */
  observeContainer(element: HTMLElement, callback: (entry: ResizeObserverEntry) => void): () => void {
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const elementCallback = (entry.target as any).__resizeCallback;
          if (elementCallback) {
            elementCallback(entry);
          }
        }
      });
    }

    (element as any).__resizeCallback = callback;
    this.resizeObserver.observe(element);

    return () => {
      if (this.resizeObserver) {
        this.resizeObserver.unobserve(element);
        delete (element as any).__resizeCallback;
      }
    };
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    if (typeof window === "undefined") {
      return {
        type: "unknown" as const,
        width: 0,
        height: 0,
        pixelRatio: 1,
        orientation: "unknown" as const,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    let type: "mobile" | "tablet" | "desktop";
    if (width < 768) {
      type = "mobile";
    } else if (width < 1024) {
      type = "tablet";
    } else {
      type = "desktop";
    }

    const orientation = width > height ? "landscape" : "portrait";

    return {
      type,
      width,
      height,
      pixelRatio,
      orientation,
    };
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    // 清理所有媒体查询监听器
    for (const [id, listener] of this.listeners) {
      listener.mediaQueryList.removeEventListener("change", listener.handler as any);
    }
    this.listeners.clear();

    // 清理窗口监听器
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.handleResize);
    }

    // 清理 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  /**
   * 获取下一个断点
   */
  private getNextBreakpoint(breakpoint: keyof Breakpoints): keyof Breakpoints | null {
    const breakpointEntries = Object.entries(this.config.breakpoints)
      .map(([name, value]) => [name, parseInt(value, 10)] as const)
      .sort(([, a], [, b]) => a - b); // 从小到大排序

    const currentIndex = breakpointEntries.findIndex(([name]) => name === breakpoint);

    if (currentIndex >= 0 && currentIndex < breakpointEntries.length - 1) {
      return breakpointEntries[currentIndex + 1][0] as keyof Breakpoints;
    }

    return null;
  }

  /**
   * 设置断点监听
   */
  private setupBreakpointMonitoring(): void {
    if (typeof window === "undefined") {
      return;
    }

    this.handleResize = debounce(() => {
      const newBreakpoint = this.getCurrentBreakpoint();
      if (newBreakpoint !== this.currentBreakpoint) {
        const previous = this.currentBreakpoint;
        this.currentBreakpoint = newBreakpoint;

        responsiveEvents.emit("breakpoint-changed", {
          current: newBreakpoint,
          previous,
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    }, 100);

    window.addEventListener("resize", this.handleResize, { passive: true });
  }

  private handleResize = () => {
    // 防抖处理在 setupBreakpointMonitoring 中设置
  };
}

/**
 * 创建响应式管理器
 */
export function createResponsiveManager(config?: Partial<ResponsiveConfig>): ResponsiveManager {
  return new ResponsiveManager(config);
}

/**
 * 默认响应式管理器实例
 */
export const defaultResponsiveManager = createResponsiveManager();

/**
 * 响应式工具函数
 */
export const responsiveUtils = {
  /**
   * 检查是否为移动设备
   */
  isMobile(): boolean {
    return defaultResponsiveManager.matches("sm", "down");
  },

  /**
   * 检查是否为平板设备
   */
  isTablet(): boolean {
    return defaultResponsiveManager.matches("md", "up") && defaultResponsiveManager.matches("lg", "down");
  },

  /**
   * 检查是否为桌面设备
   */
  isDesktop(): boolean {
    return defaultResponsiveManager.matches("lg", "up");
  },

  /**
   * 获取当前设备类型
   */
  getDeviceType(): "mobile" | "tablet" | "desktop" {
    if (this.isMobile()) return "mobile";
    if (this.isTablet()) return "tablet";
    return "desktop";
  },

  /**
   * 监听设备类型变化
   */
  onDeviceTypeChange(callback: (deviceType: "mobile" | "tablet" | "desktop") => void): () => void {
    let currentType = this.getDeviceType();

    return defaultResponsiveManager.onBreakpointChange(() => {
      const newType = this.getDeviceType();
      if (newType !== currentType) {
        currentType = newType;
        callback(newType);
      }
    });
  },

  /**
   * 创建隐藏样式（小于指定断点时隐藏）
   */
  hideBelow(breakpoint: keyof Breakpoints): StyleObject {
    const query = defaultResponsiveManager.getMediaQuery(breakpoint, "down");
    return {
      [`@media ${query}`]: {
        display: "none",
      },
    };
  },

  /**
   * 创建隐藏样式（大于指定断点时隐藏）
   */
  hideAbove(breakpoint: keyof Breakpoints): StyleObject {
    const query = defaultResponsiveManager.getMediaQuery(breakpoint, "up");
    return {
      [`@media ${query}`]: {
        display: "none",
      },
    };
  },

  /**
   * 创建只在指定断点显示的样式
   */
  showOnly(breakpoint: keyof Breakpoints): StyleObject {
    const query = defaultResponsiveManager.getMediaQuery(breakpoint, "only");
    return {
      display: "none",
      [`@media ${query}`]: {
        display: "block",
      },
    };
  },
};
