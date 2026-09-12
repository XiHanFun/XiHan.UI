const n=`// 基础用法 | 窗口只露出一段，轨道在里面往左走；滚动整段在皮肤的 @keyframes 里，用的人不写动画
import type { ReactNode } from "react";
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/react";

const notices = [
  "系统将于本周六 02:00 起停机维护两小时",
  "新版导出支持按列脱敏",
  "本月账单已生成",
];

export default function Demo(): ReactNode {
  return (
    <XhMarqueeRoot style={{ maxInlineSize: "420px" }}>
      <XhMarqueeContent>
        {notices.map(n => (
          <span key={n} style={{ marginInlineEnd: "32px", whiteSpace: "nowrap" }}>
            {n}
          </span>
        ))}
      </XhMarqueeContent>
    </XhMarqueeRoot>
  );
}
`;export{n as default};
