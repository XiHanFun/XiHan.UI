// 尺寸 | 三档换的是浮层的内边距与字号，不写 size 即缺省档；把指针停在触发器上（或用 Tab 聚焦）看差别
import type { ReactNode } from "react";
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      {sizes.map(s => (
        <XhTooltipRoot key={s.label} size={s.value} placement="bottom" openDelay={0}>
          <XhTooltipTrigger>{s.label}</XhTooltipTrigger>
          <XhTooltipPositioner>
            <XhTooltipContent>
              {`size = ${s.value ?? "未指定"}`}
              <XhTooltipArrow />
            </XhTooltipContent>
          </XhTooltipPositioner>
        </XhTooltipRoot>
      ))}
    </div>
  );
}
