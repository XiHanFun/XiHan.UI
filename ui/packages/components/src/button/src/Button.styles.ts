import { computed } from "vue";
import {
  createStyleFunction,
  hover,
  active,
  disabled,
  when,
  mergeStyles,
  type StyleObject,
  type Theme,
} from "@xihan-ui/themes";
import type { ButtonProps } from "./Button";

// 按钮基础样式
const baseButtonStyles = (theme: Theme): StyleObject => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  whiteSpace: "nowrap",
  outline: "none",
  border: "1px solid var(--xh-border-color)",
  fontWeight: theme.fontWeights.medium,
  userSelect: "none",
  WebkitAppearance: "none",
  cursor: "pointer",
  color: "var(--xh-text-color-primary)",
  backgroundColor: "var(--xh-bg-color)",
  borderRadius: "var(--xh-border-radius-base)",
  fontSize: "var(--xh-font-sizes-base)",
  transition: "all var(--xh-transitions-duration) var(--xh-transitions-timing)",
  textDecoration: "none",

  // 默认尺寸
  padding: "var(--xh-spacings-sm) var(--xh-spacings-lg)",
  minHeight: "32px",

  // 悬停状态
  ...hover({
    color: "var(--xh-colors-primary)",
    borderColor: "var(--xh-colors-primary)",
    backgroundColor: "var(--xh-colors-primary-light-9)",
  }),

  // 激活状态
  ...active({
    filter: "brightness(0.9)",
  }),

  // 禁用状态
  ...disabled({
    cursor: "not-allowed",
    opacity: 0.5,
    pointerEvents: "none",
  }),

  // 加载状态
  ...when(".is-loading", {
    cursor: "wait",
    pointerEvents: "auto",
  }),

  // 块级按钮
  ...when(".is-block", {
    display: "flex",
    width: "100%",
  }),

  // 圆角按钮
  ...when(".is-round", {
    borderRadius: "var(--xh-border-radius-round)",
  }),

  // 圆形按钮
  ...when(".is-circle", {
    borderRadius: "50%",
    padding: "var(--xh-spacings-sm)",
    width: "32px",
    height: "32px",
  }),
});

// 按钮类型样式
const buttonTypeStyles = {
  default: {},
  primary: {
    color: "var(--xh-colors-white)",
    backgroundColor: "var(--xh-colors-primary)",
    borderColor: "var(--xh-colors-primary)",

    ...hover({
      backgroundColor: "var(--xh-colors-primary-light-3)",
      borderColor: "var(--xh-colors-primary-light-3)",
    }),
  },
  success: {
    color: "var(--xh-colors-white)",
    backgroundColor: "var(--xh-colors-success)",
    borderColor: "var(--xh-colors-success)",

    ...hover({
      backgroundColor: "var(--xh-colors-success-light-3)",
      borderColor: "var(--xh-colors-success-light-3)",
    }),
  },
  warning: {
    color: "var(--xh-colors-white)",
    backgroundColor: "var(--xh-colors-warning)",
    borderColor: "var(--xh-colors-warning)",

    ...hover({
      backgroundColor: "var(--xh-colors-warning-light-3)",
      borderColor: "var(--xh-colors-warning-light-3)",
    }),
  },
  danger: {
    color: "var(--xh-colors-white)",
    backgroundColor: "var(--xh-colors-danger)",
    borderColor: "var(--xh-colors-danger)",

    ...hover({
      backgroundColor: "var(--xh-colors-danger-light-3)",
      borderColor: "var(--xh-colors-danger-light-3)",
    }),
  },
  info: {
    color: "var(--xh-colors-white)",
    backgroundColor: "var(--xh-colors-info)",
    borderColor: "var(--xh-colors-info)",

    ...hover({
      backgroundColor: "var(--xh-colors-info-light-3)",
      borderColor: "var(--xh-colors-info-light-3)",
    }),
  },
  text: {
    border: "none",
    backgroundColor: "transparent",
    color: "var(--xh-colors-primary)",

    ...hover({
      backgroundColor: "var(--xh-colors-primary-light-9)",
    }),
  },
  link: {
    border: "none",
    backgroundColor: "transparent",
    color: "var(--xh-colors-primary)",
    textDecoration: "underline",

    ...hover({
      color: "var(--xh-colors-primary-light-3)",
    }),
  },
};

// 按钮尺寸样式
const buttonSizeStyles = {
  small: {
    padding: "var(--xh-spacings-xs) var(--xh-spacings-base)",
    fontSize: "var(--xh-font-sizes-sm)",
    minHeight: "24px",

    ...when(".is-circle", {
      width: "24px",
      height: "24px",
    }),
  },
  medium: {
    padding: "var(--xh-spacings-sm) var(--xh-spacings-lg)",
    fontSize: "var(--xh-font-sizes-base)",
    minHeight: "32px",

    ...when(".is-circle", {
      width: "32px",
      height: "32px",
    }),
  },
  large: {
    padding: "var(--xh-spacings-base) var(--xh-spacings-xl)",
    fontSize: "var(--xh-font-sizes-lg)",
    minHeight: "40px",

    ...when(".is-circle", {
      width: "40px",
      height: "40px",
    }),
  },
};

// 朴素按钮样式
const plainButtonStyles = (type: string) => {
  if (type === "default") {
    return {};
  }

  return {
    color: `var(--xh-colors-${type})`,
    backgroundColor: "var(--xh-colors-white)",
    borderColor: `var(--xh-colors-${type})`,

    ...hover({
      color: "var(--xh-colors-white)",
      backgroundColor: `var(--xh-colors-${type})`,
    }),
  };
};

// 图标样式
const iconStyles: StyleObject = {
  marginRight: "var(--xh-spacings-xs)",

  // 右侧图标
  ".icon-placement--right &": {
    marginRight: 0,
    marginLeft: "var(--xh-spacings-xs)",
    order: 1,
  },

  // 圆形按钮中的图标
  ".is-circle &": {
    margin: 0,
  },
};

// 加载图标样式
const loadingIconStyles: StyleObject = {
  marginRight: "var(--xh-spacings-xs)",
  display: "inline-flex",
  alignItems: "center",

  ".xh-icon": {
    animation: "xh-spin 1s infinite linear",
    width: "1em",
    height: "1em",
  },
};

// 按钮内容样式
const buttonContentStyles: StyleObject = {
  ".is-loading &": {
    opacity: 0.7,
  },
};

// 创建按钮样式函数
export const useButtonStyles = createStyleFunction<ButtonProps>((theme, props) => {
  const {
    type = "default",
    size = "medium",
    plain = false,
    loading = false,
    disabled: isDisabled = false,
    block = false,
    round = false,
    circle = false,
  } = props || {};

  // 基础样式
  let styles = baseButtonStyles(theme);

  // 类型样式
  if (plain && type !== "default") {
    styles = mergeStyles(styles, plainButtonStyles(type));
  } else {
    styles = mergeStyles(styles, buttonTypeStyles[type as keyof typeof buttonTypeStyles] || {});
  }

  // 尺寸样式
  styles = mergeStyles(styles, buttonSizeStyles[size as keyof typeof buttonSizeStyles] || {});

  return styles;
});

// 导出样式对象
export const buttonStyles = {
  base: baseButtonStyles,
  types: buttonTypeStyles,
  sizes: buttonSizeStyles,
  icon: iconStyles,
  loadingIcon: loadingIconStyles,
  content: buttonContentStyles,
};
