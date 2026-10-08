var e=`// 跟随鼠标 | followCursor 让提示锚在指针落点上并随移动更新；触屏与键盘聚焦时仍锚在触发器上
import type { ReactNode } from "react";
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTooltipRoot followCursor openDelay={0}>
      <XhTooltipTrigger style={{ inlineSize: "100%", blockSize: "96px" }}>在这块区域里移动指针</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>
          提示跟着指针走
          <XhTooltipArrow />
        </XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>
  );
}
`;export{e as default};