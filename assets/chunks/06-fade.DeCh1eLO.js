var e=`// 两端渐隐 | fade 让内容从窗口一端淡入、从另一端淡出，边缘不再生硬地切断文字；有暂停开关时行尾那一端淡到开关之前
import type { ReactNode } from "react";
import { XhMarqueeAutoplayTrigger, XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/react";

const notices = [
  "系统将于本周六 02:00 起停机维护两小时",
  "新版导出支持按列脱敏",
  "本月账单已生成",
];

export default function Demo(): ReactNode {
  return (
    <XhMarqueeRoot fade autoFill style={{ maxInlineSize: "420px" }}>
      <XhMarqueeContent>
        {notices.map(n => (
          <span key={n} style={{ marginInlineEnd: "32px", whiteSpace: "nowrap" }}>
            {n}
          </span>
        ))}
      </XhMarqueeContent>
      <XhMarqueeAutoplayTrigger />
    </XhMarqueeRoot>
  );
}
`;export{e as default};