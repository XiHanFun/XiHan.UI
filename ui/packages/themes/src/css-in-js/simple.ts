import { ref, computed, inject, provide, type InjectionKey, type Ref } from "vue";

// 简化的样式对象类型（保留，因为 core 模块也需要）
export interface SimpleStyleObject {
  [key: string]: string | number | SimpleStyleObject;
}

// 简化的主题类型
export interface SimpleTheme {
  colors: Record<string, string>;
  fontSizes: Record<string, string>;
  spacings: Record<string, string>;
  borderRadius: Record<string, string>;
  [key: string]: any;
}

// 简化的 CSS 函数（使用 core 模块的引擎）
export function css(styles: SimpleStyleObject): string {
  // 这里应该使用 core 模块的 SimpleStyleEngine
  // 为了避免循环依赖，这里提供一个简单的实现
  const hash = generateSimpleHash(JSON.stringify(styles));
  const className = `xh-${hash}`;

  // 简单的样式注入
  if (typeof document !== "undefined") {
    const existingStyle = document.querySelector(`style[data-xh-simple="${hash}"]`);
    if (!existingStyle) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-xh-simple", hash);
      styleElement.textContent = `.${className} { ${styleObjectToCSS(styles)} }`;
      document.head.appendChild(styleElement);
    }
  }

  return className;
}

// 简单的 hash 生成函数
function generateSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

// 简单的样式对象转 CSS 函数
function styleObjectToCSS(styles: SimpleStyleObject): string {
  return Object.entries(styles)
    .map(([property, value]) => {
      if (typeof value === "object") {
        return `${property} { ${styleObjectToCSS(value)} }`;
      }
      const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssProperty}: ${value};`;
    })
    .join(" ");
}

// 样式组合函数
export function cx(...classNames: (string | undefined | null | false)[]): string {
  return classNames.filter(Boolean).join(" ");
}

// 合并样式
export function mergeStyles(...styles: SimpleStyleObject[]): SimpleStyleObject {
  return styles.reduce((merged, style) => ({ ...merged, ...style }), {});
}

// 默认主题
export const defaultTheme: SimpleTheme = {
  colors: {
    primary: "#409eff",
    success: "#67c23a",
    warning: "#e6a23c",
    danger: "#f56c6c",
    info: "#909399",
    white: "#ffffff",
    black: "#000000",
  },
  fontSizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
  },
  spacings: {
    xs: "4px",
    sm: "8px",
    base: "12px",
    lg: "16px",
    xl: "24px",
  },
  borderRadius: {
    sm: "2px",
    base: "4px",
    lg: "8px",
    round: "20px",
  },
};

// 主题注入键
export const SIMPLE_THEME_KEY: InjectionKey<Ref<SimpleTheme>> = Symbol("simpleTheme");

// 提供主题
export function provideSimpleTheme(theme: Ref<SimpleTheme>): void {
  provide(SIMPLE_THEME_KEY, theme);
}

// 使用主题
export function useSimpleTheme(): Ref<SimpleTheme> {
  const theme = inject(SIMPLE_THEME_KEY);
  if (!theme) {
    return ref(defaultTheme);
  }
  return theme;
}

// 创建样式函数
export function createSimpleStyleFunction<T = any>(
  styleFunction: (theme: SimpleTheme, props?: T) => SimpleStyleObject,
) {
  return (props?: T) => {
    const theme = useSimpleTheme();

    return computed(() => {
      const styles = styleFunction(theme.value, props);
      return css(styles);
    });
  };
}
