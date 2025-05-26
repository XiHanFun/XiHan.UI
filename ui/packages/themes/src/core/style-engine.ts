/**
 * 样式引擎
 * 基于 @utils 功能构建的完整样式引擎系统
 */

import { generateHash, styleObjectToCSS } from "../css-in-js/utils";
import { StyleCache, createStyleCache } from "./cache";
import { StyleInjector, createStyleInjector } from "./injector";
import { inject, provide } from "vue";
import type { StyleEngineConfig, IStyleEngine, CompiledStyle } from "./types";
import type { StyleObject } from "../css-in-js/types";

/**
 * 简化样式引擎配置
 */
export interface SimpleEngineConfig {
  /** CSS 类名前缀 */
  prefix?: string;
  /** 是否启用开发模式 */
  dev?: boolean;
}

/**
 * 简化样式引擎类（来自 simple 模块）
 */
export class SimpleStyleEngine {
  private readonly config: Required<SimpleEngineConfig>;

  constructor(config: SimpleEngineConfig = {}) {
    this.config = {
      prefix: config.prefix ?? "xh",
      dev: config.dev ?? process.env.NODE_ENV === "development",
    };
  }

  /**
   * 创建样式
   */
  css(styles: StyleObject): string {
    const hash = this.generateSimpleHash(JSON.stringify(styles));
    const className = `${this.config.prefix}-${hash}`;

    // 简单的样式注入
    if (typeof document !== "undefined") {
      const existingStyle = document.querySelector(`style[data-xh-simple="${hash}"]`);
      if (!existingStyle) {
        const styleElement = document.createElement("style");
        styleElement.setAttribute("data-xh-simple", hash);
        styleElement.textContent = `.${className} { ${this.simpleStyleObjectToCSS(styles)} }`;
        document.head.appendChild(styleElement);
      }
    }

    return className;
  }

  /**
   * 合并类名
   */
  cx(...classNames: Array<string | undefined | null | false>): string {
    return classNames.filter(Boolean).join(" ");
  }

  /**
   * 合并样式
   */
  merge(...styles: StyleObject[]): StyleObject {
    return styles.reduce((merged, style) => ({ ...merged, ...style }), {});
  }

  /**
   * 创建带前缀的类名
   */
  className(name: string): string {
    return `${this.config.prefix}-${name}`;
  }

  /**
   * 获取前缀
   */
  getPrefix(): string {
    return this.config.prefix;
  }

  /**
   * 获取配置
   */
  getConfig(): SimpleEngineConfig {
    return { ...this.config };
  }

  /**
   * 是否开发模式
   */
  isDev(): boolean {
    return this.config.dev;
  }

  /**
   * 创建样式变体
   */
  createVariants<T extends Record<string, StyleObject>>(baseStyles: StyleObject, variants: T): T & { base: string } {
    const result = {} as T & { base: string };

    // 基础样式
    result.base = this.css(baseStyles);

    // 变体样式
    Object.entries(variants).forEach(([key, styles]) => {
      (result as any)[key] = this.css(this.merge(baseStyles, styles));
    });

    return result;
  }

  /**
   * 创建尺寸变体
   */
  createSizes<T extends Record<string, StyleObject>>(baseStyles: StyleObject, sizes: T): T & { base: string } {
    return this.createVariants(baseStyles, sizes);
  }

  /**
   * 条件样式
   */
  when(condition: boolean, styles: StyleObject): string {
    return condition ? this.css(styles) : "";
  }

  /**
   * 批量创建样式
   */
  batch(stylesList: StyleObject[]): string[] {
    return stylesList.map(styles => this.css(styles));
  }

