import { computed, type ComputedRef } from "vue";
import type { ComponentStylesConfig, StyleObject, ComponentStyleFunction } from "./types";
import { useTheme } from "../theme/theme";
import { mergeStyles } from "./utils";
import { css } from "./css";

// 组件样式创建器
export function createComponentStyles<T = any>(
  config: ComponentStylesConfig,
): {
  useStyles: (props?: T) => ComputedRef<string>;
  className: string;
} {
  const { name, baseStyles = {}, variants = {}, sizes = {}, states = {} } = config;

  // 生成基础类名
  const baseClassName = `xh-${name}`;

  // 使用样式的 hook
  const useStyles = (props?: T) => {
    const { theme } = useTheme();

    return computed(() => {
      // 合并所有样式
      const allStyles = mergeStyles(
        baseStyles,
        // 这里可以根据 props 动态添加变体、尺寸、状态样式
      );

      // 使用 css 函数创建样式
      return css(allStyles);
    });
  };

  return {
    useStyles,
    className: baseClassName,
  };
}

// 创建样式函数
export function createStyleFunction<T = any>(
  styleFunction: ComponentStyleFunction<T>,
): (props?: T) => ComputedRef<string> {
  return (props?: T) => {
    const { theme } = useTheme();

    return computed(() => {
      const styles = styleFunction(theme.value, props);
      return css(styles);
    });
  };
}

// 预定义的组件样式工厂
export const componentStyleFactories = {
  // 按钮样式工厂
  button: (theme: any) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    whiteSpace: "nowrap",
    outline: "none",
    border: `1px solid var(--xh-border-color)`,
    fontWeight: theme.fontWeights.medium,
    userSelect: "none",
    WebkitAppearance: "none",
    cursor: "pointer",
    color: "var(--xh-text-color-primary)",
    backgroundColor: "var(--xh-bg-color)",
    borderRadius: "var(--xh-border-radius-base)",
    padding: `var(--xh-spacings-sm) var(--xh-spacings-lg)`,
    fontSize: "var(--xh-font-sizes-base)",
    minHeight: "32px",
    transition: `all var(--xh-transitions-duration) var(--xh-transitions-timing)`,

    "&:hover:not(:disabled)": {
      color: "var(--xh-colors-primary)",
      borderColor: "var(--xh-colors-primary)",
      backgroundColor: "var(--xh-colors-primary-light-9)",
    },

    "&:active:not(:disabled)": {
      filter: "brightness(0.9)",
    },

    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  }),

  // 图标样式工厂
  icon: () => ({
    display: "inline-block",
    color: "inherit",
    fontStyle: "normal",
    lineHeight: 0,
    textAlign: "center",
    textTransform: "none",
    verticalAlign: "-0.125em",
    textRendering: "optimizeLegibility",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    width: "1em",
    height: "1em",
  }),

  // 输入框样式工厂
  input: (theme: any) => ({
    display: "inline-block",
    width: "100%",
    padding: `var(--xh-spacings-sm) var(--xh-spacings-base)`,
    fontSize: "var(--xh-font-sizes-base)",
    lineHeight: theme.lineHeights.normal,
    color: "var(--xh-text-color-primary)",
    backgroundColor: "var(--xh-bg-color)",
    border: `1px solid var(--xh-border-color)`,
    borderRadius: "var(--xh-border-radius-base)",
    outline: "none",
    transition: `all var(--xh-transitions-duration) var(--xh-transitions-timing)`,

    "&:focus": {
      borderColor: "var(--xh-colors-primary)",
      boxShadow: `0 0 0 2px var(--xh-colors-primary-light-7)`,
    },

    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
      backgroundColor: "var(--xh-bg-color-page)",
    },
  }),
};

// 样式变体工厂
export const styleVariants = {
  // 按钮类型变体
  buttonType: {
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
  },

  // 尺寸变体
  size: {
    small: {
      padding: `var(--xh-spacings-xs) var(--xh-spacings-base)`,
      fontSize: "var(--xh-font-sizes-sm)",
      minHeight: "24px",
    },
    medium: {
      padding: `var(--xh-spacings-sm) var(--xh-spacings-lg)`,
      fontSize: "var(--xh-font-sizes-base)",
      minHeight: "32px",
    },
    large: {
      padding: `var(--xh-spacings-base) var(--xh-spacings-xl)`,
      fontSize: "var(--xh-font-sizes-lg)",
      minHeight: "40px",
    },
  },
};

// 动画样式工厂
export const animationStyles = {
  spin: {
    animation: "xh-spin 1s infinite linear",
  },
  pulse: {
    animation: "xh-pulse 2s infinite",
  },
  bounce: {
    animation: "xh-bounce 1s infinite",
  },
  fade: {
    animation: "xh-fade 0.3s ease-in-out",
  },
};

// 关键帧动画定义
export const keyframeAnimations = {
  "xh-spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
  "xh-pulse": {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0.5 },
  },
  "xh-bounce": {
    "0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
    "40%, 43%": { transform: "translate3d(0, -30px, 0)" },
    "70%": { transform: "translate3d(0, -15px, 0)" },
    "90%": { transform: "translate3d(0, -4px, 0)" },
  },
  "xh-fade": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
};
