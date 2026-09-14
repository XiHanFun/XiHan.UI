// 禁用 | disabled 只关掉卡片本身，触发器照样可点、可聚焦，也照样进不了展开等待
import type { ReactNode } from "react";
import {
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [clicks, setClicks] = useState(0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <XhHoverCardRoot disabled placement="bottom-start" openDelay={0}>
        <XhHoverCardTrigger onClick={() => setClicks(clicks + 1)}>@xihan（卡片已关）</XhHoverCardTrigger>
        <XhHoverCardPositioner>
          <XhHoverCardContent>
            <XhHoverCardArrow />
            <span>这张卡片不会出现。</span>
          </XhHoverCardContent>
        </XhHoverCardPositioner>
      </XhHoverCardRoot>
      <span>{`已点 ${clicks} 次`}</span>
    </div>
  );
}
