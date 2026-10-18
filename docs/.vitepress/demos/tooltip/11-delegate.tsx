// 委托 | delegate 让一个提示管一整排按钮：文字取按钮的 data-xh-tooltip 或可及名，快捷键取 aria-keyshortcuts；指针在按钮之间挪动时提示直接换过去
import type { ReactNode } from "react";
import {
  XhButton,
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";

const tools = [
  { label: "撤销", keys: "Control+Z" },
  { label: "重做", keys: "Control+Shift+Z" },
  { label: "删除", tip: "删除选中的对象", keys: "Delete" },
];

export default function Demo(): ReactNode {
  return (
    <XhTooltipRoot delegate="button">
      <XhTooltipTrigger>
        <div style={{ display: "flex", gap: "8px" }}>
          {tools.map(tool => (
            <XhButton key={tool.label} variant="outline" aria-keyshortcuts={tool.keys} data-xh-tooltip={tool.tip}>
              {tool.label}
            </XhButton>
          ))}
        </div>
      </XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>
          <XhTooltipArrow />
        </XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>
  );
}
