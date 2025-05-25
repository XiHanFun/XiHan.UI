import type { StyleObject } from "./types";
import { useStyleEngine } from "./style-engine";

// CSS 函数 - 创建动态样式
export function css(styles: StyleObject): string {
  const engine = useStyleEngine();
  return engine.createDynamicStyle(styles);
}

// 关键帧动画函数
export function keyframes(name: string, frames: Record<string, StyleObject>): string {
  const engine = useStyleEngine();
  return engine.createKeyframes(name, frames);
}

// 全局样式注入
export function injectGlobal(styles: StyleObject): void {
  const engine = useStyleEngine();
  engine.injectGlobal(styles);
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
      result[`@media (min-width: var(--xh-breakpoints-${breakpoint}))`] = style;
    }
  });

  return result;
}

// 伪类样式函数
export function hover(styles: StyleObject): StyleObject {
  return { "&:hover": styles };
}

export function focus(styles: StyleObject): StyleObject {
  return { "&:focus": styles };
}

export function active(styles: StyleObject): StyleObject {
  return { "&:active": styles };
}

export function disabled(styles: StyleObject): StyleObject {
  return { "&:disabled": styles };
}

export function firstChild(styles: StyleObject): StyleObject {
  return { "&:first-child": styles };
}

export function lastChild(styles: StyleObject): StyleObject {
  return { "&:last-child": styles };
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
  return { [`& ${selector}`]: styles };
}

export function descendant(selector: string, styles: StyleObject): StyleObject {
  return { [`& ${selector}`]: styles };
}

export function sibling(selector: string, styles: StyleObject): StyleObject {
  return { [`& + ${selector}`]: styles };
}

export function generalSibling(selector: string, styles: StyleObject): StyleObject {
  return { [`& ~ ${selector}`]: styles };
}

// 状态样式函数
export function when(condition: string, styles: StyleObject): StyleObject {
  return { [condition]: styles };
}

export function not(selector: string, styles: StyleObject): StyleObject {
  return { [`&:not(${selector})`]: styles };
}

// 媒体查询函数
export function mediaQuery(breakpoint: string, styles: StyleObject): StyleObject {
  return { [`@media (min-width: ${breakpoint})`]: styles };
}

// 容器查询函数
export function containerQuery(condition: string, styles: StyleObject): StyleObject {
  return { [`@container ${condition}`]: styles };
}

// 支持查询函数
export function supportsQuery(condition: string, styles: StyleObject): StyleObject {
  return { [`@supports ${condition}`]: styles };
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
