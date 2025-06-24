import { cB, cM } from "@xihan-ui/themes";

export default cB(
  "icon",
  {
    // 基础 RTL 样式
    "&.xh-rtl": {
      direction: "rtl",
    },
  },
  [
    // 动画 RTL 样式
    cM("spin", {
      "&.xh-rtl": {
        animationDirection: "reverse",
      },
    }),

    // 翻转 RTL 样式
    cM("flip-horizontal", {
      "&.xh-rtl": {
        transform: "scaleX(-1)",
      },
    }),
  ],
);
