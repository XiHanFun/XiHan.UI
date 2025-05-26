/**
 * CSS-in-JS 渲染器
 * 提供类似 css-render 的功能，结合 BEM 命名规范
 */

import { BEM } from "./bem";

export interface CSSProperties {
  [key: string]: string | number | CSSProperties;
}

export interface CSSRule {
  selector: string;
  properties: CSSProperties;
  children: CSSRule[];
  media?: string;
  keyframes?: string;
}

export interface CSSRenderOptions {
  target?: HTMLElement | Document;
  prefix?: string;
  hashPrefix?: string;
  hashLength?: number;
}

/**
 * CSS 规则构建器
 */
export class CSSRuleBuilder {
  private rules: CSSRule[] = [];
  private currentRule: CSSRule | null = null;

  constructor(private selector: string = "") {
    if (selector) {
      this.currentRule = {
        selector,
        properties: {},
        children: [],
      };
      this.rules.push(this.currentRule);
    }
  }

  /**
   * 添加 CSS 属性
   */
  props(properties: CSSProperties): this {
    if (this.currentRule) {
      Object.assign(this.currentRule.properties, properties);
    }
    return this;
  }

  /**
   * 添加子规则
   */
  child(selector: string, callback?: (rule: CSSRuleBuilder) => void): this {
    const childRule = new CSSRuleBuilder(selector);
    if (callback) {
      callback(childRule);
    }

    if (this.currentRule) {
      this.currentRule.children.push(...childRule.getRules());
    } else {
      this.rules.push(...childRule.getRules());
    }

    return this;
  }

  /**
   * 添加媒体查询
   */
  media(query: string, callback: (rule: CSSRuleBuilder) => void): this {
    const mediaRule = new CSSRuleBuilder();
    callback(mediaRule);

    const rules = mediaRule.getRules();
    rules.forEach(rule => {
      rule.media = query;
    });

    this.rules.push(...rules);
    return this;
  }

  /**
   * 添加关键帧动画
   */
  keyframes(name: string, frames: Record<string, CSSProperties>): this {
    const keyframeRule: CSSRule = {
      selector: name,
      properties: {},
      children: [],
      keyframes: Object.entries(frames)
        .map(([key, props]) => `${key} { ${this.propertiesToCSS(props)} }`)
        .join(" "),
    };

    this.rules.push(keyframeRule);
    return this;
  }

  /**
   * 获取所有规则
   */
  getRules(): CSSRule[] {
    return this.rules;
  }

  /**
   * 将属性对象转换为 CSS 字符串
   */
  private propertiesToCSS(properties: CSSProperties): string {
    return Object.entries(properties)
      .map(([key, value]) => {
        const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        return `${cssKey}: ${value}`;
      })
      .join("; ");
  }

  /**
   * 转换为 CSS 字符串
   */
  toCSS(): string {
    return this.rules.map(rule => this.ruleToCSS(rule)).join("\n");
  }

  private ruleToCSS(rule: CSSRule, parentSelector = ""): string {
    const fullSelector = parentSelector ? `${parentSelector} ${rule.selector}` : rule.selector;

    if (rule.keyframes) {
      return `@keyframes ${rule.selector} { ${rule.keyframes} }`;
    }

    let css = "";

    // 主规则
    if (Object.keys(rule.properties).length > 0) {
      const props = this.propertiesToCSS(rule.properties);
      if (rule.media) {
        css += `@media ${rule.media} { ${fullSelector} { ${props} } }`;
      } else {
        css += `${fullSelector} { ${props} }`;
      }
    }

    // 子规则
    if (rule.children.length > 0) {
      const childCSS = rule.children.map(child => this.ruleToCSS(child, fullSelector)).join("\n");
      css += css ? "\n" + childCSS : childCSS;
    }

    return css;
  }
}

/**
 * CSS 渲染器
 */
export class CSSRenderer {
  private styleElement: HTMLStyleElement | null = null;
  private rules = new Map<string, CSSRule[]>();
  private options: Required<CSSRenderOptions>;
  private bem: BEM;

  constructor(options: CSSRenderOptions = {}) {
    this.options = {
      target: options.target || document,
      prefix: options.prefix || "xh",
      hashPrefix: options.hashPrefix || "h",
      hashLength: options.hashLength || 8,
    };
    // 创建 BEM 实例
    this.bem = new BEM(this.options.prefix);
  }

  /**
   * 创建 CSS 规则
   */
  c(selector: string, callback?: (rule: CSSRuleBuilder) => void): CSSRuleBuilder {
    const rule = new CSSRuleBuilder(selector);
    if (callback) {
      callback(rule);
    }
    return rule;
  }

