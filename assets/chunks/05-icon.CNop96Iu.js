const n=`// 图标当回退 | fallback 是普通插槽，放图标和放缩写字一样；没有名字可写时用图标表示「某位用户」
import type { ReactNode } from "react";
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot, XhIcon } from "@xihan-ui/react";

const UserIcon = {
  name: "user",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "circle", attrs: { cx: "12", cy: "8", r: "3.5" } },
    { tag: "path", attrs: { d: "M5 20C5 16.5 8.1 14.5 12 14.5C15.9 14.5 19 16.5 19 20" } },
  ],
} as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <XhAvatarRoot size="sm">
        <XhAvatarImage />
        <XhAvatarFallback>
          <XhIcon icon={UserIcon} size="sm" />
        </XhAvatarFallback>
      </XhAvatarRoot>

      <XhAvatarRoot>
        <XhAvatarImage />
        <XhAvatarFallback>
          <XhIcon icon={UserIcon} />
        </XhAvatarFallback>
      </XhAvatarRoot>

      <XhAvatarRoot size="lg">
        <XhAvatarImage />
        <XhAvatarFallback>
          <XhIcon icon={UserIcon} size="lg" />
        </XhAvatarFallback>
      </XhAvatarRoot>

      <span style={{ fontSize: "13px" }}>图元跟着档位一起换，取的是根流下来的前景色</span>
    </div>
  );
}
`;export{n as default};
