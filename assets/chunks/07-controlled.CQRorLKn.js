const n=`// 受控 | 传了 open 就由宿主说了算；悬停、聚焦、Escape 都只发意图，最终写不写由外面这份状态决定
import type { ReactNode } from "react";
import {
  XhButton,
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  // 只留最近三条意图
  function onOpenChange(details: { open: boolean }): void {
    setOpen(details.open);
    setLog(list => [details.open ? "要展开" : "要收起", ...list].slice(0, 3));
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <XhTooltipRoot
        open={open}
        placement="bottom"
        openDelay={0}
        onOpenChange={onOpenChange}
      >
        <XhTooltipTrigger>把指针停上来</XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent>
            显隐完全跟着 open 走
            <XhTooltipArrow />
          </XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>

      <XhButton variant="outline" onClick={() => setOpen(!open)}>
        {open ? "收起" : "展开"}
      </XhButton>
      <span>{\`最近意图：\${log.join(" ← ") || "（还没动过）"}\`}</span>
    </div>
  );
}
`;export{n as default};
