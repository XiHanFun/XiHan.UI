import type { ExtractPropTypes, PropType } from "vue";
import type { ThemeTokens } from "@xihan-ui/themes";

/**
 * Button 组件的尺寸类型
 */
export type ButtonSize = "small" | "medium" | "large";

/**
 * Button 组件的主题类型
 */
export type ButtonType = "default" | "primary" | "success" | "warning" | "error";

/**
 * Button 组件的动作类型
 */
export type ButtonAction = "confirm" | "cancel" | "submit" | "reset" | "ok" | null;

/**
 * Button 组件的形状类型
 */
export type ButtonShape = "square" | "round" | "circle";

/**
 * Button 组件的状态类型
 */
export type ButtonStatus = "normal" | "loading" | "disabled";

/**
 * Button 组件的 Props 定义
 */
export const buttonProps = {
  /**
   * 组件类型
   */
  type: {
    type: String as PropType<ButtonType>,
    default: "default",
  },
  /**
   * 组件尺寸
   */
  size: {
    type: String as PropType<ButtonSize>,
    default: "medium",
  },
  /**
   * 组件形状
   */
  shape: {
    type: String as PropType<ButtonShape>,
    default: "square",
  },
  /**
   * 组件状态
   */
  status: {
    type: String as PropType<ButtonStatus>,
    default: "normal",
  },
  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否处于加载状态
   */
  loading: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否为文本按钮
   */
  text: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否为幽灵按钮
   */
  ghost: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否为块级按钮
   */
  block: {
    type: Boolean,
    default: false,
  },
  /**
   * 动作类型
   */
  action: {
    type: String as PropType<ButtonAction>,
    default: null,
  },
  /**
   * 主题相关
   */
  theme: {
    type: Object as PropType<Partial<ThemeTokens>>,
    default: () => ({}),
  },
  /**
   * 是否启用动画
   */
  animation: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否启用波纹效果
   */
  ripple: {
    type: Boolean,
    default: true,
  },
  /**
   * 自定义类名
   */
  class: {
    type: String,
    default: "",
  },
  /**
   * 自定义样式
   */
  style: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    default: "",
  },
} as const;

/**
 * Button 组件的 Props 类型
 */
export type ButtonProps = ExtractPropTypes<typeof buttonProps>;

/**
 * Button 组件的实例类型
 */
export interface ButtonInstance {
  /**
   * 组件的 DOM 元素
   */
  $el: HTMLElement;
  /**
   * 获取组件的当前状态
   */
  getState(): Record<string, any>;
  /**
   * 重置组件状态
   */
  reset(): void;
  /**
   * 设置加载状态
   */
  setLoading(loading: boolean): void;
  /**
   * 设置禁用状态
   */
  setDisabled(disabled: boolean): void;
}

/**
 * Button 组件的事件类型
 */
export interface ButtonEvents {
  /**
   * 点击事件
   */
  click: (event: MouseEvent) => void;
  /**
   * 焦点事件
   */
  focus: (event: FocusEvent) => void;
  /**
   * 失焦事件
   */
  blur: (event: FocusEvent) => void;
  /**
   * 变化事件
   */
  change: (value: any) => void;
  /**
   * 加载状态变化事件
   */
  "loading-change": (loading: boolean) => void;
  /**
   * 禁用状态变化事件
   */
  "disabled-change": (disabled: boolean) => void;
}

/**
 * Button 组件的插槽类型
 */
export interface ButtonSlots {
  /**
   * 默认插槽
   */
  default?: () => any;
  /**
   * 前缀插槽
   */
  prefix?: () => any;
  /**
   * 后缀插槽
   */
  suffix?: () => any;
  /**
   * 加载图标插槽
   */
  loading?: () => any;
}
