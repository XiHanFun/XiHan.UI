/**
 * 核心样式引擎
 * 专注于样式编译、优化和注入功能
 */

import { XH_PREFIX } from "@xihan-ui/constants";
import type {
  StyleObject,
  CompiledStyle,
  StyleEngine,
  StyleEngineConfig,
  StyleCache,
  ClassName,
} from "../foundation/types";
import {
  generateStyleHash,
  styleObjectToCSS,
  generateId,
  toKebabCase,
  normalizeCSSValue,
  createBEMClassName,
  combineClassNames,
  mergeStyleObjects,
  styleObjectToString,
} from "../foundation/utils";
import { globalEvents } from "../foundation/events";
import { createStyleCache } from "./cache";

/**
 * 样式注入器接口
 */
export interface StyleInjector {
  inject: (css: string, id?: string) => HTMLStyleElement;
  remove: (id: string) => boolean;
  clear: () => void;
  getElement: (id: string) => HTMLStyleElement | undefined;
}

/**
 * CSS 优化器配置
 */
export interface OptimizerConfig {
  minify: boolean;
  removeComments: boolean;
  removeDuplicates: boolean;
  autoprefixer: boolean;
  sortProperties: boolean;
}

/**
 * 样式注入器实现
 */
export class DOMStyleInjector implements StyleInjector {
  private elements = new Map<string, HTMLStyleElement>();
  private readonly insertionPoint: HTMLElement;

  constructor(insertionPoint?: HTMLElement) {
    this.insertionPoint = insertionPoint || document.head;
  }

  inject(css: string, id?: string): HTMLStyleElement {
    const styleId = id || generateId("style");

    // 如果已存在，更新内容
    let styleElement = this.elements.get(styleId);
    if (styleElement) {
      styleElement.textContent = css;
      return styleElement;
    }

    // 创建新的样式元素
    styleElement = document.createElement("style");
    styleElement.setAttribute("data-xh-style", styleId);
    styleElement.textContent = css;

    // 插入到DOM
    this.insertionPoint.appendChild(styleElement);
    this.elements.set(styleId, styleElement);

    // 触发事件
    globalEvents.emit("style-injected", { id: styleId, css });

    return styleElement;
  }

  remove(id: string): boolean {
    const styleElement = this.elements.get(id);
    if (!styleElement) {
      return false;
    }

    if (styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }

    this.elements.delete(id);

    // 触发事件
    globalEvents.emit("style-removed", { id });

    return true;
  }

  clear(): void {
    for (const [id, element] of this.elements) {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      globalEvents.emit("style-removed", { id });
    }
    this.elements.clear();
  }

  getElement(id: string): HTMLStyleElement | undefined {
    return this.elements.get(id);
  }

  getAllElements(): HTMLStyleElement[] {
    return Array.from(this.elements.values());
  }

  getStats() {
    return {
      count: this.elements.size,
      totalCSS: Array.from(this.elements.values()).reduce((total, el) => total + (el.textContent?.length || 0), 0),
    };
  }
}

/**
 * CSS 优化器
 */
export class CSSOptimizer {
  private config: OptimizerConfig;

  constructor(config: Partial<OptimizerConfig> = {}) {
    this.config = {
      minify: true,
      removeComments: true,
      removeDuplicates: true,
      autoprefixer: false, // 需要外部库支持
      sortProperties: true,
      ...config,
    };
  }

  optimize(css: string): string {
    let optimizedCSS = css;

    if (this.config.removeComments) {
      optimizedCSS = this.removeComments(optimizedCSS);
    }

    if (this.config.sortProperties) {
      optimizedCSS = this.sortProperties(optimizedCSS);
    }

    if (this.config.removeDuplicates) {
      optimizedCSS = this.removeDuplicateRules(optimizedCSS);
    }

    if (this.config.minify) {
      optimizedCSS = this.minify(optimizedCSS);
    }

    return optimizedCSS;
  }

