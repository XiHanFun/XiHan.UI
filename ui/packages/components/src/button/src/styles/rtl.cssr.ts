import { cB, cM } from "@xihan-ui/themes";

export default cB(
  "button",
  {
    // 基础 RTL 样式
    "&.xh-rtl": {
      direction: "rtl",
      textAlign: "right",
    },
  },
  [
    // 图标 RTL 样式
    cM("rtl", {
      "& .xh-button__icon": {
        marginRight: "0",
        marginLeft: "var(--xh-spacing-sm)",
      },
      "& .xh-button__content": {
        flexDirection: "row-reverse",
      },
    }),

    // 加载状态 RTL 样式
    cM("loading", {
      "&.xh-rtl .xh-button__icon": {
        marginRight: "0",
        marginLeft: "var(--xh-spacing-sm)",
      },
    }),

    // 波纹效果 RTL 样式
    cM("ripple", {
      "&.xh-rtl::after": {
        left: "auto",
        right: "50%",
        transform: "scale(1, 1) translate(50%, -50%)",
      },
    }),
  ],
);
