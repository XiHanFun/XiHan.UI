/**
 * DOM 集成工具
 * 将 CSS-in-JS 样式系统与 @utils/dom 操作工具集成
 */

import type { StyleObject } from "./types";
import type { Theme } from "../theme";
import { styleObjectToCSS, generateHash } from "./utils";
import { createElement, element, attr, style as domStyle, type ElementOptions } from "@xihan-ui/utils/dom";

/**
 * DOM 样式应用器
 * 基于 @utils/dom 的功能构建
 */
export class DOMStyleApplier {
  private styleElements: Map<string, HTMLStyleElement> = new Map();
  private appliedStyles: Map<HTMLElement, Set<string>> = new Map();

  /**
   * 将样式对象应用到元素
   */
  applyStyles(element: HTMLElement, styles: StyleObject, id?: string): string {
    const styleId = id || generateHash(JSON.stringify(styles));
    const className = `xh-${styleId}`;

    // 如果样式已经存在，直接应用类名
    if (this.styleElements.has(styleId)) {
      element.classList.add(className);
      this.trackAppliedStyle(element, styleId);
      return className;
    }

    // 生成 CSS
    const css = this.generateCSS(`.${className}`, styles);

    // 使用 @utils/dom 创建样式元素
    const styleElement = createElement({
      tag: "style",
      attributes: {
        "data-xh-style-id": styleId,
      },
      parent: document.head,
    }) as HTMLStyleElement;

    styleElement.textContent = css;

    // 缓存样式元素
    this.styleElements.set(styleId, styleElement);

    // 应用类名
    element.classList.add(className);
    this.trackAppliedStyle(element, styleId);

    return className;
  }

  /**
   * 移除元素的样式
   */
  removeStyles(element: HTMLElement, styleId?: string): void {
    const appliedStyles = this.appliedStyles.get(element);
    if (!appliedStyles) return;

    if (styleId) {
      // 移除特定样式
      const className = `xh-${styleId}`;
      element.classList.remove(className);
      appliedStyles.delete(styleId);
    } else {
      // 移除所有样式
      appliedStyles.forEach(id => {
        const className = `xh-${id}`;
        element.classList.remove(className);
      });
      appliedStyles.clear();
    }

    // 如果元素没有应用的样式了，从跟踪中移除
    if (appliedStyles.size === 0) {
      this.appliedStyles.delete(element);
    }
  }

  /**
   * 更新元素样式
   */
  updateStyles(element: HTMLElement, styles: StyleObject, oldStyleId?: string): string {
    if (oldStyleId) {
      this.removeStyles(element, oldStyleId);
    }
    return this.applyStyles(element, styles);
  }

  /**
   * 清理未使用的样式
   */
  cleanup(): void {
    const usedStyleIds = new Set<string>();

    // 收集所有正在使用的样式 ID
    this.appliedStyles.forEach(styleIds => {
      styleIds.forEach(id => usedStyleIds.add(id));
    });

    // 移除未使用的样式元素
    this.styleElements.forEach((styleElement, styleId) => {
      if (!usedStyleIds.has(styleId)) {
        element.remove(styleElement);
        this.styleElements.delete(styleId);
      }
    });
  }

  /**
   * 生成 CSS 字符串
   */
  private generateCSS(selector: string, styles: StyleObject): string {
    const cssRules: string[] = [];

    // 处理基础样式
    const baseStyles: Record<string, any> = {};
    const nestedRules: Record<string, StyleObject> = {};

    Object.entries(styles).forEach(([key, value]) => {
      if (key.startsWith("@") || key.startsWith("&") || key.includes(":")) {
        // 媒体查询、伪类、伪元素等
        nestedRules[key] = value as StyleObject;
      } else {
        // 基础样式属性
        baseStyles[key] = value;
      }
    });

    // 生成基础样式
    if (Object.keys(baseStyles).length > 0) {
      const baseCss = styleObjectToCSS(baseStyles);
      if (baseCss) {
        cssRules.push(`${selector} { ${baseCss} }`);
      }
    }

    // 生成嵌套规则
    Object.entries(nestedRules).forEach(([key, nestedStyles]) => {
      if (key.startsWith("@media")) {
        // 媒体查询
        const nestedCss = this.generateCSS(selector, nestedStyles);
        cssRules.push(`${key} { ${nestedCss} }`);
      } else if (key.startsWith("@container")) {
        // 容器查询
        const nestedCss = this.generateCSS(selector, nestedStyles);
        cssRules.push(`${key} { ${nestedCss} }`);
      } else if (key.startsWith("&")) {
        // 伪类、伪元素
        const nestedSelector = key.replace("&", selector);
        const nestedCss = styleObjectToCSS(nestedStyles);
        if (nestedCss) {
          cssRules.push(`${nestedSelector} { ${nestedCss} }`);
        }
      } else {
        // 子选择器
        const nestedSelector = key.startsWith(" ") ? `${selector}${key}` : `${selector} ${key}`;
        const nestedCss = styleObjectToCSS(nestedStyles);
        if (nestedCss) {
          cssRules.push(`${nestedSelector} { ${nestedCss} }`);
        }
      }
    });

    return cssRules.join(" ");
  }

