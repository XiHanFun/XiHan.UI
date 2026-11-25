// 语气、尺寸与状态 | 六种语气更换浮层实心底与其上的文字色，箭头一并随之变化；size 三档只改变浮层的内边距，字号不变，不写即默认档；disabled 只关闭提示本身，被包裹的触发器照常可点击、可聚焦。把指针停在触发器上（或用 Tab 聚焦）查看差别
import type { CSSProperties, ReactNode } from "react";
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
] as const;

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "大" },
] as const;

const rowStyle: CSSProperties = { display: "flex", flexWrap: "wrap", gap: "var(--xh-space-6)" };

export default function Demo(): ReactNode {
  const [clicks, setClicks] = useState(0);

  return (
    <>
      <div style={{ display: "grid", gap: "var(--xh-space-8)" }}>
        <div style={rowStyle}>
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

        <div style={rowStyle}>
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

        <div style={{ display: "flex" }}>
          <XhTooltipRoot disabled>
            <XhTooltipTrigger onClick={() => setClicks(n => n + 1)}>点我（提示已关）</XhTooltipTrigger>
            <XhTooltipPositioner>
              <XhTooltipContent>这段话不会出现</XhTooltipContent>
            </XhTooltipPositioner>
          </XhTooltipRoot>
        </div>
      </div>
      <span data-demo-output>{`已点 ${clicks} 次`}</span>
    </>
  );
}
