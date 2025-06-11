/**
 * XiHan UI 核心样式系统
 * 统一的样式引擎
 */

// =============================================
// 基础层导出
// =============================================
export * from "./foundation/types";
export * from "./foundation/utils";
export * from "./foundation/events";

// =============================================
// 样式层导出
// =============================================
export * from "./styling/cache";
export * from "./styling/engine";

// =============================================
// 响应式层导出
// =============================================
export * from "./responsive/manager";

// =============================================
// 主题层导出
// =============================================
export * from "./theming/manager";

// =============================================
// 动画系统导出
// =============================================
export * from "./animation/easing";
export * from "./animation/transition";
export * from "./animation/spring";
export * from "./animation/scroll";
export * from "./animation/svg";
export * from "./animation/sequence";

// =============================================
// 调试系统导出
// =============================================
export * from "./debug/monitor";
export * from "./debug/analyzer";
export * from "./debug/profiler";
export * from "./debug/logger";
export * from "./debug/dev-tools";

// =============================================
// 核心系统类
// =============================================

import { LRUStyleCache } from "./styling/cache";
import { CoreStyleEngine } from "./styling/engine";
import { ResponsiveManager } from "./responsive/manager";
import { ThemeManager } from "./theming/manager";
import { debugManager } from "./debug/monitor";
import { devTools } from "./debug/dev-tools";

export class CoreSystem {
  private static instance: CoreSystem;

  public readonly cache: LRUStyleCache;
  public readonly engine: CoreStyleEngine;
  public readonly responsive: ResponsiveManager;
  public readonly theme: ThemeManager;
  public readonly debug: typeof debugManager;
  public readonly devTools: typeof devTools;

  private constructor() {
    this.cache = new LRUStyleCache();
    this.engine = new CoreStyleEngine();
    this.responsive = new ResponsiveManager();
    this.theme = new ThemeManager();
    this.debug = debugManager;
    this.devTools = devTools;

    this.initialize();
  }

  /**
   * 获取核心系统实例（单例）
   */
  static getInstance(): CoreSystem {
    if (!CoreSystem.instance) {
      CoreSystem.instance = new CoreSystem();
    }
    return CoreSystem.instance;
  }

  /**
   * 初始化系统
   */
  private initialize(): void {
    // 启用开发模式（如果在开发环境）
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
      this.debug.enableDebug();
      this.devTools.enable();
    }

    this.debug.info("XiHan UI 核心系统已初始化");
  }

  /**
   * 销毁系统
   */
  destroy(): void {
    this.responsive.destroy();
    this.theme.destroy();
    this.cache.clear();
    this.debug.info("XiHan UI 核心系统已销毁");
  }
}

// =============================================
// 便捷函数
// =============================================

/**
 * 获取核心系统实例
 */
export function getCoreSystem(): CoreSystem {
  return CoreSystem.getInstance();
}

/**
 * 创建样式缓存
 */
export function createStyleCache(options?: any): LRUStyleCache {
  return new LRUStyleCache(options);
}

/**
 * 创建样式引擎
 */
export function createStyleEngine(config?: any): CoreStyleEngine {
  return new CoreStyleEngine(config);
}

/**
 * 创建响应式管理器
 */
export function createResponsiveManager(): ResponsiveManager {
  return new ResponsiveManager();
}

/**
 * 创建主题管理器
 */
export function createThemeManager(): ThemeManager {
  return new ThemeManager();
}

// =============================================
// 默认导出
// =============================================

export default CoreSystem;
