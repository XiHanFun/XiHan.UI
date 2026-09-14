// 基础用法 | 与 Tooltip 的分界在于卡片本体可交互：指针停在卡片上不收起，里面的链接与按钮都点得到
import type { ReactNode } from "react";
import {
  XhButton,
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardDescription,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTitle,
  XhHoverCardTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [following, setFollowing] = useState(false);

  return (
    <div>
      最近这批组件由
      <XhHoverCardRoot placement="bottom-start">
        <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
        <XhHoverCardPositioner>
          <XhHoverCardContent>
            <XhHoverCardArrow />
            <XhHoverCardTitle>XiHan.UI</XhHoverCardTitle>
            <XhHoverCardDescription>
              框架无关的设计系统运行时，Vue 与 Web Components 共用同一套无头内核。
            </XhHoverCardDescription>
            <XhButton size="sm" variant="outline" onClick={() => setFollowing(!following)}>
              {following ? "已关注" : "关注"}
            </XhButton>
          </XhHoverCardContent>
        </XhHoverCardPositioner>
      </XhHoverCardRoot>
      推上来。
    </div>
  );
}
