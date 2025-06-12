import { c } from "@xihan-ui/themes";
import type { ButtonProps } from "../interface";

export const buttonStyles = {
  base: c({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    whiteSpace: "nowrap",
    textAlign: "center",
    verticalAlign: "middle",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none",
    outline: "none",
    border: "1px solid transparent",
    borderRadius: "var(--xh-border-radius)",
    "&:focus-visible": {
      outline: "2px solid var(--xh-color-primary)",
      outlineOffset: "2px",
    },
  }),

  // 尺寸样式
  sizes: {
    small: c({
      height: "24px",
      padding: "0 12px",
      fontSize: "12px",
      lineHeight: "22px",
    }),
    medium: c({
      height: "32px",
      padding: "0 16px",
      fontSize: "14px",
      lineHeight: "30px",
    }),
    large: c({
      height: "40px",
      padding: "0 20px",
      fontSize: "16px",
      lineHeight: "38px",
    }),
  },

  // 形状样式
  shapes: {
    square: c({
      borderRadius: "var(--xh-border-radius)",
    }),
    round: c({
      borderRadius: "9999px",
    }),
    circle: c({
      borderRadius: "50%",
      padding: "0",
      width: "var(--xh-button-height)",
      height: "var(--xh-button-height)",
    }),
  },

  // 类型样式
  types: {
    default: c({
      backgroundColor: "var(--xh-color-default)",
      borderColor: "var(--xh-color-default-border)",
      color: "var(--xh-color-default-text)",
      "&:hover": {
        backgroundColor: "var(--xh-color-default-hover)",
        borderColor: "var(--xh-color-default-border-hover)",
      },
      "&:active": {
        backgroundColor: "var(--xh-color-default-active)",
        borderColor: "var(--xh-color-default-border-active)",
      },
    }),
    primary: c({
      backgroundColor: "var(--xh-color-primary)",
      borderColor: "var(--xh-color-primary)",
      color: "var(--xh-color-white)",
      "&:hover": {
        backgroundColor: "var(--xh-color-primary-hover)",
        borderColor: "var(--xh-color-primary-hover)",
      },
      "&:active": {
        backgroundColor: "var(--xh-color-primary-active)",
        borderColor: "var(--xh-color-primary-active)",
      },
    }),
    success: c({
      backgroundColor: "var(--xh-color-success)",
      borderColor: "var(--xh-color-success)",
      color: "var(--xh-color-white)",
      "&:hover": {
        backgroundColor: "var(--xh-color-success-hover)",
        borderColor: "var(--xh-color-success-hover)",
      },
      "&:active": {
        backgroundColor: "var(--xh-color-success-active)",
        borderColor: "var(--xh-color-success-active)",
      },
    }),
    warning: c({
      backgroundColor: "var(--xh-color-warning)",
      borderColor: "var(--xh-color-warning)",
      color: "var(--xh-color-white)",
      "&:hover": {
        backgroundColor: "var(--xh-color-warning-hover)",
        borderColor: "var(--xh-color-warning-hover)",
      },
      "&:active": {
        backgroundColor: "var(--xh-color-warning-active)",
        borderColor: "var(--xh-color-warning-active)",
      },
    }),
    error: c({
      backgroundColor: "var(--xh-color-error)",
      borderColor: "var(--xh-color-error)",
      color: "var(--xh-color-white)",
      "&:hover": {
        backgroundColor: "var(--xh-color-error-hover)",
        borderColor: "var(--xh-color-error-hover)",
      },
      "&:active": {
        backgroundColor: "var(--xh-color-error-active)",
        borderColor: "var(--xh-color-error-active)",
      },
    }),
  },

  // 状态样式
  states: {
    disabled: c({
      cursor: "not-allowed",
      opacity: "0.5",
      pointerEvents: "none",
    }),
    loading: c({
      cursor: "wait",
      pointerEvents: "none",
    }),
  },

  // 变体样式
  variants: {
    text: c({
      backgroundColor: "transparent",
      borderColor: "transparent",
      padding: "0",
      height: "auto",
      lineHeight: "1.5",
      "&:hover": {
        backgroundColor: "var(--xh-color-default-hover)",
      },
    }),
    ghost: c({
      backgroundColor: "transparent",
      "&:hover": {
        backgroundColor: "var(--xh-color-default-hover)",
      },
    }),
    block: c({
      display: "flex",
      width: "100%",
    }),
  },

  // 内容样式
  content: c({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  }),

  // 图标样式
  icon: c({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2em",
    lineHeight: "1",
  }),

  // 波纹效果样式
  ripple: c({
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    overflow: "hidden",
    borderRadius: "inherit",
    pointerEvents: "none",
    "&::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "5px",
      height: "5px",
      background: "rgba(255, 255, 255, 0.3)",
      opacity: "0",
      borderRadius: "100%",
      transform: "scale(1, 1) translate(-50%, -50%)",
      transformOrigin: "50% 50%",
    },
  }),
};

export function getButtonStyles(props: ButtonProps) {
  const styles = [
    buttonStyles.base,
    buttonStyles.sizes[props.size],
    buttonStyles.shapes[props.shape],
    buttonStyles.types[props.type],
    props.disabled && buttonStyles.states.disabled,
    props.loading && buttonStyles.states.loading,
    props.text && buttonStyles.variants.text,
    props.ghost && buttonStyles.variants.ghost,
    props.block && buttonStyles.variants.block,
  ];

  return styles;
}