  /**
   * 跟踪应用到元素的样式
   */
  private trackAppliedStyle(element: HTMLElement, styleId: string): void {
    if (!this.appliedStyles.has(element)) {
      this.appliedStyles.set(element, new Set());
    }
    this.appliedStyles.get(element)!.add(styleId);
  }
}

// 全局样式应用器实例
export const domStyleApplier = new DOMStyleApplier();

/**
 * 样式化元素创建器选项
 * 扩展 @utils/dom 的 ElementOptions
 */
export interface StyledElementOptions extends Omit<ElementOptions, "styles"> {
  styles?: StyleObject;
  theme?: Theme;
}

/**
 * 创建样式化元素
 * 基于 @utils/dom 的 createElement 功能
 */
export function createStyledElement(options: StyledElementOptions): HTMLElement {
  const { styles, theme, ...elementOptions } = options;

  // 使用 @utils/dom 创建元素
  const element = createElement(elementOptions);

  // 应用样式
  if (styles) {
    const appliedClassName = domStyleApplier.applyStyles(element, styles);
    element.classList.add(appliedClassName);
  }

  return element;
}

/**
 * 动态样式管理器
 * 基于 @utils/dom 的功能构建
 */
export class DynamicStyleManager {
  private element: HTMLElement;
  private currentStyleId?: string;
  private theme?: Theme;

  constructor(element: HTMLElement, theme?: Theme) {
    this.element = element;
    this.theme = theme;
  }

  /**
   * 应用样式
   */
  applyStyles(styles: StyleObject): this {
    const newStyleId = domStyleApplier.updateStyles(this.element, styles, this.currentStyleId);
    this.currentStyleId = newStyleId;
    return this;
  }

  /**
   * 添加样式
   */
  addStyles(styles: StyleObject): this {
    const styleId = domStyleApplier.applyStyles(this.element, styles);
    // 不更新 currentStyleId，因为这是额外的样式
    return this;
  }

  /**
   * 移除所有动态样式
   */
  removeStyles(): this {
    if (this.currentStyleId) {
      domStyleApplier.removeStyles(this.element, this.currentStyleId);
      this.currentStyleId = undefined;
    }
    return this;
  }

  /**
   * 切换样式
   */
  toggleStyles(styles: StyleObject, condition?: boolean): this {
    const shouldApply = condition !== undefined ? condition : !this.currentStyleId;

    if (shouldApply) {
      this.applyStyles(styles);
    } else {
      this.removeStyles();
    }

    return this;
  }

  /**
   * 设置主题
   */
  setTheme(theme: Theme): this {
    this.theme = theme;
    return this;
  }

  /**
   * 获取元素
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * 显示元素
   * 使用 @utils/dom 的样式操作
   */
  show(): this {
    domStyle.show(this.element);
    return this;
  }

  /**
   * 隐藏元素
   * 使用 @utils/dom 的样式操作
   */
  hide(): this {
    domStyle.hide(this.element);
    return this;
  }

  /**
   * 切换元素显示状态
   * 使用 @utils/dom 的样式操作
   */
  toggle(): this {
    domStyle.toggle(this.element);
    return this;
  }
}

/**
 * 创建动态样式管理器
 */
export function createDynamicStyleManager(element: HTMLElement, theme?: Theme): DynamicStyleManager {
  return new DynamicStyleManager(element, theme);
}

