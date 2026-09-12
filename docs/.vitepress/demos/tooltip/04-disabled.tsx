// 禁用 | disabled 只关掉提示本身，被包裹的触发器照样可点、可聚焦
import type { ReactNode } from "react";
import {
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [clicks, setClicks] = useState(0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <XhTooltipRoot disabled>
        <XhTooltipTrigger onClick={() => setClicks(n => n + 1)}>点我（提示已关）</XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent>这段话不会出现</XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>
      <span>{`已点 ${clicks} 次`}</span>
    </div>
  );
}
