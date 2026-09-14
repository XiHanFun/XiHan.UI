// 朝向与间距 | placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是浮层与触发器的距离
import type { ReactNode } from "react";
import {
  XhPopoverArrow,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/react";

const cases = [
  { placement: "top", offset: 8, label: "上方" },
  { placement: "right", offset: 8, label: "右侧" },
  { placement: "bottom-end", offset: 16, label: "下方靠尾（间距 16）" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {cases.map(c => (
        <XhPopoverRoot key={c.placement} placement={c.placement} offset={c.offset}>
          <XhPopoverTrigger>{c.label}</XhPopoverTrigger>
          <XhPopoverPositioner>
            <XhPopoverContent>
              <XhPopoverDescription>
                {`请求的朝向是 ${c.placement}。`}
              </XhPopoverDescription>
              <XhPopoverArrow />
            </XhPopoverContent>
          </XhPopoverPositioner>
        </XhPopoverRoot>
      ))}
    </div>
  );
}
