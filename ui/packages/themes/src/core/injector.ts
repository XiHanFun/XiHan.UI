/**
 * 样式注入器
 * 基于 @utils/dom 功能构建的样式注入系统
 */

import { createElement, element, find, attr } from "@xihan-ui/utils/dom";
import { generateId } from "@xihan-ui/utils/core";
import type { StyleInjectorConfig, IStyleInjector } from "./types";

/**
 * 样式注入器实现
 * 基于 @utils/dom 的功能构建
 */
export class StyleInjector implements IStyleInjector {
  private elements = new Map<string, HTMLStyleElement>();
  private readonly config: Required<StyleInjectorConfig>;

  constructor(config: StyleInjectorConfig = {}) {
    this.config = {
      target: config.target ?? document.head,
      insertToHead: config.insertToHead ?? true,
      attributes: config.attributes ?? {},
    };
  }

  /**
   * 注入样式
   */
  inject(css: string, id?: string): HTMLStyleElement {
    const styleId = id ?? generateId("style");

    // 检查是否已存在
    let styleElement = this.elements.get(styleId);

    if (styleElement) {
      // 更新现有样式
      styleElement.textContent = css;
      return styleElement;
    }

    // 使用 @utils/dom 创建新的样式元素
    styleElement = createElement({
      tag: "style",
      id: styleId,
      attributes: {
        type: "text/css",
        ...this.config.attributes,
      },
    }) as HTMLStyleElement;

    // 设置样式内容
    styleElement.textContent = css;

    // 插入到目标位置
    this.insertElement(styleElement);

    // 缓存元素
    this.elements.set(styleId, styleElement);

    return styleElement;
  }

  /**
   * 移除样式
   */
  remove(id: string): boolean {
    const styleElement = this.elements.get(id);
    if (!styleElement) return false;

    element.remove(styleElement);
    this.elements.delete(id);
    return true;
  }

  /**
   * 清空所有样式
   */
  clear(): void {
    for (const [id, styleElement] of this.elements.entries()) {
      element.remove(styleElement);
    }
    this.elements.clear();
  }

  /**
   * 获取所有样式元素
   */
  getElements(): HTMLStyleElement[] {
    return Array.from(this.elements.values());
  }

  /**
   * 获取样式元素
   */
  getElement(id: string): HTMLStyleElement | undefined {
    return this.elements.get(id);
  }

  /**
   * 检查样式是否存在
   */
  has(id: string): boolean {
    return this.elements.has(id);
  }

  /**
   * 更新样式内容
   */
  update(id: string, css: string): boolean {
    const styleElement = this.elements.get(id);
    if (!styleElement) return false;

    styleElement.textContent = css;
    return true;
  }

  /**
   * 获取样式内容
   */
  getCSS(id: string): string | undefined {
    const styleElement = this.elements.get(id);
    return styleElement ? styleElement.textContent || "" : undefined;
  }

  /**
   * 获取注入器统计信息
   */
  getStats() {
    return {
      totalElements: this.elements.size,
      target: this.config.target.tagName,
      insertToHead: this.config.insertToHead,
    };
  }

  // 私有方法

  private insertElement(styleElement: HTMLStyleElement): void {
    if (this.config.insertToHead) {
      // 插入到 head 的最后
      this.config.target.appendChild(styleElement);
    } else {
      // 插入到目标元素的第一个位置
      const firstChild = this.config.target.firstChild;
      if (firstChild) {
        this.config.target.insertBefore(styleElement, firstChild);
      } else {
        this.config.target.appendChild(styleElement);
      }
    }
  }
}

/**
 * 创建样式注入器实例
 */
export function createStyleInjector(config?: StyleInjectorConfig): StyleInjector {
  return new StyleInjector(config);
}

/**
 * 全局样式注入器实例
 */
export const globalStyleInjector = createStyleInjector({
  insertToHead: true,
  attributes: {
    "data-xihan-ui": "true",
  },
});

/**
 * 注入器工具函数
 * 基于 @utils/dom 的功能构建
 */
export const injectorUtils = {
  /**
   * 创建开发模式注入器
   */
  createDevInjector(): StyleInjector {
    return createStyleInjector({
      attributes: {
        "data-xihan-ui": "true",
        "data-dev": "true",
      },
    });
  },

  /**
   * 创建生产模式注入器
   */
  createProdInjector(): StyleInjector {
    return createStyleInjector({
      attributes: {
        "data-xihan-ui": "true",
        "data-prod": "true",
      },
    });
  },

  /**
   * 批量注入样式
   */
  batchInject(injector: StyleInjector, styles: Record<string, string>): HTMLStyleElement[] {
    return Object.entries(styles).map(([id, css]) => injector.inject(css, id));
  },

  /**
   * 清理所有 XiHan UI 样式
   * 使用 @utils/dom 的查找功能
   */
  cleanupXiHanStyles(): void {
    const xihanStyles = find.all('style[data-xihan-ui="true"]');
    xihanStyles.forEach(styleElement => element.remove(styleElement));
  },

  /**
   * 获取所有 XiHan UI 样式元素
   * 使用 @utils/dom 的查找功能
   */
  getXiHanStyleElements(): HTMLStyleElement[] {
    return find.all('style[data-xihan-ui="true"]') as HTMLStyleElement[];
  },

  /**
   * 检查样式元素是否存在
   * 使用 @utils/dom 的查找功能
   */
  hasStyleElement(selector: string): boolean {
    return find.one(selector) !== null;
  },

  /**
   * 获取样式元素的属性
   * 使用 @utils/dom 的属性操作功能
   */
  getStyleElementAttr(styleElement: HTMLStyleElement, name: string): string | null {
    return attr.get(styleElement, name);
  },

  /**
   * 设置样式元素的属性
   * 使用 @utils/dom 的属性操作功能
   */
  setStyleElementAttr(styleElement: HTMLStyleElement, name: string, value: string): void {
    attr.set(styleElement, name, value);
  },
};
