const o=`// 最近使用色 | 一轮取色结束（浮层收起，或常驻形态下焦点离开取色面）且颜色变了，就记进最近使用色，最新的在最前、同色只留一份；受控写回由宿主保存，刷新后还在
import type { ReactNode } from "react";
import {
  XhButton,
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRecentSwatchPicker,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  // 宿主自己决定存在哪：这里演示放进组件状态，真实场景可以存进本地存储或用户偏好
  const [recent, setRecent] = useState<string[]>(["#ef4444", "#f59e0b"]);

  return (
    <XhColorPickerRoot
      defaultValue="#3b82f6"
      recentColors={recent}
      onRecentColorsChange={details => setRecent(details.recentColors)}
      maxRecentColors={6}
    >
      {({ clearRecentColors }) => (
        <>
          <XhColorPickerLabel>标记颜色</XhColorPickerLabel>
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
              <XhColorPickerHueSlider />
              <XhColorPickerRecentSwatchPicker />
              {recent.length
                ? <XhButton size="sm" variant="ghost" onClick={() => clearRecentColors()}>清空最近使用</XhButton>
                : null}
            </XhColorPickerContent>
          </XhColorPickerPositioner>
        </>
      )}
    </XhColorPickerRoot>
  );
}
`;export{o as default};
