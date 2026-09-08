// 语气 | 六种语气换的是浮层实心底与其上的文字色，箭头一并跟着走；把指针停在触发器上（或用 Tab 聚焦）看差别
import type { ReactNode } from "react";
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      {tones.map(t => (
        <XhTooltipRoot key={t.value} tone={t.value} placement="bottom" openDelay={0}>
          <XhTooltipTrigger>{t.label}</XhTooltipTrigger>
          <XhTooltipPositioner>
            <XhTooltipContent>
              {`tone = ${t.value}`}
              <XhTooltipArrow />
            </XhTooltipContent>
          </XhTooltipPositioner>
        </XhTooltipRoot>
      ))}
    </div>
  );
}