  // 私有方法
  private generateSimpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  }

  private simpleStyleObjectToCSS(styles: StyleObject): string {
    return Object.entries(styles)
      .map(([property, value]) => {
        if (typeof value === "object") {
          return `${property} { ${this.simpleStyleObjectToCSS(value)} }`;
        }
        const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${cssProperty}: ${value};`;
      })
      .join(" ");
  }
}

/**
 * 完整版样式引擎实现
 */
export class StyleEngine implements IStyleEngine {
  private cache: StyleCache;
  private injector: StyleInjector;
  private readonly config: Required<StyleEngineConfig>;

  constructor(config: StyleEngineConfig = {}) {
    this.config = {
      prefix: config.prefix ?? "xh",
      hashLength: config.hashLength ?? 8,
      insertionPoint: config.insertionPoint ?? document.head,
      dev: config.dev ?? process.env.NODE_ENV === "development",
      cache: config.cache ?? true,
    };

    // 初始化缓存和注入器
    this.cache = createStyleCache({
      maxSize: 2000,
      ttl: this.config.dev ? 1000 * 60 : 1000 * 60 * 10, // 开发模式1分钟，生产模式10分钟
      lru: true,
    });

    this.injector = createStyleInjector({
      target: this.config.insertionPoint,
      insertToHead: true,
      attributes: {
        "data-xihan-ui": "true",
        "data-engine": "style-engine",
        ...(this.config.dev && { "data-dev": "true" }),
      },
    });
  }

  /**
   * 编译样式
   */
  compile(styles: StyleObject): CompiledStyle {
    // 生成样式的唯一标识
    const styleString = JSON.stringify(styles);
    const hash = generateHash(styleString, this.config.hashLength);
    const className = `${this.config.prefix}-${hash}`;

    // 检查缓存
    if (this.config.cache) {
      const cached = this.cache.get(hash);
      if (cached) {
        return cached;
      }
    }

    // 编译 CSS
    const css = this.compileCSS(className, styles);

    const compiled: CompiledStyle = {
      className,
      css,
      hash,
    };

    // 缓存结果
    if (this.config.cache) {
      this.cache.set(hash, compiled);
    }

    return compiled;
  }

  /**
   * 注入样式
   */
  inject(css: string, id?: string): void {
    this.injector.inject(css, id);
  }

  /**
   * 移除样式
   */
  remove(id: string): void {
    this.injector.remove(id);
  }

  /**
   * 清空所有样式
   */
  clear(): void {
    this.injector.clear();
    this.cache.clear();
  }

  /**
   * 获取配置
   */
  getConfig(): StyleEngineConfig {
    return { ...this.config };
  }

  /**
   * 编译并注入样式
   */
  compileAndInject(styles: StyleObject): string {
    const compiled = this.compile(styles);
    this.inject(compiled.css, compiled.hash);
    return compiled.className;
  }

  /**
   * 批量编译样式
   */
  batchCompile(stylesList: StyleObject[]): CompiledStyle[] {
    return stylesList.map(styles => this.compile(styles));
  }

  /**
   * 获取引擎统计信息
   */
  getStats() {
    return {
      cache: this.cache.getStats(),
      injector: this.injector.getStats(),
      config: this.config,
    };
  }

  /**
   * 清理过期缓存
   */
  cleanup(): number {
    return this.cache.cleanup();
  }

  // 私有方法
  private compileCSS(className: string, styles: StyleObject): string {
    const selector = `.${className}`;
    const cssRules: string[] = [];

    // 处理基础样式
    const baseStyles: StyleObject = {};
    const nestedRules: Array<{ selector: string; styles: StyleObject }> = [];

    Object.entries(styles).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // 处理嵌套规则（媒体查询、伪类等）
        if (key.startsWith("@")) {
          // 媒体查询等 at-rules
          nestedRules.push({
            selector: key,
            styles: { [selector]: value } as StyleObject,
          });
        } else if (key.startsWith("&")) {
          // 伪类、伪元素
          const nestedSelector = key.replace("&", selector);
          nestedRules.push({
            selector: nestedSelector,
            styles: value as StyleObject,
          });
        } else {
          // 子选择器
          const nestedSelector = key.includes("&") ? key.replace("&", selector) : `${selector} ${key}`;
          nestedRules.push({
            selector: nestedSelector,
            styles: value as StyleObject,
          });
        }
      } else {
        // 基础样式属性
        baseStyles[key] = value;
      }
    });

    // 生成基础样式规则
    if (Object.keys(baseStyles).length > 0) {
      const baseCSS = styleObjectToCSS(baseStyles);
      if (baseCSS) {
        cssRules.push(`${selector} { ${baseCSS} }`);
      }
    }

    // 生成嵌套规则
    nestedRules.forEach(({ selector: ruleSelector, styles: ruleStyles }) => {
      if (ruleSelector.startsWith("@")) {
        // at-rules (媒体查询等)
        const nestedCSS = Object.entries(ruleStyles)
          .map(([sel, st]) => `${sel} { ${styleObjectToCSS(st as StyleObject)} }`)
          .join(" ");
        cssRules.push(`${ruleSelector} { ${nestedCSS} }`);
      } else {
        // 普通嵌套选择器
        const ruleCSS = styleObjectToCSS(ruleStyles);
        if (ruleCSS) {
          cssRules.push(`${ruleSelector} { ${ruleCSS} }`);
        }
      }
    });

    return cssRules.join(" ");
  }
}

/**
 * 创建样式引擎实例
 */
export function createStyleEngine(config?: StyleEngineConfig): StyleEngine {
  return new StyleEngine(config);
}

/**
 * 创建简化样式引擎实例（来自 simple 模块）
 */
export function createSimpleStyleEngine(config?: SimpleEngineConfig): SimpleStyleEngine {
  return new SimpleStyleEngine(config);
}

/**
 * Vue 注入键
 */
export const STYLE_ENGINE_KEY = Symbol("xihan-ui-style-engine");
export const SIMPLE_STYLE_ENGINE_KEY = Symbol("xihan-ui-simple-style-engine");

/**
 * 提供样式引擎
 */
export function provideStyleEngine(engine?: StyleEngine): StyleEngine {
  const styleEngine = engine ?? createStyleEngine();
  provide(STYLE_ENGINE_KEY, styleEngine);
  return styleEngine;
}

/**
 * 提供简化样式引擎（来自 simple 模块）
 */
export function provideSimpleStyleEngine(engine?: SimpleStyleEngine): SimpleStyleEngine {
  const styleEngine = engine ?? createSimpleStyleEngine();
  provide(SIMPLE_STYLE_ENGINE_KEY, styleEngine);
  return styleEngine;
}

/**
 * 使用样式引擎
 */
export function useStyleEngine(): StyleEngine {
  const engine = inject<StyleEngine>(STYLE_ENGINE_KEY);
  if (!engine) {
    throw new Error("StyleEngine not provided. Please use provideStyleEngine() first.");
  }
  return engine;
}

/**
 * 使用简化样式引擎（来自 simple 模块）
 */
export function useSimpleStyleEngine(): SimpleStyleEngine {
  const engine = inject<SimpleStyleEngine>(SIMPLE_STYLE_ENGINE_KEY);
  if (!engine) {
    throw new Error("SimpleStyleEngine not provided. Please use provideSimpleStyleEngine() first.");
  }
  return engine;
}

/**
 * 全局样式引擎实例
 */
export const globalStyleEngine = createStyleEngine({
  prefix: "xh",
  hashLength: 8,
  dev: process.env.NODE_ENV === "development",
  cache: true,
});

/**
 * 全局简化样式引擎实例（来自 simple 模块）
 */
export const globalSimpleStyleEngine = createSimpleStyleEngine({
  prefix: "xh",
  dev: process.env.NODE_ENV === "development",
});

/**
 * 样式引擎工具函数
 */
export const styleEngineUtils = {
  /**
   * 创建开发模式引擎
   */
  createDevEngine(): StyleEngine {
    return createStyleEngine({
      dev: true,
      cache: false, // 开发模式禁用缓存
      hashLength: 12, // 更长的 hash 便于调试
    });
  },

  /**
   * 创建生产模式引擎
   */
  createProdEngine(): StyleEngine {
    return createStyleEngine({
      dev: false,
      cache: true,
      hashLength: 6, // 更短的 hash 减少体积
    });
  },

  /**
   * 批量清理引擎
   */
  batchCleanup(engines: StyleEngine[]): number {
    return engines.reduce((total, engine) => total + engine.cleanup(), 0);
  },
};

/**
 * 简化样式引擎工具函数（来自 simple 模块）
 */
export const simpleEngineUtils = {
  /**
   * 创建开发模式引擎
   */
  createDevEngine(prefix = "xh-dev"): SimpleStyleEngine {
    return createSimpleStyleEngine({
      prefix,
      dev: true,
    });
  },

  /**
   * 创建生产模式引擎
   */
  createProdEngine(prefix = "xh"): SimpleStyleEngine {
    return createSimpleStyleEngine({
      prefix,
      dev: false,
    });
  },

  /**
   * 获取当前环境的引擎
   */
  getEnvironmentEngine(): SimpleStyleEngine {
    return process.env.NODE_ENV === "development" ? this.createDevEngine() : this.createProdEngine();
  },
};
