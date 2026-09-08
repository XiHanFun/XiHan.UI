// 透明度 | alpha 打开后多一条透明度滑杆，值串跟着带上透明度；关掉时透明度恒是不透明，那条滑杆整条不可用
import type { ReactNode } from "react";
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [overlay, setOverlay] = useState("rgba(0, 169, 142, 0.6)");

  return (
    <XhColorPickerRoot
      value={overlay}
      format="rgba"
      alpha
      onValueChange={details => setOverlay(details.value)}
    >
      <XhColorPickerLabel>蒙版颜色</XhColorPickerLabel>
      <XhColorPickerControl>
        <XhColorPickerTrigger>
          <XhColorPickerSwatch />
          <XhColorPickerValueText />
        </XhColorPickerTrigger>
      </XhColorPickerControl>
      <XhColorPickerPositioner>
        <XhColorPickerContent>
          <XhColorPickerSaturationArea>
            <XhColorPickerAreaThumb />
          </XhColorPickerSaturationArea>
          <XhColorPickerChannelSlider channel="hue">
            <XhColorPickerChannelSliderTrack />
            <XhColorPickerChannelSliderThumb />
          </XhColorPickerChannelSlider>
          <XhColorPickerChannelSlider channel="alpha">
            <XhColorPickerChannelSliderTrack />
            <XhColorPickerChannelSliderThumb />
          </XhColorPickerChannelSlider>
        </XhColorPickerContent>
      </XhColorPickerPositioner>
    </XhColorPickerRoot>
  );
}
