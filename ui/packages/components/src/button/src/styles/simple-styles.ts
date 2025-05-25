import { computed } from "vue";
import {
  createSimpleStyleFunction,
  simpleMergeStyles,
  type SimpleStyleObject,
  type SimpleTheme,
} from "@xihan-ui/themes";
import type { ButtonProps } from "../Button";

// 按钮基础样式
const baseButtonStyles = (theme: SimpleTheme): SimpleStyleObject => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  whiteSpace: "nowrap",
  outline: "none",
  border: "1px solid var(--xh-border-color)",
  fontWeight: "500",
  userSelect: "none",
  WebkitAppearance: "none",
  cursor: "pointer",
  color: "var(--xh-text-color-primary)",
  backgroundColor: "var(--xh-bg-color)",
  borderRadius: "var(--xh-border-radius-base)",
  fontSize: theme.fontSizes.base,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  textDecoration: "none",

  // 默认尺寸
  padding: `${theme.spacings.sm} ${theme.spacings.lg}`,
  minHeight: "32px",

  // 悬停状态
  "&:hover:not(:disabled)": {
    color: "var(--xh-colors-primary)",
    borderColor: "var(--xh-colors-primary)",
    backgroundColor: "var(--xh-colors-primary-light-9)",
  },

  // 激活状态
  "&:active:not(:disabled)": {
    filter: "brightness(0.9)",
  },

  // 禁用状态
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.5,
    pointerEvents: "none",
  },

  // 加载状态
  "&.is-loading": {
    cursor: "wait",
    pointerEvents: "auto",
  },

  // 块级按钮
  "&.is-block": {
    display: "flex",
    width: "100%",
  },

  // 圆角按钮
  "&.is-round": {
    borderRadius: theme.borderRadius.round,
  },

  // 圆形按钮
  "&.is-circle": {
    borderRadius: "50%",
    padding: theme.spacings.sm,
    width: "32px",
    height: "32px",
  },
});

// 按钮类型样式
const buttonTypeStyles = {
  default: {},
  primary: {
    color: "var(--xh-colors-white)",
    backgroundColor: "var(--xh-colors-primary)",
    borderColor: "var(--xh-colors-primary)",

    "&:hover:not(:disabled)": {
      backgroundColor: "var(--xh-colors-primary-light-3)",
      borderColor: "var(--xh-colors-primary-light-3)",
    },
  },
  success: {
    color: "var(--xh-colors-white)",
    backgroundColor: "var(--xh-colors-success)",
    borderColor: "var(--xh-colors-success)",

    "&:hover:not(:disabled)": {
      backgroundColor: "var(--xh-colors-success-light-3)",
      borderColor: "var(--xh-colors-success-light-3)",
    },
  },
  warning: {
    color: "var(--xh-colors-white)",
    backgroundColor: "var(--xh-colors-warning)",
    borderColor: "var(--xh-colors-warning)",

    "&:hover:not(:disabled)": {
      backgroundColor: "var(--xh-colors-warning-light-3)",
      borderColor: "var(--xh-colors-warning-light-3)",
    },
  },
  danger: {
    color: "var(--xh-colors-white)",
    backgroundColor: "var(--xh-colors-danger)",
    borderColor: "var(--xh-colors-danger)",

    "&:hover:not(:disabled)": {
      backgroundColor: "var(--xh-colors-danger-light-3)",
      borderColor: "var(--xh-colors-danger-light-3)",
    },
  },
  info: {
    color: "var(--xh-colors-white)",
    backgroundColor: "var(--xh-colors-info)",
    borderColor: "var(--xh-colors-info)",

    "&:hover:not(:disabled)": {
      backgroundColor: "var(--xh-colors-info-light-3)",
      borderColor: "var(--xh-colors-info-light-3)",
    },
  },
  text: {
    border: "none",
    backgroundColor: "transparent",
    color: "var(--xh-colors-primary)",

    "&:hover:not(:disabled)": {
      backgroundColor: "var(--xh-colors-primary-light-9)",
    },
  },
  link: {
    border: "none",
    backgroundColor: "transparent",
    color: "var(--xh-colors-primary)",
    textDecoration: "underline",

    "&:hover:not(:disabled)": {
      color: "var(--xh-colors-primary-light-3)",
    },
  },
};

// 按钮尺寸样式
const buttonSizeStyles = (theme: SimpleTheme) => ({
  small: {
    padding: `${theme.spacings.xs} ${theme.spacings.base}`,
    fontSize: theme.fontSizes.sm,
    minHeight: "24px",

    "&.is-circle": {
      width: "24px",
      height: "24px",
    },
  },
  medium: {
    padding: `${theme.spacings.sm} ${theme.spacings.lg}`,
    fontSize: theme.fontSizes.base,
    minHeight: "32px",

    "&.is-circle": {
      width: "32px",
      height: "32px",
    },
  },
  large: {
    padding: `${theme.spacings.base} ${theme.spacings.xl}`,
    fontSize: theme.fontSizes.lg,
    minHeight: "40px",

    "&.is-circle": {
      width: "40px",
      height: "40px",
    },
  },
});

// 朴素按钮样式
const plainButtonStyles = (type: string): SimpleStyleObject => {
  if (type === "default") {
    return {};
  }

  return {
    color: `var(--xh-colors-${type})`,
    backgroundColor: "var(--xh-colors-white)",
    borderColor: `var(--xh-colors-${type})`,

    "&:hover:not(:disabled)": {
      color: "var(--xh-colors-white)",
      backgroundColor: `var(--xh-colors-${type})`,
    },
  };
};

// 图标样式
const iconStyles: SimpleStyleObject = {
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
const loadingIconStyles: SimpleStyleObject = {
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
const buttonContentStyles: SimpleStyleObject = {
  ".is-loading &": {
    opacity: 0.7,
  },
};

// 创建按钮样式函数（暂时注释掉，等待修复导入问题）
// export const useButtonStyles = createSimpleStyleFunction<ButtonProps>((theme, props) => {
//   const {
//     type = 'default',
//     size = 'medium',
//     plain = false,
//     loading = false,
//     disabled: isDisabled = false,
//     block = false,
//     round = false,
//     circle = false,
//   } = props || {};

//   // 基础样式
//   let styles = baseButtonStyles(theme);

//   // 类型样式
//   if (plain && type !== 'default') {
//     styles = simpleMergeStyles(styles, plainButtonStyles(type));
//   } else {
//     styles = simpleMergeStyles(styles, buttonTypeStyles[type as keyof typeof buttonTypeStyles] || {});
//   }

//   // 尺寸样式
//   const sizeStyles = buttonSizeStyles(theme);
//   styles = simpleMergeStyles(styles, sizeStyles[size as keyof typeof sizeStyles] || {});

//   return styles;
// });

// 导出样式对象
export const buttonStyles = {
  base: baseButtonStyles,
  types: buttonTypeStyles,
  sizes: buttonSizeStyles,
  icon: iconStyles,
  loadingIcon: loadingIconStyles,
  content: buttonContentStyles,
};
