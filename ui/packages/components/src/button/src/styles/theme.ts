import type { ThemeTokens } from "@xihan-ui/themes";

export interface ButtonThemeVars {
  // 基础变量
  buttonColor: string;
  buttonTextColor: string;
  buttonBorderColor: string;
  buttonBorderRadius: string;
  buttonFontSize: string;
  buttonFontWeight: string;
  buttonLineHeight: string;
  buttonPadding: string;
  buttonHeight: string;

  // 状态变量
  buttonHoverColor: string;
  buttonActiveColor: string;
  buttonDisabledColor: string;
  buttonDisabledTextColor: string;
  buttonDisabledBorderColor: string;

  // 变体变量
  buttonTextHoverColor: string;
  buttonGhostHoverColor: string;

  // 动画变量
  buttonTransition: string;
  buttonRippleColor: string;
  buttonRippleOpacity: string;
  buttonRippleDuration: string;
  buttonLoadingColor: string;
  buttonLoadingSize: string;
  buttonLoadingDuration: string;
}

export interface ButtonTheme extends ThemeTokens {
  button: ButtonThemeVars;
}

export const buttonTheme: ButtonTheme = {
  color: { primary: "var(--xihan-color-primary)" },
  fontSize: { base: "14px" },
  spacing: { base: "8px" },
  borderRadius: { base: "4px" },
  shadow: { base: "0 2px 8px rgba(0, 0, 0, 0.15)" },
  zIndex: { base: 1 },
  transition: { base: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" },
  breakpoint: { base: "768px" },
  button: {
    // 基础变量
    buttonColor: "var(--xihan-color-primary)",
    buttonTextColor: "var(--xihan-color-white)",
    buttonBorderColor: "var(--xihan-color-primary)",
    buttonBorderRadius: "4px",
    buttonFontSize: "14px",
    buttonFontWeight: "500",
    buttonLineHeight: "1.5",
    buttonPadding: "8px 16px",
    buttonHeight: "32px",

    // 状态变量
    buttonHoverColor: "var(--xihan-color-primary-hover)",
    buttonActiveColor: "var(--xihan-color-primary-active)",
    buttonDisabledColor: "var(--xihan-color-disabled)",
    buttonDisabledTextColor: "var(--xihan-color-text-disabled)",
    buttonDisabledBorderColor: "var(--xihan-color-border-disabled)",

    // 变体变量
    buttonTextHoverColor: "var(--xihan-color-fill-light)",
    buttonGhostHoverColor: "var(--xihan-color-fill-light)",

    // 动画变量
    buttonTransition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    buttonRippleColor: "var(--xihan-color-white)",
    buttonRippleOpacity: "0.3",
    buttonRippleDuration: "600ms",
    buttonLoadingColor: "var(--xihan-color-white)",
    buttonLoadingSize: "16px",
    buttonLoadingDuration: "1s",
  },
};
