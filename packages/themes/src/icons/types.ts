import type { Component, PropType } from "vue";

// 图标大小
export type IconSize = "small" | "medium" | "large" | number;

// 图标主题
export type IconTheme = "outline" | "filled" | "two-tone";

// 图标方向
export type IconRotate = 0 | 90 | 180 | 270;

// 图标属性
export interface IconProps {
  // 基础属性
  size?: IconSize;
  color?: string;
  spin?: boolean;
  // 扩展属性
  theme?: IconTheme;
  rotate?: IconRotate;
  flip?: "horizontal" | "vertical";
  // 交互属性
  clickable?: boolean;
  disabled?: boolean;
  // 自定义类名和样式
  class?: string | string[];
  style?: string | Record<string, string>;
}

// 图标组件类型
export type IconComponent = Component<IconProps>;

// 图标集合类型
export interface IconSet {
  [key: string]: IconComponent;
}

// 图标配置
export interface IconConfig {
  defaultSize?: IconSize;
  defaultTheme?: IconTheme;
  defaultColor?: string;
  prefix?: string;
}

// 图标注册选项
export interface IconRegisterOptions {
  name: string;
  component: IconComponent;
}
