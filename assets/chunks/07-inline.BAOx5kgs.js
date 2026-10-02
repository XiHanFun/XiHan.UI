const o=`// 常驻形态 | inline 让取色面直接铺在页面里，与浮层形态同一台机器、同一组部件，只是不写 control、trigger 与 positioner；取色面不抢焦点，也不因点外或 Esc 收起
import type { ReactNode } from "react";
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelInput,
  XhColorPickerContent,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [color, setColor] = useState<string[]>(["#3b82f6"]);

  return (
    <>
      <XhColorPickerRoot value={color} onValueChange={details => setColor(details.value)} inline>
        <XhColorPickerLabel>画笔颜色</XhColorPickerLabel>
        <XhColorPickerContent>
          <XhColorPickerSaturationArea>
            <XhColorPickerAreaThumb />
          </XhColorPickerSaturationArea>
          <XhColorPickerHueSlider />
          <XhColorPickerChannelInput channel="hex" />
        </XhColorPickerContent>
      </XhColorPickerRoot>
      <p>
        当前：
        <code>{color[0]}</code>
      </p>
    </>
  );
}
`;export{o as default};
