const o=`// 事件 | open-change 带一份 { open }，报的是这次要落到的状态；非受控时内部开合也照发一次
import type { ReactNode } from "react";
import {
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [log, setLog] = useState<string[]>([]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <XhPopoverRoot
        placement="bottom-start"
        // 只留最近五条
        onOpenChange={details => setLog([details.open ? "展开" : "收起", ...log].slice(0, 5))}
      >
        <XhPopoverTrigger>点开再关掉</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverDescription>
              按钮、Escape、点浮层外部，三条路都会发一次意图。
            </XhPopoverDescription>
            <XhPopoverArrow />
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>
      <span>{\`最近：\${log.join(" ← ") || "（还没动过）"}\`}</span>
    </div>
  );
}
`;export{o as default};