  /**
   * 创建块级选择器 (Block)
   */
  cB(block: string, callback?: (rule: CSSRuleBuilder) => void): CSSRuleBuilder {
    const selector = `.${this.bem.b()}-${block}`;
    return this.c(selector, callback);
  }

  /**
   * 创建元素选择器 (Element)
   */
  cE(element: string, callback?: (rule: CSSRuleBuilder) => void): CSSRuleBuilder {
    return this.c(`&${this.bem.options.elementSeparator}${element}`, callback);
  }

  /**
   * 创建修饰符选择器 (Modifier)
   */
  cM(modifier: string, callback?: (rule: CSSRuleBuilder) => void): CSSRuleBuilder {
    return this.c(`&${this.bem.options.modifierSeparator}${modifier}`, callback);
  }

  /**
   * 创建否定修饰符选择器 (Not Modifier)
   */
  cNotM(modifier: string, callback?: (rule: CSSRuleBuilder) => void): CSSRuleBuilder {
    return this.c(`&:not(&${this.bem.options.modifierSeparator}${modifier})`, callback);
  }

  /**
   * 获取 BEM 实例
   */
  getBEM(): BEM {
    return this.bem;
  }

  /**
   * 创建 BEM 块级样式构建器
   */
  createBlock(block: string): BEMStyleBuilder {
    return new BEMStyleBuilder(this, block);
  }

  /**
   * 查找选择器
   */
  find(selector: string): CSSRuleBuilder {
    return this.c(selector);
  }

  /**
   * 注册样式规则
   */
  mount(id: string, rules: CSSRule[] | CSSRuleBuilder): void {
    const ruleArray = Array.isArray(rules) ? rules : rules.getRules();
    this.rules.set(id, ruleArray);
    this.updateStyles();
  }

  /**
   * 卸载样式规则
   */
  unmount(id: string): void {
    this.rules.delete(id);
    this.updateStyles();
  }

  /**
   * 更新样式
   */
  private updateStyles(): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement("style");
      this.styleElement.setAttribute("data-css-render", this.options.prefix);

      const target = this.options.target === document ? document.head : (this.options.target as HTMLElement);
      target.appendChild(this.styleElement);
    }

    const allRules: CSSRule[] = [];
    this.rules.forEach(rules => allRules.push(...rules));

    const css = allRules.map(rule => this.ruleToCSS(rule)).join("\n");
    this.styleElement.textContent = css;
  }

  private ruleToCSS(rule: CSSRule, parentSelector = ""): string {
    let selector = rule.selector;

    // 处理 & 符号
    if (selector.includes("&")) {
      selector = selector.replace(/&/g, parentSelector || "");
    } else if (parentSelector) {
      selector = `${parentSelector} ${selector}`;
    }

    if (rule.keyframes) {
      return `@keyframes ${rule.selector} { ${rule.keyframes} }`;
    }

    let css = "";

    // 主规则
    if (Object.keys(rule.properties).length > 0) {
      const props = this.propertiesToCSS(rule.properties);
      if (rule.media) {
        css += `@media ${rule.media} { ${selector} { ${props} } }`;
      } else {
        css += `${selector} { ${props} }`;
      }
    }

    // 子规则
    if (rule.children.length > 0) {
      const childCSS = rule.children.map(child => this.ruleToCSS(child, selector)).join("\n");
      css += css ? "\n" + childCSS : childCSS;
    }

    return css;
  }

  private propertiesToCSS(properties: CSSProperties): string {
    return Object.entries(properties)
      .map(([key, value]) => {
        if (typeof value === "object") {
          return ""; // 嵌套对象在子规则中处理
        }
        const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        return `${cssKey}: ${value}`;
      })
      .filter(Boolean)
      .join("; ");
  }

  /**
   * 生成哈希类名
   */
  hash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return `${this.options.hashPrefix}${Math.abs(hash).toString(36).slice(0, this.options.hashLength)}`;
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    this.rules.clear();
  }
}

/**
 * 默认渲染器实例
 */
export const cssRenderer = new CSSRenderer();

/**
 * 便捷函数
 */
export const c = (selector: string, callback?: (rule: CSSRuleBuilder) => void) => cssRenderer.c(selector, callback);

export const cB = (block: string, callback?: (rule: CSSRuleBuilder) => void) => cssRenderer.cB(block, callback);

export const cE = (element: string, callback?: (rule: CSSRuleBuilder) => void) => cssRenderer.cE(element, callback);

