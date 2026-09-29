const o=`// 提示组 | XhTooltipProvider 把一排提示放进同一组：没写延时的取组的缺省，组里另一个开着时指向下一个直接接替，同一时刻只开一个
import type { ReactNode } from "react";
import {
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipProvider,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";

const tools = [
  { label: "加粗", tip: "加粗（Ctrl+B）" },
  { label: "斜体", tip: "斜体（Ctrl+I）" },
  { label: "下划线", tip: "下划线（Ctrl+U）" },
];

export default function Demo(): ReactNode {
  return (
    <XhTooltipProvider openDelay={400} skipDelayDuration={500}>
      <div style={{ display: "flex", gap: "8px" }}>
        {tools.map(tool => (
          <XhTooltipRoot key={tool.label}>
            <XhTooltipTrigger>{tool.label}</XhTooltipTrigger>
            <XhTooltipPositioner>
              <XhTooltipContent>{tool.tip}</XhTooltipContent>
            </XhTooltipPositioner>
          </XhTooltipRoot>
        ))}
      </div>
    </XhTooltipProvider>
  );
}
`;export{o as default};