  private removeComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, "");
  }

  private minify(css: string): string {
    return css
      .replace(/\s+/g, " ")
      .replace(/;\s*}/g, "}")
      .replace(/\s*{\s*/g, "{")
      .replace(/\s*}\s*/g, "}")
      .replace(/\s*,\s*/g, ",")
      .replace(/\s*:\s*/g, ":")
      .replace(/\s*;\s*/g, ";")
      .trim();
  }

  private sortProperties(css: string): string {
    // 简单的属性排序实现
    return css.replace(/\{([^}]+)\}/g, (match, properties) => {
      const props = properties
        .split(";")
        .filter((prop: string) => prop.trim())
        .map((prop: string) => prop.trim())
        .sort();
      return `{${props.join(";")}}`;
    });
  }

  private removeDuplicateRules(css: string): string {
    const rules = new Set<string>();
    const uniqueRules: string[] = [];

    // 简单的重复规则移除
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const ruleString = match[0];
      if (!rules.has(ruleString)) {
        rules.add(ruleString);
        uniqueRules.push(ruleString);
      }
    }

    return uniqueRules.join("");
  }
}

/**
 * 样式编译器
 */
export class StyleCompiler {
  private optimizer: CSSOptimizer;

  constructor(optimizerConfig?: Partial<OptimizerConfig>) {
    this.optimizer = new CSSOptimizer(optimizerConfig);
  }

  compile(styles: StyleObject, className?: string): CompiledStyle {
    const generatedClassName = className || generateStyleHash(styles);
    const selector = `.${generatedClassName}`;

    // 使用 styleObjectToCSS 转换样式
    let css = styleObjectToCSS(styles, selector);

    // 优化CSS
    css = this.optimizer.optimize(css);

    // 生成哈希
    const hash = generateStyleHash(styles);

    return {
      className: generatedClassName as ClassName,
      css,
      hash,
      priority: this.calculatePriority(styles),
    };
  }

  private calculatePriority(styles: StyleObject): number {
    let priority = 0;

    for (const [key, value] of Object.entries(styles)) {
      if (typeof value === "string" && value.includes("!important")) {
        priority += 1000;
      }

      // 伪类和伪元素增加优先级
      if (key.startsWith(":") || key.startsWith("::")) {
        priority += 10;
      }

      // 嵌套选择器增加优先级
      if (typeof value === "object") {
        priority += 1;
      }
    }

    return priority;
  }
}

/**
 * 核心样式引擎实现
 */
export class CoreStyleEngine implements StyleEngine {
  private cache: StyleCache;
  private injector: StyleInjector;
  private compiler: StyleCompiler;
  private config: Required<StyleEngineConfig>;

  constructor(config: Partial<StyleEngineConfig> = {}) {
    this.config = {
      prefix: XH_PREFIX,
      hashLength: 8,
      enableCache: true,
      enableMinification: true,
      enableSourceMap: false,
      insertionPoint: document.head,
      ...config,
    };

    this.cache = createStyleCache({ maxSize: 1000 });
    this.injector = new DOMStyleInjector(this.config.insertionPoint);
    this.compiler = new StyleCompiler({
      minify: this.config.enableMinification,
    });
  }

