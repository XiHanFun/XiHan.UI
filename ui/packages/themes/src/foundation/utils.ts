/**
 * 核心工具函数库
 * 统一整个样式系统的通用工具函数
 */

import type { CSSValue, StyleObject, ClassName, CSSVarName } from "./types";

// =============================================
// 哈希生成工具
// =============================================

/**
 * 统一的哈希生成函数
 * 使用 djb2 算法，性能优秀且冲突率低
 */
export function generateHash(input: string, length: number = 8): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash).toString(36).substring(0, length);
}

/**
 * 为样式对象生成唯一哈希
 */
export function generateStyleHash(styles: StyleObject, prefix: string = "xh"): string {
  const styleString = styleObjectToString(styles);
  const hash = generateHash(styleString);
  return `${prefix}-${hash}`;
}

// =============================================
// 字符串处理工具
// =============================================

/**
 * 转换为 kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

/**
 * 转换为 camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 转换为 PascalCase
 */
export function toPascalCase(str: string): string {
  return str.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase());
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// =============================================
// CSS 值处理工具
// =============================================

/**
 * 标准化 CSS 值
 * 自动添加单位或处理特殊值
 */
export function normalizeCSSValue(property: string, value: CSSValue): string {
  if (typeof value === "number") {
    // 需要单位的属性
    if (needsUnit(property)) {
      return `${value}px`;
    }
    return value.toString();
  }

  return value;
}

/**
 * 判断 CSS 属性是否需要单位
 */
function needsUnit(property: string): boolean {
  const unitlessProperties = new Set([
    "opacity",
    "zIndex",
    "fontWeight",
    "lineHeight",
    "flex",
    "flexGrow",
    "flexShrink",
    "flexOrder",
    "gridColumn",
    "gridRow",
    "order",
    "zoom",
    "fillOpacity",
    "floodOpacity",
    "stopOpacity",
    "strokeOpacity",
  ]);

  return !unitlessProperties.has(property);
}

/**
 * 创建 CSS 变量名
 */
export function createCSSVar(name: string, prefix: string = "xh"): CSSVarName {
  const varName = `--${prefix}-${toKebabCase(name)}`;
  return varName as CSSVarName;
}

/**
 * 引用 CSS 变量
 */
export function useCSSVar(name: CSSVarName, fallback?: string): string {
  return fallback ? `var(${name}, ${fallback})` : `var(${name})`;
}

// =============================================
// 样式对象处理工具
// =============================================

/**
 * 将样式对象转换为字符串（用于哈希生成）
 */
export function styleObjectToString(styles: StyleObject): string {
  const keys = Object.keys(styles).sort();
  const pairs = keys.map(key => {
    const value = styles[key];
    if (typeof value === "object" && value !== null) {
      return `${key}:{${styleObjectToString(value)}}`;
    }
    return `${key}:${value}`;
  });
  return pairs.join(";");
}

/**
 * 将样式对象转换为 CSS 字符串
 */
export function styleObjectToCSS(styles: StyleObject, selector?: string): string {
  const cssRules: string[] = [];
  const nestedRules: string[] = [];

  for (const [property, value] of Object.entries(styles)) {
    if (value === undefined) continue;

    if (typeof value === "object") {
      // 处理嵌套规则
      const nestedSelector = selector ? `${selector} ${property}` : property;
      nestedRules.push(styleObjectToCSS(value, nestedSelector));
    } else {
      // 处理普通属性
      const cssProperty = toKebabCase(property);
      const cssValue = normalizeCSSValue(property, value);
      cssRules.push(`  ${cssProperty}: ${cssValue};`);
    }
  }

  const result: string[] = [];

  // 添加当前选择器的规则
  if (cssRules.length > 0 && selector) {
    result.push(`${selector} {\n${cssRules.join("\n")}\n}`);
  }

  // 添加嵌套规则
  result.push(...nestedRules);

  return result.join("\n");
}

/**
 * 深度合并样式对象
 */
export function mergeStyleObjects(...styleObjects: (StyleObject | undefined)[]): StyleObject {
  const result: StyleObject = {};

  for (const styles of styleObjects) {
    if (!styles) continue;

    for (const [key, value] of Object.entries(styles)) {
      if (value === undefined) continue;

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // 递归合并嵌套对象
        result[key] = mergeStyleObjects(result[key] as StyleObject, value as StyleObject);
      } else {
        // 直接赋值
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * 条件样式
 */
export function conditionalStyle(condition: boolean, styles: StyleObject): StyleObject {
  return condition ? styles : {};
}

// =============================================
// 类名处理工具
// =============================================

/**
 * 合并类名
 */
export function combineClassNames(...classNames: (string | undefined | null | false)[]): ClassName {
  return classNames.filter(Boolean).join(" ").trim() as ClassName;
}

/**
 * 创建 BEM 类名
 */
export function createBEMClassName(
  block: string,
  element?: string,
  modifier?: string,
  options: { elementSeparator?: string; modifierSeparator?: string } = {},
): ClassName {
  const { elementSeparator = "__", modifierSeparator = "--" } = options;

  let className = block;

  if (element) {
    className += `${elementSeparator}${element}`;
  }

  if (modifier) {
    className += `${modifierSeparator}${modifier}`;
  }

  return className as ClassName;
}

// =============================================
// 颜色处理工具
// =============================================

/**
 * 解析颜色值为 RGB 分量
 */
export function parseColor(color: string): [number, number, number] | null {
  // 处理十六进制颜色
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return [parseInt(hex[0] + hex[0], 16), parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16)];
    } else if (hex.length === 6) {
      return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
    }
  }

  // 处理 RGB 颜色
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }

  return null;
}

/**
 * 混合两个颜色
 */
export function mixColors(color1: string, color2: string, weight: number = 0.5): string {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  if (!rgb1 || !rgb2) {
    return color1; // 回退到第一个颜色
  }

  const r = Math.round(rgb1[0] * (1 - weight) + rgb2[0] * weight);
  const g = Math.round(rgb1[1] * (1 - weight) + rgb2[1] * weight);
  const b = Math.round(rgb1[2] * (1 - weight) + rgb2[2] * weight);

  return `rgb(${r}, ${g}, ${b})`;
}

// =============================================
// 性能优化工具
// =============================================

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: number | undefined;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 记忆化函数
 */
export function memoize<T extends (...args: any[]) => any>(func: T, getKey?: (...args: Parameters<T>) => string): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// =============================================
// 数组处理工具
// =============================================

/**
 * 去重数组
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * 压缩数组（移除 falsy 值）
 */
export function compact<T>(array: (T | null | undefined | false | 0 | "")[]): T[] {
  return array.filter(Boolean) as T[];
}

// =============================================
// 对象处理工具
// =============================================

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * 判断两个值是否深度相等
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => keysB.includes(key) && deepEqual(a[key], b[key]));
  }

  return false;
}
