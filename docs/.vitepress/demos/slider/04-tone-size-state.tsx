// 语气、尺寸与状态 | tone 决定已填轨道与滑块使用哪族颜色，不写时沿用品牌色；size 改变轨道厚度与滑块直径，不写即默认中档；禁用的拇指退出 Tab 序列、值也不再随表单提交，只读仍可聚焦与朗读，只是不可推动
import type { ReactNode } from "react";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-8)" }}>
      <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
        {tones.map(t => (
          <XhSliderRoot key={t} tone={t} defaultValue={[60]} style={{ inlineSize: "280px" }}>
            <XhSliderLabel>{t}</XhSliderLabel>
            <XhSliderControl>
              <XhSliderTrack>
                <XhSliderRange />
              </XhSliderTrack>
              <XhSliderThumb>
                <XhSliderHiddenInput />
              </XhSliderThumb>
            </XhSliderControl>
          </XhSliderRoot>
        ))}
      </div>

      <div style={{ display: "grid", gap: "var(--xh-space-5)" }}>
        <XhSliderRoot defaultValue={[50]} size="sm" style={{ inlineSize: "280px" }}>
          <XhSliderLabel>sm</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb>
              <XhSliderHiddenInput />
            </XhSliderThumb>
          </XhSliderControl>
        </XhSliderRoot>

        <XhSliderRoot defaultValue={[50]} style={{ inlineSize: "280px" }}>
          <XhSliderLabel>缺省</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb>
              <XhSliderHiddenInput />
            </XhSliderThumb>
          </XhSliderControl>
        </XhSliderRoot>

        <XhSliderRoot defaultValue={[50]} size="lg" style={{ inlineSize: "280px" }}>
          <XhSliderLabel>lg</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb>
              <XhSliderHiddenInput />
            </XhSliderThumb>
          </XhSliderControl>
        </XhSliderRoot>
      </div>

      <div style={{ display: "grid", gap: "var(--xh-space-4)" }}>
        <XhSliderRoot defaultValue={[60]} disabled name="brightness" style={{ inlineSize: "280px" }}>
          <XhSliderLabel>禁用</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb>
              <XhSliderHiddenInput />
            </XhSliderThumb>
          </XhSliderControl>
        </XhSliderRoot>

        <XhSliderRoot defaultValue={[60]} readOnly style={{ inlineSize: "280px" }}>
          <XhSliderLabel>只读</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb>
              <XhSliderHiddenInput />
            </XhSliderThumb>
          </XhSliderControl>
        </XhSliderRoot>
      </div>
    </div>
  );
}
