import type { CSSProperties } from "vue";

// 基础样式对象类型，支持嵌套选择器、媒体查询等
export type StyleObject = CSSProperties & {
  // 支持其他任意选择器
  [key: string]: string | number | undefined | StyleObject;
};

// 主题配置类型
export interface ThemeConfig {
  colors: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    white: string;
    black: string;
    [key: string]: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    [key: string]: string;
  };
  fontWeights: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
    [key: string]: number;
  };
  lineHeights: {
    none: number;
    tight: number;
    normal: number;
    loose: number;
    [key: string]: number;
  };
  spacings: {
    "0": string;
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    [key: string]: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    round: string;
    circle: string;
    [key: string]: string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    [key: string]: string;
  };
  zIndexes: {
    dropdown: number;
    sticky: number;
    fixed: number;
    modalBackdrop: number;
    modal: number;
    popover: number;
    tooltip: number;
    [key: string]: number;
  };
  shadows: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    [key: string]: string;
  };
  transitions: {
    duration: string;
    timing: string;
    [key: string]: string;
  };
}

// 主题类型
export interface Theme extends ThemeConfig {
  mode: "light" | "dark";
  cssVars: Record<string, string>;
}

// 组件样式配置
export interface ComponentStylesConfig {
  name: string;
  baseStyles?: StyleObject;
  variants?: Record<string, StyleObject>;
  sizes?: Record<string, StyleObject>;
  states?: Record<string, StyleObject>;
}

// CSS 规则类型
export interface CSSRule {
  selector: string;
  styles: StyleObject;
}

// 样式引擎相关类型已移至 core/types.ts

// 组件样式函数类型
export type ComponentStyleFunction<T = any> = (theme: Theme, props?: T) => StyleObject;

// 样式工厂类型
export type StyleFactory<T = any> = (props?: T) => string;
