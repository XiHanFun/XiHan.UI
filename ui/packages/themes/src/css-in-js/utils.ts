/**
 * CSS-in-JS 工具函数
 * 基于 @xihan-ui/utils/dom 的功能构建样式相关的工具函数
 */

import { generateId, toCamelCase, toKebabCase, flattenObject as utilsFlattenObject } from "@xihan-ui/utils/core";
import { deepMerge } from "@xihan-ui/utils/data";
import type { StyleObject } from "./types";

/**
 * 生成样式 hash
 * 基于 @utils 的 generateId 函数
 */
export function generateHash(input: string, length = 8): string {
  // 使用 @utils 的 generateId 作为基础，但针对样式优化
  const baseId = generateId("css");
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${baseId}-${Math.abs(hash).toString(36).substring(0, length)}`;
}

/**
 * 将样式对象转换为 CSS 字符串
 * 使用 @utils 的字符串转换功能
 */
export function styleObjectToCSS(styles: StyleObject): string {
  return Object.entries(styles)
    .map(([property, value]) => {
      if (value === null || value === undefined) return "";

      // 处理嵌套选择器
      if (typeof value === "object" && !Array.isArray(value)) {
        return `${property} { ${styleObjectToCSS(value as StyleObject)} }`;
      }

      // 使用 @utils 的 toKebabCase 转换属性名
      const cssProperty = toKebabCase(property);

      // 处理数值类型的属性
      const cssValue = typeof value === "number" && needsUnit(cssProperty) ? `${value}px` : String(value);

      return `${cssProperty}: ${cssValue};`;
    })
    .filter(Boolean)
    .join(" ");
}

/**
 * 判断 CSS 属性是否需要单位
 */
function needsUnit(property: string): boolean {
  const unitlessProperties = new Set([
    "opacity",
    "z-index",
    "font-weight",
    "line-height",
    "flex",
    "flex-grow",
    "flex-shrink",
    "order",
    "column-count",
    "fill-opacity",
    "stroke-opacity",
    "animation-iteration-count",
    "grid-column",
    "grid-row",
  ]);

  return !unitlessProperties.has(property);
}

/**
 * 合并样式对象
 * 使用 @utils 的 deepMerge 功能
 */
export function mergeStyles(...styles: (StyleObject | undefined)[]): StyleObject {
  // 过滤掉 undefined 值
  const validStyles = styles.filter(Boolean) as StyleObject[];

  if (validStyles.length === 0) return {};
  if (validStyles.length === 1) return validStyles[0];

  // 使用 @utils 的 deepMerge
  return validStyles.reduce((merged, style) => {
    return deepMerge(merged, style);
  }, {} as StyleObject);
}

/**
 * 创建媒体查询
 * 增强版本，支持更多媒体查询类型
 */
export function mediaQuery(breakpoint: string, styles: StyleObject): StyleObject {
  // 如果 breakpoint 已经是完整的媒体查询，直接使用
  if (breakpoint.includes("(")) {
    return {
      [`@media ${breakpoint}`]: styles,
    } as StyleObject;
  }

  // 否则假设是断点值
  return {
    [`@media (min-width: ${breakpoint})`]: styles,
  } as StyleObject;
}

/**
 * 创建伪类选择器
 */
export function pseudoClass(pseudo: string, styles: StyleObject): StyleObject {
  return {
    [`&:${pseudo}`]: styles,
  } as StyleObject;
}

/**
 * 创建伪元素选择器
 */
export function pseudoElement(element: string, styles: StyleObject): StyleObject {
  return {
    [`&::${element}`]: styles,
  } as StyleObject;
}

/**
 * 创建子选择器
 */
export function childSelector(selector: string, styles: StyleObject): StyleObject {
  return {
    [`& ${selector}`]: styles,
  } as StyleObject;
}

/**
 * 混合颜色
 * 基于 @utils/dom 的颜色功能实现更完整的颜色混合
 */
export function mixColor(color1: string, color2: string, weight: number): string {
  // 将颜色转换为 RGB 值进行混合
  const parseColor = (color: string): [number, number, number] => {
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b];
    }

    // 处理 rgb/rgba 格式
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }

    // 默认返回黑色
    return [0, 0, 0];
  };

  const [r1, g1, b1] = parseColor(color1);
  const [r2, g2, b2] = parseColor(color2);

  const r = Math.round(r1 * weight + r2 * (1 - weight));
  const g = Math.round(g1 * weight + g2 * (1 - weight));
  const b = Math.round(b1 * weight + b2 * (1 - weight));

  // 转换回 hex 格式
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 创建 CSS 变量
 * 直接使用 @utils/dom 的 cssVar 功能
 */
export function cssVar(name: string, fallback?: string): string {
  return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`;
}

