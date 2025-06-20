import { cB, cE, cM } from "@xihan-ui/themes";
import type { IconProps } from "../interface";

export default cB(
  "icon",
  {
    display: "inline-flex",
    alignSelf: "center",
    position: "relative",
    flexShrink: 0,
    lineHeight: 1,
    verticalAlign: "middle",
    color: "var(--icon-color)",
    fontSize: "var(--icon-font-size)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  [
    cM("disabled", {
      cursor: "not-allowed",
      opacity: 0.6,
      pointerEvents: "none",
    }),

    cM("clickable", {
      cursor: "pointer",
      "&:hover": {
        opacity: 0.8,
      },
      "&:active": {
        opacity: 0.6,
      },
    }),

    cM("hover", {
      transition: "all 0.3s ease",
    }),

    cM("inverse", {
      filter: "invert(1)",
    }),

    cM("loading", {
      animation: "spin 1s linear infinite",
    }),

    cM("error", {
      color: "var(--xh-color-error)",
    }),

    cE("loading", {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),

    cE("spinner", {
      width: "1em",
      height: "1em",
      animation: "spin 1s linear infinite",
    }),

    cE("error", {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--xh-color-error)",
    }),

    cE("placeholder", {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--xh-color-text-3)",
    }),

    cE("svg", {
      width: "1em",
      height: "1em",
      fill: "currentColor",
    }),

    {
      "@keyframes spin": {
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

export function getIconStyles(props: IconProps) {
  const styles = [
    cM(String(props.size), {}),
    cM(props.type, {}),
    cM("disabled", {}),
    cM("loading", {}),
    cM("clickable", {}),
    cM("hover", {}),
    cM("inverse", {}),
    cM("error", {}),
    props.animation && cM(props.animation, {}),
    props.speed && cM(`speed-${props.speed}`, {}),
    props.flip && cM(`flip-${props.flip}`, {}),
  ].filter(Boolean);

  return styles;
}
