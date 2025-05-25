import { ref, computed, inject, provide, watch, type InjectionKey, type Ref } from "vue";

// 简化的样式对象类型
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

// 样式引擎注入键
export const SIMPLE_STYLE_ENGINE_KEY: InjectionKey<SimpleStyleEngine> = Symbol("simpleStyleEngine");

// 简化的样式引擎
export class SimpleStyleEngine {
  private styleElements = new Map<string, HTMLStyleElement>();
  private cache = new Map<string, string>();

  // 生成 hash
  private generateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  }

  // 将样式对象转换为 CSS
  private styleObjectToCSS(styles: SimpleStyleObject): string {
    return Object.entries(styles)
      .map(([property, value]) => {
        if (typeof value === "object") {
          return `${property} { ${this.styleObjectToCSS(value)} }`;
        }
        const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${cssProperty}: ${value};`;
      })
      .join(" ");
  }

  // 注入样式
  injectStyle(css: string, id?: string): void {
    const styleId = id || this.generateHash(css);

    if (this.styleElements.has(styleId)) {
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.setAttribute("data-xh-style", styleId);
    styleElement.textContent = css;

    document.head.appendChild(styleElement);
    this.styleElements.set(styleId, styleElement);
  }

  // 创建动态样式
  createDynamicStyle(styles: SimpleStyleObject): string {
    const hash = this.generateHash(JSON.stringify(styles));
    const className = `xh-${hash}`;
    const cacheKey = `dynamic-${hash}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const css = `.${className} { ${this.styleObjectToCSS(styles)} }`;
    this.injectStyle(css, cacheKey);
    this.cache.set(cacheKey, className);

    return className;
  }

  // 清理样式
  clear(): void {
    this.styleElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.styleElements.clear();
    this.cache.clear();
  }
}

// 创建样式引擎
export function createSimpleStyleEngine(): SimpleStyleEngine {
  return new SimpleStyleEngine();
}

// 提供样式引擎
export function provideSimpleStyleEngine(engine: SimpleStyleEngine): void {
  provide(SIMPLE_STYLE_ENGINE_KEY, engine);
}

// 使用样式引擎
export function useSimpleStyleEngine(): SimpleStyleEngine {
  const engine = inject(SIMPLE_STYLE_ENGINE_KEY);
  if (!engine) {
    throw new Error("SimpleStyleEngine not provided");
  }
  return engine;
}

// 简化的 CSS 函数
export function css(styles: SimpleStyleObject): string {
  const engine = useSimpleStyleEngine();
  return engine.createDynamicStyle(styles);
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
    const engine = useSimpleStyleEngine();
    const theme = useSimpleTheme();

    return computed(() => {
      const styles = styleFunction(theme.value, props);
      return engine.createDynamicStyle(styles);
    });
  };
}