  compile(styles: StyleObject): CompiledStyle {
    if (!styles || typeof styles !== "object") {
      throw new Error("Invalid styles object");
    }

    // 生成缓存键
    const cacheKey = generateStyleHash(styles, this.config.prefix);

    // 检查缓存
    if (this.config.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // 编译样式
    const startTime = performance.now();
    const compiled = this.compiler.compile(styles, cacheKey);
    const compilationTime = performance.now() - startTime;

    // 缓存结果
    if (this.config.enableCache) {
      this.cache.set(cacheKey, compiled);
    }

    // 触发性能事件
    if (compilationTime > 10) {
      // 超过10ms的编译认为是慢编译
      globalEvents.emit("performance-warning", {
        totalStyles: 1,
        compilationTime,
        injectionTime: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        recommendations: ["Consider caching frequently used styles"],
      });
    }

    return compiled;
  }

  inject(css: string, id?: string): HTMLStyleElement {
    const startTime = performance.now();
    const element = this.injector.inject(css, id);
    const injectionTime = performance.now() - startTime;

    // 触发性能事件
    if (injectionTime > 5) {
      // 超过5ms的注入认为是慢注入
      globalEvents.emit("performance-warning", {
        totalStyles: 1,
        compilationTime: 0,
        injectionTime,
        cacheHitRate: 0,
        memoryUsage: 0,
        recommendations: ["Consider batching style injections"],
      });
    }

    return element;
  }

  remove(id: string): boolean {
    return this.injector.remove(id);
  }

  clear(): void {
    this.cache.clear();
    this.injector.clear();
  }

  getConfig(): StyleEngineConfig {
    return { ...this.config };
  }

  // 扩展方法

  /**
   * 编译并注入样式
   */
  compileAndInject(styles: StyleObject, id?: string): { className: ClassName; element: HTMLStyleElement } {
    const compiled = this.compile(styles);
    const element = this.inject(compiled.css, id || compiled.hash);

    return {
      className: compiled.className as ClassName,
      element,
    };
  }

  /**
   * 批量编译样式
   */
  batchCompile(stylesList: StyleObject[]): CompiledStyle[] {
    return stylesList.map(styles => this.compile(styles));
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    if (this.cache instanceof Map) {
      return {
        size: this.cache.size,
        hitRate: 0, // Map没有命中率统计
      };
    }

    // 假设缓存有getStats方法
    return (this.cache as any).getStats?.() || { size: 0, hitRate: 0 };
  }

  /**
   * 获取注入器统计信息
   */
  getInjectorStats() {
    return (this.injector as DOMStyleInjector).getStats();
  }

  /**
   * 预热缓存
   */
  warmupCache(stylesList: StyleObject[]): void {
    for (const styles of stylesList) {
      this.compile(styles);
    }
  }

  /**
   * 清理过期缓存
   */
  cleanupCache(): number {
    if (typeof (this.cache as any).cleanup === "function") {
      return (this.cache as any).cleanup();
    }
    return 0;
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    this.clear();
    if (typeof (this.cache as any).destroy === "function") {
      (this.cache as any).destroy();
    }
  }
}

/**
 * 样式变体生成器
 */
export class StyleVariantGenerator {
  /**
   * 创建样式变体
   */
  createVariants<T extends Record<string, StyleObject>>(
    baseStyles: StyleObject,
    variants: T,
  ): Record<keyof T, CompiledStyle> & { base: CompiledStyle } {
    const engine = new CoreStyleEngine();

    const result = {
      base: engine.compile(baseStyles),
    } as any;

    for (const [variantName, variantStyles] of Object.entries(variants)) {
      const mergedStyles = { ...baseStyles, ...variantStyles };
      result[variantName] = engine.compile(mergedStyles);
    }

    return result;
  }

