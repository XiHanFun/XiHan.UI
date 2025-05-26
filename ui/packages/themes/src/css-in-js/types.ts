/**
 * CSS-in-JS 类型定义
 * 基于 @utils/dom 构建的样式系统类型
 */

import type { CSSProperties } from "vue";

/**
 * 样式对象类型
 */
export type StyleObject = CSSProperties & {
  // 支持其他任意选择器
  [key: string]: string | number | undefined | StyleObject;
};

/**
 * 组件样式配置
 */
export interface ComponentStylesConfig {
  name: string;
  baseStyles?: StyleObject;
  variants?: Record<string, StyleObject>;
  sizes?: Record<string, StyleObject>;
  states?: Record<string, StyleObject>;
}

/**
 * CSS 规则
 */
export interface CSSRule {
  selector: string;
  styles: StyleObject;
}

/**
 * 组件样式函数类型
 */
export type ComponentStyleFunction<T = any> = (theme: any, props?: T) => StyleObject;

/**
 * 样式工厂类型
 */
export type StyleFactory<T = any> = (props?: T) => string;

/**
 * 样式变体配置
 */
export interface StyleVariantConfig {
  base?: StyleObject;
  variants?: Record<string, StyleObject>;
  compoundVariants?: Array<{
    variants: Record<string, any>;
    styles: StyleObject;
  }>;
  defaultVariants?: Record<string, any>;
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  name: string;
  duration?: string;
  timingFunction?: string;
  delay?: string;
  iterationCount?: string | number;
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  fillMode?: "none" | "forwards" | "backwards" | "both";
  playState?: "running" | "paused";
}

/**
 * 过渡配置
 */
export interface TransitionConfig {
  property?: string;
  duration?: string;
  timingFunction?: string;
  delay?: string;
}

/**
 * 媒体查询配置
 */
export interface MediaQueryConfig {
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  orientation?: "portrait" | "landscape";
  resolution?: string;
  aspectRatio?: string;
  colorScheme?: "light" | "dark";
  reducedMotion?: boolean;
  hover?: "none" | "hover";
  pointer?: "none" | "coarse" | "fine";
}

/**
 * 容器查询配置
 */
export interface ContainerQueryConfig {
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  aspectRatio?: string;
}

/**
 * 全局样式配置
 */
export interface GlobalStylesConfig {
  reset?: boolean;
  normalize?: boolean;
  customReset?: StyleObject;
  variables?: Record<string, string>;
  keyframes?: Record<string, Record<string, StyleObject>>;
}
