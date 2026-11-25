// 形态、语气、尺寸与状态 | variant 决定描边与底色的绘制方式、tone 决定使用哪族颜色、size 切换几何档，三者只落在 root，浮层中的格子一并随之变化；禁用整条退出 Tab 序列，只读仍能展开浏览只是不可修改值，invalid 只改变标注
import type { ControlVariant, Size, Tone } from "@xihan-ui/core";
import type { ReactNode } from "react";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/react";

const variants: ControlVariant[] = ["outline", "subtle", "ghost"];
const tones: Tone[] = ["brand", "success", "danger"];
const sizes: Size[] = ["sm", "md", "lg"];

const states = [
  { label: "禁用", disabled: true, readOnly: false, invalid: false },
  { label: "只读", disabled: false, readOnly: true, invalid: false },
  { label: "校验失败", disabled: false, readOnly: false, invalid: true },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-6)" }}>
      {/* 前三行一行只换一根轴，标题写的就是那一档的取值 */}
      {[variants, tones, sizes].map((row, i) => (
        <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-4)" }}>
          {row.map(v => (
            <XhTimePickerRoot
              key={v}
              variant={i === 0 ? (v as ControlVariant) : undefined}
              tone={i === 1 ? (v as Tone) : undefined}
              size={i === 2 ? (v as Size) : undefined}
              defaultValue="09:30"
            >
              <XhTimePickerLabel>{v}</XhTimePickerLabel>
              <XhTimePickerControl>
                <XhTimePickerSegmentGroup>
                  <XhTimePickerSegment segment="hour" />
                  <span>:</span>
                  <XhTimePickerSegment segment="minute" />
                </XhTimePickerSegmentGroup>
                <XhTimePickerClearTrigger />
              </XhTimePickerControl>
              <XhTimePickerPositioner>
                <XhTimePickerContent>
                  <XhTimePickerColumn unit="hour">
                    {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
                  </XhTimePickerColumn>
                  <XhTimePickerColumn unit="minute">
                    {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
                  </XhTimePickerColumn>
                </XhTimePickerContent>
              </XhTimePickerPositioner>
            </XhTimePickerRoot>
          ))}
        </div>
      ))}

      {/* 末行切状态 */}
      <div style={{ display: "grid", gap: "var(--xh-space-4)", justifyItems: "start" }}>
        {states.map(s => (
          <XhTimePickerRoot
            key={s.label}
            disabled={s.disabled}
            readOnly={s.readOnly}
            invalid={s.invalid}
            defaultValue="09:30"
          >
            <XhTimePickerLabel>{s.label}</XhTimePickerLabel>
            <XhTimePickerControl>
              <XhTimePickerSegmentGroup>
                <XhTimePickerSegment segment="hour" />
                <span>:</span>
                <XhTimePickerSegment segment="minute" />
              </XhTimePickerSegmentGroup>
            </XhTimePickerControl>
            <XhTimePickerPositioner>
              <XhTimePickerContent>
                <XhTimePickerColumn unit="hour">
                  {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
                </XhTimePickerColumn>
                <XhTimePickerColumn unit="minute">
                  {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
                </XhTimePickerColumn>
              </XhTimePickerContent>
            </XhTimePickerPositioner>
          </XhTimePickerRoot>
        ))}
      </div>
    </div>
  );
}
