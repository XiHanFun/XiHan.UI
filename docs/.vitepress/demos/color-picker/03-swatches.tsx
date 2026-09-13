// 预设色板 | 提供常用颜色
import type { ReactNode } from "react";
import {
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerSwatchGroup,
  XhColorPickerSwatchItem,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/react";

const swatches = ["#00a98e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Demo(): ReactNode {
  return (
    <XhColorPickerRoot defaultValue="#00a98e" swatches={swatches}>
      <XhColorPickerLabel>主题色</XhColorPickerLabel>
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
          <XhColorPickerSwatchGroup>
            {swatches.map(c => (
              <XhColorPickerSwatchItem key={c} value={c} />
            ))}
          </XhColorPickerSwatchGroup>
        </XhColorPickerContent>
      </XhColorPickerPositioner>
    </XhColorPickerRoot>
  );
}
