// 竖直与状态 | orientation 竖排时渐变自下而上；禁用时标签换禁用前景、颜色带压暗，只读保留 Tab 位但不可调节
import type { ReactNode } from "react";
import {
  XhColorSliderControl,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "32px" }}>
      <XhColorSliderRoot defaultValue="#f59e0b" channel="brightness" orientation="vertical">
        <XhColorSliderLabel>明度</XhColorSliderLabel>
        <XhColorSliderControl>
          <XhColorSliderTrack />
          <XhColorSliderThumb />
        </XhColorSliderControl>
      </XhColorSliderRoot>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "240px" }}>
        <XhColorSliderRoot defaultValue="#f59e0b" disabled>
          <XhColorSliderLabel>禁用</XhColorSliderLabel>
          <XhColorSliderControl>
            <XhColorSliderTrack />
            <XhColorSliderThumb />
          </XhColorSliderControl>
        </XhColorSliderRoot>
        <XhColorSliderRoot defaultValue="#f59e0b" readOnly>
          <XhColorSliderLabel>只读</XhColorSliderLabel>
          <XhColorSliderControl>
            <XhColorSliderTrack />
            <XhColorSliderThumb />
          </XhColorSliderControl>
        </XhColorSliderRoot>
        <XhColorSliderRoot defaultValue="#f59e0b" invalid size="lg">
          <XhColorSliderLabel>无效（大号）</XhColorSliderLabel>
          <XhColorSliderControl>
            <XhColorSliderTrack />
            <XhColorSliderThumb />
          </XhColorSliderControl>
        </XhColorSliderRoot>
      </div>
    </div>
  );
}
