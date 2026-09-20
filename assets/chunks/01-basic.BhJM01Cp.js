const n=`// 基础用法 | 值恒为数组，单滑块即长度 1；方向键移动一格 step，PageUp 与 PageDown 按 largeStep，Home 与 End 到达端点
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
    <XhSliderRoot
      defaultValue={[40]}
      min={0}
      max={100}
      step={1}
      largeStep={10}
      name="volume"
      style={{ inlineSize: "320px" }}
    >
      {({ value }) => (
        <>
          <XhSliderLabel>{\`音量：\${value[0]}\`}</XhSliderLabel>
          <XhSliderControl>
            <XhSliderTrack>
              <XhSliderRange />
            </XhSliderTrack>
            <XhSliderThumb>
              <XhSliderHiddenInput />
            </XhSliderThumb>
          </XhSliderControl>
        </>
      )}
    </XhSliderRoot>
  );
}
`;export{n as default};
