// 暂停开关 | 窗口行尾压一颗暂停开关，触屏与键盘也停得住；名字与图标随状态换成下一步的动作
import type { ReactNode } from "react";
import { XhMarqueeAutoplayTrigger, XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/react";

const notices = ["系统将于本周六 02:00 起停机维护两小时", "新版导出支持按列脱敏", "本月账单已生成"];

export default function Demo(): ReactNode {
  return (
    <XhMarqueeRoot
      autoFill
      style={{ maxInlineSize: "420px", border: "1px solid var(--xh-border-default)", borderRadius: "6px" }}
    >
      <XhMarqueeContent>
        {notices.map(n => (
          <span key={n} style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>{n}</span>
        ))}
      </XhMarqueeContent>
      {/* 放在 root 里、紧跟轨道；不给内容时皮肤画暂停 / 播放图标 */}
      <XhMarqueeAutoplayTrigger />
    </XhMarqueeRoot>
  );
}
