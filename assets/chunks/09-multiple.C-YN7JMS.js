const o=`// 多选成标签 | selectionMode="multiple" 时浮层里调出的颜色是草稿，按「添加」收进值、浮层不收，可以接着添；预设色板点一下切换选中。选中的颜色在输入行里排成带色点的标签，点叉或在展开钮上按退格摘掉
import type { ReactNode } from "react";
import {
  XhColorPickerAreaThumb,
  XhColorPickerConfirmTrigger,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHiddenInput,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerSwatchPicker,
  XhColorPickerTagList,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const swatches = ["#00a98e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["#00a98e", "#3b82f6"]);

  return (
    <>
      <XhColorPickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        name="palette"
        selectionMode="multiple"
        swatches={swatches}
      >
        <XhColorPickerLabel>配色</XhColorPickerLabel>
        <XhColorPickerControl>
          <XhColorPickerTagList />
          <XhColorPickerTrigger>
            <XhColorPickerSwatch />
            <XhColorPickerValueText />
          </XhColorPickerTrigger>
        </XhColorPickerControl>
        <XhColorPickerHiddenInput />
        <XhColorPickerPositioner>
          <XhColorPickerContent>
            <XhColorPickerSaturationArea>
              <XhColorPickerAreaThumb />
            </XhColorPickerSaturationArea>
            <XhColorPickerHueSlider />
            <XhColorPickerSwatchPicker />
            <XhColorPickerConfirmTrigger>添加</XhColorPickerConfirmTrigger>
          </XhColorPickerContent>
        </XhColorPickerPositioner>
      </XhColorPickerRoot>

      <span aria-live="polite" style={{ fontSize: "13px" }}>
        {\`当前值：\${value.join("、") || "（空）"}\`}
      </span>
    </>
  );
}
`;export{o as default};
