// 禁用与只读 | 禁用的拇指退出 Tab 序列、值也不再随表单提交；只读仍可聚焦与朗读，只是推不动
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
    <>
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
    </>
  );
}