/**
 * 样式化工具函数
 * 基于 @utils/dom 的 createElement 功能
 */
export const styled = {
  /**
   * 创建样式化的 div
   */
  div(styles: StyleObject, options?: Omit<StyledElementOptions, "tag" | "styles">): HTMLElement {
    return createStyledElement({ tag: "div", styles, ...options });
  },

  /**
   * 创建样式化的 span
   */
  span(styles: StyleObject, options?: Omit<StyledElementOptions, "tag" | "styles">): HTMLElement {
    return createStyledElement({ tag: "span", styles, ...options });
  },

  /**
   * 创建样式化的 button
   */
  button(styles: StyleObject, options?: Omit<StyledElementOptions, "tag" | "styles">): HTMLElement {
    return createStyledElement({ tag: "button", styles, ...options });
  },

  /**
   * 创建样式化的 input
   */
  input(styles: StyleObject, options?: Omit<StyledElementOptions, "tag" | "styles">): HTMLElement {
    return createStyledElement({ tag: "input", styles, ...options });
  },

  /**
   * 创建样式化的任意元素
   */
  element(tag: string, styles: StyleObject, options?: Omit<StyledElementOptions, "tag" | "styles">): HTMLElement {
    return createStyledElement({ tag, styles, ...options });
  },
};

/**
 * 批量样式操作
 */
export const batchStyles = {
  /**
   * 批量应用样式到多个元素
   */
  apply(elements: HTMLElement[], styles: StyleObject): string[] {
    return elements.map(element => domStyleApplier.applyStyles(element, styles));
  },

  /**
   * 批量移除样式
   */
  remove(elements: HTMLElement[], styleId?: string): void {
    elements.forEach(element => domStyleApplier.removeStyles(element, styleId));
  },

  /**
   * 批量更新样式
   */
  update(elements: HTMLElement[], styles: StyleObject, oldStyleId?: string): string[] {
    return elements.map(element => domStyleApplier.updateStyles(element, styles, oldStyleId));
  },

  /**
   * 批量显示元素
   * 使用 @utils/dom 的样式操作
   */
  show(elements: HTMLElement[]): void {
    elements.forEach(element => domStyle.show(element));
  },

  /**
   * 批量隐藏元素
   * 使用 @utils/dom 的样式操作
   */
  hide(elements: HTMLElement[]): void {
    elements.forEach(element => domStyle.hide(element));
  },

  /**
   * 批量切换元素显示状态
   * 使用 @utils/dom 的样式操作
   */
  toggle(elements: HTMLElement[]): void {
    elements.forEach(element => domStyle.toggle(element));
  },
};

/**
 * 样式动画集成
 * 基于 @utils/dom 的动画功能（如果需要可以扩展）
 */
export const styleAnimation = {
  /**
   * 创建样式过渡动画
   */
  transition(
    element: HTMLElement,
    fromStyles: StyleObject,
    toStyles: StyleObject,
    duration = 300,
    easing = "ease",
  ): Promise<void> {
    return new Promise(resolve => {
      // 应用初始样式
      domStyleApplier.applyStyles(element, fromStyles);

      // 设置过渡
      element.style.transition = `all ${duration}ms ${easing}`;

      // 应用目标样式
      requestAnimationFrame(() => {
        domStyleApplier.applyStyles(element, toStyles);

        // 监听过渡结束
        const handleEnd = () => {
          element.removeEventListener("transitionend", handleEnd);
          element.style.transition = "";
          resolve();
        };

        element.addEventListener("transitionend", handleEnd);
      });
    });
  },

  /**
   * 创建关键帧动画
   */
  keyframes(element: HTMLElement, keyframes: StyleObject[], duration = 300, easing = "ease"): Promise<void> {
    return new Promise(resolve => {
      const keyframeObjects = keyframes.map(styles => {
        const result: Record<string, any> = {};
        Object.entries(styles).forEach(([key, value]) => {
          // 转换驼峰命名为短横线命名
          const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
          result[cssKey] = value;
        });
        return result;
      });

      const animation = element.animate(keyframeObjects, {
        duration,
        easing,
        fill: "forwards",
      });

      animation.addEventListener("finish", () => resolve());
    });
  },
};