  /**
   * 创建响应式变体
   */
  createResponsiveVariants(
    baseStyles: StyleObject,
    breakpoints: Record<string, string>,
  ): Record<string, CompiledStyle> {
    const engine = new CoreStyleEngine();
    const result: Record<string, CompiledStyle> = {};

    result.base = engine.compile(baseStyles);

    for (const [breakpointName, mediaQuery] of Object.entries(breakpoints)) {
      const responsiveStyles = {
        [`@media ${mediaQuery}`]: baseStyles,
      };
      result[breakpointName] = engine.compile(responsiveStyles);
    }

    return result;
  }
}

/**
 * 创建样式引擎实例
 */
export function createStyleEngine(config?: Partial<StyleEngineConfig>): StyleEngine {
  return new CoreStyleEngine(config);
}

/**
 * 样式引擎工具函数
 */
export const engineUtils = {
  /**
   * 创建开发环境引擎
   */
  createDevEngine(): StyleEngine {
    return createStyleEngine({
      prefix: `${XH_PREFIX}-dev`,
      enableMinification: false,
      enableSourceMap: true,
    });
  },

  /**
   * 创建生产环境引擎
   */
  createProdEngine(): StyleEngine {
    return createStyleEngine({
      prefix: XH_PREFIX,
      enableMinification: true,
      enableSourceMap: false,
    });
  },

  /**
   * 获取环境适配的引擎
   */
  getEnvironmentEngine(): StyleEngine {
    const isDev = process.env.NODE_ENV !== "production";
    return isDev ? this.createDevEngine() : this.createProdEngine();
  },
};

/**
 * BEM 风格的样式工具函数
 */

/**
 * 创建基础样式
 * @param styles 样式对象或字符串
 * @param children 子样式数组
 */
export function c(styles: StyleObject | string, children: StyleObject[] = []): StyleObject {
  if (typeof styles === "string") {
    return {
      "&": styles,
      ...children.reduce((acc, child) => mergeStyleObjects(acc, child), {}),
    };
  }
  return mergeStyleObjects(styles, ...children);
}

/**
 * 创建块级样式
 * @param block 块名
 * @param styles 样式对象或字符串
 * @param children 子样式数组
 * @param extraClassNames 额外的类名
 */
export function cB(
  block: string,
  styles: StyleObject | string,
  children: StyleObject[] = [],
  extraClassNames?: (string | undefined | null | false)[],
): StyleObject {
  const styleObj = typeof styles === "string" ? { "&": styles } : styles;
  const className = createBEMClassName(block);
  const finalClassName = extraClassNames ? combineClassNames(className, ...extraClassNames) : className;

  return {
    [`.${finalClassName}`]: mergeStyleObjects(styleObj, ...children),
  };
}

/**
 * 创建元素样式 使用 &__element 语法
 * @param element 元素名
 * @param styles 样式对象
 * @param children 子样式数组
 * @param extraClassNames 额外的类名
 */
export function cE(
  element: string,
  styles: StyleObject | string,
  children: StyleObject[] = [],
  extraClassNames?: (string | undefined | null | false)[],
): StyleObject {
  const styleObj = typeof styles === "string" ? { "&": styles } : styles;
  const className = createBEMClassName("", element);
  const finalClassName = extraClassNames ? combineClassNames(className, ...extraClassNames) : className;

  return {
    [`&${finalClassName}`]: mergeStyleObjects(styleObj, ...children),
  };
}

/**
 * 创建修饰符样式 使用 &--modifier 语法
 * @param modifier 修饰符名
 * @param styles 样式对象
 * @param children 子样式数组
 * @param extraClassNames 额外的类名
 */
export function cM(
  modifier: string,
  styles: StyleObject | string,
  children: StyleObject[] = [],
  extraClassNames?: (string | undefined | null | false)[],
): StyleObject {
  const styleObj = typeof styles === "string" ? { "&": styles } : styles;
  const className = createBEMClassName("", "", modifier);
  const finalClassName = extraClassNames ? combineClassNames(className, ...extraClassNames) : className;

  return {
    [`&${finalClassName}`]: mergeStyleObjects(styleObj, ...children),
  };
}

/**
 * 创建非修饰符样式 使用 &:not(&--modifier) 语法
 * @param modifier 修饰符名
 * @param children 子样式数组
 * @param extraClassNames 额外的类名
 */
export function cNotM(
  modifier: string,
  children: StyleObject[] = [],
  extraClassNames?: (string | undefined | null | false)[],
): StyleObject {
  const className = createBEMClassName("", "", modifier);
  const finalClassName = extraClassNames ? combineClassNames(className, ...extraClassNames) : className;

  return {
    [`&:not(&${finalClassName})`]: mergeStyleObjects(...children),
  };
}

/**
 * 创建子元素样式 使用 & selector 语法
 * @param selector 选择器
 * @param styles 样式对象
 * @param children 子样式数组
 * @param extraClassNames 额外的类名
 */
export function cS(
  selector: string,
  styles: StyleObject | string,
  children: StyleObject[] = [],
  extraClassNames?: (string | undefined | null | false)[],
): StyleObject {
  const styleObj = typeof styles === "string" ? { "&": styles } : styles;
  const finalSelector = extraClassNames ? combineClassNames(selector, ...extraClassNames) : selector;

  return {
    [`& ${finalSelector}`]: mergeStyleObjects(styleObj, ...children),
  };
}
