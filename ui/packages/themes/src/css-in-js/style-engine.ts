import { ref, reactive, computed, inject, provide, type InjectionKey } from "vue";
import type { StyleEngineConfig, StyleInjector, StyleCache, StyleObject } from "./types";
import { generateHash, styleObjectToCSS } from "./utils";

// 样式引擎注入键
export const STYLE_ENGINE_KEY: InjectionKey<StyleEngine> = Symbol("styleEngine");

// 样式缓存实现
class StyleCacheImpl implements StyleCache {
  private cache = new Map<string, string>();

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// 样式注入器实现
class StyleInjectorImpl implements StyleInjector {
  private styleElements = new Map<string, HTMLStyleElement>();
  private insertionPoint: HTMLElement;

  constructor(insertionPoint?: HTMLElement) {
    this.insertionPoint = insertionPoint || document.head;
  }

  inject(css: string, id?: string): void {
    const styleId = id || generateHash(css);

    if (this.styleElements.has(styleId)) {
      return; // 已存在，不重复注入
    }

    const styleElement = document.createElement("style");
    styleElement.setAttribute("data-xh-style", styleId);
    styleElement.textContent = css;

    this.insertionPoint.appendChild(styleElement);
    this.styleElements.set(styleId, styleElement);
  }

  remove(id: string): void {
    const styleElement = this.styleElements.get(id);
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
      this.styleElements.delete(id);
    }
  }

  clear(): void {
    this.styleElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.styleElements.clear();
  }
}

// 样式引擎类
export class StyleEngine {
  private config: Required<StyleEngineConfig>;
  private cache: StyleCache;
  private injector: StyleInjector;
  private componentStyles = new Map<string, string>();

  constructor(config: StyleEngineConfig = {}) {
    this.config = {
      prefix: "xh",
      hashLength: 8,
      insertionPoint: document.head,
      ...config,
    };

    this.cache = new StyleCacheImpl();
    this.injector = new StyleInjectorImpl(this.config.insertionPoint);
  }

  // 生成类名
  generateClassName(componentName: string, variant?: string): string {
    const parts = [this.config.prefix, componentName];
    if (variant) {
      parts.push(variant);
    }
    return parts.join("-");
  }

  // 注册组件样式
  registerComponentStyles(componentName: string, styles: StyleObject): string {
    const cacheKey = `${componentName}-${generateHash(JSON.stringify(styles))}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const className = this.generateClassName(componentName);
    const css = this.generateCSS(`.${className}`, styles);

    this.injector.inject(css, cacheKey);
    this.cache.set(cacheKey, className);
    this.componentStyles.set(componentName, className);

    return className;
  }

  // 生成 CSS
  private generateCSS(selector: string, styles: StyleObject): string {
    const cssRules: string[] = [];
    const nestedRules: string[] = [];
    const baseStyles: Record<string, any> = {};

    // 分离基础样式和嵌套样式
    Object.entries(styles).forEach(([key, value]) => {
      if (key.startsWith("&") || key.startsWith("@")) {
        // 嵌套选择器或媒体查询
        const nestedSelector = key.startsWith("&") ? selector + key.slice(1) : key;
        nestedRules.push(this.generateCSS(nestedSelector, value as StyleObject));
      } else {
        baseStyles[key] = value;
      }
    });

    // 生成基础样式
    if (Object.keys(baseStyles).length > 0) {
      const baseCSS = styleObjectToCSS(baseStyles);
      if (baseCSS) {
        cssRules.push(`${selector} { ${baseCSS} }`);
      }
    }

    // 添加嵌套样式
    cssRules.push(...nestedRules);

    return cssRules.join("\n");
  }

  // 创建动态样式
  createDynamicStyle(styles: StyleObject): string {
    const hash = generateHash(JSON.stringify(styles), this.config.hashLength);
    const className = `${this.config.prefix}-${hash}`;
    const cacheKey = `dynamic-${hash}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const css = this.generateCSS(`.${className}`, styles);
    this.injector.inject(css, cacheKey);
    this.cache.set(cacheKey, className);

    return className;
  }

  // 创建关键帧动画
  createKeyframes(name: string, keyframes: Record<string, StyleObject>): string {
    const animationName = `${this.config.prefix}-${name}`;
    const cacheKey = `keyframes-${name}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const keyframeRules = Object.entries(keyframes)
      .map(([key, styles]) => `${key} { ${styleObjectToCSS(styles)} }`)
      .join("\n");

    const css = `@keyframes ${animationName} {\n${keyframeRules}\n}`;
    this.injector.inject(css, cacheKey);
    this.cache.set(cacheKey, animationName);

    return animationName;
  }

  // 注入全局样式
  injectGlobal(styles: StyleObject): void {
    const css = this.generateCSS("", styles);
    this.injector.inject(css, "global");
  }

  // 清理所有样式
  clear(): void {
    this.cache.clear();
    this.injector.clear();
    this.componentStyles.clear();
  }

  // 获取组件样式类名
  getComponentClassName(componentName: string): string | undefined {
    return this.componentStyles.get(componentName);
  }
}

// 创建样式引擎实例
export function createStyleEngine(config?: StyleEngineConfig): StyleEngine {
  return new StyleEngine(config);
}

// 使用样式引擎
export function useStyleEngine(): StyleEngine {
  const engine = inject(STYLE_ENGINE_KEY);
  if (!engine) {
    throw new Error("StyleEngine not provided. Make sure to call provideStyleEngine first.");
  }
  return engine;
}

// 提供样式引擎
export function provideStyleEngine(engine: StyleEngine): void {
  provide(STYLE_ENGINE_KEY, engine);
}
