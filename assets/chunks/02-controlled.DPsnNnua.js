const o=`// 受控 | 传了 value 就由宿主说了算，取色只回写不自改
import type { ReactNode } from "react";
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [color, setColor] = useState("#3b82f6");

  return (
    <>
      <XhColorPickerRoot value={color} onValueChange={details => setColor(details.value)}>
        <XhColorPickerControl>
          <XhColorPickerTrigger>
            <XhColorPickerSwatch />
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
          </XhColorPickerContent>
        </XhColorPickerPositioner>
      </XhColorPickerRoot>
      <span>
        当前：
        {color}
      </span>
    </>
  );
}
`;export{o as default};
