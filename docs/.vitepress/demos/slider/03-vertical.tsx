// 竖向 | orientation 换成 vertical 后整条控件收成一块，键盘与拖动的方向跟着一起翻
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
    <XhSliderRoot defaultValue={[30]} orientation="vertical">
      {({ value }) => (
        <>
          <XhSliderLabel>{`亮度：${value[0]}`}</XhSliderLabel>
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
