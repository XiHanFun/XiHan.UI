// 精确输入 | 输入色值或使用屏幕取色
import type { CSSProperties, ReactNode } from "react";
import { PipetteIcon } from "@xihan-ui/icons";
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelInput,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerEyeDropperTrigger,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
  XhIcon,
} from "@xihan-ui/react";

const inputRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: "6px",
};

const translations = {
  eyeDropperTrigger: "从屏幕上取色",
};

export default function Demo(): ReactNode {
  return (
    <XhColorPickerRoot defaultValue="#3b82f6" translations={translations}>
      <XhColorPickerLabel>品牌色</XhColorPickerLabel>
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <XhColorPickerEyeDropperTrigger>
              <XhIcon icon={PipetteIcon} />
            </XhColorPickerEyeDropperTrigger>
            <XhColorPickerHueSlider style={{ flex: 1 }} />
          </div>
          <div style={inputRow}>
            <XhColorPickerChannelInput channel="hex" />
            <XhColorPickerChannelInput channel="r" />
            <XhColorPickerChannelInput channel="g" />
            <XhColorPickerChannelInput channel="b" />
          </div>
        </XhColorPickerContent>
      </XhColorPickerPositioner>
    </XhColorPickerRoot>
  );
}
