/**
 * CSS 工具函数
 * 基于 @utils/dom 构建的核心 CSS 功能
 */

import type { StyleObject } from "./types";
import { generateHash, styleObjectToCSS } from "./utils";

// === 轻量级 CSS 功能（来自 simple 模块）===

/**
 * 简单的 hash 生成函数（轻量级版本）
 */
function generateSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

/**
 * 简单的样式对象转 CSS 函数（轻量级版本）
 */
function simpleStyleObjectToCSS(styles: StyleObject): string {
  return Object.entries(styles)
    .map(([property, value]) => {
      if (typeof value === "object") {
        return `${property} { ${simpleStyleObjectToCSS(value)} }`;
      }
      const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssProperty}: ${value};`;
    })
    .join(" ");
}

/**
 * 轻量级 CSS 函数（来自 simple 模块）
 * 提供更简单的样式创建方式，适用于轻量级项目
 */
export function simpleCss(styles: StyleObject): string {
  const hash = generateSimpleHash(JSON.stringify(styles));
  const className = `xh-${hash}`;

  // 简单的样式注入
  if (typeof document !== "undefined") {
    const existingStyle = document.querySelector(`style[data-xh-simple="${hash}"]`);
    if (!existingStyle) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-xh-simple", hash);
      styleElement.textContent = `.${className} { ${simpleStyleObjectToCSS(styles)} }`;
      document.head.appendChild(styleElement);
    }
  }

  return className;
}

// === 完整版 CSS 功能 ===

// CSS 函数 - 创建动态样式
export function css(styles: StyleObject): string {
  const hash = generateHash(JSON.stringify(styles));
  const className = `xh-${hash}`;

  // 简单的样式注入
  if (typeof document !== "undefined") {
    const existingStyle = document.querySelector(`style[data-xh-css="${hash}"]`);
    if (!existingStyle) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-xh-css", hash);
      styleElement.textContent = `.${className} { ${styleObjectToCSS(styles)} }`;
      document.head.appendChild(styleElement);
    }
  }

  return className;
}

// 关键帧动画函数
export function keyframes(name: string, frames: Record<string, StyleObject>): string {
  const animationName = `xh-${name}`;

  if (typeof document !== "undefined") {
    const existingStyle = document.querySelector(`style[data-xh-keyframes="${name}"]`);
    if (!existingStyle) {
      const keyframeRules = Object.entries(frames)
        .map(([key, styles]) => `${key} { ${styleObjectToCSS(styles)} }`)
        .join("\n");

      const css = `@keyframes ${animationName} {\n${keyframeRules}\n}`;

      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-xh-keyframes", name);
      styleElement.textContent = css;
      document.head.appendChild(styleElement);
    }
  }

  return animationName;
}

// 全局样式注入
export function injectGlobal(styles: StyleObject): void {
  if (typeof document !== "undefined") {
    const css = styleObjectToCSS(styles);
    const hash = generateHash(css);

    const existingStyle = document.querySelector(`style[data-xh-global="${hash}"]`);
    if (!existingStyle) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-xh-global", hash);
      styleElement.textContent = css;
      document.head.appendChild(styleElement);
    }
  }
}

// 样式组合函数
export function cx(...classNames: (string | undefined | null | false)[]): string {
  return classNames.filter(Boolean).join(" ");
}

// 条件样式函数
export function cond(condition: boolean, trueStyles: StyleObject, falseStyles?: StyleObject): StyleObject {
  return condition ? trueStyles : falseStyles || {};
}

// 响应式样式函数
export function responsive(styles: Record<string, StyleObject>): StyleObject {
  const result: StyleObject = {};

  Object.entries(styles).forEach(([breakpoint, style]) => {
    if (breakpoint === "base") {
      Object.assign(result, style);
    } else {
      (result as any)[`@media (min-width: var(--xh-breakpoints-${breakpoint}))`] = style;
    }
  });

  return result;
}

/**
 * 合并样式
 */
export function mergeStyles(...styles: StyleObject[]): StyleObject {
  return styles.reduce((merged, style) => ({ ...merged, ...style }), {});
}

/**
 * 条件样式
 */
export function conditionalStyles(condition: boolean, styles: StyleObject): StyleObject {
  return condition ? styles : {};
}

// 伪类样式函数
export function hover(styles: StyleObject): StyleObject {
  return { "&:hover": styles } as StyleObject;
}

export function focus(styles: StyleObject): StyleObject {
  return { "&:focus": styles } as StyleObject;
}

export function active(styles: StyleObject): StyleObject {
  return { "&:active": styles } as StyleObject;
}

export function disabled(styles: StyleObject): StyleObject {
  return { "&:disabled": styles } as StyleObject;
}

export function firstChild(styles: StyleObject): StyleObject {
  return { "&:first-child": styles } as StyleObject;
}

export function lastChild(styles: StyleObject): StyleObject {
  return { "&:last-child": styles } as StyleObject;
}

// 伪元素样式函数
export function before(styles: StyleObject): StyleObject {
  return { "&::before": styles };
}

export function after(styles: StyleObject): StyleObject {
  return { "&::after": styles };
}

// 选择器函数
export function child(selector: string, styles: StyleObject): StyleObject {
  return { [`& ${selector}`]: styles } as StyleObject;
}

export function descendant(selector: string, styles: StyleObject): StyleObject {
  return { [`& ${selector}`]: styles } as StyleObject;
}

export function sibling(selector: string, styles: StyleObject): StyleObject {
  return { [`& + ${selector}`]: styles } as StyleObject;
}

export function generalSibling(selector: string, styles: StyleObject): StyleObject {
  return { [`& ~ ${selector}`]: styles } as StyleObject;
}

// 状态样式函数
export function when(condition: string, styles: StyleObject): StyleObject {
  return { [condition]: styles } as StyleObject;
}

export function not(selector: string, styles: StyleObject): StyleObject {
  return { [`&:not(${selector})`]: styles } as StyleObject;
}

// 媒体查询函数
export function mediaQuery(breakpoint: string, styles: StyleObject): StyleObject {
  return { [`@media (min-width: ${breakpoint})`]: styles } as StyleObject;
}

// 容器查询函数
export function containerQuery(condition: string, styles: StyleObject): StyleObject {
  return { [`@container ${condition}`]: styles } as StyleObject;
}

// 支持查询函数
export function supportsQuery(condition: string, styles: StyleObject): StyleObject {
  return { [`@supports ${condition}`]: styles } as StyleObject;
}

// 组合样式函数
export function combine(...styles: StyleObject[]): StyleObject {
  return styles.reduce((acc, style) => ({ ...acc, ...style }), {});
}

// 变体样式函数
export function variant(variants: Record<string, StyleObject>) {
  return (variantName: string): StyleObject => {
    return variants[variantName] || {};
  };
}

// 尺寸样式函数
export function size(sizes: Record<string, StyleObject>) {
  return (sizeName: string): StyleObject => {
    return sizes[sizeName] || {};
  };
}

// 颜色方案样式函数
export function colorScheme(schemes: Record<string, StyleObject>) {
  return (schemeName: string): StyleObject => {
    return schemes[schemeName] || {};
  };
}