export const cM = (modifier: string, callback?: (rule: CSSRuleBuilder) => void) => cssRenderer.cM(modifier, callback);

export const cNotM = (modifier: string, callback?: (rule: CSSRuleBuilder) => void) =>
  cssRenderer.cNotM(modifier, callback);

export const find = (selector: string) => cssRenderer.find(selector);

/**
 * 创建新的渲染器实例
 */
export function createCSSRenderer(options?: CSSRenderOptions): CSSRenderer {
  return new CSSRenderer(options);
}

/**
 * 样式工具函数
 */
export const styleUtils = {
  /**
   * 像素值转换
   */
  px(value: number): string {
    return `${value}px`;
  },

  /**
   * 百分比值转换
   */
  percent(value: number): string {
    return `${value}%`;
  },

  /**
   * rem 值转换
   */
  rem(value: number): string {
    return `${value}rem`;
  },

  /**
   * em 值转换
   */
  em(value: number): string {
    return `${value}em`;
  },

  /**
   * 颜色透明度
   */
  rgba(color: string, alpha: number): string {
    if (color.startsWith("#")) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  },

  /**
   * 变量引用
   */
  var(name: string, fallback?: string): string {
    return `var(--${name}${fallback ? `, ${fallback}` : ""})`;
  },

  /**
   * calc 计算
   */
  calc(expression: string): string {
    return `calc(${expression})`;
  },
};

/**
 * 响应式断点工具
 */
export const breakpoints = {
  xs: "(max-width: 575.98px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)",
  xxl: "(min-width: 1400px)",
};

/**
 * 媒体查询辅助函数
 */
export function media(query: string, callback: (rule: CSSRuleBuilder) => void): CSSRuleBuilder {
  const rule = new CSSRuleBuilder();
  return rule.media(query, callback);
}

/**
 * 关键帧动画辅助函数
 */
export function keyframes(name: string, frames: Record<string, CSSProperties>): CSSRuleBuilder {
  const rule = new CSSRuleBuilder();
  return rule.keyframes(name, frames);
}

/**
 * BEM 样式构建器
 * 提供更便捷的 BEM 样式创建方式
 */
export class BEMStyleBuilder {
  private renderer: CSSRenderer;
  private blockName: string;
  private bem: BEM;

  constructor(renderer: CSSRenderer, blockName: string) {
    this.renderer = renderer;
    this.blockName = blockName;
    this.bem = new BEM(blockName);
  }

  /**
   * 创建块级样式
   */
  block(callback?: (rule: CSSRuleBuilder) => void): this {
    const selector = `.${this.bem.b()}`;
    const rule = this.renderer.c(selector, callback);
    return this;
  }

  /**
   * 创建元素样式
   */
  element(elementName: string, callback?: (rule: CSSRuleBuilder) => void): this {
    const selector = `.${this.bem.e(elementName)}`;
    const rule = this.renderer.c(selector, callback);
    return this;
  }

  /**
   * 创建修饰符样式
   */
  modifier(modifierName: string, callback?: (rule: CSSRuleBuilder) => void): this {
    const selector = `.${this.bem.m(modifierName)}`;
    const rule = this.renderer.c(selector, callback);
    return this;
  }

  /**
   * 创建元素修饰符样式
   */
  elementModifier(elementName: string, modifierName: string, callback?: (rule: CSSRuleBuilder) => void): this {
    const selector = `.${this.bem.em(elementName, modifierName)}`;
    const rule = this.renderer.c(selector, callback);
    return this;
  }

  /**
   * 创建否定修饰符样式
   */
  notModifier(modifierName: string, callback?: (rule: CSSRuleBuilder) => void): this {
    const selector = `.${this.bem.notM(modifierName)}`;
    const rule = this.renderer.c(selector, callback);
    return this;
  }

  /**
   * 创建状态样式（伪类）
   */
  state(state: string, callback?: (rule: CSSRuleBuilder) => void): this {
    const selector = `.${this.bem.b()}:${state}`;
    const rule = this.renderer.c(selector, callback);
    return this;
  }

  /**
   * 创建响应式样式
   */
  responsive(breakpoint: string, callback: (builder: BEMStyleBuilder) => void): this {
    const mediaRule = new CSSRuleBuilder();
    mediaRule.media(breakpoint, () => {
      callback(this);
    });
    return this;
  }

  /**
   * 获取 BEM 实例
   */
  getBEM(): BEM {
    return this.bem;
  }

  /**
   * 获取块名
   */
  getBlockName(): string {
    return this.blockName;
  }
}