/**
 * 创建 CSS 变量对象
 * 使用 @utils 的字符串处理功能
 */
export function createCSSVars(vars: Record<string, string>, prefix = "xh"): Record<string, string> {
  const result: Record<string, string> = {};

  Object.entries(vars).forEach(([key, value]) => {
    // 使用 @utils 的 toKebabCase 确保变量名格式正确
    const cssVarName = toKebabCase(key);
    result[`--${prefix}-${cssVarName}`] = value;
  });

  return result;
}

/**
 * 样式值标准化
 * 将各种格式的样式值转换为标准格式
 */
export function normalizeStyleValue(property: string, value: any): string {
  if (value === null || value === undefined) return "";

  // 数值类型处理
  if (typeof value === "number") {
    return needsUnit(property) ? `${value}px` : String(value);
  }

  // 字符串类型直接返回
  if (typeof value === "string") return value;

  // 数组类型（如 margin: [10, 20] -> "10px 20px"）
  if (Array.isArray(value)) {
    return value.map(v => normalizeStyleValue(property, v)).join(" ");
  }

  return String(value);
}

/**
 * 创建样式变体
 * 基于基础样式和变体配置生成样式对象
 */
export function createStyleVariants<T extends Record<string, StyleObject>>(baseStyles: StyleObject, variants: T): T {
  const result = {} as T;

  Object.entries(variants).forEach(([key, variantStyles]) => {
    result[key as keyof T] = mergeStyles(baseStyles, variantStyles) as T[keyof T];
  });

  return result;
}

/**
 * 样式条件应用
 * 根据条件决定是否应用样式
 */
export function conditionalStyles(condition: boolean, styles: StyleObject): StyleObject {
  return condition ? styles : {};
}

/**
 * 创建响应式样式工具
 * 基于断点生成响应式样式
 */
export function createResponsiveStyleHelper(breakpoints: Record<string, string>) {
  return function responsiveStyle(styles: Record<string, StyleObject>): StyleObject {
    const result: StyleObject = {};

    Object.entries(styles).forEach(([breakpoint, style]) => {
      if (breakpoint === "base") {
        Object.assign(result, style);
      } else if (breakpoints[breakpoint]) {
        result[`@media (min-width: ${breakpoints[breakpoint]})`] = style;
      }
    });

    return result;
  };
}

/**
 * 样式调试工具
 * 在开发环境下添加调试信息
 */
export function debugStyles(styles: StyleObject, label?: string): StyleObject {
  if (process.env.NODE_ENV === "development" && label) {
    return {
      ...styles,
      "/* debug-label */": label,
    };
  }
  return styles;
}

/**
 * 样式性能优化
 * 移除重复和无效的样式属性
 */
export function optimizeStyles(styles: StyleObject): StyleObject {
  const optimized: StyleObject = {};

  Object.entries(styles).forEach(([key, value]) => {
    // 跳过空值
    if (value === null || value === undefined || value === "") return;

    // 处理嵌套对象
    if (typeof value === "object" && !Array.isArray(value)) {
      const nestedOptimized = optimizeStyles(value as StyleObject);
      if (Object.keys(nestedOptimized).length > 0) {
        optimized[key] = nestedOptimized;
      }
    } else {
      optimized[key] = value;
    }
  });

  return optimized;
}

/**
 * 样式兼容性处理
 * 添加浏览器前缀等兼容性处理
 */
export function addVendorPrefixes(styles: StyleObject): StyleObject {
  const prefixMap: Record<string, string[]> = {
    transform: ["-webkit-transform", "-moz-transform", "-ms-transform"],
    transition: ["-webkit-transition", "-moz-transition", "-ms-transition"],
    animation: ["-webkit-animation", "-moz-animation", "-ms-animation"],
    "box-shadow": ["-webkit-box-shadow", "-moz-box-shadow"],
    "border-radius": ["-webkit-border-radius", "-moz-border-radius"],
  };

  const result: StyleObject = {};

  Object.entries(styles).forEach(([property, value]) => {
    if (value === null || value === undefined) return;

    // 处理嵌套对象
    if (typeof value === "object" && !Array.isArray(value)) {
      result[property] = addVendorPrefixes(value as StyleObject);
      return;
    }

    // 添加原始属性
    result[property] = value;

    // 添加浏览器前缀
    const prefixes = prefixMap[property];
    if (prefixes) {
      prefixes.forEach(prefix => {
        result[prefix] = value;
      });
    }
  });

  return result;
}
