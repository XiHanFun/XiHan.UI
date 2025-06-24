import { cB, cE, cM } from "@xihan-ui/themes";
import type { ButtonProps } from "../interface";

export default cB(
  "button",
  {
    position: "relative",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none",
    touchAction: "manipulation",
    outline: "none",
    border: "1px solid transparent",
    borderRadius: "var(--xh-button-border-radius, 4px)",
    padding: "var(--xh-button-padding, 8px 16px)",
    fontSize: "var(--xh-button-font-size, 14px)",
    fontWeight: "var(--xh-button-font-weight, 500)",
    lineHeight: "var(--xh-button-line-height, 1.5)",
    color: "var(--xh-button-text-color, #ffffff)",
    backgroundColor: "var(--xh-button-color, #1890ff)",
    borderColor: "var(--xh-button-border-color, #1890ff)",
    height: "var(--xh-button-height, 32px)",
    minWidth: "64px",
    overflow: "hidden",

    "&:hover:not(:disabled)": {
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      backgroundColor: "var(--xh-button-hover-color, #40a9ff)",
      borderColor: "var(--xh-button-hover-color, #40a9ff)",
    },

    "&:active:not(:disabled)": {
      transform: "translateY(0)",
      boxShadow: "none",
      backgroundColor: "var(--xh-button-active-color, #096dd9)",
      borderColor: "var(--xh-button-active-color, #096dd9)",
    },

    "&:focus-visible": {
      outline: "2px solid var(--xh-button-color, #1890ff)",
      outlineOffset: "2px",
    },
  },
  [
    // 状态修饰符
    cM("disabled", {
      cursor: "not-allowed",
      opacity: 0.6,
      pointerEvents: "none",
      backgroundColor: "var(--xh-button-disabled-color, #f5f5f5)",
      borderColor: "var(--xh-button-disabled-border-color, #d9d9d9)",
      color: "var(--xh-button-disabled-text-color, #00000040)",

      "&:hover": {
        transform: "none",
        boxShadow: "none",
      },
    }),

    cM("loading", {
      cursor: "wait",
      pointerEvents: "none",

      "&:hover": {
        transform: "none",
        boxShadow: "none",
      },
    }),

    // 尺寸修饰符
    cM("small", {
      fontSize: "12px",
      padding: "4px 12px",
      height: "24px",
      minWidth: "48px",
    }),

    cM("medium", {
      fontSize: "14px",
      padding: "8px 16px",
      height: "32px",
      minWidth: "64px",
    }),

    cM("large", {
      fontSize: "16px",
      padding: "12px 20px",
      height: "40px",
      minWidth: "80px",
    }),

    // 形状修饰符
    cM("square", {
      borderRadius: "4px",
    }),

    cM("round", {
      borderRadius: "20px",
    }),

    cM("circle", {
      borderRadius: "50%",
      width: "var(--xh-button-height, 32px)",
      minWidth: "var(--xh-button-height, 32px)",
      padding: "0",
    }),

    // 类型修饰符
    cM("default", {
      backgroundColor: "#ffffff",
      borderColor: "#d9d9d9",
      color: "#000000",

      "&:hover:not(:disabled)": {
        borderColor: "var(--xh-button-color, #1890ff)",
        color: "var(--xh-button-color, #1890ff)",
        backgroundColor: "#ffffff",
      },
    }),

    cM("primary", {
      backgroundColor: "var(--xh-button-color, #1890ff)",
      borderColor: "var(--xh-button-border-color, #1890ff)",
      color: "var(--xh-button-text-color, #ffffff)",
    }),

    cM("success", {
      backgroundColor: "#52c41a",
      borderColor: "#52c41a",
      color: "#ffffff",

      "&:hover:not(:disabled)": {
        backgroundColor: "#73d13d",
        borderColor: "#73d13d",
      },
    }),

    cM("warning", {
      backgroundColor: "#faad14",
      borderColor: "#faad14",
      color: "#ffffff",

      "&:hover:not(:disabled)": {
        backgroundColor: "#ffc53d",
        borderColor: "#ffc53d",
      },
    }),

    cM("error", {
      backgroundColor: "#ff4d4f",
      borderColor: "#ff4d4f",
      color: "#ffffff",

      "&:hover:not(:disabled)": {
        backgroundColor: "#ff7875",
        borderColor: "#ff7875",
      },
    }),

    cM("info", {
      backgroundColor: "#1890ff",
      borderColor: "#1890ff",
      color: "#ffffff",

      "&:hover:not(:disabled)": {
        backgroundColor: "#40a9ff",
        borderColor: "#40a9ff",
      },
    }),

    cM("submit", {
      backgroundColor: "#52c41a",
      borderColor: "#52c41a",
      color: "#ffffff",

      "&:hover:not(:disabled)": {
        backgroundColor: "#73d13d",
        borderColor: "#73d13d",
      },
    }),

    // 变体修饰符
    cM("text", {
      backgroundColor: "transparent",
      borderColor: "transparent",
      color: "var(--xh-button-color, #1890ff)",
      padding: "0",
      height: "auto",
      lineHeight: "inherit",
      boxShadow: "none",

      "&:hover:not(:disabled)": {
        backgroundColor: "var(--xh-button-text-hover-color, rgba(24, 144, 255, 0.1))",
        transform: "none",
        boxShadow: "none",
      },
    }),

    cM("ghost", {
      backgroundColor: "transparent",
      borderColor: "var(--xh-button-color, #1890ff)",
      color: "var(--xh-button-color, #1890ff)",

      "&:hover:not(:disabled)": {
        backgroundColor: "var(--xh-button-ghost-hover-color, rgba(24, 144, 255, 0.1))",
        transform: "none",
      },
    }),

    cM("block", {
      display: "flex",
      width: "100%",
    }),

    // 按钮内容和子元素
    cE("content", {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      position: "relative",
      zIndex: 1,
    }),

    cE("text", {
      display: "inline-block",
    }),

    cE("prefix", {
      display: "inline-flex",
      alignItems: "center",
    }),

    cE("suffix", {
      display: "inline-flex",
      alignItems: "center",
    }),

    cE("loading", {
      display: "inline-flex",
      alignItems: "center",
    }),

    cE("loading-icon", {
      width: "1em",
      height: "1em",
      animation: "xh-button-spin 1s linear infinite",
    }),

    // 波纹效果
    cE("ripple", {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
      pointerEvents: "none",
      borderRadius: "inherit",
    }),

    cE("ripple-effect", {
      position: "absolute",
      borderRadius: "50%",
      backgroundColor: "var(--xh-button-ripple-color, rgba(255, 255, 255, 0.3))",
      opacity: "var(--xh-button-ripple-opacity, 0.3)",
      transform: "scale(0)",
      pointerEvents: "none",
    }),

    // 动画关键帧
    {
      "@keyframes xh-button-ripple": {
        "0%": {
          transform: "scale(0)",
          opacity: "var(--xh-button-ripple-opacity, 0.3)",
        },
        "100%": {
          transform: "scale(2)",
          opacity: 0,
        },
      },

      "@keyframes xh-button-spin": {
        "0%": {
          transform: "rotate(0deg)",
        },
        "100%": {
          transform: "rotate(360deg)",
        },
      },
    },
  ],
);

export function getButtonStyles(props: ButtonProps) {
  const styles = [];

  // 基础样式
  styles.push(cB("button", {}));

  // 尺寸样式
  if (props.size) {
    styles.push(cM(props.size, {}));
  }

  // 形状样式
  if (props.shape) {
    styles.push(cM(props.shape, {}));
  }

  // 类型样式
  if (props.type) {
    styles.push(cM(props.type, {}));
  }

  // 状态样式
  if (props.disabled) {
    styles.push(cM("disabled", {}));
  }

  if (props.loading) {
    styles.push(cM("loading", {}));
  }

  // 变体样式
  if (props.text) {
    styles.push(cM("text", {}));
  }

  if (props.ghost) {
    styles.push(cM("ghost", {}));
  }

  if (props.block) {
    styles.push(cM("block", {}));
  }

  return styles;
}
