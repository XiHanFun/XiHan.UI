// 长文案 | 提示到了宽度上限就换行，不会拉成一条横线；上限是 content 上的 --xh-tooltip-max-w 槽位
import type { CSSProperties, ReactNode } from "react";
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";

const text = "导出会把当前筛选条件下的全部行写进文件，行数很多时要等上一会儿。";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      <XhTooltipRoot placement="bottom" openDelay={0}>
        <XhTooltipTrigger>缺省上限</XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent>
            {text}
            <XhTooltipArrow />
          </XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>

      <XhTooltipRoot placement="bottom" openDelay={0}>
        <XhTooltipTrigger>放宽到 360px</XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent style={{ "--xh-tooltip-max-w": "360px" } as CSSProperties}>
            {text}
            <XhTooltipArrow />
          </XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>
    </div>
  );
}
