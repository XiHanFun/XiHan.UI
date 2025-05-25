import type { StyleObject } from "./types";

// 生成唯一的 hash
export function generateHash(input: string, length = 8): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, length);
}

// 将样式对象转换为 CSS 字符串
export function styleObjectToCSS(styles: StyleObject): string {
  return Object.entries(styles)
    .map(([property, value]) => {
      if (value === null || value === undefined) return "";

      // 处理嵌套选择器
      if (typeof value === "object" && !Array.isArray(value)) {
        return `${property} { ${styleObjectToCSS(value as StyleObject)} }`;
      }

      // 转换驼峰命名为短横线命名
      const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase();

      // 处理数值类型的属性
      const cssValue = typeof value === "number" && needsUnit(cssProperty) ? `${value}px` : String(value);

      return `${cssProperty}: ${cssValue};`;
    })
    .filter(Boolean)
    .join(" ");
}

// 判断 CSS 属性是否需要单位
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
    "stroke-dasharray",
    "stroke-dashoffset",
  ]);

  return !unitlessProperties.has(property);
}

// 合并样式对象
export function mergeStyles(...styles: (StyleObject | undefined)[]): StyleObject {
  return styles.reduce((merged, style) => {
    if (!style) return merged;

    Object.entries(style).forEach(([key, value]) => {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        merged[key] = mergeStyles((merged[key] as StyleObject) || {}, value as StyleObject);
      } else {
        merged[key] = value;
      }
    });

    return merged;
  }, {} as StyleObject);
}

// 创建媒体查询
export function mediaQuery(breakpoint: string, styles: StyleObject): StyleObject {
  return {
    [`@media (min-width: ${breakpoint})`]: styles,
  };
}

// 创建伪类选择器
export function pseudoClass(pseudo: string, styles: StyleObject): StyleObject {
  return {
    [`&:${pseudo}`]: styles,
  };
}

// 创建伪元素选择器
export function pseudoElement(element: string, styles: StyleObject): StyleObject {
  return {
    [`&::${element}`]: styles,
  };
}

// 创建子选择器
export function childSelector(selector: string, styles: StyleObject): StyleObject {
  return {
    [`& ${selector}`]: styles,
  };
}

// 颜色工具函数
export function rgba(color: string, alpha: number): string {
  // 简单的 hex 转 rgba 实现
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

// 混合颜色（简化版）
export function mixColor(color1: string, color2: string, weight: number): string {
  // 这里可以实现更复杂的颜色混合逻辑
  // 暂时返回原色
  return weight > 0.5 ? color1 : color2;
}

// 创建 CSS 变量
export function cssVar(name: string, fallback?: string): string {
  return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`;
}

// 创建 CSS 变量对象
export function createCSSVars(vars: Record<string, string>, prefix = "xh"): Record<string, string> {
  const result: Record<string, string> = {};

  Object.entries(vars).forEach(([key, value]) => {
    result[`--${prefix}-${key}`] = value;
  });

  return result;
}

// 扁平化嵌套对象
export function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}-${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  });

  return result;
}
