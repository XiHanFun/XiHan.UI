// 基础用法 | 悬停或聚焦触发器即出；指针停在提示上也不收起
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
    <XhTooltipRoot>
      <XhTooltipTrigger>保存</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>
          写入草稿箱，不会发布
          <XhTooltipArrow />
        </XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>
  );
}
