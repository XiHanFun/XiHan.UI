const o=`// 预设色板 | swatches 给出常用色，选中即写回 value
import type { ReactNode } from "react";
import {
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerSwatchGroup,
  XhColorPickerSwatchItem,
  XhColorPickerTrigger,
} from "@xihan-ui/react";

const swatches = ["#00a98e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Demo(): ReactNode {
  return (
    <XhColorPickerRoot defaultValue="#00a98e" swatches={swatches}>
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
`;export{o as default};
