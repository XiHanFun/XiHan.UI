// 尺寸 | size 改轨道厚度与滑块直径，不写即缺省中档
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

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "20px" }}>
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
  );
}
