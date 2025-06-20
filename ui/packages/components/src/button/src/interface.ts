import type { ExtractPropTypes, PropType, Ref } from "vue";
import type { ThemeTokens } from "@xihan-ui/themes";

/**
 * Button 组件的尺寸类型
 */
export type ButtonSize = "small" | "medium" | "large";

/**
 * Button 组件的主题类型
 */
export type ButtonType = "default" | "primary" | "success" | "warning" | "error" | "info" | "submit";

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
  type: {
    type: String as PropType<ButtonType>,
    default: "default",
  },
  size: {
    type: String as PropType<ButtonSize>,
    default: "medium",
  },
  shape: {
    type: String as PropType<ButtonShape>,
    default: "square",
  },
  color: { type: String as PropType<string>, default: "" },
  textColor: { type: String as PropType<string>, default: "" },
  text: Boolean,
  block: Boolean,
  loading: Boolean,
  disabled: Boolean,
  ghost: Boolean,
  round: Boolean,
  circle: Boolean,
  dashed: Boolean,
  strong: Boolean,
  bordered: {
    type: Boolean,
    default: true,
  },
  focusable: {
    type: Boolean,
    default: true,
  },
  keyboard: {
    type: Boolean,
    default: true,
  },
  tag: {
    type: String as PropType<keyof HTMLElementTagNameMap>,
    default: "button",
  },
  attrType: {
    type: String as PropType<"button" | "submit" | "reset">,
    default: "button",
  },
  /**
   * 按钮的 aria-label
   */
  ariaLabel: {
    type: String,
    default: "",
  },
  /**
   * 按钮的 aria-describedby
   */
  ariaDescribedby: {
    type: String,
    default: "",
  },
  /**
   * 按钮的 aria-pressed
   */
  ariaPressed: {
    type: [Boolean, String] as PropType<boolean | "true" | "false" | "mixed">,
    default: undefined,
  },
  /**
   * 按钮的 aria-expanded
   */
  ariaExpanded: {
    type: [Boolean, String] as PropType<boolean | "true" | "false">,
    default: undefined,
  },
  /**
   * 按钮的 aria-controls
   */
  ariaControls: {
    type: String,
    default: "",
  },
  /**
   * 按钮的 aria-haspopup
   */
  ariaHaspopup: {
    type: [Boolean, String] as PropType<boolean | "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog">,
    default: undefined,
  },
  /**
   * 按钮的 role
   */
  role: {
    type: String,
    default: "",
  },
  /**
   * 按钮的 tabindex
   */
  tabindex: {
    type: [String, Number] as PropType<string | number>,
    default: 0,
  },
  ripple: {
    type: Boolean as PropType<boolean>,
    default: true,
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
  $el: Ref<HTMLElement | null>;
  /**
   * 获取组件的当前状态
   */
  getState: () => {
    isPressed: boolean;
    isFocused: boolean;
    status: ButtonStatus;
  };
  /**
   * 重置组件状态
   */
  reset: () => void;
  /**
   * 设置加载状态
   */
  setLoading: (loading: boolean) => void;
  /**
   * 设置禁用状态
   */
  setDisabled: (disabled: boolean) => void;
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
